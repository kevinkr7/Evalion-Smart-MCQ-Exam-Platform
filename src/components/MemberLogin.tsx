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
      navigate("/dashboard");
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
          className="bg-transparent border border-white/10 text-white hover:bg-white/5 transition-colors"
        >
          Sign out
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSignIn} className="space-y-4">
      <div>
        <Label className="text-slate-400 mb-1.5 block font-medium">Student Email</Label>
        <Input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="bg-[#111116] text-white border border-white/10 placeholder-slate-600 focus:outline-none focus:border-white/30 focus:ring-0 transition-all h-11"
          placeholder="student@example.com"
        />
      </div>
      <div>
        <Label className="text-slate-400 mb-1.5 block font-medium">Password</Label>
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="bg-[#111116] text-white border border-white/10 placeholder-slate-600 focus:outline-none focus:border-white/30 focus:ring-0 transition-all h-11"
          placeholder="••••••••"
        />
      </div>

      {err && <div className="text-sm text-red-400">{err}</div>}

      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          onClick={() => {
            setEmail("");
            setPassword("");
            setErr(null);
          }}
          className="flex-1 bg-transparent border border-white/10 text-white hover:bg-white/5 transition-colors h-11"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={loading}
          className="flex-1 bg-white text-[#0b0b0d] hover:bg-slate-200 transition-colors font-medium h-11"
        >
          {loading ? "Signing..." : "Sign in"}
        </Button>
      </div>
    </form>
  );
}
