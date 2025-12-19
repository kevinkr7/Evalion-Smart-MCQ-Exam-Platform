// src/pages/Index.tsx
import React, { useEffect, useState } from "react";
import { useQuiz } from "@/contexts/QuizContext";
import { UserEntryForm } from "@/components/UserEntryForm";
import { QuizInterface } from "@/components/QuizInterface";
import { QuizResults } from "@/components/QuizResults";
import MemberLogin from "@/components/MemberLogin";
import { Link } from "react-router-dom";
import { mockQuestions } from "@/data/mockQuestions";

/* ... (rest of imports remain same) ... */

export default function Index() {
  const { state, dispatch } = useQuiz();
  const [showEntryForm, setShowEntryForm] = useState(false);

  useEffect(() => {
    dispatch({ type: "SET_QUESTIONS", payload: mockQuestions });
  }, [dispatch]);

  if (state.isSubmitted) return <QuizResults />;
  if (state.startTime && state.userInfo) return <QuizInterface />;

  if (showEntryForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#05040a] via-[#071020] to-[#0b0b14] text-slate-100 p-6">
        <div className="max-w-3xl mx-auto">
          <div className="bg-[rgba(7,10,23,0.85)] border border-slate-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold">Confirm Your Details</h2>
                <div className="text-sm text-slate-400">Fill the details and start the test.</div>
              </div>
              <div>
                <button
                  onClick={() => setShowEntryForm(false)}
                  className="bg-slate-700 text-white px-3 py-1 rounded hover:bg-slate-600"
                >
                  Back
                </button>
              </div>
            </div>

            <UserEntryForm onClose={() => setShowEntryForm(false)} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#05040a] via-[#071020] to-[#0b0b14] text-slate-100">
      {/* Header visible only on landing */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
        <div className="text-xl font-bold">Quiz Portal</div>

        <div className="flex items-center gap-3">
          {state.authUser?.uid ? (
            <>
              <Link to="/dashboard">
                <button className="bg-[linear-gradient(90deg,#6366f1,#7c3aed)] text-white px-4 py-2 rounded-lg hover:opacity-95">
                  📊 Dashboard
                </button>
              </Link>

              <Link to="/admin">
                <button className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90">
                  🔑 Admin
                </button>
              </Link>

              {/* Logout button */}
              <button
                onClick={async () => {
                  const { logoutUser } = await import("@/utils"); // lazy import
                  const res = await logoutUser();
                  if (res.success) {
                    dispatch({ type: "RESET" }); // clear quiz state
                    window.location.href = "/"; // redirect to home
                  } else {
                    alert("Logout failed. Please try again.");
                  }
                }}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
              >
                🚪 Logout
              </button>
            </>
          ) : (
            <Link to="/admin">
              <button className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90">
                🔑 Admin
              </button>
            </Link>
          )}
        </div>

      </header>

      <div className="p-6 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* LEFT: big title + captions */}
        <div className="space-y-6 px-4 md:px-8">
          <h1 className="text-5xl md:text-7xl font-extrabold leading-tight bg-clip-text text-transparent bg-gradient-to-r from-[#7c3aed] via-[#6366f1] to-[#06b6d4]">
            Technical MCQ
          </h1>
          <p className="text-lg text-slate-300">Sharpen your technical skills with a quick, timed MCQ quiz — designed for practice, review, and ranking.</p>

          <div className="mt-6 p-4 rounded-lg border border-slate-800 bg-[rgba(7,10,23,0.6)] shadow">
            <h3 className="font-semibold text-white">Pro tip</h3>
            <p className="text-sm text-slate-300">Log in first to save & view your attempts. Your progress is saved on submission and can be reviewed later.</p>
          </div>
        </div>

        {/* RIGHT: Login / Proceed box */}
        <div className="px-4 md:px-8">
          <div className="max-w-md mx-auto bg-[rgba(7,10,23,0.65)] border border-slate-800 rounded-xl p-6 shadow-lg">
            {!state.authUser?.uid ? (
              <div className="space-y-4">
                <h2 className="text-xl font-bold">Member Login</h2>
                <p className="text-sm text-slate-400">Sign in with your provided credentials to continue.</p>
                <div className="pt-3">
                  <MemberLogin />
                </div>
                <div className="mt-4 text-xs text-slate-500">
                  <p>Don't have credentials? Ask your instructor to create an account for you.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-bold">{state.authUser.name ?? state.authUser.email}</h2>
                    <div className="text-xs text-slate-400">Signed in</div>
                  </div>
                </div>

                <div className="mt-2 text-sm text-slate-300 space-y-2">
                  <h3 className="font-semibold">Test Instructions</h3>
                  <ol className="list-decimal list-inside text-slate-400 space-y-1">
                    <li>Read each question carefully before answering.</li>
                    <li>Switching tabs or exiting fullscreen increments a proctor counter.</li>
                    <li>You can pause only before starting the quiz — no pauses during the test.</li>
                    <li>Results will be saved to your account after submission.</li>
                  </ol>
                </div>

                <div className="pt-3 flex flex-col gap-3">
                  <div className="text-sm text-slate-300">Please confirm your details before starting the test.</div>
                  <button
                    className="w-full border border-slate-700 text-slate-200 py-2 rounded-lg hover:bg-slate-800"
                    onClick={() => setShowEntryForm(true)}
                  >
                    Proceed with the Test
                  </button>

                  <Link to="/dashboard">
                    <button className="w-full bg-[rgba(99,102,241,0.12)] border border-slate-700 text-slate-200 py-2 rounded-lg hover:bg-[rgba(99,102,241,0.16)]">
                      View My Attempts
                    </button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
