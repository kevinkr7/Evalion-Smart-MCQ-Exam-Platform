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

  if (isAdmin === null) return <div className="p-6 text-slate-200">Checking admin access...</div>;
  if (!isAdmin) return <div className="p-6 text-slate-200">Access denied — sign in with an admin email to view this page.</div>;

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-[#05040a] via-[#071020] to-[#0b0b14] text-slate-100">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-[#7c3aed] via-[#6366f1] to-[#06b6d4]">
              Admin Dashboard
            </h1>
            <p className="text-sm text-slate-300 mt-1">Manage quiz results and upload questions (per set)</p>
          </div>

          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
  {/* Left group: data actions */}
  <div className="flex flex-wrap gap-3">
    <Button
      onClick={() => fetchResults()}
      className="bg-[transparent] border border-slate-700 text-slate-200 hover:bg-slate-800"
      disabled={loading || deleting}
    >
      {loading ? "Refreshing..." : "Refresh"}
    </Button>

    <Button
      onClick={() => exportCSV(filteredResults)}
      className="bg-gradient-to-r from-[#6366f1] to-[#7c3aed] text-white"
      disabled={deleting}
    >
      Export CSV
    </Button>

    <Button
      onClick={handleDeleteAll}
      className="bg-gradient-to-r from-[#ef4444] to-[#dc2626] text-white"
      disabled={deleting}
    >
      {deleting ? "Deleting..." : "Delete All"}
    </Button>
  </div>

  {/* Right group: release toggle */}
  <div className="flex items-center gap-3 bg-[rgba(7,10,23,0.5)] px-3 py-2 rounded-lg border border-slate-700">
    <div className="text-sm text-slate-300">
      Results:
      <span className={`ml-2 font-semibold ${released ? "text-green-300" : "text-amber-300"}`}>
        {released === null ? "Loading..." : released ? "Released" : "Hidden"}
      </span>
    </div>
    <Button
      onClick={handleToggleRelease}
      className={`text-white px-4 py-2 ${
        released
          ? "bg-gradient-to-r from-[#f97316] to-[#ef4444]"
          : "bg-gradient-to-r from-[#6366f1] to-[#7c3aed]"
      }`}
      disabled={toggling}
    >
      {toggling ? "Working..." : released ? "Hide Results" : "Release Results"}
    </Button>
  </div>
</div>

        </div>

        {/* Question Sets + Uploader */}
        <div className="mb-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="col-span-2 bg-[rgba(7,10,23,0.6)] border border-slate-800 rounded-lg p-4">
            <h3 className="text-lg text-white font-semibold mb-3">Question Sets</h3>
            <div className="space-y-2">
              {loadingSets && <div className="text-slate-300">Loading sets...</div>}
              {!loadingSets && sets.length === 0 && <div className="text-slate-400">No sets found — upload a set to begin.</div>}
              {!loadingSets && sets.map(s => (
                <div key={s.id} className="flex items-center justify-between gap-3 p-3 bg-[rgba(10,15,25,0.4)] border border-slate-800 rounded">
                  <div>
                    <div className="text-sm text-slate-300">{s.name}</div>
                    <div className="text-xs text-slate-500">{s.createdAt?.toDate ? s.createdAt.toDate().toLocaleString() : ""}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-sm text-slate-300 mr-2"> {activeSetId === s.id ? <span className="text-green-300 font-semibold">Active</span> : <span className="text-slate-400">Not active</span>} </div>
                    <Button onClick={() => handleSetActiveSet(s.id)} className="text-sm">Make active</Button>
                    <Button variant="muted" onClick={async () => {
                      // quick preview count
                      try {
                        const q = query(collection(db, "questionSets", s.id, "questions"), orderBy("createdAt", "desc"));
                        const snap = await getDocs(q);
                        alert(`Set "${s.name}" contains ${snap.size} questions.`);
                      } catch (err) {
                        console.error(err);
                        alert("Failed to fetch count.");
                      }
                    }}>Count</Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Button onClick={() => { handleSetActiveSet(null); }} variant="muted">Clear active set</Button>
            </div>
          </div>

          <div className="bg-[rgba(7,10,23,0.6)] border border-slate-800 rounded-lg p-4">
            <h3 className="text-lg text-white font-semibold mb-3">Uploader</h3>
            <AdminQuestionUploader onUploaded={() => { loadSets(); }} sets={sets} activeSetId={activeSetId} />
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 bg-[rgba(7,10,23,0.6)] border border-slate-800 rounded-lg p-4 flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-300 mb-1">Search (name, email, roll)</label>
            <input
              className="w-full bg-[#071022] text-slate-100 px-3 py-2 rounded border border-slate-700 focus:ring-2 focus:ring-[#06b6d4]"
              value={queryText}
              onChange={(e) => setQueryText(e.target.value)}
              placeholder="Search by name, email or roll number"
            />
          </div>

          <div className="flex items-end gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Min score</label>
              <input
                className="w-28 bg-[#071022] text-slate-100 px-2 py-2 rounded border border-slate-700 focus:ring-2 focus:ring-[#6366f1]"
                value={minScore}
                onChange={(e) => setMinScore(e.target.value)}
                placeholder="min"
                type="number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Max score</label>
              <input
                className="w-28 bg-[#071022] text-slate-100 px-2 py-2 rounded border border-slate-700 focus:ring-2 focus:ring-[#7c3aed]"
                value={maxScore}
                onChange={(e) => setMaxScore(e.target.value)}
                placeholder="max"
                type="number"
              />
            </div>

            <div>
              <Button variant="muted" onClick={clearFilters} className="text-slate-200 border border-slate-700" disabled={deleting}>
                Clear
              </Button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto bg-[rgba(15,23,42,0.6)] border border-slate-800 rounded-lg p-3">
          <table className="w-full text-sm table-fixed">
            <thead>
              <tr className="text-left text-slate-300">
                <th className="p-3 w-44">Name</th>
                <th className="p-3 w-56">Email</th>
                <th className="p-3 w-36">Register</th>
                <th className="p-3 w-20">Score</th>
                <th className="p-3 w-36">Submitted At</th>
                <th className="p-3 w-24">Tab Switches</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredResults.map(r => (
                <tr key={r.id} className="border-t border-slate-800">
                  <td className="p-3 text-slate-100">{r.name}</td>
                  <td className="p-3 text-slate-300">{r.email}</td>
                  <td className="p-3 text-slate-300">{r.rollNo ?? ""}</td>
                  <td className="p-3 font-semibold text-white">{r.score ?? ""}</td>
                  <td className="p-3 text-slate-300">{r.createdAt?.toDate ? r.createdAt.toDate().toLocaleString() : String(r.createdAt ?? "")}</td>
                  <td className="p-3 text-slate-300">{r.tabSwitchCount ?? 0}</td>
                  <td className="p-3">
                    <button
                      className="text-sky-300 underline text-sm"
                      onClick={() => {
                        const details = JSON.stringify(r.answers ?? {}, null, 2);
                        alert(`Details for ${r.name ?? r.email}:\n\nScore: ${r.score}\n\nAnswers:\n${details}`);
                      }}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
              {filteredResults.length === 0 && (
                <tr>
                  <td className="p-6 text-slate-300" colSpan={7}>No results match the filters</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
