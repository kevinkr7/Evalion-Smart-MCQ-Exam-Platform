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
    // 1) compute final score snapshot (don't rely on state.score which may be stale)
    const scoreNow = calculateScore();

    // 2) stop quiz (mark submitted, cleanup listeners, etc.)
    submitQuiz();
    setShowSubmitDialog(false);

    // 3) save to Firestore using the snapshot value
    try {
      await saveQuizResult({
        name: state.userInfo?.name || "",
        email: state.userInfo?.email || "",
        rollNo: state.userInfo?.rollId || "",
        score: scoreNow, // <-- important: use snapshot
        answers: state.answers || {},
        tabSwitchCount: state.tabSwitchCount ?? 0
      });

      // 4) update local context state with authoritative score (so UI matches)
      dispatch({ type: 'SET_SCORE', payload: scoreNow });
    } catch (err) {
      console.error("Error saving result:", err);
      toast({
        title: "Save failed",
        description: "Could not save your result to server. It may retry automatically.",
      });
      // optionally still set local score so UI shows it even if save failed
      dispatch({ type: 'SET_SCORE', payload: scoreNow });
    }

    toast({
      title: "Quiz Submitted!",
      description: `Your answers have been recorded — score: ${scoreNow}`,
    });
  };




  const getQuestionStatus = (index: number) => {
    const question = state.questions[index];
    if (!question) return 'unanswered';
    
    const hasAnswer = state.answers[question.id];
    if (index === state.currentQuestionIndex) return 'current';
    if (hasAnswer) return 'completed';
    return 'unanswered';
  };

  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">Loading questions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary">
      {/* Header */}
      <div className="bg-card border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-semibold">Technical MCQ Quiz</h1>
              <div className="text-sm text-muted-foreground">
                Welcome, {state.userInfo?.name}
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="quiz-timer">
                ⏰ {formatTime(state.timeRemaining)}
              </div>
              <Button 
                onClick={handleSubmit}
                variant="destructive"
                className="bg-danger hover:bg-danger/90"
              >
                Submit Test
              </Button>
            </div>
          </div>
        </div>
      </div>

      {state.tabSwitchCount > 0 && (
        <div className="fixed top-4 right-4 bg-warning/90 text-warning-foreground px-3 py-1 rounded z-50">
          ⚠️ Tab switches: {state.tabSwitchCount}
        </div>
      )}


      {isBlocked && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full text-center shadow-lg">
            <h3 className="text-xl font-semibold mb-2">Test paused — fullscreen required</h3>
            <p className="mb-4">
              You left fullscreen or switched tabs. Please return to fullscreen to resume the test.
            </p>
            <p className="mb-4 font-medium">Tab switches recorded: {state.tabSwitchCount ?? fullscreenLostCount}</p>
            <div className="flex justify-center gap-3">
              <button
                className="px-4 py-2 rounded bg-primary text-white"
                onClick={async () => {
                  try {
                    const el = document.documentElement;
                    if (el.requestFullscreen) await el.requestFullscreen();
                    else if ((el as any).webkitRequestFullscreen) await (el as any).webkitRequestFullscreen();
                    // resume
                    setIsBlocked(false);
                  } catch (err) {
                    console.warn('requestFullscreen failed', err);
                  }
                }}
              >
                Re-enter Fullscreen
              </button>
              <button
                className="px-4 py-2 rounded border"
                onClick={() => {
                  // optional: allow submit even if blocked (or keep disabled)
                  setShowSubmitDialog(true);
                }}
              >
                Submit Anyway
              </button>
            </div>
          </div>
        </div>
      )}


      <div className="max-w-7xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Question Navigation Sidebar */}
        <Card className="lg:col-span-1 quiz-card h-fit">
          <CardContent className="p-4">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Question Progress</h3>
                <Progress value={progress} className="quiz-progress-bar" />
                <p className="text-sm text-muted-foreground mt-1">
                  {state.currentQuestionIndex + 1} of {state.questions.length} questions
                </p>
              </div>
              
              <div className="grid grid-cols-5 gap-2">
                {state.questions.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToQuestion(index)}
                    className={`quiz-question-nav ${getQuestionStatus(index)}`}
                    title={`Question ${index + 1}`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>

              <div className="text-xs space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-success"></div>
                  <span>Answered</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-primary"></div>
                  <span>Current</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-warning"></div>
                  <span>Unanswered</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Question Area */}
        <div className="lg:col-span-3 space-y-6">
          <Card className="quiz-card fade-in">
            <CardContent className="p-6">
              <div className="space-y-6">
                {/* Question Header */}
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">
                    Question {state.currentQuestionIndex + 1}
                  </h2>
                  <div className="text-sm text-muted-foreground">
                    5 marks
                  </div>
                </div>

                {/* Question Text (preserve newlines & spaces from CSV) */}
                <div className="flex justify-center">
                  <div className="bg-muted rounded-lg p-6 max-w-2xl w-full">
                    <div
                      className="text-lg leading-relaxed"
                      style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
                    >
                      {currentQuestion.text}
                    </div>
                  </div>
                </div>

                {/* Answer Options */}
                <div className="space-y-3">
                  {Object.entries(currentQuestion.choices).map(([key, text]) => (
                    <button
                      key={key}
                      onClick={() => { if (!isBlocked) handleAnswerSelect(key as 'A' | 'B' | 'C' | 'D'); }}
                      className={`quiz-option ${currentAnswer === key ? 'selected' : ''} ${isBlocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                      disabled={isBlocked}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full border-2 border-current flex items-center justify-center font-semibold">
                          {key}
                        </div>
                        <span className="text-left">{text}</span>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between pt-4">
                  <Button
                    onClick={previousQuestion}
                    disabled={state.currentQuestionIndex === 0}
                    variant="outline"
                    className="quiz-button-secondary"
                  >
                    ← Previous
                  </Button>
                  
                  <div className="flex gap-2">
                    {currentAnswer && (
                      <Button
                        onClick={() => setAnswer(currentQuestion.id, null)}
                        variant="outline"
                        className="text-warning border-warning hover:bg-warning hover:text-warning-foreground"
                      >
                        Clear Answer
                      </Button>
                    )}
                    
                    {state.currentQuestionIndex < state.questions.length - 1 ? (
                      <Button
                        onClick={nextQuestion}
                        className="quiz-button-primary"
                      >
                        Next →
                      </Button>
                    ) : (
                      <Button
                        onClick={handleSubmit}
                        className="bg-success hover:bg-success/90 text-success-foreground"
                      >
                        Finish Test
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Submit Confirmation Dialog */}
      <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Your Test?</DialogTitle>
            <DialogDescription>
              Are you sure you want to submit your test? Once submitted, you cannot make any changes to your answers.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Questions answered:</span>
                <span className="font-semibold">
                  {Object.values(state.answers).filter(answer => answer !== null).length} / {state.questions.length}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Time remaining:</span>
                <span className="font-semibold text-warning">
                  {formatTime(state.timeRemaining)}
                </span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowSubmitDialog(false)}
            >
              Continue Test
            </Button>
            <Button
              onClick={confirmSubmit}
              className="bg-success hover:bg-success/90 text-success-foreground"
            >
              Submit Test
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}