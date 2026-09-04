// src/components/ResultsReview.tsx
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuiz } from "@/contexts/QuizContext";
import { db } from "../firebase";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * ResultsReview (updated)
 * - If query param `id` is present: load attempt doc from `userAttempts/{id}` (preferred).
 * - Else: fallback to runtime state -> localStorage -> quizResults by uid/email (legacy).
 * - Uses questionsSnapshot when available (no network). Otherwise fetches only referenced question docs.
 * - Computes score/counts deterministically from questions + answers.
 */

type QuestionDoc = {
  id: string;
  text?: string;
  choices?: { A: string; B: string; C: string; D: string };
  correctOption?: "A" | "B" | "C" | "D";
};

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function ResultsReview() {
  const { state } = useQuiz();
  const navigate = useNavigate();
  const q = useQuery();
  const idParam = q.get("id");

  const [questions, setQuestions] = useState<QuestionDoc[]>([]);
  const [answers, setAnswers] = useState<Record<string, string | null> | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // computed stats
  const [score, setScore] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [wrongCount, setWrongCount] = useState<number>(0);
  const [skippedCount, setSkippedCount] = useState<number>(0);

  useEffect(() => {
    let mounted = true;

    async function loadForId(attemptId: string) {
      setLoading(true);
      setError(null);

      try {
        const ref = doc(db, "userAttempts", attemptId);
        const snap = await getDoc(ref);
        if (!snap.exists()) {
          setError("Attempt not found.");
          setLoading(false);
          return;
        }

        const data: any = snap.data();

        // answers object
        const loadedAnswers: Record<string, string | null> = data.answers ?? {};

        // questionsSnapshot if present
        let qDocs: QuestionDoc[] = [];
        if (Array.isArray(data.questionsSnapshot) && data.questionsSnapshot.length > 0) {
          qDocs = data.questionsSnapshot.map((s: any) => ({
            id: s.id,
            text: s.text ?? "",
            choices: s.choices ?? { A: "", B: "", C: "", D: "" },
            correctOption: (s.correctOption ?? s.correctChoice ?? "A") as "A" | "B" | "C" | "D",
          }));
        } else if (Array.isArray(data.questionIds) && data.questionIds.length > 0) {
          // fetch referenced questions (only those ids)
          const fetched: QuestionDoc[] = [];
          for (const qid of data.questionIds) {
            try {
              const qref = doc(db, "questions", qid);
              const qsnap = await getDoc(qref);
              if (qsnap.exists()) {
                const d: any = qsnap.data();
                fetched.push({
                  id: qid,
                  text: d.text ?? d.question ?? "",
                  choices: d.choices ?? d.choice ?? { A: "", B: "", C: "", D: "" },
                  correctOption: (d.correctOption ?? d.correctChoice ?? "A") as "A" | "B" | "C" | "D",
                });
              } else {
                fetched.push({ id: qid, text: `Question ${qid} (not found)`, choices: { A: "", B: "", C: "", D: "" }, correctOption: "A" });
              }
            } catch (err) {
              console.error("Error fetching question", qid, err);
              fetched.push({ id: qid, text: `Question ${qid} (error)`, choices: { A: "", B: "", C: "", D: "" }, correctOption: "A" });
            }
          }
          // preserve attempted order
          qDocs = (data.questionIds as string[]).map((id: string) => fetched.find(f => f.id === id)!).filter(Boolean);
        } else {
          // fallback: if answers keys exist, build a minimal question list from answer keys
          qDocs = Object.keys(loadedAnswers).map(k => ({ id: k, text: `Question ${k}`, choices: { A: "", B: "", C: "", D: "" }, correctOption: "A" }));
        }

        if (!mounted) return;
        setAnswers(loadedAnswers);
        setQuestions(qDocs);

        // compute score & counts
        computeStats(qDocs, loadedAnswers);
      } catch (err) {
        console.error("Failed to load attempt by id:", err);
        if (mounted) setError("Failed to load review. Try again later.");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    async function loadFallback() {
      setLoading(true);
      setError(null);

      try {
        // 1) runtime state (preferred)
        if (state && state.questions && state.questions.length > 0 && state.answers && Object.keys(state.answers).length > 0) {
          const qdocs = state.questions.map(q => ({
            id: q.id,
            text: (q as any).text ?? "",
            choices: q.choices,
            correctOption: (q as any).correctChoice ?? (q as any).correctOption,
          })) as QuestionDoc[];

          if (!mounted) return;
          setQuestions(qdocs);
          setAnswers(state.answers ?? {});
          computeStats(qdocs, state.answers ?? {});
          return;
        }

        // 2) localStorage fallback (unsaved attempts)
        let loadedAnswers: Record<string, string | null> | null = null;
        let fromResultDoc: any = null;

        const last = localStorage.getItem("lastQuizAttempt");
        if (last) {
          try {
            const parsed = JSON.parse(last);
            if (parsed && parsed.answers && Object.keys(parsed.answers).length > 0) {
              loadedAnswers = parsed.answers;
              fromResultDoc = parsed;
            }
          } catch (e) {
            // ignore
          }
        }

        // 3) Firestore fallback by uid -> email (legacy)
        if ((!loadedAnswers || Object.keys(loadedAnswers).length === 0) && state?.authUser?.uid) {
          const uid = state.authUser.uid;
          const q1 = query(collection(db, "quizResults"), where("uid", "==", uid));
          const snap1 = await getDocs(q1);
          if (snap1 && !snap1.empty) {
            const docs = snap1.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
            docs.sort((a,b) => {
              const ta = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : (a.createdAt ? new Date(a.createdAt).getTime() : 0);
              const tb = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : (b.createdAt ? new Date(b.createdAt).getTime() : 0);
              return tb - ta;
            });
            const latest = docs[0];
            if (latest && latest.answers && Object.keys(latest.answers).length > 0) {
              loadedAnswers = latest.answers;
              fromResultDoc = latest;
            }
          }
        }

        if ((!loadedAnswers || Object.keys(loadedAnswers).length === 0) && (state?.userInfo?.email || state?.authUser?.email)) {
          const email = (state.userInfo?.email ?? state.authUser?.email ?? "").trim().toLowerCase();
          if (email) {
            const q2 = query(collection(db, "quizResults"), where("email", "==", email));
            const snap2 = await getDocs(q2);
            if (snap2 && !snap2.empty) {
              const docs2 = snap2.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
              docs2.sort((a,b) => {
                const ta = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : (a.createdAt ? new Date(a.createdAt).getTime() : 0);
                const tb = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : (b.createdAt ? new Date(b.createdAt).getTime() : 0);
                return tb - ta;
              });
              const latest = docs2[0];
              if (latest && latest.answers && Object.keys(latest.answers).length > 0) {
                loadedAnswers = latest.answers;
                fromResultDoc = latest;
              }
            }
          }
        }

        if (!loadedAnswers || Object.keys(loadedAnswers).length === 0) {
          setError("No submitted answers were found for this user. Review is only available after you submit the quiz.");
          setTimeout(() => navigate("/"), 3000);
          return;
        }

        if (!mounted) return;
        setAnswers(loadedAnswers);

        // build questions from snapshot or questionIds or fallback to keys
        let qDocs: QuestionDoc[] = [];

        if (fromResultDoc && Array.isArray(fromResultDoc.questionsSnapshot) && fromResultDoc.questionsSnapshot.length > 0) {
          qDocs = fromResultDoc.questionsSnapshot.map((s: any) => ({
            id: s.id,
            text: s.text ?? "",
            choices: s.choices ?? { A: "", B: "", C: "", D: "" },
            correctOption: (s.correctChoice ?? s.correctOption ?? "A") as "A" | "B" | "C" | "D",
          }));
        } else {
          const qIds = fromResultDoc && Array.isArray(fromResultDoc.questionIds) && fromResultDoc.questionIds.length > 0
            ? fromResultDoc.questionIds
            : Object.keys(loadedAnswers);

          const fetched: QuestionDoc[] = [];
          for (const id of qIds) {
            try {
              const dref = doc(db, "questions", id);
              const snap = await getDoc(dref);
              if (snap.exists()) {
                const data = snap.data() as any;
                fetched.push({
                  id,
                  text: data.text ?? data.question ?? "",
                  choices: data.choices ?? data.choice ?? { A: "", B: "", C: "", D: "" },
                  correctOption: (data.correctOption ?? data.correctChoice ?? "A") as "A" | "B" | "C" | "D",
                });
              } else {
                fetched.push({ id, text: `Question ${id} (not found)`, choices: { A: "", B: "", C: "", D: "" }, correctOption: "A" });
              }
            } catch (err) {
              console.error("fetch question error", id, err);
              fetched.push({ id, text: `Question ${id} (error)`, choices: { A: "", B: "", C: "", D: "" }, correctOption: "A" });
            }
          }
          qDocs = qIds.map((id: string) => fetched.find(f => f.id === id)!).filter(Boolean);
        }

        if (!mounted) return;
        setQuestions(qDocs);
        computeStats(qDocs, loadedAnswers);
      } catch (err) {
        console.error("ResultsReview load error:", err);
        if (mounted) setError("Failed to load review. Try again later.");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    // computeStats helper
    function computeStats(qDocs: QuestionDoc[], ans: Record<string, string | null> | null) {
      const a = ans ?? {};
      let correct = 0, wrong = 0, skipped = 0;
      qDocs.forEach(qd => {
        const ua = a[qd.id];
        if (ua === null || typeof ua === "undefined") {
          skipped++;
        } else if (ua === qd.correctOption) {
          correct++;
        } else {
          wrong++;
        }
      });
      const s = correct * 5 - wrong * 1;
      if (mounted) {
        setCorrectCount(correct);
        setWrongCount(wrong);
        setSkippedCount(skipped);
        setScore(s);
      }
    }

    // main logic
    if (idParam) {
      loadForId(idParam);
    } else {
      loadFallback();
    }

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idParam, state?.authUser?.uid, state?.userInfo?.email, state?.authUser?.email]);

  const renderChoice = (q: QuestionDoc, key: "A" | "B" | "C" | "D") => {
    const correct = q.correctOption === key;
    const userAnswer = (answers && answers[q.id]) ?? null;
    const selectedByUser = userAnswer === key;

    const bgClass = correct
      ? "bg-emerald-50 border border-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.1)]"
      : selectedByUser
        ? "bg-red-50 border border-red-300 shadow-[0_0_10px_rgba(239,68,68,0.1)]"
        : "bg-white border border-slate-200";

    const textClass = correct ? "text-emerald-700" : selectedByUser ? "text-red-700" : "text-slate-600";
    const iconBorderClass = correct ? "border-emerald-500 bg-emerald-100" : selectedByUser ? "border-red-500 bg-red-100" : "border-slate-300 bg-slate-100";
    
    return (
      <div key={key} className={`p-4 rounded-xl ${bgClass} flex items-start gap-4 transition-all duration-300`}>
        <div className={`w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full border ${iconBorderClass}`}>
          <div className={`font-bold text-sm ${textClass}`}>{key}</div>
        </div>
        <div className="flex-1 pt-1">
          <div className={`text-sm font-medium ${textClass}`}>{q.choices ? (q.choices as any)[key] : ""}</div>
        </div>

        <div className="w-6 pt-1 flex-shrink-0">
          {correct && <span className="text-emerald-600 font-bold text-lg">✓</span>}
          {!correct && selectedByUser && <span className="text-red-600 font-bold text-lg">✕</span>}
        </div>
      </div>
    );
  };

  if (loading) return (
    <div className="min-h-screen relative bg-[#f9fafb] flex items-center justify-center text-slate-500">
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0" style={{ backgroundImage: 'radial-gradient(120% 70% at 50% 0%, #ffffff 0%, #f3f4f6 50%, #e5e7eb 100%)' }}></div>
      <div className="relative z-10 text-lg font-medium animate-pulse">Loading review...</div>
    </div>
  );
  
  if (error) return (
    <div className="min-h-screen relative bg-[#f9fafb] flex items-center justify-center font-['Geist'] text-slate-800">
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0" style={{ backgroundImage: 'radial-gradient(120% 70% at 50% 0%, #ffffff 0%, #f3f4f6 50%, #e5e7eb 100%)' }}></div>
      <div className="relative z-10 text-center space-y-5 bg-white p-10 rounded-2xl shadow-xl border border-slate-200">
        <h2 className="text-2xl font-extrabold text-red-500">Access Denied</h2>
        <p className="text-slate-500 font-medium">{error}</p>
        <Button onClick={() => navigate("/")} className="bg-slate-900 text-white hover:bg-slate-800 rounded-xl px-8">Go Home</Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen relative bg-[#f9fafb] text-slate-800 overflow-x-hidden font-['Geist']">
      {/* Premium Light Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0" style={{ backgroundImage: 'radial-gradient(120% 70% at 50% 0%, #ffffff 0%, #f3f4f6 50%, #e5e7eb 100%)' }}></div>
      <div className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.35] z-0" style={{backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`}}></div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-12 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center justify-center bg-white border border-slate-200 shadow-sm px-3 py-1 rounded-full mb-3">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Past Attempt</span>
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Your Answers — Review</h2>
          </div>
          <div className="flex gap-3">
            <Button onClick={() => navigate("/dashboard")} variant="outline" className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm rounded-xl">Dashboard</Button>
            <Button onClick={() => window.print()} className="bg-slate-900 text-white hover:bg-slate-800 shadow-md rounded-xl">Print Report</Button>
          </div>
        </div>

        <div className="space-y-6">
          {questions.length === 0 && <div className="text-slate-500 bg-white p-6 rounded-2xl border border-slate-200 text-center shadow-sm">No questions available for review.</div>}

          {/* Summary Card */}
          <div className="bg-white border border-slate-200 shadow-xl shadow-slate-200/50 rounded-2xl p-6 relative overflow-hidden">
            {/* Subtle light violet glow inside the card */}
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-violet-100 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
              <div>
                <div className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-1">Final Score</div>
                <div className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-violet-600 to-indigo-600">{score ?? 0}</div>
              </div>
              
              <div className="flex gap-4 sm:gap-8">
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Correct</span>
                  <span className="text-2xl font-bold text-emerald-600">{correctCount}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Wrong</span>
                  <span className="text-2xl font-bold text-red-600">{wrongCount}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Skipped</span>
                  <span className="text-2xl font-bold text-amber-500">{skippedCount}</span>
                </div>
                <div className="flex flex-col pl-4 sm:pl-8 border-l border-slate-100">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total</span>
                  <span className="text-2xl font-bold text-slate-800">{questions.length}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Questions */}
          {questions.map((q, idx) => {
            const userAns = answers ? answers[q.id] ?? null : null;
            const unanswered = userAns === null || typeof userAns === "undefined";

            return (
              <div key={q.id} className={`bg-white border ${unanswered ? "border-amber-300 shadow-[0_0_15px_rgba(252,211,77,0.2)]" : "border-slate-200"} shadow-lg shadow-slate-200/40 rounded-2xl overflow-hidden`}>
                <div className={`px-6 py-4 border-b ${unanswered ? "border-amber-200 bg-amber-50/50" : "border-slate-100 bg-slate-50/50"} flex items-center justify-between`}>
                  <h3 className="text-lg font-bold text-slate-800">Question {idx + 1}</h3>
                  {unanswered && <div className="text-xs font-bold bg-amber-100 text-amber-700 px-3 py-1 rounded-full uppercase tracking-widest">Unanswered</div>}
                </div>
                
                <div className="p-6">
                  <div className="mb-6 text-slate-700 whitespace-pre-wrap font-medium text-base leading-relaxed">{q.text}</div>

                  <div className="space-y-3">
                    {["A","B","C","D"].map(k => renderChoice(q, k as any))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center text-sm font-medium text-slate-500 pt-8 pb-12">
          <p><span className="text-emerald-600 font-bold text-lg align-middle">✓</span> indicates the correct option — <span className="text-red-600 font-bold text-lg align-middle">✕</span> indicates your incorrect selection.</p>
        </div>
      </div>
    </div>
  );
}
