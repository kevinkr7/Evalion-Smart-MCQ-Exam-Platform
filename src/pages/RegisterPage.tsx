import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function RegisterPage() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [windowSize, setWindowSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    setWindowSize({ w: window.innerWidth, h: window.innerHeight });
    
    const handleResize = () => {
      setWindowSize({ w: window.innerWidth, h: window.innerHeight });
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (windowSize.w === 0) return;
    
    // Calculate relative mouse position (-1 to 1)
    const x = (e.clientX / windowSize.w) * 2 - 1;
    const y = (e.clientY / windowSize.h) * 2 - 1;
    
    setMousePos({ x, y });
  };

  return (
    <div 
      className="min-h-screen relative flex flex-col items-center justify-center py-12 px-6 overflow-hidden font-['Geist'] bg-slate-50"
      onMouseMove={handleMouseMove}
    >
      
      {/* Highly Dynamic Parallax Background */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
        
        {/* Dynamic Sweeping Aurora Gradients */}
        <div className="absolute top-0 left-0 w-full h-full opacity-60">
          <div 
            className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] bg-gradient-to-r from-blue-300 to-indigo-400 rounded-full mix-blend-multiply filter blur-[100px] transition-transform duration-700 ease-out" 
            style={{ transform: `translate(${mousePos.x * -30}px, ${mousePos.y * -30}px)` }}
          ></div>
          <div 
            className="absolute top-[10%] right-[-10%] w-[60vw] h-[60vw] bg-gradient-to-l from-purple-300 to-pink-300 rounded-full mix-blend-multiply filter blur-[100px] transition-transform duration-700 ease-out" 
            style={{ transform: `translate(${mousePos.x * 40}px, ${mousePos.y * 40}px)` }}
          ></div>
          <div 
            className="absolute bottom-[-20%] left-[20%] w-[80vw] h-[80vw] bg-gradient-to-t from-violet-300 to-fuchsia-300 rounded-full mix-blend-multiply filter blur-[100px] transition-transform duration-700 ease-out" 
            style={{ transform: `translate(${mousePos.x * -20}px, ${mousePos.y * -20}px)` }}
          ></div>
        </div>

        {/* Animated Grid that moves continuously + parallax */}
        <div 
          className="absolute inset-[-10%] w-[120%] h-[120%] transition-transform duration-700 ease-out" 
          style={{ 
            backgroundImage: `
              linear-gradient(to right, rgba(99, 102, 241, 0.1) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(99, 102, 241, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
            maskImage: 'radial-gradient(ellipse 70% 70% at 50% 50%, #000 20%, transparent 100%)',
            WebkitMaskImage: 'radial-gradient(ellipse 70% 70% at 50% 50%, #000 20%, transparent 100%)',
            animation: 'gridMove 20s linear infinite',
            transform: `translate(${mousePos.x * -10}px, ${mousePos.y * -10}px)`
          }}
        ></div>
        
        {/* Abstract Floating UI Elements (Circles & Dots) with intense Parallax */}
        
        <div 
          className="absolute top-[15%] left-[15%] w-32 h-32 transition-transform duration-700 ease-out"
          style={{ transform: `translate(${mousePos.x * 60}px, ${mousePos.y * 60}px)` }}
        >
          <div className="w-full h-full border border-indigo-200 rounded-full animate-[spin_15s_linear_infinite] opacity-50"></div>
        </div>

        <div 
          className="absolute bottom-[20%] right-[15%] w-48 h-48 transition-transform duration-700 ease-out"
          style={{ transform: `translate(${mousePos.x * -80}px, ${mousePos.y * -80}px)` }}
        >
          <div className="w-full h-full border border-dashed border-purple-300 rounded-full animate-[spin_20s_linear_infinite_reverse] opacity-50"></div>
        </div>

        <div 
          className="absolute top-[40%] right-[25%] transition-transform duration-500 ease-out"
          style={{ transform: `translate(${mousePos.x * 120}px, ${mousePos.y * 120}px)` }}
        >
          <div className="w-4 h-4 bg-blue-400 rounded-full shadow-[0_0_20px_rgba(96,165,250,0.8)] animate-pulse"></div>
        </div>

        <div 
          className="absolute bottom-[30%] left-[20%] transition-transform duration-500 ease-out" 
          style={{ transform: `translate(${mousePos.x * -100}px, ${mousePos.y * -100}px)` }}
        >
          <div className="w-6 h-6 bg-violet-400 rounded-full shadow-[0_0_20px_rgba(139,92,246,0.8)] animate-bounce" style={{ animationDuration: '3s' }}></div>
        </div>
      </div>

      {/* Inline styles for background animations */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes gridMove {
          0% { background-position: 0 0; }
          100% { background-position: 40px 40px; }
        }
      `}} />

      <div className="relative z-10 w-full max-w-lg mx-auto">
        {/* Light Glassmorphic Main Content Card with Entry Animation and Subtle Parallax */}
        <div 
          className="w-full bg-white/70 backdrop-blur-2xl border border-white/50 rounded-3xl p-10 shadow-[0_8px_32px_rgba(0,0,0,0.04)] flex flex-col text-center relative overflow-hidden group perspective-[1000px] animate-in fade-in zoom-in-95 duration-1000 transition-transform duration-700 ease-out"
          style={{ transform: `rotateX(${mousePos.y * 2}deg) rotateY(${mousePos.x * -2}deg)` }}
        >
          
          {/* Subtle 3D SVG concept overlay */}
          <div className="absolute inset-0 pointer-events-none transition-transform duration-700">
            <svg className="absolute inset-0 w-full h-full text-indigo-500/10" viewBox="0 0 100 100" preserveAspectRatio="none">
              <rect x="0" y="0" width="100" height="100" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 4" />
              <circle cx="0" cy="0" r="1.5" fill="currentColor" />
              <circle cx="100" cy="0" r="1.5" fill="currentColor" />
              <circle cx="100" cy="100" r="1.5" fill="currentColor" />
              <circle cx="0" cy="100" r="1.5" fill="currentColor" />
            </svg>
          </div>

          <div className="inline-flex items-center justify-center bg-red-50 border border-red-100 text-red-600 px-4 py-1.5 rounded-full mx-auto mb-8 relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 fill-mode-both">
            <span className="relative flex h-2 w-2 mr-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            <span className="text-xs font-bold uppercase tracking-widest">Restricted Access</span>
          </div>
          
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 mb-4 relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500 fill-mode-both">
            Registration Disabled
          </h1>
          
          <p className="text-lg text-slate-600 mb-10 leading-relaxed relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-700 fill-mode-both">
            Open registration is currently disabled for security reasons. Please ask the administrator to provide your credentials to access the platform.
          </p>

          <div className="relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-[900ms] fill-mode-both">
            <Link 
              to="/login"
              className="inline-flex items-center justify-center w-full py-5 text-lg font-semibold rounded-full bg-white text-slate-800 border border-slate-200 shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.16)] transition-all duration-300 hover:-translate-y-1 hover:border-indigo-100 group-hover:text-indigo-600"
            >
              Back to Login
            </Link>
          </div>
        </div>

        <div className="text-center text-sm text-slate-500 mt-8 relative z-10 animate-in fade-in duration-1000 delay-[1200ms] fill-mode-both">
          <p>Need help? Contact <span className="font-medium text-slate-700 notranslate">support@evalion.app</span></p>
        </div>
      </div>
    </div>
  );
}
