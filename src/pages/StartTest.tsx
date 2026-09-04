import { UserEntryForm } from "@/components/UserEntryForm";
import { useQuiz } from "@/contexts/QuizContext";
import { useEffect, useState } from "react";
import { fetchActiveQuestionSetMeta, isAutoQuiz } from "@/lib/quizMode";
import { useNavigate } from "react-router-dom";
import { QuizInterface } from "@/components/QuizInterface";
import { QuizResults } from "@/components/QuizResults";

export default function StartTest() {
  const { state } = useQuiz();
  const navigate = useNavigate();
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

  return (
    <UserEntryForm onClose={() => navigate("/dashboard")} autoQuizMode={autoQuizMode} />
  );
}
