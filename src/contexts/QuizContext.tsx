// src/contexts/QuizContext.tsx
import React, { createContext, useContext, useReducer, useEffect, ReactNode } from "react";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
  orderBy,
  limit,
} from "firebase/firestore";
import { db, auth } from "../firebase";
import { saveQuizResult } from "@/utils";
import { onAuthStateChanged, User } from "firebase/auth";

/* -------------------- Types -------------------- */
export interface Question {
  id: string;
  text: string;
  choices: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctChoice: "A" | "B" | "C" | "D";
}

export interface AuthUser {
  uid: string;
  email?: string | null;
  name?: string | null;
}

export interface UserInfo {
  name: string;
  email: string;
  rollId?: string;
}

export interface QuizState {
  authUser?: AuthUser | null;
  userInfo: UserInfo | null;
  questions: Question[];
  currentQuestionIndex: number;
  answers: { [questionId: string]: "A" | "B" | "C" | "D" | null };
  timeRemaining: number;
  startTime: number | null;
  isSubmitted: boolean;
  score: number | null;
  isLoading: boolean;
  error: string | null;
  tabSwitchCount: number;
}

type QuizAction =
  | { type: "SET_AUTH_USER"; payload: AuthUser | null }
  | { type: "SET_USER_INFO"; payload: UserInfo | null }
  | { type: "SET_QUESTIONS"; payload: Question[] }
  | { type: "SET_CURRENT_QUESTION"; payload: number }
  | { type: "SET_ANSWER"; payload: { questionId: string; answer: "A" | "B" | "C" | "D" | null } }
  | { type: "TICK_TIMER" }
  | { type: "START_QUIZ" }
  | { type: "SUBMIT_QUIZ" }
  | { type: "SET_SCORE"; payload: number }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "RESET_QUIZ" }
  | { type: "RESTORE_STATE"; payload: Partial<QuizState> }
  | { type: "INCREMENT_TAB_SWITCH" }
  | { type: "RESET_TAB_SWITCH" };

/* -------------------- Initial state -------------------- */
const initialState: QuizState = {
  authUser: null,
  userInfo: null,
  questions: [],
  currentQuestionIndex: 0,
  answers: {},
  timeRemaining: 1500,
  startTime: null,
  isSubmitted: false,
  score: null,
  isLoading: false,
  error: null,
  tabSwitchCount: 0,
};

/* -------------------- Reducer -------------------- */
function quizReducer(state: QuizState, action: QuizAction): QuizState {
  switch (action.type) {
    case "SET_AUTH_USER":
      return { ...state, authUser: action.payload };
    case "SET_USER_INFO":
      return { ...state, userInfo: action.payload };
    case "SET_QUESTIONS":
      return { ...state, questions: action.payload };
    case "SET_CURRENT_QUESTION":
      return { ...state, currentQuestionIndex: action.payload };
    case "SET_ANSWER":
      return {
        ...state,
        answers: { ...state.answers, [action.payload.questionId]: action.payload.answer },
      };
    case "TICK_TIMER": {
      const newTime = Math.max(0, state.timeRemaining - 1);
      return { ...state, timeRemaining: newTime };
    }
    case "START_QUIZ": {
      const startTime = Date.now();
      return { ...state, startTime, timeRemaining: 1500, tabSwitchCount: 0, isSubmitted: false, score: null };
    }
    case "SUBMIT_QUIZ":
      return { ...state, isSubmitted: true };
    case "SET_SCORE":
      return { ...state, score: action.payload };
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    case "RESET_QUIZ":
      return initialState;
    case "RESTORE_STATE":
      return { ...state, ...action.payload };
    case "INCREMENT_TAB_SWITCH":
      return { ...state, tabSwitchCount: (state.tabSwitchCount ?? 0) + 1 };
    case "RESET_TAB_SWITCH":
      return { ...state, tabSwitchCount: 0 };
    default:
      return state;
  }
}

/* -------------------- Context type -------------------- */
interface QuizContextType {
  state: QuizState;
  dispatch: React.Dispatch<QuizAction>;
  startQuiz: (userInfo: UserInfo) => Promise<void>;
  setAnswer: (questionId: string, answer: "A" | "B" | "C" | "D" | null) => void;
  goToQuestion: (index: number) => void;
  nextQuestion: () => void;
  previousQuestion: () => void;
  submitQuiz: () => void;
  calculateScore: () => number;
  resetQuiz: () => void;
}

const QuizContext = createContext<QuizContextType | undefined>(undefined);

/* -------------------- Helpers -------------------- */
function shuffleArray<T>(arr: T[]) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* Fetch questions: prefer settings/questions.activeSetId -> questionSets/{id}/questions -> fallback to 'questions' collection */
async function fetchQuestionsFromFirestore(): Promise<Question[]> {
  // 1) check settings doc
  try {
    const settingsRef = doc(db, "settings", "questions");
    const settingsSnap = await getDoc(settingsRef);
    if (settingsSnap.exists()) {
      const data: any = settingsSnap.data();
      const activeSetId = data?.activeSetId;
      if (activeSetId) {
        // fetch subcollection
        const q = query(collection(db, "questionSets", activeSetId, "questions"), orderBy("createdAt", "asc"));
        const snaps = await getDocs(q);
        const out: Question[] = [];
        snaps.forEach((s) => {
          const d = s.data() as any;
          // normalize fields
          const choicesObj = d.choices ?? {};
          const text = (d.text ?? d.question ?? "") as string;
          const correctOption = (d.correctOption ?? d.correctChoice ?? "A") as "A" | "B" | "C" | "D";
          out.push({
            id: s.id,
            text,
            choices: {
              A: String(choicesObj.A ?? ""),
              B: String(choicesObj.B ?? ""),
              C: String(choicesObj.C ?? ""),
              D: String(choicesObj.D ?? ""),
            },
            correctChoice: correctOption,
          });
        });
        if (out.length > 0) return out;
      }
    }
  } catch (err) {
    console.warn("[QuizContext] failed to load questionSets active set:", err);
    // fallthrough to legacy collection
  }

  // 2) fallback: old top-level 'questions' collection where active == true
  try {
    const q = query(collection(db, "questions"), where("active", "==", true));
    const snaps = await getDocs(q);
    const out: Question[] = [];
    snaps.forEach((s) => {
      const d = s.data() as any;
      const choicesObj = d.choices ?? {};
      const text = (d.text ?? d.question ?? "") as string;
      const correctOption = (d.correctOption ?? d.correctChoice ?? "A") as "A" | "B" | "C" | "D";
      out.push({
        id: s.id,
        text,
        choices: {
          A: String(choicesObj.A ?? ""),
          B: String(choicesObj.B ?? ""),
          C: String(choicesObj.C ?? ""),
          D: String(choicesObj.D ?? ""),
        },
        correctChoice: correctOption,
      });
    });
    return out;
  } catch (err) {
    console.error("[QuizContext] fetchQuestionsFromFirestore fallback error", err);
    return [];
  }
}

/* -------------------- Provider -------------------- */
export function QuizProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(quizReducer, initialState);

  // listen to firebase auth and populate authUser in state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        let dbName = u.displayName;
        try {
          const docRef = doc(db, "users", u.uid);
          const snap = await getDoc(docRef);
          if (snap.exists()) {
            const data = snap.data();
            if (data.Name) dbName = data.Name;
            else if (data.name) dbName = data.name;
          }
        } catch (e) {
          console.error("Failed to fetch user doc for name", e);
        }

        dispatch({
          type: "SET_AUTH_USER",
          payload: { uid: u.uid, email: u.email ?? null, name: dbName ?? null },
        });
        // also populate legacy userInfo if not set
        dispatch({
          type: "SET_USER_INFO",
          payload: { name: dbName ?? "", email: u.email ?? "" },
        });
      } else {
        dispatch({ type: "SET_AUTH_USER", payload: null });
      }
    });
    return () => unsub();
  }, []);

  // Timer effect
  useEffect(() => {
    if (state.startTime && !state.isSubmitted && state.timeRemaining > 0) {
      const timer = setInterval(() => dispatch({ type: "TICK_TIMER" }), 1000);
      return () => clearInterval(timer);
    }
  }, [state.startTime, state.isSubmitted, state.timeRemaining]);

  // Auto-submit when timer reaches 0
  useEffect(() => {
    if (state.timeRemaining === 0 && !state.isSubmitted && state.startTime) {
      submitQuiz();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.timeRemaining, state.isSubmitted, state.startTime]);

  // Persist runtime state to localStorage (only when quiz started)
  useEffect(() => {
    if (state.startTime) {
      const toSave = {
        userInfo: state.userInfo,
        answers: state.answers,
        currentQuestionIndex: state.currentQuestionIndex,
        startTime: state.startTime,
        tabSwitchCount: state.tabSwitchCount,
        questions: state.questions,
      };
      try {
        localStorage.setItem("quizState", JSON.stringify(toSave));
      } catch (err) {
        console.warn("localStorage set failed", err);
      }
    }
  }, [state.userInfo, state.answers, state.currentQuestionIndex, state.startTime, state.tabSwitchCount]);

  // Restore runtime state on mount
  useEffect(() => {
    const saved = localStorage.getItem("quizState");
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved);
      if (!parsed || !parsed.startTime || !parsed.questions || parsed.questions.length === 0) {
        localStorage.removeItem("quizState");
        return;
      }
      const elapsed = Math.floor((Date.now() - parsed.startTime) / 1000);
      const remaining = Math.max(0, 1500 - elapsed);
      if (remaining > 0) {
        dispatch({ type: "RESTORE_STATE", payload: { ...parsed, timeRemaining: remaining } });
      } else {
        localStorage.removeItem("quizState");
      }
    } catch (err) {
      console.warn("Failed to restore quiz state", err);
      localStorage.removeItem("quizState");
    }
  }, []);

  /* -------------------- Actions -------------------- */

  const startQuiz = async (userInfo: UserInfo) => {
    dispatch({ type: "SET_LOADING", payload: true });
    // ensure strings
    const normalizedUserInfo: UserInfo = {
      name: (userInfo.name ?? "").toString(),
      email: (userInfo.email ?? "").toString(),
      rollId: (userInfo.rollId ?? "").toString(),
    };
    dispatch({ type: "SET_USER_INFO", payload: normalizedUserInfo });

    try {
      // fetch questions (using settings/activeSetId or fallback)
      const fetched = await fetchQuestionsFromFirestore();
      
      if (!fetched || fetched.length === 0) {
        throw new Error("No active questions found for this quiz. Please contact the administrator.");
      }

      // per-question: shuffle choices per-student AND compute new correct label
      const randomizedQuestions: Question[] = fetched.map((qDoc) => {
        const originalChoices = [qDoc.choices.A, qDoc.choices.B, qDoc.choices.C, qDoc.choices.D];
        const originalCorrectText = qDoc.choices[qDoc.correctChoice] ?? originalChoices[0];
        const shuffled = shuffleArray(originalChoices);
        const labels = ["A", "B", "C", "D"] as const;
        const newChoices = {
          A: shuffled[0],
          B: shuffled[1],
          C: shuffled[2],
          D: shuffled[3],
        };
        const idx = shuffled.findIndex((t) => t === originalCorrectText);
        const newCorrectLabel = (labels[idx >= 0 ? idx : 0]) as "A" | "B" | "C" | "D";

        return {
          id: qDoc.id,
          text: qDoc.text ?? "",
          choices: newChoices,
          correctChoice: newCorrectLabel,
        };
      });

      // shuffle question order
      const finalQuestions = shuffleArray(randomizedQuestions);

      dispatch({ type: "SET_QUESTIONS", payload: finalQuestions });
      dispatch({ type: "START_QUIZ" });

      // attempt fullscreen (best-effort)
      try {
        const el = document.documentElement;
        if (el.requestFullscreen) await el.requestFullscreen();
        else if ((el as any).webkitRequestFullscreen) await (el as any).webkitRequestFullscreen();
      } catch (err) {
        console.warn("fullscreen request failed", err);
      }

      // setup visibility & fullscreen listeners to increment tabSwitchCount
      const onVisibilityChange = () => {
        if (document.hidden && !state.isSubmitted && state.startTime) {
          dispatch({ type: "INCREMENT_TAB_SWITCH" });
        }
      };
      const onFullScreenChange = () => {
        if (!document.fullscreenElement && !state.isSubmitted && state.startTime) {
          dispatch({ type: "INCREMENT_TAB_SWITCH" });
        }
      };

      document.addEventListener("visibilitychange", onVisibilityChange);
      document.addEventListener("fullscreenchange", onFullScreenChange);

      // store cleanup so submitQuiz can call it
      (window as any).__quiz_cleanup = () => {
        document.removeEventListener("visibilitychange", onVisibilityChange);
        document.removeEventListener("fullscreenchange", onFullScreenChange);
      };
    } catch (err) {
      console.error("[QuizContext] startQuiz error", err);
      dispatch({ type: "SET_ERROR", payload: "Failed to load questions. Please try later." });
      throw err;
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const setAnswer = (questionId: string, answer: "A" | "B" | "C" | "D" | null) => {
    dispatch({ type: "SET_ANSWER", payload: { questionId, answer } });
  };

  const goToQuestion = (index: number) => {
    if (index >= 0 && index < state.questions.length) dispatch({ type: "SET_CURRENT_QUESTION", payload: index });
  };

  const nextQuestion = () => {
    if (state.currentQuestionIndex < state.questions.length - 1)
      dispatch({ type: "SET_CURRENT_QUESTION", payload: state.currentQuestionIndex + 1 });
  };

  const previousQuestion = () => {
    if (state.currentQuestionIndex > 0)
      dispatch({ type: "SET_CURRENT_QUESTION", payload: state.currentQuestionIndex - 1 });
  };

  const calculateScore = (): number => {
    let score = 0;
    for (const question of state.questions) {
      const userAns = state.answers[question.id];
      if (userAns === question.correctChoice) score += 5;
      else if (userAns && userAns !== question.correctChoice) score -= 1;
    }
    return score;
  };

  const submitQuiz = async () => {
    // calculate snapshot score
    const finalScore = calculateScore();
    dispatch({ type: "SET_SCORE", payload: finalScore });
    dispatch({ type: "SUBMIT_QUIZ" });

    // cleanup listeners
    try {
      const cleanup = (window as any).__quiz_cleanup;
      if (typeof cleanup === "function") cleanup();
      (window as any).__quiz_cleanup = undefined;
      if (document.fullscreenElement) (document as any).exitFullscreen?.();
    } catch (e) {
      console.warn("cleanup error", e);
    }

    // build answersComplete (explicitly include all question ids)
    const questionIds = state.questions.map((q) => q.id);
    const answersComplete: Record<string, string | null> = {};
    for (const qid of questionIds) {
      const a = state.answers ? (state.answers[qid] ?? null) : null;
      answersComplete[qid] = a === undefined ? null : a;
    }

    // snapshot of questions (non-sensitive) - store shuffled choices + correctChoice so review can show correct option
    const questionsSnapshot = state.questions.map((q) => ({
      id: q.id,
      text: q.text ?? "",
      choices: q.choices,
      correctChoice: q.correctChoice,
    }));

    // ensure rollId is string
    const rollIdStr = (state.userInfo?.rollId ?? "") + "";

    // Fetch current activeSetId so we can tag this submission correctly
    let currentSetId = null;
    try {
      const { fetchActiveQuestionSetMeta } = await import("@/lib/quizMode");
      const meta = await fetchActiveQuestionSetMeta();
      currentSetId = meta.activeSetId;
    } catch (e) {
      console.warn("Could not fetch activeSetId for submission:", e);
    }

    const payload: any = {
      uid: state.authUser?.uid ?? null,
      name: state.userInfo?.name ?? null,
      email: state.userInfo?.email ?? null,
      rollId: rollIdStr || null,
      score: finalScore,
      answers: answersComplete,
      questionIds,
      questionSetId: currentSetId,
      questionsSnapshot,
      tabSwitchCount: state.tabSwitchCount ?? 0,
    };

    try {
      const res = await saveQuizResult(payload);
      if (!res || (res as any).success === false) {
        console.error("Failed to save: ", res);
        // store locally for retry
        localStorage.setItem("lastQuizAttempt", JSON.stringify({ ...payload, _savedLocallyAt: new Date().toISOString() }));
      } else {
        localStorage.removeItem("lastQuizAttempt");
      }
    } catch (err) {
      console.error("Error saving quiz result:", err);
      localStorage.setItem("lastQuizAttempt", JSON.stringify({ ...payload, _savedLocallyAt: new Date().toISOString() }));
    }

    // remove runtime persisted state
    localStorage.removeItem("quizState");
  };

  const resetQuiz = () => {
    dispatch({ type: "RESET_QUIZ" });
    localStorage.removeItem("quizState");
    localStorage.removeItem("lastQuizAttempt");
  };

  return (
    <QuizContext.Provider
      value={{
        state,
        dispatch,
        startQuiz,
        setAnswer,
        goToQuestion,
        nextQuestion,
        previousQuestion,
        submitQuiz,
        calculateScore,
        resetQuiz,
      }}
    >
      {children}
    </QuizContext.Provider>
  );
}

/* -------------------- Hook -------------------- */
export function useQuiz() {
  const context = useContext(QuizContext);
  if (context === undefined) throw new Error("useQuiz must be used within a QuizProvider");
  return context;
}
