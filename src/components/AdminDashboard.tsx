// src/components/AdminDashboard.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  collection,
  query,
  orderBy,
  getDocs,
  doc,
  getDoc,
  writeBatch,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../firebase";
import { Button } from "@/components/ui/button";
import { auth } from "../firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { useQuiz } from "@/contexts/QuizContext";
import AdminQuestionUploader from "@/components/AdminQuestionUploader";
import { Home } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

/**
 * Admin dashboard with:
 *  - client-side search/filter
 *  - CSV export
 *  - question uploader (into named sets)
 *  - delete-all quizResults
 *  - toggle to release/hide results (settings/results.released)
 *  - question sets management (create, list, set active)
 */

type QuizResult = {
  id: string;
  name?: string;
  email?: string;
  rollNo?: string;
  score?: number | null;
  answers?: any;
  createdAt?: any;
  tabSwitchCount?: number;
};

type QuestionSet = {
  id: string;
  name: string;
  createdAt?: any;
  createdBy?: string;
};

export default function AdminDashboard() {
  // try to get email from app context (if available)
  let ctxEmail = "";
  try {
    const q = useQuiz();
    ctxEmail = q?.state?.userInfo?.email ?? "";
  } catch (e) {
    ctxEmail = "";
  }

  const { toast } = useToast();
  const [userEmail, setUserEmail] = useState<string>(ctxEmail);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [results, setResults] = useState<QuizResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // NEW: release toggle state (null = loading)
  const [released, setReleased] = useState<boolean | null>(null);
  const [toggling, setToggling] = useState(false);

  // question sets
  const [sets, setSets] = useState<QuestionSet[]>([]);
  const [loadingSets, setLoadingSets] = useState(false);
  const [activeSetId, setActiveSetId] = useState<string | null>(null);

  // search & filter states
  const [queryText, setQueryText] = useState("");
  const [minScore, setMinScore] = useState<string>(""); // use strings to allow empty
  const [maxScore, setMaxScore] = useState<string>("");

  // listen for auth if no context email
  useEffect(() => {
    if (userEmail) return;
    const unsub = onAuthStateChanged(auth, (user: User | null) => {
      setUserEmail(user?.email ?? "");
    });
    return () => unsub();
  }, [userEmail]);

  // check admin doc
  useEffect(() => {
    if (!userEmail) {
      setIsAdmin(false);
      return;
    }
    (async () => {
      try {
        const adminDoc = doc(db, "admins", userEmail);
        const snap = await getDoc(adminDoc);
        setIsAdmin(snap.exists());
      } catch (err) {
        console.error("[AdminDashboard] admin check error", err);
        setIsAdmin(false);
      }
    })();
  }, [userEmail]);

  // fetch release flag & activeSetId
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const ref = doc(db, "settings", "results");
        const snap = await getDoc(ref);
        if (!mounted) return;
        const val = snap.exists() ? ((snap.data() as any).released === true) : false;
        setReleased(val);
      } catch (err) {
        console.error("[AdminDashboard] failed to fetch release flag", err);
        setReleased(false);
      }

      // fetch active question set id from settings
      try {
        const sref = doc(db, "settings", "questions");
        const ssnap = await getDoc(sref);
        if (!mounted) return;
        const aid = ssnap.exists() ? ((ssnap.data() as any).activeSetId ?? null) : null;
        setActiveSetId(aid);
      } catch (err) {
        console.error("[AdminDashboard] failed to fetch activeSetId", err);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // fetch sets
  useEffect(() => {
    loadSets();
  }, []);

  async function loadSets() {
    setLoadingSets(true);
    try {
      const q = query(collection(db, "questionSets"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      const docs = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })) as QuestionSet[];
      setSets(docs);
    } catch (err) {
      console.error("[AdminDashboard] loadSets error", err);
      toast({ title: "Failed", description: "Unable to load question sets." });
    } finally {
      setLoadingSets(false);
    }
  }

  useEffect(() => {
    if (isAdmin) fetchResults();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  async function fetchResults() {
    setLoading(true);
    try {
      const q = query(collection(db, "quizResults"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      const docs = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
      setResults(docs);
    } catch (err) {
      console.error("[AdminDashboard] fetchResults error:", err);
      toast({ title: "Error fetching results", description: "See console for details." });
    } finally {
      setLoading(false);
    }
  }

  function exportCSV(filteredResults = results) {
    const headers = ["id","name","email","rollNo","score","tabSwitchCount","createdAt","answers"];
    const rows = filteredResults.map(r => [
      r.id,
      r.name ?? "",
      r.email ?? "",
      r.rollNo ?? "",
      r.score ?? "",
      r.tabSwitchCount ?? 0,
      r.createdAt?.toDate ? r.createdAt.toDate().toISOString() : String(r.createdAt ?? ""),
      JSON.stringify(r.answers ?? {})
    ]);
    const csv = [headers, ...rows]
      .map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(","))
      .join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `quiz_results_${new Date().toISOString().slice(0,10)}.csv`;
    link.click();
  }

  // client-side filtering/searching
  const filteredResults = useMemo(() => {
    const qText = queryText.trim().toLowerCase();
    const min = minScore === "" ? Number.NEGATIVE_INFINITY : Number(minScore);
    const max = maxScore === "" ? Number.POSITIVE_INFINITY : Number(maxScore);

    return results.filter(r => {
      // score filter (allow null -> treat as -Infinity)
      const scoreVal = typeof r.score === "number" ? r.score : Number.NEGATIVE_INFINITY;
      if (scoreVal < min || scoreVal > max) return false;

      if (!qText) return true; // no search text

      // search name, email, rollNo
      const name = (r.name ?? "").toString().toLowerCase();
      const email = (r.email ?? "").toString().toLowerCase();
      const roll = (r.rollNo ?? "").toString().toLowerCase();

      return name.includes(qText) || email.includes(qText) || roll.includes(qText);
    });
  }, [results, queryText, minScore, maxScore]);

  function clearFilters() {
    setQueryText("");
    setMinScore("");
    setMaxScore("");
  }

  // --- delete all quizResults (unchanged) ---
  async function handleDeleteAll() {
    if (deleting) return;

    const warn = `You are about to DELETE ALL student quiz submissions in Firestore (collection: "quizResults").\n\nThis action cannot be undone.\n\nType "DELETE" to confirm.`;
    const typed = window.prompt(warn, "");
    if (typed !== "DELETE") {
      toast({ title: "Cancelled", description: "Delete operation aborted." });
      return;
    }

    setDeleting(true);
    try {
      const qRef = query(collection(db, "quizResults"), orderBy("createdAt", "desc"));
      const snap = await getDocs(qRef);
      if (snap.empty) {
        toast({ title: "No documents", description: "No quiz results found to delete." });
        setDeleting(false);
        return;
      }

      const docs = snap.docs;
      const batchSize = 500;
      let deletedCount = 0;

      for (let i = 0; i < docs.length; i += batchSize) {
        const batch = writeBatch(db);
        const chunk = docs.slice(i, i + batchSize);
        chunk.forEach(d => batch.delete(d.ref));
        await batch.commit();
        deletedCount += chunk.length;
      }

      setResults([]);
      toast({ title: "Deleted", description: `Deleted ${deletedCount} quiz result(s).` });
    } catch (err) {
      console.error("[AdminDashboard] deleteAll error", err);
      toast({ title: "Delete failed", description: "See console for details." });
    } finally {
      setDeleting(false);
      fetchResults();
    }
  }

  // --- NEW: toggle release flag in Firestore ---
  async function handleToggleRelease() {
    if (toggling) return;

    const next = !Boolean(released);
    const action = next ? "RELEASE" : "HIDE";
    const confirmMsg = `You are about to ${action} result reviews for students.\n\nType "${action}" to confirm.`;
    const typed = window.prompt(confirmMsg, "");
    if (typed !== action) {
      toast({ title: "Cancelled", description: "Operation aborted." });
      return;
    }

    setToggling(true);
    try {
      const ref = doc(db, "settings", "results");
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        // create the doc
        await setDoc(ref, { released: next });
      } else {
        await updateDoc(ref, { released: next });
      }
      setReleased(next);
      toast({
        title: next ? "Results released" : "Results hidden",
        description: next ? "Students can now view detailed reviews." : "Students can no longer view reviews.",
      });
    } catch (err) {
      console.error("[AdminDashboard] toggle release error", err);
      toast({ title: "Operation failed", description: "See console for details." });
    } finally {
      setToggling(false);
    }
  }

  // --- NEW: set active question set ---
  async function handleSetActiveSet(setId: string | null) {
    const action = setId ? `Set "${sets.find(s => s.id === setId)?.name ?? setId}" active` : "Clear active set";
    const confirm = window.confirm(`${action}?`);
    if (!confirm) return;

    try {
      const ref = doc(db, "settings", "questions");
      await setDoc(ref, { activeSetId: setId ?? null }, { merge: true });
      setActiveSetId(setId);
      toast({ title: "Updated", description: setId ? "Active set updated." : "Active set cleared." });
    } catch (err) {
      console.error("[AdminDashboard] set active set error", err);
      toast({ title: "Failed", description: "Could not update active set." });
    }
  }

  if (isAdmin === null) {
    return (
      <div className="min-h-screen bg-[#0b0b0d] text-white font-['Geist'] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-t-2 border-indigo-500 rounded-full animate-spin mb-4"></div>
        <div className="text-slate-400 tracking-wider">Verifying admin access...</div>
      </div>
    );
  }
  
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#0b0b0d] text-white font-['Geist'] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-6">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
        </div>
        <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
        <p className="text-slate-400 max-w-md">You do not have administrative privileges. Please sign in with an authorized admin account.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0b0d] text-white font-['Geist'] relative overflow-x-hidden pb-20">
      {/* Background SVG Noise */}
      <div className="fixed inset-0 w-full h-full pointer-events-none opacity-[0.03] z-0" style={{backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`}}></div>

      <div className="max-w-[1600px] mx-auto p-4 md:p-8 relative z-10">
        
        {/* Header */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 mb-10">
          <div className="flex items-center gap-5">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => window.location.href = "/"} 
              className="rounded-full border-white/10 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all shrink-0 h-12 w-12"
            >
              <Home className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
                 <div className="w-2.5 h-2.5 rounded-full bg-[#7c3aed] shadow-[0_0_15px_rgba(124,58,237,0.8)]"></div>
                 Admin Dashboard
              </h1>
              <p className="text-slate-400 mt-2">Manage quiz results and upload question sets</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {/* Left group: data actions */}
            <div className="flex flex-wrap gap-2 bg-white/5 border border-white/10 p-1.5 rounded-xl backdrop-blur-md">
              <button
                onClick={() => fetchResults()}
                className="px-4 py-2 text-sm font-medium rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                disabled={loading || deleting}
              >
                {loading ? "Refreshing..." : "Refresh Data"}
              </button>

              <button
                onClick={() => exportCSV(filteredResults)}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_15px_rgba(79,70,229,0.2)] transition-colors"
                disabled={deleting}
              >
                Export CSV
              </button>

              <button
                onClick={handleDeleteAll}
                className="px-4 py-2 text-sm font-medium rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete All"}
              </button>
            </div>

            {/* Right group: release toggle */}
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 p-1.5 pl-4 rounded-xl backdrop-blur-md">
              <div className="text-sm text-slate-400 font-medium">
                Results:
                <span className={`ml-2 font-bold tracking-wide ${released ? "text-indigo-400" : "text-slate-300"}`}>
                  {released === null ? "..." : released ? "RELEASED" : "HIDDEN"}
                </span>
              </div>
              <button
                onClick={handleToggleRelease}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                  released
                    ? "bg-indigo-950/50 hover:bg-indigo-900/50 text-indigo-300 border border-indigo-500/30"
                    : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_15px_rgba(79,70,229,0.2)]"
                }`}
                disabled={toggling}
              >
                {toggling ? "Working..." : released ? "Hide Results" : "Release Results"}
              </button>
            </div>
          </div>
        </div>

        {/* Question Sets & Uploader */}
        <div className="mb-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 relative min-h-[400px] lg:min-h-0">
            <div className="lg:absolute lg:inset-0 bg-[#111116] border border-white/10 rounded-2xl p-6 shadow-2xl overflow-hidden flex flex-col h-full">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-[80px] pointer-events-none"></div>
              
              <h3 className="text-xl text-white font-bold mb-6 relative z-10 shrink-0">Question Sets</h3>
              
              <div className="space-y-3 relative z-10 overflow-y-auto pr-2 custom-scrollbar flex-1 min-h-0">
                {loadingSets && <div className="text-slate-400 flex items-center gap-2"><div className="w-4 h-4 border-t-2 border-indigo-500 rounded-full animate-spin"></div>Loading sets...</div>}
                {!loadingSets && sets.length === 0 && <div className="text-slate-500 italic">No sets found — upload a set to begin.</div>}
                
                {!loadingSets && sets.map(s => (
                  <div key={s.id} className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border transition-all ${activeSetId === s.id ? 'bg-indigo-500/10 border-indigo-500/30' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}>
                    <div>
                      <div className="text-base text-slate-200 font-medium mb-1 flex items-center gap-2">
                        {s.name}
                        {activeSetId === s.id && <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-400 uppercase tracking-wider border border-indigo-500/20">Active</span>}
                      </div>
                      <div className="text-xs text-slate-500 font-mono">{s.createdAt?.toDate ? s.createdAt.toDate().toLocaleString() : ""}</div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {activeSetId !== s.id && (
                        <button 
                          onClick={() => handleSetActiveSet(s.id)} 
                          className="px-3 py-1.5 text-xs font-medium rounded-lg bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500 hover:text-white transition-colors"
                        >
                          Make active
                        </button>
                      )}
                      <button 
                        onClick={async () => {
                          try {
                            const q = query(collection(db, "questionSets", s.id, "questions"), orderBy("createdAt", "desc"));
                            const snap = await getDocs(q);
                            alert(`Set "${s.name}" contains ${snap.size} questions.`);
                          } catch (err) {
                            console.error(err);
                            alert("Failed to fetch count.");
                          }
                        }}
                        className="px-3 py-1.5 text-xs font-medium rounded-lg bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white transition-colors border border-white/10"
                      >
                        Count
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 pt-4 border-t border-white/10 relative z-10 flex justify-end shrink-0">
                <button 
                  onClick={() => handleSetActiveSet(null)} 
                  className="px-4 py-2 text-sm font-medium rounded-lg text-slate-400 hover:text-white transition-colors"
                >
                  Clear active set
                </button>
              </div>
            </div>
          </div>

          <div className="bg-[#111116] border border-white/10 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
            <h3 className="text-xl text-white font-bold mb-6">Uploader</h3>
            <div className="relative z-10">
              <AdminQuestionUploader onUploaded={() => { loadSets(); }} sets={sets} activeSetId={activeSetId} />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 bg-[#111116] border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-end gap-6">
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-slate-400 mb-2">Search Candidates</label>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              <input
                className="w-full bg-white/5 text-white pl-10 pr-4 py-2.5 rounded-xl border border-white/10 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-600"
                value={queryText}
                onChange={(e) => setQueryText(e.target.value)}
                placeholder="Search by name, email, or register number..."
              />
            </div>
          </div>

          <div className="flex items-end gap-4 w-full md:w-auto">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Min Score</label>
              <input
                className="w-full md:w-24 bg-white/5 text-white px-4 py-2.5 rounded-xl border border-white/10 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all text-center"
                value={minScore}
                onChange={(e) => setMinScore(e.target.value)}
                placeholder="0"
                type="number"
              />
            </div>
            <div className="text-slate-500 pb-3 font-medium">-</div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Max Score</label>
              <input
                className="w-full md:w-24 bg-white/5 text-white px-4 py-2.5 rounded-xl border border-white/10 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all text-center"
                value={maxScore}
                onChange={(e) => setMaxScore(e.target.value)}
                placeholder="100"
                type="number"
              />
            </div>

            <div>
              <button 
                onClick={clearFilters} 
                className="px-5 py-2.5 text-sm font-medium rounded-xl text-slate-400 bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white transition-colors h-[46px]" 
                disabled={deleting}
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* Results Table */}
        <div className="bg-[#111116] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="bg-white/[0.03] border-b border-white/10 text-slate-400">
                  <th className="px-6 py-4 font-semibold w-48">Candidate Name</th>
                  <th className="px-6 py-4 font-semibold w-64">Email Address</th>
                  <th className="px-6 py-4 font-semibold w-36">Register No.</th>
                  <th className="px-6 py-4 font-semibold w-24 text-center">Score</th>
                  <th className="px-6 py-4 font-semibold w-48">Submitted At</th>
                  <th className="px-6 py-4 font-semibold w-32 text-center">Tab Switches</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                {filteredResults.map(r => (
                  <tr key={r.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4 text-slate-200 font-medium">{r.name}</td>
                    <td className="px-6 py-4 text-slate-400">{r.email}</td>
                    <td className="px-6 py-4 text-slate-400 font-mono text-xs">{r.rollNo ?? "-"}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center justify-center min-w-[3rem] px-2 py-1 rounded bg-white/5 border border-white/10 text-white font-bold font-mono">
                        {r.score ?? "-"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400 text-xs">
                      {r.createdAt?.toDate ? r.createdAt.toDate().toLocaleString(undefined, {
                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                      }) : String(r.createdAt ?? "-")}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {r.tabSwitchCount && r.tabSwitchCount > 0 ? (
                        <span className="text-indigo-400 font-bold">{r.tabSwitchCount}</span>
                      ) : (
                        <span className="text-slate-600">0</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        className="px-3 py-1.5 rounded-lg text-xs font-medium text-indigo-400 hover:text-white hover:bg-indigo-500/20 transition-colors border border-transparent hover:border-indigo-500/30 opacity-0 group-hover:opacity-100 focus:opacity-100"
                        onClick={() => {
                          const details = JSON.stringify(r.answers ?? {}, null, 2);
                          alert(`Details for ${r.name ?? r.email}:\n\nScore: ${r.score}\n\nAnswers:\n${details}`);
                        }}
                      >
                        View JSON
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredResults.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-16 text-center text-slate-500">
                      <div className="flex flex-col items-center justify-center">
                        <svg className="w-10 h-10 mb-3 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>
                        No results match your current filters.
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
