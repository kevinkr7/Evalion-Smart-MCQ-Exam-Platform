// src/components/UserDashboard.tsx
import React, { useEffect, useState } from "react";
import { useQuiz } from "@/contexts/QuizContext";
import { db } from "@/firebase";
import { collection, query, where, getDocs, limit, doc, getDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { fetchActiveQuestionSetMeta, isAutoQuiz } from "@/lib/quizMode";

type ResultRow = {
  id: string;
  uid?: string | null;
  name?: string | null;
  email?: string | null;
  rollId?: string | null;
  score?: number | null;
  tabSwitchCount?: number;
  createdAt?: any;
  questionIds?: string[];
};

export default function UserDashboard() {
  const { state } = useQuiz();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState<ResultRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  // NEW: whether results are released by admin
  const [released, setReleased] = useState<boolean | null>(null);
  const [loadingReleased, setLoadingReleased] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadReleasedFlag() {
      setLoadingReleased(true);
      try {
        const meta = await fetchActiveQuestionSetMeta();
        if (isAutoQuiz(meta.questionSet)) {
          setReleased(true);
          return;
        }

        const ref = doc(db, "settings", "results");
        const snap = await getDoc(ref);
        if (!mounted) return;
        const val = snap.exists() ? ((snap.data() as any).released === true) : false;
        setReleased(val);
      } catch (err) {
        console.error("Failed to read results.release flag:", err);
        if (mounted) setReleased(false);
      } finally {
        if (mounted) setLoadingReleased(false);
      }
    }

    loadReleasedFlag();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    async function loadAttempts() {
      setLoading(true);
      setError(null);

      try {
        // Prefer uid if present, otherwise fallback to email
        const uid = state?.authUser?.uid;
        const emailFallback = (state?.authUser?.email ?? state?.userInfo?.email ?? "")?.trim().toLowerCase() || null;

        if (!uid && !emailFallback) {
          if (!mounted) return;
          setAttempts([]);
          setLoading(false);
          return;
        }

        let snapQuery;
        if (uid) {
          // Query userAttempts by uid (no orderBy to avoid composite index requirement)
          snapQuery = query(collection(db, "userAttempts"), where("uid", "==", uid), limit(500));
        } else {
          // Query by email fallback
          snapQuery = query(collection(db, "userAttempts"), where("email", "==", emailFallback), limit(500));
        }

        const snap = await getDocs(snapQuery);

        if (!mounted) return;

        if (!snap || snap.empty) {
          setAttempts([]);
          return;
        }

        // Map docs to rows
        const rows: ResultRow[] = snap.docs.map((d) => {
          const data = d.data() as any;
          return {
            id: d.id,
            uid: data.uid ?? null,
            name: data.name ?? null,
            email: data.email ?? null,
            rollId: data.rollId ?? data.registerNumber ?? null,
            score: typeof data.score === "number" ? data.score : (data.score ? Number(data.score) : null),
            tabSwitchCount: data.tabSwitchCount ?? 0,
            createdAt: data.createdAt ?? null,
            questionIds: Array.isArray(data.questionIds) ? data.questionIds : [],
          };
        });

        // Helper to get milliseconds from createdAt in many shapes
        const createdAtMs = (r: ResultRow) => {
          const c = (r as any).createdAt;
          if (!c) return 0;
          // Firestore Timestamp
          if (typeof c === "object" && typeof (c as any).toDate === "function") {
            try { return (c as any).toDate().getTime(); } catch { return 0; }
          }
          // number-like
          const n = Number(c);
          if (!Number.isNaN(n) && n > 0) return n;
          // ISO string
          const parsed = Date.parse(String(c));
          return Number.isNaN(parsed) ? 0 : parsed;
        };

        // Sort newest-first client-side
        rows.sort((a, b) => createdAtMs(b) - createdAtMs(a));

        // Limit to reasonable size for the UI
        setAttempts(rows.slice(0, 100));
      } catch (err) {
        console.error("Failed to load attempts:", err);
        setError("Failed to load attempts. Try again later.");
        setAttempts([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadAttempts();
    return () => {
      mounted = false;
    };
  }, [state?.authUser?.uid, state?.authUser?.email, state?.userInfo?.email]);

  const openResult = (id: string) => {
    if (!released) {
      // short-circuit: results not released
      alert("Results/reviews are not released by the administrator yet.");
      return;
    }
    // navigate to review page with id param; update ResultsReview to accept id later.
    navigate(`/review?id=${encodeURIComponent(id)}`);
  };

  const goHome = () => navigate("/");

  // Optional manual refresh (reload attempts + released flag)
  const refreshAll = async () => {
    setLoading(true);
    setLoadingReleased(true);
    try {
      const meta = await fetchActiveQuestionSetMeta();
      if (isAutoQuiz(meta.questionSet)) {
        setReleased(true);
        window.location.reload();
        return;
      }

      const ref = doc(db, "settings", "results");
      const snap = await getDoc(ref);
      setReleased(snap.exists() ? ((snap.data() as any).released === true) : false);
    } catch (err) {
      console.error("refresh released flag failed", err);
    } finally {
      setLoadingReleased(false);
      setLoading(false);
      // re-run attempts effect by manually navigating or reloading page if needed
      // for simplicity: force a page reload of attempts by re-calling the effect dependency - easiest is window.location.reload()
      // but we'll just re-run loadAttempts by programmatically re-mounting: navigate to same route
      // simpler: reload page:
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#05040a] via-[#071020] to-[#0b0b14] p-6 text-slate-100">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-[#7c3aed] via-[#6366f1] to-[#06b6d4]">
              My Attempts
            </h1>
            <p className="text-sm text-slate-400 mt-1">Previous quizzes you've submitted — click View to open a full review (when enabled).</p>
          </div>

          <div className="flex gap-2">
            <Button onClick={goHome}>Home</Button>
            <Button variant="muted" onClick={refreshAll}>Refresh</Button>
          </div>
        </div>

        {/* Banner when results not released */}
        {released === false && (
          <div className="bg-yellow-900/20 border border-yellow-700 text-yellow-200 p-3 rounded-md">
            <div className="flex items-center justify-between gap-4">
              <div>
                <strong>Results are currently hidden.</strong>
                <div className="text-sm text-yellow-100">The administrator has not yet released score reviews. Scores and reviews will appear here once released.</div>
              </div>
              <div>
                <Button onClick={() => { navigator.clipboard?.writeText(window.location.href); }} variant="ghost">Share this page</Button>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {loading && <div className="text-slate-300 p-4">Loading your attempts...</div>}
          {!loading && error && <div className="text-red-400 p-4">{error}</div>}
          {!loading && !error && attempts.length === 0 && (
            <div className="bg-[rgba(7,10,23,0.65)] border border-slate-800 rounded p-6 text-slate-300">
              No attempts found. Submit a quiz first, or sign in with the account that took the tests.
            </div>
          )}

          {!loading && attempts.map((r) => {
            const created = r.createdAt?.toDate ? r.createdAt.toDate() : (r.createdAt ? new Date(r.createdAt) : null);
            return (
              <Card key={r.id} className="bg-[rgba(7,10,23,0.65)] border border-slate-800 shadow-md">
                <CardHeader>
                  <div className="flex items-center justify-between w-full">
                    <CardTitle className="text-lg text-white">{created ? created.toLocaleString() : "Attempt"}</CardTitle>
                    <div className="text-sm text-slate-400">
                      Score:{" "}
                      <span className="font-semibold text-white">
                        {released ? (r.score ?? "—") : "Hidden"}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between gap-4">
                    <div className="text-sm text-slate-300">
                      <div>
                        <span className="text-xs text-slate-400">Name</span>
                        <div className="font-medium text-white">{r.name ?? "—"}</div>
                      </div>
                      <div className="mt-2">
                        <span className="text-xs text-slate-400">Email</span>
                        <div className="text-sm text-white">{r.email ?? "—"}</div>
                      </div>
                      <div className="mt-2">
                        <span className="text-xs text-slate-400">Register No.</span>
                        <div className="text-sm text-white">{r.rollId ?? "—"}</div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <div className="text-xs text-slate-400">Tab-switches</div>
                      <div className="font-semibold text-white">{r.tabSwitchCount ?? 0}</div>

                      <div className="mt-3 w-full flex gap-2">
                        <Button onClick={() => openResult(r.id)} className="flex-1" disabled={!released}>
                          {released ? "View" : "View (locked)"}
                        </Button>

                        <Button
                          variant="outline"
                          onClick={() => {
                            const link = `${window.location.origin}/review?id=${encodeURIComponent(r.id)}`;
                            navigator.clipboard?.writeText(link);
                            alert("Link copied to clipboard");
                          }}
                          disabled={!released}
                        >
                          {released ? "Copy Link" : "Copy Link (locked)"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
