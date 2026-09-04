// src/pages/ProfileSettings.tsx
import React, { useEffect, useState, useRef } from "react";
import { auth, db } from "@/firebase";
import { updateProfile, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { useQuiz } from "@/contexts/QuizContext";

const AnimatedSection = ({ children, delay = 0, className = "" }: { children: React.ReactNode, delay?: number, className?: string }) => {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => setIsVisible(entry.isIntersecting));
    });
    if (domRef.current) observer.observe(domRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={domRef}
      className={`transition-all duration-1000 ease-out ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

export default function ProfileSettings() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  // Profile Data
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");

  // Password Update Data
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Stats
  const [stats, setStats] = useState({ totalTests: 0, avgScore: 0 });
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    // Inject global CSS for LandingNavbar
    if (!document.getElementById('prolibu-global-css')) {
      const link1 = document.createElement('link'); link1.id = 'prolibu-global-css'; link1.rel = 'stylesheet'; link1.href = '/prolibu_assets/global.css'; document.head.appendChild(link1);
      const link2 = document.createElement('link'); link2.id = 'prolibu-hr-css'; link2.rel = 'stylesheet'; link2.href = '/prolibu_assets/human-resources.css'; document.head.appendChild(link2);
    }
    
    if (!document.getElementById('profile-theme-override')) {
      const style = document.createElement('style');
      style.id = 'profile-theme-override';
      style.innerHTML = `
        :root { --bg-1: #0d0621 !important; --ink: #ffffff !important; }
        body, html {
          background-color: #0d0621 !important;
          background-image: 
            radial-gradient(circle at 15% 50%, rgba(124, 58, 237, 0.12), transparent 50%),
            radial-gradient(circle at 85% 30%, rgba(76, 29, 149, 0.15), transparent 50%),
            url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0.1 0 0 0 0 0.1 0 0 0 0 0.1 0 0 0 0.6 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.25'/%3E%3C/svg%3E") !important;
          color: #ffffff !important;
        }
      `;
      document.head.appendChild(style);
    }
    
    return () => {
      const override = document.getElementById('profile-theme-override');
      if (override) override.remove();
    };
  }, []);

  const { state } = useQuiz();

  // Fetch Current User & Stats
  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setDisplayName(state.authUser?.name || state.userInfo?.name || user.displayName || "");
      setEmail(user.email || "");

      // Fetch Stats
      const fetchStats = async () => {
        try {
          const q = query(collection(db, "quizResults"), where("uid", "==", user.uid));
          const snap = await getDocs(q);
          let totalScore = 0;
          let count = 0;
          
          snap.forEach(doc => {
            const data = doc.data();
            if (typeof data.score === 'number') {
              totalScore += data.score;
              count++;
            }
          });

          setStats({
            totalTests: count,
            avgScore: count > 0 ? Math.round((totalScore / count) * 10) / 10 : 0
          });
        } catch (error) {
          console.error("Failed to fetch user stats", error);
        } finally {
          setStatsLoading(false);
        }
      };
      fetchStats();
    } else {
      setStatsLoading(false);
    }

    // Load script and initialize 3D SVG Concept (IsoPlayer)
    let interval: ReturnType<typeof setInterval>;
    
    const loadIsoScript = () => {
      return new Promise<void>((resolve) => {
        if (document.querySelector(`script[src="/prolibu_assets/iso-player.js"]`)) {
          resolve();
          return;
        }
        const script = document.createElement('script');
        script.src = "/prolibu_assets/iso-player.js";
        script.onload = () => resolve();
        document.body.appendChild(script);
      });
    };

    const initIso = () => {
      const IsoPlayer = (window as any).IsoPlayer;
      if (!IsoPlayer) return;
      const container = document.getElementById('profile-iso');
      if (!container || (container as any)._isoInit) return;

      (container as any)._isoInit = true;
      clearInterval(interval);
      IsoPlayer.load(container, '/prolibu_assets/iso-human.json?v=4', {
        autoplay: false,
        loop: false,
        responsive: true,
        cover: true,
      }).then((player: any) => {
        // Remove pan to ensure it stays in frame, we handle position via CSS
        
        const handleScroll = () => {
          // Profile page doesn't have much scroll, so we amplify the effect
          // and start at a frame where the element is fully visible (e.g., frame 30)
          let progress = window.scrollY / (window.innerHeight * 0.5);
          progress = Math.max(0, Math.min(1, progress));
          
          const startFrame = 30; 
          const scrollRange = 40; // Animate 40 frames over the scroll distance
          
          player.setFrame(startFrame + (progress * scrollRange));
        };
        (container as any)._isoScrollHandler = handleScroll;
        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll(); // Initial frame
        
      }).catch((e: any) => console.error('IsoPlayer load failed:', e));
    };

    loadIsoScript().then(() => {
      interval = setInterval(initIso, 200);
      initIso();
    });

    return () => {
      clearInterval(interval);
      if (typeof window !== 'undefined') {
        const container = document.getElementById('profile-iso');
        if (container && (container as any)._isoScrollHandler) {
          window.removeEventListener('scroll', (container as any)._isoScrollHandler);
        }
      }
    };
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    setLoading(true);
    try {
      // 1. Update Firebase Auth Profile
      await updateProfile(auth.currentUser, { displayName });
      
      // 2. Update Firestore `users` document
      const { doc, updateDoc } = await import("firebase/firestore");
      const userDocRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(userDocRef, { Name: displayName }).catch(err => {
        // Fallback: If document doesn't exist, it might fail, which is fine for users without a db entry
        console.warn("Could not update users collection:", err);
      });

      toast({ title: "Success", description: "Profile updated successfully." });
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to update profile." });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser || !auth.currentUser.email) return;
    
    if (newPassword !== confirmPassword) {
      toast({ title: "Error", description: "New passwords do not match." });
      return;
    }

    if (newPassword.length < 6) {
      toast({ title: "Error", description: "Password must be at least 6 characters." });
      return;
    }

    setLoading(true);
    try {
      // Re-authenticate first
      const credential = EmailAuthProvider.credential(auth.currentUser.email, currentPassword);
      await reauthenticateWithCredential(auth.currentUser, credential);
      
      // Then update password
      await updatePassword(auth.currentUser, newPassword);
      
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast({ title: "Success", description: "Password updated successfully." });
    } catch (error: any) {
      console.error(error);
      let msg = "Failed to update password.";
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
         msg = "Incorrect current password.";
      }
      toast({ title: "Error", description: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0b0d] text-white font-['Geist'] relative overflow-x-hidden pb-20 selection:bg-white/20">
      
      {/* 3D SVG Concept (IsoPlayer) */}
      <div 
        id="profile-iso" 
        className="fixed top-1/2 -translate-y-1/2 right-[-50vw] w-[80vw] h-[100vh] z-0 opacity-[0.15] pointer-events-none"
      ></div>

      <LandingNavbar />

      <div className="max-w-4xl mx-auto px-6 pt-28 space-y-12 w-full relative z-10">
        <AnimatedSection delay={100}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/10 pb-8">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3">Profile Settings</h1>
              <p className="text-slate-400 text-lg">Manage your account details and security.</p>
            </div>
          </div>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Left Column: Forms */}
          <div className="md:col-span-8 space-y-8">
            <AnimatedSection delay={200}>
              <Card className="bg-[#150d2c]/60 backdrop-blur-xl border border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.5)]">
                <CardHeader>
                  <CardTitle className="text-white text-xl">Account Information</CardTitle>
                  <CardDescription className="text-white/50">Update your public display name.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-white/70">Email Address (Read Only)</Label>
                      <Input 
                        id="email" 
                        value={email} 
                        disabled 
                        className="bg-white/5 border-white/10 text-white/50 cursor-not-allowed" 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="displayName" className="text-white/70">Display Name</Label>
                      <Input 
                        id="displayName" 
                        value={displayName} 
                        onChange={(e) => setDisplayName(e.target.value)} 
                        className="bg-white/5 border-white/10 text-white focus-visible:ring-violet-500" 
                        placeholder="John Doe"
                      />
                    </div>
                    <Button 
                      type="submit" 
                      disabled={loading} 
                      className="w-full bg-violet-600 hover:bg-violet-500 text-white transition-all shadow-[0_0_20px_rgba(124,58,237,0.3)] mt-2"
                    >
                      {loading ? "Saving..." : "Save Changes"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </AnimatedSection>

            <AnimatedSection delay={300}>
              <Card className="bg-[#150d2c]/60 backdrop-blur-xl border border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.5)]">
                <CardHeader>
                  <CardTitle className="text-white text-xl">Security</CardTitle>
                  <CardDescription className="text-white/50">Change your account password.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleUpdatePassword} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword" className="text-white/70">Current Password</Label>
                      <Input 
                        id="currentPassword" 
                        type="password"
                        value={currentPassword} 
                        onChange={(e) => setCurrentPassword(e.target.value)} 
                        className="bg-white/5 border-white/10 text-white focus-visible:ring-violet-500" 
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword" className="text-white/70">New Password</Label>
                      <Input 
                        id="newPassword" 
                        type="password"
                        value={newPassword} 
                        onChange={(e) => setNewPassword(e.target.value)} 
                        className="bg-white/5 border-white/10 text-white focus-visible:ring-violet-500" 
                        required
                        minLength={6}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-white/70">Confirm New Password</Label>
                      <Input 
                        id="confirmPassword" 
                        type="password"
                        value={confirmPassword} 
                        onChange={(e) => setConfirmPassword(e.target.value)} 
                        className="bg-white/5 border-white/10 text-white focus-visible:ring-violet-500" 
                        required
                        minLength={6}
                      />
                    </div>
                    <Button 
                      type="submit" 
                      disabled={loading} 
                      className="w-full bg-white text-black hover:bg-slate-200 transition-all font-semibold mt-2"
                    >
                      {loading ? "Updating..." : "Update Password"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </AnimatedSection>
          </div>

          {/* Right Column: Stats */}
          <div className="md:col-span-4">
            <AnimatedSection delay={400} className="sticky top-28">
              <Card className="bg-gradient-to-br from-violet-900/40 to-[#150d2c]/80 backdrop-blur-xl border border-violet-500/20 shadow-[0_8px_30px_rgba(124,58,237,0.15)]">
                <CardHeader>
                  <CardTitle className="text-black text-xl flex items-center gap-2">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-violet-400"><path d="M12 20v-6M6 20V10M18 20V4"/></svg>
                    Your Stats
                  </CardTitle>
                  <CardDescription className="text-black/70">Overview of your performance</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {statsLoading ? (
                    <div className="space-y-4 animate-pulse">
                      <div className="h-16 bg-white/5 rounded-lg w-full"></div>
                      <div className="h-16 bg-white/5 rounded-lg w-full"></div>
                    </div>
                  ) : (
                    <>
                      <div className="bg-black/40 border border-black/20 shadow-inner rounded-xl p-4 flex justify-between items-center">
                        <span className="text-white/70 font-medium">Total Tests</span>
                        <span className="text-3xl font-bold text-white">{stats.totalTests}</span>
                      </div>
                      <div className="bg-black/40 border border-black/20 shadow-inner rounded-xl p-4 flex justify-between items-center">
                        <span className="text-white/70 font-medium">Avg Score</span>
                        <span className="text-3xl font-bold text-violet-400">{stats.avgScore}</span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </AnimatedSection>
          </div>
        </div>

      </div>
    </div>
  );
}
