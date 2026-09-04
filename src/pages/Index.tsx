import { useQuiz } from "@/contexts/QuizContext";
import { UserEntryForm } from "@/components/UserEntryForm";
import { QuizInterface } from "@/components/QuizInterface";
import { QuizResults } from "@/components/QuizResults";
import MemberLogin from "@/components/MemberLogin";
import { fetchActiveQuestionSetMeta, isAutoQuiz } from "@/lib/quizMode";
import { LandingLayout } from "@/components/landing/LandingLayout";
import { useState, useEffect } from "react";

export default function Index() {
  const { state, dispatch, startQuiz } = useQuiz();
  const [showEntryForm, setShowEntryForm] = useState(false);
  const [autoQuizMode, setAutoQuizMode] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const meta = await fetchActiveQuestionSetMeta();
        if (!mounted) return;
        setAutoQuizMode(isAutoQuiz(meta.questionSet));
      } catch (err) {}
    })();
    return () => { mounted = false; };
  }, []);



  if (state.isSubmitted) return <QuizResults />;
  if (state.startTime && state.userInfo) return <QuizInterface />;
  
  if (showEntryForm) {
      return (
        <div style={{minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0b0b0d', padding: '20px'}}>
            <div style={{background: '#16161a', padding: '40px', borderRadius: '16px', width: '100%', maxWidth: '500px'}}>
                <h2 style={{color: 'white', marginBottom: '20px', fontSize: '24px'}}>Enter Details</h2>
                <UserEntryForm onClose={() => setShowEntryForm(false)} autoQuizMode={autoQuizMode} />
            </div>
        </div>
      )
  }


  // Render the native React Landing Page
  return (
    <LandingLayout />
  );
}
