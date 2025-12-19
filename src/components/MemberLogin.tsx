import React, { useState } from "react";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useQuiz } from "@/contexts/QuizContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

/**
 * MemberLogin (always shows full form)
 * - No toggle button. The form is rendered directly.
 * - If logged in, shows "Sign out".
 */

export default function MemberLogin() {
  const { state, dispatch } = useQuiz();
  const navigate = useNavigate();
  const { toast } = useToast ? useToast() : { toast: (t: any) => {} }; // fallback typing
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const isLoggedIn = !!state?.authUser?.uid;

  async function handleSignIn(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setLoading(true);
    setErr(null);

    try {
      const cred = await signInWithEmailAndPassword(
        auth,
        email.trim().toLowerCase(),
        password
      );
      // populate legacy userInfo
      dispatch({
        type: "SET_USER_INFO",
        payload: {
          name: cred.user.displayName ?? "",
          email: cred.user.email ?? email.trim().toLowerCase(),
        },
      });
      toast && toast({ title: "Signed in", description: "Welcome back!" });
      navigate("/");
    } catch (error: any) {
      console.error("Sign-in error", error);
      setErr(error?.message ?? "Failed to sign in");
      toast &&
        toast({
          title: "Sign-in failed",
          description: error?.message ?? "Unable to sign in",
        });
    } finally {
      setLoading(false);
    }
  }

  async function handleSignOut() {
    try {
      await signOut(auth);
      dispatch({ type: "SET_USER_INFO", payload: null });
      toast &&
        toast({ title: "Signed out", description: "You have been signed out." });
    } catch (e) {
      console.warn("Sign-out failed", e);
      toast &&
        toast({
          title: "Sign-out failed",
          description: (e as any)?.message ?? "",
        });
    }
  }

  if (isLoggedIn) {
    return (
      <div className="flex items-center gap-3">
        <div className="text-sm">
          {state.authUser?.name ?? state.authUser?.email}
        </div>
        <Button
          size="sm"
          onClick={handleSignOut}
          className="bg-slate-700 text-white hover:bg-slate-600"
        >
          Sign out
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSignIn} className="space-y-3">
      <div>
        <Label className="text-slate-300">Student Email</Label>
        <Input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="bg-slate-800 text-white border border-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="student@example.com"
        />
      </div>
      <div>
        <Label className="text-slate-300">Password</Label>
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="bg-slate-800 text-white border border-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="••••••••"
        />
      </div>

      {err && <div className="text-xs text-red-300">{err}</div>}

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          onClick={() => {
            setEmail("");
            setPassword("");
            setErr(null);
          }}
          className="bg-slate-700 text-white hover:bg-slate-600"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={loading}
          className="bg-gradient-to-r from-[#6366f1] to-[#7c3aed] text-white hover:opacity-90"
        >
          {loading ? "Signing..." : "Sign in"}
        </Button>
      </div>
    </form>
  );
}
