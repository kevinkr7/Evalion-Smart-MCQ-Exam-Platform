import React, { useState } from 'react';
import { useQuiz } from '@/contexts/QuizContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { saveQuizResult } from '../utils.ts';
import { useEffect } from 'react';


export function QuizInterface() {
  const { state, dispatch, calculateScore, setAnswer, goToQuestion, nextQuestion, previousQuestion, submitQuiz } = useQuiz();
  const { toast } = useToast();
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false); // blocks answering when true
  const [fullscreenLostCount, setFullscreenLostCount] = useState(0); // local mirror for UI


  const currentQuestion = state.questions[state.currentQuestionIndex];
  const currentAnswer = currentQuestion ? state.answers[currentQuestion.id] : null;
  const progress = ((state.currentQuestionIndex + 1) / state.questions.length) * 100;

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (answer: 'A' | 'B' | 'C' | 'D') => {
    if (currentQuestion) {
      setAnswer(currentQuestion.id, answer === currentAnswer ? null : answer);
    }
  };

  const handleSubmit = () => {
    setShowSubmitDialog(true);
  };

  useEffect(() => {
    // handler to set blocked state when fullscreen lost or tab hidden
    const onVisibilityChange = () => {
      const activeQuiz = !!state.startTime && !state.isSubmitted;
      if (activeQuiz) {
        if (document.hidden) {
          // increment block and show
          dispatch({ type: 'INCREMENT_TAB_SWITCH' });
          setFullscreenLostCount(prev => prev + 1);
          setIsBlocked(true);
        }
      }
    };

    const onFullScreenChange = () => {
      const activeQuiz = !!state.startTime && !state.isSubmitted;
      if (activeQuiz) {
        if (!document.fullscreenElement) {
          // fullscreen ended
          dispatch({ type: 'INCREMENT_TAB_SWITCH' });
          setFullscreenLostCount(prev => prev + 1);
          setIsBlocked(true);
        } else {
          // entered fullscreen again -> un-block
          setIsBlocked(false);
        }
      }
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    document.addEventListener('fullscreenchange', onFullScreenChange);

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      document.removeEventListener('fullscreenchange', onFullScreenChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const confirmSubmit = async () => {
    // submitQuiz in QuizContext already calculates score, saves to Firestore, and updates state
    submitQuiz();
    setShowSubmitDialog(false);
  };




  const getQuestionStatusClass = (index: number) => {
    const question = state.questions[index];
    if (!question) return 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10';
    
    const hasAnswer = state.answers[question.id];
    if (index === state.currentQuestionIndex) return 'bg-indigo-500 text-white border-indigo-500 ring-4 ring-indigo-500/20';
    if (hasAnswer) return 'bg-emerald-500 text-white border-emerald-500';
    return 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10';
  };

  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b0b0d] text-white font-['Geist']">
        <div className="text-center">
          <div className="w-12 h-12 border-t-2 border-indigo-500 rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-lg text-slate-400 tracking-wider">Loading assessment data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0b0d] text-white font-['Geist'] flex flex-col relative overflow-hidden">
      {/* Background SVG Noise */}
      <div className="fixed inset-0 w-full h-full pointer-events-none opacity-[0.03] z-0" style={{backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`}}></div>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#0b0b0d]/80 backdrop-blur-xl border-b border-white/10 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            Technical MCQ Quiz
          </h1>
          <p className="text-sm text-slate-400 mt-1">Candidate: <span className="text-slate-200">{state.userInfo?.name}</span></p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full font-mono text-emerald-400 text-lg font-semibold tracking-wider">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            {formatTime(state.timeRemaining)}
          </div>
          <button 
            onClick={handleSubmit}
            className="px-5 py-2.5 bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white font-medium rounded-lg transition-all"
          >
            Submit Test
          </button>
        </div>
      </header>

      {/* Tab Switch Warning Overlay */}
      {state.tabSwitchCount > 0 && (
        <div className="fixed top-24 right-6 bg-red-500/90 backdrop-blur-md text-white px-4 py-2 rounded-lg z-50 shadow-[0_0_20px_rgba(239,68,68,0.3)] border border-red-400 flex items-center gap-2 font-medium">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
          Tab switches: {state.tabSwitchCount}
        </div>
      )}

      {/* Fullscreen Blocked Modal */}
      {isBlocked && (
        <div className="fixed inset-0 z-[9999] bg-[#0b0b0d]/90 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="bg-[#111116] border border-red-500/30 shadow-[0_0_50px_rgba(239,68,68,0.15)] rounded-3xl p-8 max-w-lg w-full text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="w-16 h-16 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 relative z-10">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2 relative z-10">Test Paused</h3>
            <p className="text-slate-400 mb-6 relative z-10">
              You left fullscreen or switched tabs. Please return to fullscreen to resume the assessment securely.
            </p>
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-8 relative z-10">
              <p className="text-red-400 font-medium">Tab switches recorded: {state.tabSwitchCount ?? fullscreenLostCount}</p>
            </div>
            <div className="flex flex-col sm:flex-row justify-center gap-4 relative z-10">
              <button
                className="px-6 py-3 bg-white text-black font-semibold rounded-lg hover:bg-slate-200 transition-colors"
                onClick={async () => {
                  try {
                    const el = document.documentElement;
                    if (el.requestFullscreen) await el.requestFullscreen();
                    else if ((el as any).webkitRequestFullscreen) await (el as any).webkitRequestFullscreen();
                    setIsBlocked(false);
                  } catch (err) {
                    console.warn('requestFullscreen failed', err);
                  }
                }}
              >
                Re-enter Fullscreen
              </button>
              <button
                className="px-6 py-3 bg-transparent border border-white/20 text-white font-medium rounded-lg hover:bg-white/5 transition-colors"
                onClick={() => setShowSubmitDialog(true)}
              >
                Submit Anyway
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Layout */}
      <div className="flex-1 w-full max-w-[1500px] mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
        
        {/* LEFT SIDEBAR: Navigation */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-[#111116] border border-white/10 rounded-2xl p-6 shadow-2xl sticky top-24">
            <h3 className="font-semibold text-slate-200 mb-4">Progress</h3>
            
            <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden mb-3">
              <div 
                className="h-full bg-emerald-500 transition-all duration-500 ease-out" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            
            <p className="text-sm text-slate-400 mb-8">
              <span className="text-white font-medium">{Object.values(state.answers).filter(a => a !== null).length}</span> of {state.questions.length} answered
            </p>
            
            <div className="grid grid-cols-5 gap-2.5">
              {state.questions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToQuestion(index)}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium transition-all border ${getQuestionStatusClass(index)}`}
                  title={`Question ${index + 1}`}
                >
                  {index + 1}
                </button>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-white/10 space-y-3 text-sm text-slate-400">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div> 
                <span>Answered</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-indigo-500 ring-2 ring-indigo-500/30"></div> 
                <span>Current</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-white/5 border border-white/20"></div> 
                <span>Unanswered</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT AREA: Question & Answers */}
        <div className="lg:col-span-9 flex flex-col">
          <div className="bg-[#111116] border border-white/10 rounded-2xl p-4 md:p-6 shadow-2xl flex-1 flex flex-col relative overflow-hidden">
            {/* Subtle glow */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#7c3aed]/5 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="flex items-center justify-between mb-4 relative z-10 pb-4 border-b border-white/10">
              <h2 className="text-xl md:text-2xl font-bold text-white">
                Question {state.currentQuestionIndex + 1}
              </h2>
              <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-xs md:text-sm text-slate-400 font-medium">
                5 marks
              </span>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-4 md:p-6 mb-6 relative z-10">
              <p 
                className="text-base md:text-lg text-slate-200 leading-relaxed font-medium"
                style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
              >
                {currentQuestion.text}
              </p>
            </div>

            <div className="space-y-2 mb-6 relative z-10 flex-1">
              {Object.entries(currentQuestion.choices).map(([key, text]) => {
                const isSelected = currentAnswer === key;
                return (
                  <button
                    key={key}
                    onClick={() => { if (!isBlocked) handleAnswerSelect(key as 'A' | 'B' | 'C' | 'D'); }}
                    disabled={isBlocked}
                    className={`w-full text-left p-3 md:p-4 rounded-xl border transition-all flex items-start gap-4 ${
                      isSelected 
                        ? 'bg-indigo-500/10 border-indigo-500 shadow-[0_0_15px_rgba(124,58,237,0.15)] text-white' 
                        : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/20'
                    } ${isBlocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className={`flex-shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center font-bold text-xs mt-0.5 ${
                      isSelected ? 'border-indigo-400 text-indigo-400 bg-indigo-500/20' : 'border-slate-500 text-slate-500'
                    }`}>
                      {key}
                    </div>
                    <span className="text-base leading-snug">{text}</span>
                  </button>
                );
              })}
            </div>

            <div className="mt-auto pt-6 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4 relative z-10">
              <button
                onClick={previousQuestion}
                disabled={state.currentQuestionIndex === 0}
                className="px-5 py-2.5 bg-transparent border border-white/20 text-white font-medium rounded-lg hover:bg-white/5 transition-colors disabled:opacity-30 disabled:hover:bg-transparent w-full sm:w-auto text-sm"
              >
                ← Previous
              </button>
              
              <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
                {currentAnswer && (
                  <button
                    onClick={() => setAnswer(currentQuestion.id, null)}
                    className="px-4 py-2.5 text-slate-400 hover:text-white transition-colors text-sm font-medium"
                  >
                    Clear Answer
                  </button>
                )}
                
                {state.currentQuestionIndex < state.questions.length - 1 ? (
                  <button
                    onClick={nextQuestion}
                    className="px-6 py-2.5 bg-white text-black hover:bg-slate-200 font-semibold rounded-lg shadow-lg transition-all text-sm"
                  >
                    Next →
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-lg shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all text-sm"
                  >
                    Finish Test
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Confirmation Dialog */}
      <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <DialogContent className="bg-[#111116] border border-white/10 text-white font-['Geist'] shadow-2xl sm:rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Submit Assessment?</DialogTitle>
            <DialogDescription className="text-slate-400 text-base mt-2">
              Are you sure you want to submit your test? Once submitted, you cannot make any changes to your answers.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-6">
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-medium">Questions answered</span>
                <span className="text-lg font-bold text-white">
                  {Object.values(state.answers).filter(a => a !== null).length} <span className="text-slate-500 text-sm">/ {state.questions.length}</span>
                </span>
              </div>
              <div className="h-px w-full bg-white/10"></div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-medium">Time remaining</span>
                <span className="font-mono text-emerald-400 text-lg font-bold tracking-wider">
                  {formatTime(state.timeRemaining)}
                </span>
              </div>
            </div>
          </div>
          
          <DialogFooter className="gap-3 sm:gap-0 mt-2">
            <button
              onClick={() => setShowSubmitDialog(false)}
              className="px-5 py-2.5 bg-transparent border border-white/20 text-white font-medium rounded-lg hover:bg-white/5 transition-colors"
            >
              Continue Test
            </button>
            <button
              onClick={confirmSubmit}
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-lg shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all"
            >
              Confirm Submission
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}