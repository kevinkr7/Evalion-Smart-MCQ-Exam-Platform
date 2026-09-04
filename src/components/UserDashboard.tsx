// src/components/UserDashboard.tsx
import React, { useEffect, useState, useRef } from "react";
import { useQuiz } from "@/contexts/QuizContext";
import { db } from "@/firebase";
import { collection, query, where, getDocs, limit, doc, getDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { fetchActiveQuestionSetMeta, isAutoQuiz } from "@/lib/quizMode";
import { PieChart, Pie, Cell, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from "recharts";

import { LandingNavbar } from "@/components/landing/LandingNavbar";

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

type ResultRow = {
  id: string;
  uid?: string | null;
  name?: string | null;
  email?: string | null;
  rollId?: string | null;
  score?: number | null;
  tabSwitchCount?: number;
  createdAt?: any;
  questionIds?: string[];
  questionSetId?: string | null;
};

export default function UserDashboard() {
  const [userData, setUserData] = useState<any>(null);
  const [metrics, setMetrics] = useState<any>({ totalAttempts: 0, avgScore: 0, bestScore: 0 });
  const [recentAttempts, setRecentAttempts] = useState<any[]>([]);

  useEffect(() => {
    // Inject global CSS for LandingNavbar
    if (!document.getElementById('prolibu-global-css')) {
      const link1 = document.createElement('link'); link1.id = 'prolibu-global-css'; link1.rel = 'stylesheet'; link1.href = '/prolibu_assets/global.css'; document.head.appendChild(link1);
      const link2 = document.createElement('link'); link2.id = 'prolibu-hr-css'; link2.rel = 'stylesheet'; link2.href = '/prolibu_assets/human-resources.css'; document.head.appendChild(link2);
    }
    
    // Override Prolibu's global color variables so it doesn't break the dark theme
    if (!document.getElementById('dashboard-theme-override')) {
      const style = document.createElement('style');
      style.id = 'dashboard-theme-override';
      style.innerHTML = `
        :root {
          --bg-1: #0d0621 !important;
          --ink: #ffffff !important;
        }
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
      const override = document.getElementById('dashboard-theme-override');
      if (override) override.remove();
    };
  }, []);

  const { state } = useQuiz();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState<ResultRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [released, setReleased] = useState<boolean | null>(null);
  const [loadingReleased, setLoadingReleased] = useState(false);
  const [activeSetId, setActiveSetId] = useState<string | null>(null); // NEW: Track active set ID

  useEffect(() => {
    let mounted = true;

    async function loadReleasedFlag() {
      setLoadingReleased(true);
      try {
        const meta = await fetchActiveQuestionSetMeta();
        if (!mounted) return;
        setActiveSetId(meta.activeSetId); // Save activeSetId to filter attempts

        if (isAutoQuiz(meta.questionSet)) {
          setReleased(true);
          return;
        }

        const ref = doc(db, "settings", "results");
        const snap = await getDoc(ref);
        if (!mounted) return;
        const val = snap.exists() ? ((snap.data() as any).released === true) : false;
        setReleased(val);
      } catch (err) {
        console.error("Failed to read results.release flag:", err);
        if (mounted) setReleased(false);
      } finally {
        if (mounted) setLoadingReleased(false);
      }
    }

    loadReleasedFlag();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    async function loadAttempts() {
      setLoading(true);
      setError(null);

      try {
        // Prefer uid if present, otherwise fallback to email
        const uid = state?.authUser?.uid;
        const emailFallback = (state?.authUser?.email ?? state?.userInfo?.email ?? "")?.trim().toLowerCase() || null;

        if (!uid && !emailFallback) {
          if (!mounted) return;
          setAttempts([]);
          setLoading(false);
          return;
        }

        let snapQuery;
        if (uid) {
          // Query userAttempts by uid (no orderBy to avoid composite index requirement)
          snapQuery = query(collection(db, "userAttempts"), where("uid", "==", uid), limit(500));
        } else {
          // Query by email fallback
          snapQuery = query(collection(db, "userAttempts"), where("email", "==", emailFallback), limit(500));
        }

        const snap = await getDocs(snapQuery);

        if (!mounted) return;

        if (!snap || snap.empty) {
          setAttempts([]);
          return;
        }

        // Map docs to rows
        const rows: ResultRow[] = snap.docs.map((d) => {
          const data = d.data() as any;
          return {
            id: d.id,
            uid: data.uid ?? null,
            name: data.name ?? null,
            email: data.email ?? null,
            rollId: data.rollId ?? data.registerNumber ?? null,
            score: typeof data.score === "number" ? data.score : (data.score ? Number(data.score) : null),
            tabSwitchCount: data.tabSwitchCount ?? 0,
            createdAt: data.createdAt ?? null,
            questionIds: Array.isArray(data.questionIds) ? data.questionIds : [],
            questionSetId: data.questionSetId ?? null, // extract questionSetId
          };
        });

        // Helper to get milliseconds from createdAt in many shapes
        const createdAtMs = (r: ResultRow) => {
          const c = (r as any).createdAt;
          if (!c) return 0;
          // Firestore Timestamp
          if (typeof c === "object" && typeof (c as any).toDate === "function") {
            try { return (c as any).toDate().getTime(); } catch { return 0; }
          }
          // number-like
          const n = Number(c);
          if (!Number.isNaN(n) && n > 0) return n;
          // ISO string
          const parsed = Date.parse(String(c));
          return Number.isNaN(parsed) ? 0 : parsed;
        };

        // Sort newest-first client-side
        rows.sort((a, b) => createdAtMs(b) - createdAtMs(a));

        // Limit to reasonable size for the UI
        setAttempts(rows.slice(0, 100));
      } catch (err) {
        console.error("Failed to load attempts:", err);
        setError("Failed to load attempts. Try again later.");
        setAttempts([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadAttempts();
    return () => {
      mounted = false;
    };
  }, [state?.authUser?.uid, state?.authUser?.email, state?.userInfo?.email]);

  const openResult = (id: string) => {
    if (!released) {
      // short-circuit: results not released
      alert("Results/reviews are not released by the administrator yet.");
      return;
    }
    // navigate to review page with id param; update ResultsReview to accept id later.
    navigate(`/review?id=${encodeURIComponent(id)}`);
  };

  const goHome = () => navigate("/");

  // Optional manual refresh (reload attempts + released flag)
  const refreshAll = async () => {
    setLoading(true);
    setLoadingReleased(true);
    try {
      const meta = await fetchActiveQuestionSetMeta();
      if (isAutoQuiz(meta.questionSet)) {
        setReleased(true);
        window.location.reload();
        return;
      }

      const ref = doc(db, "settings", "results");
      const snap = await getDoc(ref);
      setReleased(snap.exists() ? ((snap.data() as any).released === true) : false);
    } catch (err) {
      console.error("refresh released flag failed", err);
    } finally {
      setLoadingReleased(false);
      setLoading(false);
      // re-run attempts effect by manually navigating or reloading page if needed
      // for simplicity: force a page reload of attempts by re-calling the effect dependency - easiest is window.location.reload()
      // but we'll just re-run loadAttempts by programmatically re-mounting: navigate to same route
      // simpler: reload page:
      window.location.reload();
    }
  };

  const totalAttempts = attempts.length;
  const avgScore = totalAttempts > 0 
    ? (attempts.reduce((sum, a) => sum + (a.score ?? 0), 0) / totalAttempts).toFixed(1) 
    : 0;
  const bestScore = totalAttempts > 0 
    ? Math.max(...attempts.map(a => a.score ?? 0))
    : 0;

  const totalAttemptsForActiveSet = activeSetId 
    ? attempts.filter(a => a.questionSetId === activeSetId).length 
    : (attempts.filter(a => !a.questionSetId).length); // Fallback: if there's no activeSetId, assume legacy matching

  const mockRadarData = [
    { subject: 'Python', A: 85, fullMark: 100 },
    { subject: 'Data Structures', A: 92, fullMark: 100 },
    { subject: 'Algorithms', A: 78, fullMark: 100 },
    { subject: 'System Design', A: 88, fullMark: 100 },
    { subject: 'Databases', A: 95, fullMark: 100 },
  ];

  const pieData = [
    { name: 'Accuracy', value: totalAttempts > 0 ? Number(avgScore) : 0, fill: '#ffffff' },
    { name: 'Gap', value: totalAttempts > 0 ? 100 - Number(avgScore) : 100, fill: '#1a1a24' }
  ];

  return (
    <div className="min-h-screen bg-transparent text-white font-['Geist'] pb-20 selection:bg-white/20">
      
      {/* Top Navigation */}
      <LandingNavbar />

      <div className="max-w-6xl mx-auto px-6 pt-28 space-y-12 w-full">
        {/* Header section */}
        <AnimatedSection delay={100}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/10 pb-8">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3">Student Dashboard</h1>
              <p className="text-slate-400 text-lg">Your overall performance and assessment history.</p>
            </div>
          </div>
        </AnimatedSection>

        {released === false && (
          <AnimatedSection delay={200}>
            <div className="bg-yellow-900/10 border border-yellow-700/50 text-yellow-500 p-4 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <strong className="block text-yellow-400 mb-1">Results are currently hidden.</strong>
                <span className="text-sm">The administrator has not yet released score reviews.</span>
              </div>
            </div>
          </AnimatedSection>
        )}

        {/* Active Tests Section */}
        <AnimatedSection delay={250}>
          <div className="space-y-4">
            <h3 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              Active Tests
            </h3>
            <div className="bg-gradient-to-br from-[#111116] to-[#0a0a0f] border border-white/10 hover:border-emerald-500/30 transition-all duration-300 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden group shadow-2xl">
              {/* Subtle accent line */}
              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-emerald-400 to-emerald-600 shadow-[0_0_15px_rgba(16,185,129,0.5)]"></div>
              
              {/* Background accent glow */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-all duration-500"></div>

              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-3">
                  <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-[0_0_10px_rgba(16,185,129,0.1)]">Live Now</span>
                  <span className="text-slate-400 text-sm font-medium">Standard MCQ Format</span>
                </div>
                <h4 className="text-3xl font-bold text-white mb-2 tracking-tight">Technical MCQ Assessment</h4>
                <p className="text-slate-400 text-lg">20 Questions • Multiple Choice • 25 Minutes</p>
              </div>
              
              <div className="relative z-10 mt-4 md:mt-0 w-full md:w-auto">
                <Button 
                  onClick={() => navigate("/start")} 
                  disabled={totalAttemptsForActiveSet > 0}
                  className={`w-full md:w-auto text-white font-semibold px-10 py-6 h-auto text-lg rounded-xl transition-all duration-300 ${
                    totalAttemptsForActiveSet > 0 
                      ? 'bg-yellow-500 hover:bg-yellow-600 shadow-[0_4px_20px_-4px_rgba(234,179,8,0.4)] opacity-90' 
                      : 'bg-emerald-500 hover:bg-emerald-400 shadow-[0_4px_20px_-4px_rgba(16,185,129,0.4)] hover:shadow-[0_8px_25px_-4px_rgba(16,185,129,0.6)] hover:-translate-y-1'
                  }`}
                >
                  {totalAttemptsForActiveSet > 0 ? "Already Taken" : "Start Assessment"}
                </Button>
              </div>
            </div>
          </div>
        </AnimatedSection>

        {/* Analytics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Key Metrics */}
          <AnimatedSection delay={300} className="lg:col-span-1 h-full">
            <div className="bg-[#111116] border border-white/10 rounded-2xl p-6 shadow-2xl h-full flex flex-col justify-between">
              <h3 className="text-slate-400 font-medium mb-6">Key Metrics</h3>
              <div className="space-y-6">
                <div>
                  <div className="text-5xl font-bold tracking-tighter">{totalAttempts}</div>
                  <div className="text-sm text-slate-400 mt-1 uppercase tracking-widest font-semibold">Total Attempts</div>
                </div>
                <div className="w-full h-[1px] bg-white/10" />
                <div>
                  <div className="text-5xl font-bold tracking-tighter">{avgScore}<span className="text-2xl text-slate-500 ml-1">%</span></div>
                  <div className="text-sm text-slate-400 mt-1 uppercase tracking-widest font-semibold">Avg Score</div>
                </div>
                <div className="w-full h-[1px] bg-white/10" />
                <div>
                  <div className="text-5xl font-bold tracking-tighter">{bestScore}<span className="text-2xl text-slate-500 ml-1">%</span></div>
                  <div className="text-sm text-slate-400 mt-1 uppercase tracking-widest font-semibold">Best Score</div>
                </div>
              </div>
            </div>
          </AnimatedSection>

          {/* Circular Chart */}
          <AnimatedSection delay={400} className="lg:col-span-1 h-full">
            <div className="bg-[#111116] border border-white/10 rounded-2xl p-6 shadow-2xl h-full flex flex-col">
              <h3 className="text-slate-400 font-medium mb-2">Overall Accuracy</h3>
              <div className="flex-1 flex items-center justify-center relative w-full h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={90}
                      startAngle={90}
                      endAngle={-270}
                      dataKey="value"
                      stroke="none"
                      cornerRadius={4}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-4xl font-bold">{avgScore}%</span>
                  <span className="text-xs text-slate-400 uppercase tracking-widest mt-1">Accuracy</span>
                </div>
              </div>
            </div>
          </AnimatedSection>

          {/* Radar Chart for Strong Areas */}
          <AnimatedSection delay={500} className="lg:col-span-1 h-full">
            <div className="bg-[#111116] border border-white/10 rounded-2xl p-6 shadow-2xl h-full flex flex-col">
              <h3 className="text-slate-400 font-medium mb-2">Areas Strong In</h3>
              <div className="flex-1 flex items-center justify-center w-full h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="60%" data={mockRadarData}>
                    <PolarGrid stroke="rgba(255,255,255,0.1)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <Radar
                      name="Student"
                      dataKey="A"
                      stroke="#ffffff"
                      fill="#ffffff"
                      fillOpacity={0.2}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#111116', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                      itemStyle={{ color: '#fff' }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </AnimatedSection>
        </div>

        {/* Previous Attempts List */}
        <AnimatedSection delay={600}>
          <div className="space-y-6">
            <h3 className="text-2xl font-bold tracking-tight text-white">Recent Attempts</h3>
            
            {loading && <div className="text-slate-400">Loading attempts...</div>}
            {!loading && error && <div className="text-red-400">{error}</div>}
            {!loading && !error && attempts.length === 0 && (
              <div className="bg-[#111116] border border-white/10 rounded-2xl p-12 text-center flex flex-col items-center justify-center gap-4">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center border border-white/10 mb-2">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="9" y1="9" x2="15" y2="9"></line>
                    <line x1="9" y1="13" x2="15" y2="13"></line>
                    <line x1="9" y1="17" x2="15" y2="17"></line>
                  </svg>
                </div>
                <h4 className="text-lg font-medium text-white">No attempts yet</h4>
                <p className="text-slate-400 max-w-sm">Take your first assessment and your detailed performance results will appear here.</p>
              </div>
            )}

            <div className="space-y-3">
              {!loading && attempts.map((r) => {
                const created = r.createdAt?.toDate ? r.createdAt.toDate() : (r.createdAt ? new Date(r.createdAt) : null);
                return (
                  <div key={r.id} className="group bg-[#111116] border border-white/10 hover:border-white/30 transition-colors rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-6">
                      <div className="h-12 w-12 flex-shrink-0 rounded-full bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-white/10 transition-colors">
                        <span className="font-semibold text-lg">{released ? (r.score ?? 0) : "?"}</span>
                      </div>
                      <div>
                        <div className="font-medium text-white mb-1">
                          {created ? created.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : "Recent Attempt"}
                        </div>
                        <div className="text-sm text-slate-400 flex items-center gap-3">
                          <span>{r.name ?? r.email ?? "Unknown User"}</span>
                          <span className="w-1 h-1 flex-shrink-0 rounded-full bg-slate-600" />
                          <span>Tabs switched: {r.tabSwitchCount ?? 0}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        onClick={() => openResult(r.id)} 
                        disabled={!released}
                        className="bg-transparent border-white/10 hover:bg-white hover:text-black transition-colors"
                      >
                        {released ? "View Details" : "Locked"}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </AnimatedSection>
      </div>
    </div>
  );
}
