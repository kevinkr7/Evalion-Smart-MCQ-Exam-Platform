import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase";

export type ActiveQuestionSetMeta = {
  activeSetId: string | null;
  questionSet: Record<string, any> | null;
};

export function isAutoQuiz(questionSet: Record<string, any> | null | undefined) {
  return (questionSet?.source ?? "").toString().trim().toLowerCase() === "nexasense";
}

export async function fetchActiveQuestionSetMeta(): Promise<ActiveQuestionSetMeta> {
  const settingsRef = doc(db, "settings", "questions");
  const settingsSnap = await getDoc(settingsRef);
  const activeSetId = settingsSnap.exists() ? ((settingsSnap.data() as any).activeSetId ?? null) : null;

  if (!activeSetId) {
    return { activeSetId: null, questionSet: null };
  }

  const setRef = doc(db, "questionSets", activeSetId);
  const setSnap = await getDoc(setRef);
  const questionSet = setSnap.exists() ? (setSnap.data() as Record<string, any>) : null;

  return { activeSetId, questionSet };
}
