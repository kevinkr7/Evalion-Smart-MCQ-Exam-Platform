// src/components/UserEntryForm.tsx
import React, { useEffect, useState } from "react";
import { useQuiz } from "@/contexts/QuizContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { collection, query, where, getDocs, limit, doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import { fetchActiveQuestionSetMeta } from "@/lib/quizMode";
import { Home } from "lucide-react";

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
        const meta = await fetchActiveQuestionSetMeta();
        const q = query(collection(db, "quizResults"), where("email", "==", emailTrimmed));
        const snap = await getDocs(q);
        
        const hasTakenActive = snap.docs.some(d => {
          const data = d.data();
          if (!meta.activeSetId) return !data.questionSetId;
          return data.questionSetId === meta.activeSetId;
        });

        if (hasTakenActive) {
          window.alert(
            "You have already submitted the quiz for this question set. If you believe this is an error, contact the administrator."
          );
          setCheckingExisting(false);
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
      await startQuiz({
        name,
        email: emailTrimmed,
        rollId: rollIdStr,
      });

      toast({ title: "Quiz Started!", description: "Good luck with your test!" });
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
        const meta = await fetchActiveQuestionSetMeta();
        const q = query(collection(db, "quizResults"), where("email", "==", emailTrimmed));
        const snap = await getDocs(q);
        
        const hasTakenActive = snap.docs.some(d => {
          const data = d.data();
          if (!meta.activeSetId) return !data.questionSetId;
          return data.questionSetId === meta.activeSetId;
        });

        if (hasTakenActive) {
          window.alert(
            "You have already submitted the quiz for this question set. If you believe this is an error, contact the administrator."
          );
          setCheckingExisting(false);
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
      await startQuiz({
        name: String(formData.name || "").trim(),
        email: emailTrimmed,
        rollId: String(formData.rollId || "").trim(),
      });

      toast({ title: "Quiz Started!", description: "Good luck with your test!" });
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
    <div className="min-h-screen relative flex flex-col items-center justify-center py-12 px-0 text-white bg-[#0b0b0d] overflow-hidden">
      {/* Home Button */}
      <Button 
        variant="outline" 
        size="icon" 
        onClick={() => window.location.href = "/"} 
        className="absolute top-6 left-6 rounded-full border-white/10 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all z-50 h-12 w-12"
      >
        <Home className="h-5 w-5" />
      </Button>

      {/* Background Effects */}
      <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[120%] h-[80%] bg-[radial-gradient(ellipse_at_center,rgba(124,58,237,0.15)_0%,transparent_70%)] pointer-events-none"></div>
      <div className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.03]" style={{backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`}}></div>

      <div className="relative z-10 w-full max-w-[1200px] mx-auto px-6">
        {/* Page header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center bg-[#111116] border border-white/10 px-4 py-1.5 rounded-full mb-4">
            <span className="relative flex h-2 w-2 mr-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Live Assessment</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4">
            Technical MCQ Quiz
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Test your knowledge — quick, secure, and monitored.
          </p>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          {/* LEFT: Instructions */}
          <div className="w-full h-full bg-[#111116] border border-white/10 rounded-2xl p-8 shadow-2xl flex flex-col">
            <div className="mb-6">
              <h2 className="text-xl font-semibold flex items-center gap-3 text-white mb-2">
                <span className="text-xl">📋</span>
                <span>Test Instructions</span>
              </h2>
              <p className="text-sm text-slate-400">Please read the rules before starting the quiz</p>
            </div>
            
            <div className="space-y-6 flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm text-slate-300">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full mt-1.5 shadow-[0_0_10px_rgba(99,102,241,0.5)]"></span>
                    <div>
                      <div className="font-medium text-white text-base">20 questions</div>
                      <div className="text-xs text-slate-400">Code-based problems</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full mt-1.5 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span>
                    <div>
                      <div className="font-medium text-white text-base">+5 points</div>
                      <div className="text-xs text-slate-400">for correct answers</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="w-2.5 h-2.5 bg-red-500 rounded-full mt-1.5 shadow-[0_0_10px_rgba(239,68,68,0.5)]"></span>
                    <div>
                      <div className="font-medium text-white text-base">-1 point</div>
                      <div className="text-xs text-slate-400">for wrong answers</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <span className="w-2.5 h-2.5 bg-yellow-400 rounded-full mt-1.5 shadow-[0_0_10px_rgba(250,204,21,0.5)]"></span>
                    <div>
                      <div className="font-medium text-white text-base">25 minutes</div>
                      <div className="text-xs text-slate-400">total time limit</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="w-2.5 h-2.5 bg-slate-500 rounded-full mt-1.5"></span>
                    <div>
                      <div className="font-medium text-white text-base">0 points</div>
                      <div className="text-xs text-slate-400">for skipped questions</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="w-2.5 h-2.5 bg-purple-500 rounded-full mt-1.5 shadow-[0_0_10px_rgba(168,85,247,0.5)]"></span>
                    <div>
                      <div className="font-medium text-white text-base">Auto-submit</div>
                      <div className="text-xs text-slate-400">when time expires</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-auto pt-6">
                <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                  <p className="text-sm text-slate-300 leading-relaxed">
                    💡 <strong className="text-white">Tip:</strong> You can navigate between questions and change your answers until you submit or time runs out. Leaving the tab or exiting fullscreen will be recorded.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Details */}
          <div className="w-full h-full bg-gradient-to-br from-[#111116] to-[#0a0a0f] border border-white/10 rounded-2xl p-8 shadow-2xl flex flex-col relative overflow-hidden">
            {/* Subtle glow behind form */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#7c3aed]/5 rounded-full blur-3xl pointer-events-none"></div>

            <div className="mb-6 relative z-10">
              <h2 className="text-xl font-semibold text-white mb-2">
                {isSignedIn ? "Your details" : "Enter Your Details"}
              </h2>
              <p className="text-sm text-slate-400">
                {isSignedIn ? "Confirm your information before starting" : "Please provide your information to begin the test"}
              </p>
            </div>

            <div className="flex-1 relative z-10">
              {isSignedIn ? (
                // READ-ONLY DETAILS VIEW
                <div className="space-y-6 w-full flex flex-col h-full">
                  <div className="space-y-5 flex-1">
                    <div className="w-full bg-white/5 border border-white/5 p-4 rounded-xl">
                      <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Full Name</div>
                      <div className="text-lg font-medium text-white">{String(formData.name) || "—"}</div>
                    </div>

                    <div className="w-full bg-white/5 border border-white/5 p-4 rounded-xl">
                      <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Email Address</div>
                      <div className="text-lg font-medium text-white">{String(formData.email) || "—"}</div>
                    </div>

                    <div className="w-full bg-white/5 border border-white/5 p-4 rounded-xl">
                      <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Register Number</div>
                      <div className="text-lg font-medium text-white">{String(formData.rollId) || "—"}</div>
                    </div>
                  </div>

                  <div className="pt-4 mt-auto">
                    {!String(formData.rollId).trim() && (
                      <p className="text-sm text-yellow-400 mb-4 bg-yellow-400/10 p-3 rounded-lg border border-yellow-400/20">
                        Register number missing — ask admin to add it or enter it below.
                      </p>
                    )}
                    <Button
                      onClick={handleStartSignedIn}
                      disabled={checkingExisting || !String(formData.rollId).trim()}
                      className="w-full py-6 text-lg font-semibold rounded-xl bg-emerald-500 text-white hover:bg-emerald-400 shadow-[0_4px_20px_-4px_rgba(16,185,129,0.4)] hover:shadow-[0_8px_25px_-4px_rgba(16,185,129,0.6)] transition-all duration-300 hover:-translate-y-1"
                    >
                      {checkingExisting ? "Checking..." : "Start Assessment"}
                    </Button>
                  </div>
                </div>
              ) : (
                // INPUT FORM FOR GUESTS
                <form onSubmit={handleSubmit} className="space-y-5 w-full flex flex-col h-full" noValidate>
                  <div className="flex-1 space-y-5">
                    <div>
                      <Label htmlFor="name" className="text-sm text-slate-300 font-medium">Full Name *</Label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="Enter your full name"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        className={`mt-2 w-full bg-white/5 text-white placeholder:text-slate-500 border ${errors.name ? "border-red-500 ring-1 ring-red-500" : "border-white/10"} focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed] transition-colors rounded-lg h-12`}
                      />
                      {errors.name && <p className="text-sm text-red-400 mt-1">{errors.name}</p>}
                    </div>

                    <div>
                      <Label htmlFor="email" className="text-sm text-slate-300 font-medium">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email address"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        className={`mt-2 w-full bg-white/5 text-white placeholder:text-slate-500 border ${errors.email ? "border-red-500 ring-1 ring-red-500" : "border-white/10"} focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed] transition-colors rounded-lg h-12`}
                      />
                      {errors.email && <p className="text-sm text-red-400 mt-1">{errors.email}</p>}
                    </div>

                    <div>
                      <Label htmlFor="rollId" className="text-sm text-slate-300 font-medium">Register Number (12 digits) *</Label>
                      <Input
                        id="rollId"
                        type="text"
                        inputMode="numeric"
                        placeholder="Enter your 12-digit register number"
                        value={formData.rollId}
                        onChange={(e) => handleInputChange("rollId", e.target.value)}
                        className={`mt-2 w-full bg-white/5 text-white placeholder:text-slate-500 border ${errors.rollId ? "border-red-500 ring-1 ring-red-500" : "border-white/10"} focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed] transition-colors rounded-lg h-12`}
                        maxLength={12}
                      />
                      {errors.rollId && <p className="text-sm text-red-400 mt-1">{errors.rollId}</p>}
                    </div>
                  </div>

                  <div className="pt-4 mt-auto">
                    <Button
                      type="submit"
                      disabled={checkingExisting}
                      className="w-full py-6 text-lg font-semibold rounded-xl bg-emerald-500 text-white hover:bg-emerald-400 shadow-[0_4px_20px_-4px_rgba(16,185,129,0.4)] hover:shadow-[0_8px_25px_-4px_rgba(16,185,129,0.6)] transition-all duration-300 hover:-translate-y-1"
                    >
                      {checkingExisting ? "Checking..." : "Start Assessment"}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>

        <div className="text-center text-sm text-slate-500 mt-8">
          <p>Make sure you have a stable internet connection before starting</p>
        </div>
      </div>
    </div>
  );
}

export default UserEntryForm;
