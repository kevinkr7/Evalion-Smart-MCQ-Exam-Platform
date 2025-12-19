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
      ? "bg-[rgba(16,185,129,0.12)] border border-green-500"
      : selectedByUser
        ? "bg-[rgba(239,68,68,0.08)] border border-red-500"
        : "bg-transparent border border-transparent";

    const textClass = correct ? "text-green-300" : selectedByUser ? "text-red-300" : "text-slate-200";

    return (
      <div key={key} className={`p-3 rounded-md ${bgClass} flex items-start gap-3`}>
        <div className={`w-8 h-8 flex items-center justify-center rounded-full border ${correct ? "border-green-500" : selectedByUser ? "border-red-500" : "border-slate-700"}`}>
          <div className={`font-semibold ${textClass}`}>{key}</div>
        </div>
        <div className="flex-1">
          <div className={`text-sm ${textClass}`}>{q.choices ? (q.choices as any)[key] : ""}</div>
        </div>

        <div className="w-6">
          {correct && <span className="text-green-400 font-bold">✓</span>}
          {!correct && selectedByUser && <span className="text-red-400 font-bold">✕</span>}
        </div>
      </div>
    );
  };

  if (loading) return <div className="p-6 text-slate-200">Loading review...</div>;
  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#05040a] via-[#071020] to-[#0b0b14] text-slate-200">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold text-red-400">Access Denied</h2>
        <p className="text-slate-400">{error}</p>
        <Button onClick={() => navigate("/")}>Go Home</Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#05040a] via-[#071020] to-[#0b0b14] p-6 text-slate-100">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-[#7c3aed] via-[#6366f1] to-[#06b6d4]">Your Answers — Review</h2>
          <div className="flex gap-2">
            <Button onClick={() => navigate("/")}>Home</Button>
            <Button onClick={() => window.print()} className="bg-gradient-to-r from-[#6366f1] to-[#7c3aed]">Print</Button>
          </div>
        </div>

        <div className="space-y-4">
          {questions.length === 0 && <div className="text-slate-300">No questions available for review.</div>}

          {/* Summary */}
          <Card className="bg-[rgba(7,10,23,0.65)] border border-slate-800 shadow-2xl p-4">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-sm text-slate-300">Score</div>
                <div className="text-3xl font-extrabold text-white">{score ?? 0}</div>
              </div>
              <div className="text-sm text-slate-300">
                <div>Correct: <span className="font-semibold text-green-300">{correctCount}</span></div>
                <div>Wrong: <span className="font-semibold text-red-300">{wrongCount}</span></div>
                <div>Skipped: <span className="font-semibold text-yellow-300">{skippedCount}</span></div>
                <div className="mt-2 text-xs text-slate-400">Questions: {questions.length}</div>
              </div>
            </div>
          </Card>

          {questions.map((q, idx) => {
            const userAns = answers ? answers[q.id] ?? null : null;
            const unanswered = userAns === null || typeof userAns === "undefined";

            return (
              <Card key={q.id} className={`bg-[rgba(7,10,23,0.65)] border ${unanswered ? "border-yellow-500" : "border-slate-800"} shadow-2xl`}>
                <CardHeader>
                  <div className="flex items-center justify-between w-full">
                    <CardTitle className="text-lg text-white">Question {idx + 1}</CardTitle>
                    {unanswered && <div className="text-xs font-semibold bg-yellow-400/10 text-yellow-300 px-2 py-1 rounded">Unanswered</div>}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-3 text-slate-200 whitespace-pre-wrap">{q.text}</div>

                  <div className="space-y-2">
                    {["A","B","C","D"].map(k => renderChoice(q, k as any))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="text-sm text-slate-300">
          <p><span className="text-green-300 font-semibold">✓</span> correct option — <span className="text-red-300 font-semibold">✕</span> your wrong selection. Unanswered questions are highlighted in yellow.</p>
        </div>
      </div>
    </div>
  );
}
