// src/components/QuizResults.tsx
import React, { useState, useEffect } from 'react';
import { useQuiz } from '@/contexts/QuizContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useToast } from "@/hooks/use-toast";
import { fetchActiveQuestionSetMeta, isAutoQuiz } from "@/lib/quizMode";

const AnimatedSection = ({ children, delay = 0, className = "" }: { children: React.ReactNode, delay?: number, className?: string }) => {
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);
  return (
    <div 
      className={`transition-all duration-700 ease-out transform ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      } ${className}`}
    >
      {children}
    </div>
  );
};

export function QuizResults() {
  const { state, resetQuiz } = useQuiz();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [completedAt] = useState(() => new Date().toLocaleString());
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [windowSize, setWindowSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    setWindowSize({ w: window.innerWidth, h: window.innerHeight });
    const handleResize = () => setWindowSize({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (windowSize.w === 0) return;
    const x = (e.clientX / windowSize.w) * 2 - 1;
    const y = (e.clientY / windowSize.h) * 2 - 1;
    setMousePos({ x, y });
  };

  const safeScore = state.score ?? 0;
  const totalQuestions = state.questions.length;
  const maxPoints = totalQuestions * 5;

  const getScoreColor = (score: number) => {
    const pct = (score / Math.max(1, maxPoints)) * 100;
    if (pct >= 80) return 'text-violet-300';
    if (pct >= 60) return 'text-violet-400';
    return 'text-white/60';
  };

  const handleOpenReview = async () => {
    try {
      const meta = await fetchActiveQuestionSetMeta();
      if (isAutoQuiz(meta.questionSet)) {
        navigate("/review");
        return;
      }

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
    if (pct >= 90) return "Outstanding performance.";
    if (pct >= 80) return "Great job. Well done.";
    if (pct >= 70) return "Good work. Keep it up.";
    if (pct >= 60) return "Nice effort. Room for improvement.";
    return "Keep practicing. You will do better next time.";
  };

  const correctCount = state.questions.reduce((acc, q) => {
    const ans = state.answers[q.id];
    if (ans && ans === q.correctChoice) return acc + 1;
    return acc;
  }, 0);

  const answeredQuestions = Object.values(state.answers).filter(a => a !== null && typeof a !== 'undefined').length;
  const skippedQuestions = totalQuestions - answeredQuestions;
  const wrongCount = Math.max(0, answeredQuestions - correctCount);

  return (
    <div 
      className="min-h-screen relative flex flex-col items-center justify-center p-6 font-['Geist'] bg-[#0b0b0d] text-white overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      {/* Dynamic Parallax Background */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-full h-full opacity-30">
          <div 
            className="absolute top-[10%] left-[10%] w-[50vw] h-[50vw] bg-violet-600 rounded-full mix-blend-screen filter blur-[120px] transition-transform duration-700 ease-out opacity-40" 
            style={{ transform: `translate(${mousePos.x * -40}px, ${mousePos.y * -40}px)` }}
          ></div>
          <div 
            className="absolute bottom-[10%] right-[10%] w-[40vw] h-[40vw] bg-indigo-600 rounded-full mix-blend-screen filter blur-[120px] transition-transform duration-700 ease-out opacity-30" 
            style={{ transform: `translate(${mousePos.x * 50}px, ${mousePos.y * 50}px)` }}
          ></div>
        </div>
      </div>

      <div className="relative z-10 w-full max-w-3xl space-y-8 mt-10 mb-10">
        
        {/* Header */}
        <AnimatedSection delay={100} className="text-center space-y-4">
          <h1 className="text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-violet-300">
            Quiz Completed
          </h1>
          <p className="text-lg text-white/60 max-w-2xl mx-auto font-light">
            Thank you for completing the assessment. Your performance overview is below.
          </p>
        </AnimatedSection>

        {/* Results Card */}
        <AnimatedSection delay={200}>
          <Card className="bg-[#121217]/80 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)] rounded-2xl overflow-hidden relative">
            {/* Top Accent Line */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 to-indigo-500"></div>
            
            <CardHeader className="text-center pb-4 pt-8">
              <CardTitle className="text-3xl text-white font-semibold">
                {state.userInfo?.name || 'Participant'}
              </CardTitle>
              <CardDescription className="text-sm text-white/50 tracking-wide uppercase mt-2">
                Assessment Results
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-10 px-8 pb-10">
              {/* Score Display */}
              <AnimatedSection delay={300} className="text-center space-y-4">
                <div className={`text-7xl font-extrabold tracking-tighter ${getScoreColor(safeScore)}`}>
                  {safeScore}
                </div>
                <div className="text-md text-white/50 uppercase tracking-widest font-semibold">
                  out of <span className="text-white">{maxPoints}</span> points
                </div>
                <div className="text-lg font-medium text-violet-200/80 pt-2">
                  {getScoreMessage(safeScore)}
                </div>
              </AnimatedSection>

              {/* Statistics Grid */}
              <AnimatedSection delay={400} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col items-center justify-center p-6 rounded-xl bg-white/[0.03] border border-white/5 hover:border-violet-500/30 transition-colors">
                  <div className="text-3xl font-bold text-white mb-1">
                    {answeredQuestions}
                  </div>
                  <div className="text-xs text-white/50 uppercase tracking-widest">
                    Answered
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center p-6 rounded-xl bg-white/[0.03] border border-white/5 hover:border-violet-500/30 transition-colors">
                  <div className="text-3xl font-bold text-white mb-1">
                    {skippedQuestions}
                  </div>
                  <div className="text-xs text-white/50 uppercase tracking-widest">
                    Skipped
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center p-6 rounded-xl bg-white/[0.03] border border-white/5 hover:border-violet-500/30 transition-colors">
                  <div className="text-3xl font-bold text-white mb-1">
                    {totalQuestions}
                  </div>
                  <div className="text-xs text-white/50 uppercase tracking-widest">
                    Total
                  </div>
                </div>
              </AnimatedSection>

              {/* Performance Breakdown */}
              <AnimatedSection delay={500} className="bg-[#0b0b0d]/50 p-6 rounded-xl border border-white/5">
                <h3 className="font-semibold text-white/80 mb-4 text-sm uppercase tracking-wider">Breakdown</h3>
                <div className="space-y-3 text-sm text-white/60">
                  <div className="flex justify-between items-center pb-2 border-b border-white/5">
                    <span>Correct answers (+5 points)</span>
                    <span className="font-semibold text-white">
                      {correctCount}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-white/5">
                    <span>Wrong answers (-1 point)</span>
                    <span className="font-semibold text-white">
                      {wrongCount}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Skipped questions (0 points)</span>
                    <span className="font-semibold text-white">
                      {skippedQuestions}
                    </span>
                  </div>
                </div>
              </AnimatedSection>

              {/* User Info */}
              <AnimatedSection delay={600} className="space-y-2 text-xs text-white/40">
                <div className="flex justify-between">
                  <span>Name</span>
                  <span className="text-white/70">{state.userInfo?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Email</span>
                  <span className="text-white/70">{state.userInfo?.email}</span>
                </div>
                {state.userInfo?.rollId && (
                  <div className="flex justify-between">
                    <span>Register No</span>
                    <span className="text-white/70">{state.userInfo.rollId}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Completed at</span>
                  <span className="text-white/70">{completedAt}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tab switches</span>
                  <span className="text-white/70">{state.tabSwitchCount ?? 0}</span>
                </div>
              </AnimatedSection>

              {/* Action Buttons */}
              <AnimatedSection delay={700} className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button
                  onClick={handleOpenReview}
                  className="flex-1 py-6 rounded-xl bg-white text-black hover:bg-white/90 font-semibold shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all hover:scale-[1.02]"
                >
                  View Detailed Review
                </Button>
                <Button
                  onClick={() => navigate("/dashboard")}
                  variant="outline"
                  className="flex-1 py-6 rounded-xl border border-white/10 text-white bg-transparent hover:bg-white/5 font-medium transition-all"
                >
                  Return to Dashboard
                </Button>
              </AnimatedSection>
            </CardContent>
          </Card>
        </AnimatedSection>

        {/* Note */}
        <AnimatedSection delay={800} className="text-center text-sm text-white/30 pt-4">
          <p>Your results have been saved successfully.</p>
        </AnimatedSection>
      </div>
    </div>
  );
}
