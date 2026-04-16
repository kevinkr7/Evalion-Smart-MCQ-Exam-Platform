// src/components/UserEntryForm.tsx
import React, { useEffect, useState } from "react";
import { useQuiz } from "@/contexts/QuizContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import AdminLogin from "@/components/AdminLogin";
import { collection, query, where, getDocs, limit, doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";

/**
 * Fixed: ensures rollId is treated as string (coerce when reading from Firestore),
 * avoids `.trim()` on non-strings, and makes right card more willing to expand.
 */

type Props = {
  onClose?: () => void;
  autoQuizMode?: boolean;
};

export function UserEntryForm({ onClose, autoQuizMode = false }: Props) {
  const { startQuiz, state } = useQuiz();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    rollId: "", // always keep as string in UI state
  });

  const [errors, setErrors] = useState({
    name: "",
    email: "",
    rollId: "",
  });

  const [checkingExisting, setCheckingExisting] = useState(false);
  const [loadingUserDoc, setLoadingUserDoc] = useState(false);

  // Prefill formData from authUser and users/{uid} as before.
  useEffect(() => {
    let mounted = true;
    async function loadUserDoc() {
      // coerce authUser fields to strings
      setFormData((prev) => ({
        ...prev,
        name: state?.authUser?.name ?? prev.name,
        email: state?.authUser?.email ?? prev.email,
      }));

      if (state?.authUser?.uid) {
        setLoadingUserDoc(true);
        try {
          const udocRef = doc(db, "users", state.authUser.uid);
          const snap = await getDoc(udocRef);
          if (!mounted) return;
          if (snap.exists()) {
            const data: any = snap.data();
            // Coerce rollId to string if present (could be number in DB)
            const rollFromDoc = data?.rollId ?? "";
            const rollString =
              typeof rollFromDoc === "string"
                ? rollFromDoc
                : typeof rollFromDoc === "number"
                ? String(rollFromDoc)
                : "";

            const resolvedName = state?.authUser?.name ? state.authUser.name : data?.name ?? "";

            setFormData((prev) => ({
              ...prev,
              name: (resolvedName as string) || prev.name,
              email: (data?.email as string) ?? prev.email,
              rollId: rollString || prev.rollId,
            }));
          }
        } catch (err) {
          console.warn("Failed to load users/{uid} doc:", err);
        } finally {
          if (mounted) setLoadingUserDoc(false);
        }
      }
    }
    loadUserDoc();
    return () => {
      mounted = false;
    };
  }, [state?.authUser?.uid, state?.authUser?.email, state?.authUser?.name]);

  const validateForm = () => {
    const newErrors = { name: "", email: "", rollId: "" };

    if (!String(formData.name || "").trim()) newErrors.name = "Full name is required";

    const emailStr = String(formData.email || "").trim();
    if (!emailStr) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(emailStr)) newErrors.email = "Please enter a valid email address";

    const roll = String(formData.rollId || "").trim();
    if (!autoQuizMode) {
      if (!roll) newErrors.rollId = "Register number is required";
      else if (!/^\d{12}$/.test(roll)) newErrors.rollId = "Register number must be exactly 12 digits (numbers only)";
    } else if (roll && !/^\d{6,14}$/.test(roll)) {
      newErrors.rollId = "Register number format looks unusual, but you can continue in auto mode.";
    }

    setErrors(newErrors);
    if (autoQuizMode) {
      return !newErrors.name && !newErrors.email;
    }
    return !newErrors.name && !newErrors.email && !newErrors.rollId;
  };

  // Handles start for signed-in users (no input fields)
  const handleStartSignedIn = async () => {
    // ensure fields are present and treat them as strings
    const name = String(formData.name || "").trim();
    const email = String(formData.email || "").trim().toLowerCase();
    const rollIdStr = String(formData.rollId ?? "").trim();

    if (!email || !name || (!rollIdStr && !autoQuizMode)) {
      toast({
        title: "Missing data",
        description: "Some profile details are missing. Please contact admin or fill them in.",
      });
      return;
    }

    // reuse same duplicate-check + ensure users doc behavior as before
    try {
      setCheckingExisting(true);
      const emailTrimmed = email;

      if (!autoQuizMode) {
        const q = query(collection(db, "quizResults"), where("email", "==", emailTrimmed), limit(1));
        const snap = await getDocs(q);
        if (!snap.empty) {
          window.alert(
            "You have already submitted the quiz with this email. If you believe this is an error, contact the administrator."
          );
          return;
        }
      }

      // ensure users/{uid} has rollId (create/merge if necessary)
      if (state?.authUser?.uid) {
        try {
          const uref = doc(db, "users", state.authUser.uid);
          const udsnap = await getDoc(uref);
          if (!udsnap.exists()) {
            // store rollId as string in users collection
            await setDoc(uref, {
              name,
              email,
              rollId: rollIdStr,
              createdAt: new Date().toISOString(),
            });
          } else {
            const data: any = udsnap.data();
            const existingRoll = data?.rollId;
            if (!existingRoll && rollIdStr) {
              await setDoc(uref, { ...data, rollId: rollIdStr }, { merge: true });
            }
            if ((!data?.name || !data?.email) && (name || email)) {
              await setDoc(uref, { ...data, name: name || data?.name, email: email || data?.email }, { merge: true });
            }
          }
        } catch (err) {
          console.warn("Could not write users/{uid} doc:", err);
        }
      }

      // start quiz (pass rollId as string)
      startQuiz({
        name,
        email: emailTrimmed,
        rollId: rollIdStr,
      });

      toast({ title: "Quiz Started!", description: "Good luck with your test!" });
      onClose?.();
    } catch (err) {
      console.error("Start signed-in error:", err);
      toast({ title: "Error", description: "Unable to start quiz. Try again." });
    } finally {
      setCheckingExisting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (checkingExisting) return;

    const emailTrimmed = String(formData.email || "").trim().toLowerCase();

    try {
      setCheckingExisting(true);
      if (!autoQuizMode) {
        const q = query(collection(db, "quizResults"), where("email", "==", emailTrimmed), limit(1));
        const snap = await getDocs(q);
        if (!snap.empty) {
          window.alert(
            "You have already submitted the quiz with this email. If you believe this is an error, contact the administrator."
          );
          return;
        }
      }

      // save users doc if signed-in and missing (store rollId as string)
      if (state?.authUser?.uid) {
        try {
          const uref = doc(db, "users", state.authUser.uid);
          const udsnap = await getDoc(uref);
          if (!udsnap.exists()) {
            await setDoc(uref, {
              name: String(formData.name || ""),
              email: String(formData.email || ""),
              rollId: String(formData.rollId || ""),
              createdAt: new Date().toISOString(),
            });
          } else {
            const data: any = udsnap.data();
            if (!data?.rollId && formData.rollId) {
              await setDoc(uref, { ...data, rollId: String(formData.rollId) }, { merge: true });
            }
          }
        } catch (err) {
          console.warn("Could not write users/{uid} doc:", err);
        }
      }

      // start quiz with canonical string values
      startQuiz({
        name: String(formData.name || "").trim(),
        email: emailTrimmed,
        rollId: String(formData.rollId || "").trim(),
      });

      toast({ title: "Quiz Started!", description: "Good luck with your test!" });
      onClose?.();
    } catch (err) {
      console.error("Error checking existing quiz submission:", err);
      toast({ title: "Error", description: "Could not verify previous submissions. Please try again." });
    } finally {
      setCheckingExisting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    if (field === "rollId") {
      value = value.replace(/\D/g, "");
      if (value.length > 12) value = value.slice(0, 12);
    }
    // always store as string
    setFormData((prev) => ({ ...prev, [field]: String(value) }));
    if (errors[field as keyof typeof errors]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const isSignedIn = !!state?.authUser?.uid;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#05040a] via-[#071020] to-[#0b0b14] flex items-center justify-center px-0 text-white">
      {/* Top-right admin login */}
      <div className="absolute top-4 right-4 z-50 ">
        <AdminLogin />
      </div>

      {/* WIDE inner container (very large max width, centered) */}
      <div className="w-full max-w-[95rem] mx-auto px-6">
        {/* Page header */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#7c3aed] via-[#6366f1] to-[#06b6d4]">
            Technical MCQ Quiz
          </h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">
            Test your knowledge — quick, secure, and monitored.
          </p>
        </div>

        {/* Two-column layout with right column wider */}
        <div className="grid grid-cols-1 md:grid-cols-[2fr_3fr] gap-8 items-start">
          {/* LEFT: Instructions */}
          <Card className="w-full bg-[rgba(15,23,42,0.6)] border border-slate-800 shadow-xl backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-xl font-semibold flex items-center gap-3 text-white">
                <span className="text-2xl">📋</span>
                <span>Test Instructions</span>
              </CardTitle>
              <CardDescription className="text-sm text-slate-300">Please read the rules before starting the quiz</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* instructions content unchanged */}
              <div className="grid grid-cols-1 gap-4 text-sm text-slate-300">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="w-3 h-3 bg-gradient-to-br from-[#6366f1] to-[#7c3aed] rounded-full mt-1"></span>
                    <div>
                      <div className="font-medium text-white">20 questions</div>
                      <div className="text-xs">Code-based problems</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="w-3 h-3 bg-[#06b6d4] rounded-full mt-1"></span>
                    <div>
                      <div className="font-medium text-white">+5 points</div>
                      <div className="text-xs">for correct answers</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="w-3 h-3 bg-red-500 rounded-full mt-1"></span>
                    <div>
                      <div className="font-medium text-white">-1 point</div>
                      <div className="text-xs">for wrong answers</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="w-3 h-3 bg-yellow-400 rounded-full mt-1"></span>
                    <div>
                      <div className="font-medium text-white">25 minutes</div>
                      <div className="text-xs">total time limit</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="w-3 h-3 bg-slate-500 rounded-full mt-1"></span>
                    <div>
                      <div className="font-medium text-white">0 points</div>
                      <div className="text-xs">for skipped questions</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="w-3 h-3 bg-gradient-to-br from-[#7c3aed] to-[#06b6d4] rounded-full mt-1"></span>
                    <div>
                      <div className="font-medium text-white">Auto-submit</div>
                      <div className="text-xs">when time expires</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-2 p-3 rounded-lg bg-gradient-to-r from-[#07102a]/40 to-[#0b1226]/40 border border-slate-800">
                <p className="text-sm text-slate-300">
                  💡 <strong className="text-white">Tip:</strong> You can navigate between questions and change your answers until you submit or time runs out. Leaving the tab or exiting fullscreen will be recorded.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* RIGHT: Details (read-only for signed-in users, inputs for guests) */}
          <Card className="w-full md:max-w-none flex-1 bg-[rgba(7,10,23,0.65)] border border-slate-800 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-white">
                {isSignedIn ? "Your details are:" : "Enter Your Details"}
              </CardTitle>
              <CardDescription className="text-sm text-slate-300">
                {isSignedIn ? "Confirm before starting the test" : "Please provide your information to begin the test"}
              </CardDescription>
            </CardHeader>

            <CardContent>
              {isSignedIn ? (
                // READ-ONLY DETAILS VIEW
                <div className="space-y-4 w-full">
                  <div className="text-sm text-slate-300 w-full">
                    <div className="text-xs text-slate-400">Full Name</div>
                    <div className="mt-1 text-lg font-medium text-white w-full">{String(formData.name) || "—"}</div>
                  </div>

                  <div className="text-sm text-slate-300 w-full">
                    <div className="text-xs text-slate-400">Email Address</div>
                    <div className="mt-1 text-lg font-medium text-white w-full">{String(formData.email) || "—"}</div>
                  </div>

                  <div className="text-sm text-slate-300 w-full">
                    <div className="text-xs text-slate-400">Register Number</div>
                    <div className="mt-1 text-lg font-medium text-white w-full">{String(formData.rollId) || "—"}</div>
                  </div>

                  <div className="pt-2">
                    <Button
                      onClick={handleStartSignedIn}
                      disabled={checkingExisting || !String(formData.rollId).trim()}
                      className="w-full py-3 text-lg font-semibold rounded-lg bg-gradient-to-r from-[#6366f1] to-[#7c3aed] hover:opacity-95"
                    >
                      {checkingExisting ? "Checking..." : "🚀 Start Test"}
                    </Button>
                    {!String(formData.rollId).trim() && (
                      <p className="text-xs text-yellow-300 mt-2">
                        Register number missing — ask admin to add it or enter it below.
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                // ORIGINAL INPUT FORM FOR GUESTS
                <form onSubmit={handleSubmit} className="space-y-5 w-full" noValidate>
                  <div>
                    <Label htmlFor="name" className="text-sm text-slate-300">Full Name *</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      className={`mt-2 w-full bg-[#0b1220] text-white placeholder:text-slate-400 border border-slate-700 focus:ring-2 focus:ring-[#6366f1] ${errors.name ? "ring-1 ring-red-600" : ""}`}
                    />
                    {errors.name && <p className="text-sm text-red-400 mt-1">{errors.name}</p>}
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-sm text-slate-300">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email address"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className={`mt-2 w-full bg-[#0b1220] text-white placeholder:text-slate-400 border border-slate-700 focus:ring-2 focus:ring-[#06b6d4] ${errors.email ? "ring-1 ring-red-600" : ""}`}
                    />
                    {errors.email && <p className="text-sm text-red-400 mt-1">{errors.email}</p>}
                  </div>

                  <div>
                    <Label htmlFor="rollId" className="text-sm text-slate-300">Register Number (12 digits) *</Label>
                    <Input
                      id="rollId"
                      type="text"
                      inputMode="numeric"
                      placeholder="Enter your 12-digit register number"
                      value={formData.rollId}
                      onChange={(e) => handleInputChange("rollId", e.target.value)}
                      className={`mt-2 w-full bg-[#0b1220] text-white placeholder:text-slate-400 border border-slate-700 focus:ring-2 focus:ring-[#7c3aed] ${errors.rollId ? "ring-1 ring-red-600" : ""}`}
                      maxLength={12}
                    />
                    {errors.rollId && <p className="text-sm text-red-400 mt-1">{errors.rollId}</p>}
                  </div>

                  <div className="pt-2">
                    <Button
                      type="submit"
                      disabled={checkingExisting}
                      className="w-full py-3 text-lg font-semibold rounded-lg bg-gradient-to-r from-[#6366f1] to-[#7c3aed] hover:from-[#4f46e5] hover:to-[#6d28d9] shadow-md"
                    >
                      {checkingExisting ? "Checking..." : "🚀 Start Test"}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="text-center text-sm text-slate-400 mt-6">
          <p>Make sure you have a stable internet connection before starting</p>
        </div>
      </div>
    </div>
  );
}

export default UserEntryForm;
