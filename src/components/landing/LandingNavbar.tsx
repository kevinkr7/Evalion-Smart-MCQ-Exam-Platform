import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuiz } from '@/contexts/QuizContext';
import { auth } from '@/firebase';
import { signOut } from 'firebase/auth';

export function LandingNavbar() {
  const { state } = useQuiz();
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [currentLang, setCurrentLang] = useState('en');
  const isLoggedIn = !!state.authUser?.uid;
  
  const displayName = state.authUser?.name || state.userInfo?.name || state.authUser?.email || 'User';
  
  // Extract initials for the profile avatar
  const initials = isLoggedIn 
    ? displayName.charAt(0).toUpperCase() 
    : '';

  useEffect(() => {
    // Read googtrans cookie
    const match = document.cookie.match(/googtrans=\/en\/([^;]+)/);
    if (match && match[1]) {
      setCurrentLang(match[1]);
    }
  }, []);

  const handleLanguageChange = (e: React.MouseEvent, code: string) => {
    e.preventDefault();
    // Clear any existing cookie
    document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
    
    if (code !== 'en') {
       document.cookie = `googtrans=/en/${code}; path=/;`;
       document.cookie = `googtrans=/en/${code}; path=/; domain=${window.location.hostname};`;
    }
    
    window.location.reload();
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      setIsProfileOpen(false); // Close dropdown
      await signOut(auth);
      // Wait for a nice visual delay before hard reload
      setTimeout(() => {
        window.location.href = '/';
      }, 1500);
    } catch (e) {
      console.error(e);
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      {/* Animated Logout Overlay */}
      {isLoggingOut && (
        <div className="fixed inset-0 z-[9999] bg-[#0b0b0d] flex flex-col items-center justify-center font-['Geist']">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(124,58,237,0.15)_0%,transparent_70%)] pointer-events-none"></div>
          <div className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.03]" style={{backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`}}></div>
          
          <div className="relative z-10 flex items-center justify-center w-32 h-32 mb-10">
            <div className="absolute w-32 h-32 border-t-2 border-indigo-500 rounded-full animate-spin opacity-70" style={{ animationDuration: '2s' }}></div>
            <div className="absolute w-24 h-24 border-r-2 border-emerald-400 rounded-full animate-spin opacity-80" style={{ animationDuration: '1.5s', animationDirection: 'reverse' }}></div>
            <div className="absolute w-16 h-16 border-b-2 border-cyan-400 rounded-full animate-spin" style={{ animationDuration: '1s' }}></div>
            <div className="absolute w-8 h-8 bg-white rounded-full shadow-[0_0_20px_#fff,0_0_40px_#7c3aed] animate-pulse"></div>
          </div>
          <p className="relative z-10 text-slate-300 text-lg font-medium tracking-widest uppercase animate-pulse">Signing Out Safely</p>
        </div>
      )}

      {isProfileOpen && (
        <div className="fixed inset-0 z-[45] backdrop-blur-md bg-black/10 transition-all duration-300 pointer-events-none" />
      )}
      <nav className="nav-visible nav-ready" style={{ zIndex: isProfileOpen ? 50 : undefined }}>
        <a href="/" className="nav-logo notranslate" style={{ color: '#fff', fontSize: '20px', fontWeight: '300', textDecoration: 'none' }}>
          EVALION
        </a>
        <div className="nav-links">
        </div>
        <div className="nav-cta">
          <div className="lang-switcher">
            <button className="lang-switcher__toggle" aria-label="Switch language" onClick={(e) => e.currentTarget.parentElement?.classList.toggle('open')}>
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx={12} cy={12} r={10} /><path d="M2 12h20" /><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" /></svg>
              {currentLang}
              <svg className="lang-switcher__caret" width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
            </button>
            <div className="lang-switcher__dropdown">
              <a href="#" onClick={(e) => handleLanguageChange(e, 'en')}>English</a>
              <a href="#" onClick={(e) => handleLanguageChange(e, 'hi')}>हिंदी</a>
              <a href="#" onClick={(e) => handleLanguageChange(e, 'ta')}>தமிழ்</a>
              <a href="#" onClick={(e) => handleLanguageChange(e, 'ml')}>മലയാളം</a>
              <a href="#" onClick={(e) => handleLanguageChange(e, 'ko')}>한국어</a>
            </div>
          </div>
          
          {isLoggedIn ? (
            <>
              <Link to="/dashboard" className="btn-outline font-['Geist'] font-medium" style={{display: 'inline-flex', alignItems: 'center', justifyContent: 'center'}}>Dashboard</Link>
              
              <div 
                className="relative"
                onMouseEnter={() => setIsProfileOpen(true)}
                onMouseLeave={() => setIsProfileOpen(false)}
              >
                <div 
                  onClick={() => navigate('/profile')}
                  style={{
                    width: '40px', 
                    height: '40px', 
                    borderRadius: '50%', 
                    backgroundColor: '#7c3aed', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    border: '2px solid rgba(255,255,255,0.2)',
                    position: 'relative',
                    zIndex: 51
                  }}
                  title="Profile"
                >
                  {initials}
                </div>

                {/* Light-themed Dropdown Menu */}
                {isProfileOpen && (
                  <div className="absolute right-0 top-full pt-2 z-[60]">
                    <div className="w-56 bg-white rounded-xl shadow-2xl py-2 border border-slate-100 font-['Geist'] animate-in fade-in slide-in-from-top-2">
                      <div className="px-4 py-3 border-b border-slate-100 mb-1">
                        <p className="text-sm font-semibold text-slate-800 truncate">{displayName}</p>
                        <p className="text-xs text-slate-500 truncate mt-0.5">{state.authUser?.email || state.userInfo?.email}</p>
                      </div>
                      <button 
                        onClick={() => navigate('/profile')}
                        className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors flex items-center gap-3"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                        Profile Settings
                      </button>
                      <button 
                        onClick={() => window.location.href = 'mailto:support@evalion.app'}
                        className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors flex items-center gap-3"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                        Help & Support
                      </button>
                      <div className="h-px bg-slate-100 my-1"></div>
                      <button 
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-3 font-medium"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                        Log out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-outline font-['Geist'] font-medium" style={{display: 'inline-flex', alignItems: 'center', justifyContent: 'center'}}>Log in</Link>
              <Link to="/register" className="btn-fill">Get Started</Link>
            </>
          )}
        </div>
        <button className="hamburger" aria-label="Menu" onClick={(e) => {
          var n = e.currentTarget.closest('nav');
          var m = document.querySelector('.mobile-menu');
          var b = document.body;
          var opening = m && !m.classList.contains('open');
          if (opening && m && n) {
            b.dataset.scrollY = window.scrollY.toString();
            m.classList.add('open');
            n.classList.add('menu-open');
            b.classList.add('menu-open');
            b.style.top = '-' + b.dataset.scrollY + 'px';
          } else if (m && n) {
            m.classList.remove('open');
            n.classList.remove('menu-open');
            b.classList.remove('menu-open');
            b.style.top = '';
            window.scrollTo(0, parseInt(b.dataset.scrollY || '0'));
          }
        }}>
          <span /><span /><span />
        </button>
      </nav>
      <div className="mobile-menu" style={{ display: 'none' }}>
        <div className="mobile-dropdown">
          <button className="mobile-dropdown-toggle" onClick={(e) => e.currentTarget.parentElement?.classList.toggle('open')}>Products</button>
          <div className="mobile-dropdown-content">
            <a href="https://evalion.app/en/platform/sales/">Assessment Platform<span>Everything you need to run better assessments.</span></a>
          </div>
        </div>
        <div className="mobile-dropdown">
          <button className="mobile-dropdown-toggle" onClick={(e) => e.currentTarget.parentElement?.classList.toggle('open')}>Resources</button>
          <div className="mobile-dropdown-content">
            <a href="https://evalion.app/en/resources/developers/">For Developers<span>API, technical documentation, and integrations.</span></a>
          </div>
        </div>
        <div className="mobile-dropdown">
          <button className="mobile-dropdown-toggle" onClick={(e) => e.currentTarget.parentElement?.classList.toggle('open')}>Partners</button>
          <div className="mobile-dropdown-content">
            <a href="https://evalion.app/en/resources/partners/">Partner Program<span>Margins, tiers, and incentives for our partners.</span></a>
            <a href="https://evalion.app/en/company/partners/">Apply as Partner<span>Join our network of commercial partners.</span></a>
          </div>
        </div>
      </div>
    </>
  );
}
