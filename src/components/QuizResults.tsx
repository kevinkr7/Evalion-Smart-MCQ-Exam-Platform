// src/components/QuizResults.tsx
import React from 'react';
import { useQuiz } from '@/contexts/QuizContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useToast } from "@/hooks/use-toast";

export function QuizResults() {
  const { state, resetQuiz } = useQuiz();
  const navigate = useNavigate();
  const { toast } = useToast();

  const safeScore = state.score ?? 0;
  const totalQuestions = state.questions.length;
  const maxPoints = totalQuestions * 5;

  const getScoreColor = (score: number) => {
    // return Tailwind color classes suitable for dark theme
    const pct = (score / Math.max(1, maxPoints)) * 100;
    if (pct >= 80) return 'text-green-400';
    if (pct >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

    const handleOpenReview = async () => {
    try {
      // check settings doc at settings/results -> { released: boolean }
      const ref = doc(db, "settings", "results");
      const snap = await getDoc(ref);
      const released = snap.exists() ? (snap.data() as any).released === true : false;

      if (!released) {
        toast({
          title: "Results not available",
          description: "Results review is not yet released by the administrator.",
        });
        return;
      }

      // navigate to review page
      navigate("/review");
    } catch (err) {
      console.error("Failed to check release flag:", err);
      toast({
        title: "Error",
        description: "Could not verify if results are released. Try again later.",
      });
    }
  };

  const getScoreMessage = (score: number) => {
    const pct = (score / Math.max(1, maxPoints)) * 100;
    if (pct >= 90) return "Outstanding performance! 🎉";
    if (pct >= 80) return "Great job! Well done! 👏";
    if (pct >= 70) return "Good work! Keep it up! 👍";
    if (pct >= 60) return "Nice effort! Room for improvement. 📚";
    return "Keep practicing! You'll do better next time. 💪";
  };

  // compute counts directly (unchanged logic)
  const correctCount = state.questions.reduce((acc, q) => {
    const ans = state.answers[q.id];
    if (ans && ans === q.correctChoice) return acc + 1;
    return acc;
  }, 0);

  const answeredQuestions = Object.values(state.answers).filter(a => a !== null && typeof a !== 'undefined').length;
  const skippedQuestions = totalQuestions - answeredQuestions;
  const wrongCount = Math.max(0, answeredQuestions - correctCount);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#05040a] via-[#071020] to-[#0b0b14] flex items-center justify-center p-6 text-slate-100">
      <div className="w-full max-w-3xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#7c3aed] via-[#6366f1] to-[#06b6d4]">
            Quiz Completed!
          </h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">
            Thank you for taking the Technical MCQ Quiz — here’s how you performed.
          </p>
        </div>

        {/* Results Card */}
        <Card className="bg-[rgba(7,10,23,0.65)] border border-slate-800 shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-white">
              Thank you, {state.userInfo?.name || 'Participant'}! 🎯
            </CardTitle>
            <CardDescription className="text-sm text-slate-300">
              Here are your test results
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Score Display */}
            <div className="text-center space-y-4">
              <div className={`text-6xl font-extrabold ${getScoreColor(safeScore)}`}>
                {safeScore}
              </div>
              <div className="text-md text-slate-400">
                out of <span className="font-semibold text-white">{maxPoints}</span> points
              </div>
              <div className="text-lg font-medium text-slate-200">
                {getScoreMessage(safeScore)}
              </div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 rounded-lg bg-gradient-to-br from-[#07203a] to-[#031024] border border-slate-800">
                <div className="text-2xl font-bold text-[#06b6d4]">
                  {answeredQuestions}
                </div>
                <div className="text-sm text-slate-300">
                  Questions Answered
                </div>
              </div>

              <div className="text-center p-4 rounded-lg bg-gradient-to-br from-[#2a1b12] to-[#1b1210] border border-slate-800">
                <div className="text-2xl font-bold text-[#f59e0b]">
                  {skippedQuestions}
                </div>
                <div className="text-sm text-slate-300">
                  Questions Skipped
                </div>
              </div>

              <div className="text-center p-4 rounded-lg bg-gradient-to-br from-[#191124] to-[#0d0b16] border border-slate-800">
                <div className="text-2xl font-bold text-[#a78bfa]">
                  {totalQuestions}
                </div>
                <div className="text-sm text-slate-300">
                  Total Questions
                </div>
              </div>
            </div>

            {/* Performance Breakdown */}
            <div className="space-y-3">
              <h3 className="font-semibold text-center text-white">Performance Breakdown</h3>
              <div className="space-y-2 text-sm text-slate-300">
                <div className="flex justify-between items-center">
                  <span>Correct answers (+5 points each):</span>
                  <span className="font-semibold text-green-400">
                    {correctCount} question{correctCount !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Wrong answers (-1 point each):</span>
                  <span className="font-semibold text-red-400">
                    {wrongCount} question{wrongCount !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Skipped questions (0 points each):</span>
                  <span className="font-semibold text-yellow-400">
                    {skippedQuestions} question{skippedQuestions !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </div>

            {/* User Info */}
            <div className="border-t border-slate-800 pt-4 space-y-3 text-sm">
              <div className="flex justify-between text-slate-300">
                <span>Name:</span>
                <span className="text-white">{state.userInfo?.name}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Email:</span>
                <span className="text-white">{state.userInfo?.email}</span>
              </div>
              {state.userInfo?.rollId && (
                <div className="flex justify-between text-slate-300">
                  <span>Register No:</span>
                  <span className="text-white">{state.userInfo.rollId}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-300">
                <span>Completed at:</span>
                <span className="text-white">{new Date().toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Tab switches recorded:</span>
                <span className="text-white">{state.tabSwitchCount ?? 0}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-2">
                <Button
                  onClick={handleOpenReview}
                  className="flex-1 py-3 rounded-lg bg-gradient-to-r from-[#6366f1] to-[#7c3aed] hover:from-[#4f46e5] hover:to-[#6d28d9] text-white shadow"
                >
                  View Detailed Review
                </Button>
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                className="px-4 py-3 rounded-lg border border-slate-700 text-slate-200 bg-transparent hover:bg-slate-800"
              >
                Home
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Note */}
        <div className="text-center text-sm text-slate-400">
          <p>Your results have been saved successfully. You can now close this window.</p>
        </div>
      </div>
    </div>
  );
}
