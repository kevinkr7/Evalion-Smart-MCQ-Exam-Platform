import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuiz } from '@/contexts/QuizContext';
import { db } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';

export function LandingFooter() {
  const { state } = useQuiz();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const email = state.authUser?.email;
    if (email) {
      getDoc(doc(db, 'admins', email)).then((snap) => {
        setIsAdmin(snap.exists());
      }).catch(() => setIsAdmin(false));
    } else {
      setIsAdmin(false);
    }
  }, [state.authUser?.email]);

  return (
    <footer className="bg-[#0b0b0d] text-slate-400 py-16 border-t border-white/5 font-['Geist'] h-auto min-h-0" style={{ height: 'auto' }}>
      <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-8 mb-16">
          <div className="md:col-span-4 lg:col-span-5">
            <a href="/" className="inline-block mb-6">
              <span className="text-white text-xl font-light tracking-[0.1em] notranslate">EVALION</span>
            </a>
            <p className="text-sm text-slate-500 max-w-xs leading-relaxed">
              Create assessments, conduct secure evaluations, and turn every attempt into meaningful performance data.
            </p>
          </div>
          
          <div className="md:col-span-2 lg:col-span-2">
            <h3 className="text-xs font-semibold text-white tracking-widest uppercase mb-6">Platform</h3>
            <ul className="space-y-4 text-sm">
              <li><a href="#" className="hover:text-white transition-colors duration-200">Assessment</a></li>
              <li><a href="#" className="hover:text-white transition-colors duration-200">Proctoring</a></li>
              <li><a href="#" className="hover:text-white transition-colors duration-200">Analytics</a></li>
              <li><a href="#" className="hover:text-white transition-colors duration-200">Integrations</a></li>
              {isAdmin && <li><Link to="/admin" className="hover:text-white transition-colors duration-200 text-[#7c3aed]">Admin</Link></li>}
            </ul>
          </div>

          <div className="md:col-span-2 lg:col-span-2">
            <h3 className="text-xs font-semibold text-white tracking-widest uppercase mb-6">Resources</h3>
            <ul className="space-y-4 text-sm">
              <li><a href="#" className="hover:text-white transition-colors duration-200">Documentation</a></li>
              <li><a href="#" className="hover:text-white transition-colors duration-200">Help Center</a></li>
              <li><a href="#" className="hover:text-white transition-colors duration-200">Guides</a></li>
              <li><a href="#" className="hover:text-white transition-colors duration-200">API Status</a></li>
            </ul>
          </div>

          <div className="md:col-span-2 lg:col-span-3">
            <h3 className="text-xs font-semibold text-white tracking-widest uppercase mb-6">Company</h3>
            <ul className="space-y-4 text-sm">
              <li><a href="#" className="hover:text-white transition-colors duration-200">About <span className="notranslate">Evalion</span></a></li>
              <li><a href="#" className="hover:text-white transition-colors duration-200">Customers</a></li>
              <li><a href="#" className="hover:text-white transition-colors duration-200">Careers</a></li>
              <li><a href="#" className="hover:text-white transition-colors duration-200">Contact</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-6 text-sm text-slate-500">
            <span>© 2026 <span className="notranslate">Evalion</span>. All rights reserved.</span>
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
          </div>
          
          <div className="flex items-center gap-5 text-slate-500">
            <a href="#" className="hover:text-white transition-colors" aria-label="Twitter">
              <i className="ph-fill ph-twitter-logo text-xl"></i>
            </a>
            <a href="#" className="hover:text-white transition-colors" aria-label="LinkedIn">
              <i className="ph-fill ph-linkedin-logo text-xl"></i>
            </a>
            <a href="#" className="hover:text-white transition-colors" aria-label="GitHub">
              <i className="ph-fill ph-github-logo text-xl"></i>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
