// src/utils.ts
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";
import { signOut } from "firebase/auth";
import { auth } from "./firebase";

export type StoredQuestion = {
  id: string;
  text?: string;
  choices?: { A: string; B: string; C: string; D: string };
  correctChoice?: "A" | "B" | "C" | "D";
};

export type QuizResultPayload = {
  uid?: string | null; // optional firebase uid
  name?: string | null;
  email?: string | null;
  rollId?: string | null;
  score?: number | null;
  answers: Record<string, string | null>; // all qids -> 'A'|'B'|'C'|'D' or null
  questionIds: string[]; // order of questions
  questionSetId?: string | null; // NEW: Track which question set this attempt belongs to
  questionsSnapshot?: StoredQuestion[]; // optional full snapshot of questions
  tabSwitchCount?: number;
  extra?: Record<string, any>;
  createdAt?: any; // allow override (but we default to serverTimestamp)
};

export async function logoutUser() {
  try {
    await signOut(auth);
    return { success: true };
  } catch (err) {
    console.error("Error during logout:", err);
    return { success: false, error: err };
  }
}

/**
 * saveQuizResult
 * - writes attempt to both `quizResults` (legacy/admin) and `userAttempts` (user-facing history)
 * - returns ids for both writes when successful
 */
export async function saveQuizResult(payload: QuizResultPayload) {
  try {
    // Ensure createdAt exists (serverTimestamp if not provided)
    const toSave: any = {
      ...payload,
      createdAt: payload.createdAt ?? serverTimestamp(),
    };

    // 1) save to existing collection for admin/legacy flows
    const quizResultsCol = collection(db, "quizResults");
    const quizResultsRef = await addDoc(quizResultsCol, toSave);

    // 2) also save to userAttempts collection (separate place to keep user history)
    const userAttemptsCol = collection(db, "userAttempts");
    // store same payload but add a small typed flag for clarity
    const attemptDoc = {
      ...toSave,
      _savedFrom: "saveQuizResult_v2", // helpful for debugging/migration
    };
    const userAttemptsRef = await addDoc(userAttemptsCol, attemptDoc);

    return {
      success: true,
      quizResultsId: quizResultsRef.id,
      userAttemptsId: userAttemptsRef.id,
    };
  } catch (err) {
    console.error("Error saving quiz result (both locations):", err);
    return { success: false, error: err };
  }
}
