// src/components/AdminLogin.tsx
import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

/**
 * AdminLogin: small inline form that signs in using Firebase Auth,
 * verifies existence in `admins` collection, then navigates to /admin.
 *
 * Visuals adjusted to the dark modern theme (black / blue / purple / white).
 * No logic changes — only styling.
 */

export default function AdminLogin() {
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  async function handleSignIn(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const userCred = await signInWithEmailAndPassword(auth, email.trim(), password);
      const userEmail = userCred.user.email ?? "";
      // verify admin doc exists
      const adminDoc = doc(db, "admins", userEmail);
      const snap = await getDoc(adminDoc);
      if (!snap.exists()) {
        toast({
          title: "Access denied",
          description: "This account is not an admin.",
        });
        setLoading(false);
        return;
      }
      toast({
        title: "Signed in",
        description: "Redirecting to admin dashboard...",
      });
      // go to admin
      navigate("/admin");
    } catch (err: any) {
      console.error("Admin login error", err);
      toast({
        title: "Sign-in failed",
        description: err?.message ?? "Unable to sign in",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative">
      {/* Trigger button: small ghost but keep text color to match dark theme */}
      <Button
        size="sm"
        variant="ghost"
        onClick={() => setShow(prev => !prev)}
        className="text-xs text-slate-200 hover:text-white bg-transparent px-2 py-1 rounded-full"
      >
        🔑 Admin
      </Button>

      {show && (
        <div
          className="absolute right-0 mt-2 w-80 bg-[rgba(7,10,23,0.96)] text-white rounded-lg p-4 shadow-2xl border border-slate-800 z-50"
          role="dialog"
          aria-modal="true"
        >
          <form onSubmit={handleSignIn} className="space-y-3">
            <div>
              <Label htmlFor="admin-email" className="text-sm text-slate-300">Admin Email</Label>
              <Input
                id="admin-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className="mt-2 w-full bg-[#071022] text-white placeholder:text-slate-400 border border-slate-700 focus:ring-2 focus:ring-[#06b6d4]"
              />
            </div>

            <div>
              <Label htmlFor="admin-pass" className="text-sm text-slate-300">Password</Label>
              <Input
                id="admin-pass"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="********"
                className="mt-2 w-full bg-[#071022] text-white placeholder:text-slate-400 border border-slate-700 focus:ring-2 focus:ring-[#7c3aed]"
              />
            </div>

            <div className="flex justify-end gap-2 mt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShow(false)}
                className="px-3 py-1 text-sm border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-[rgba(48, 4, 69, 0.57)]"
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={loading}
                className="px-4 py-1 text-sm bg-gradient-to-r from-[#6366f1] to-[#7c3aed] hover:from-[#4f46e5] hover:to-[#6d28d9] text-white"
              >
                {loading ? "Signing in..." : "Sign in"}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
