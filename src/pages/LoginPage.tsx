import React, { useState, useEffect } from 'react';
import MemberLogin from '@/components/MemberLogin';
import { Link } from 'react-router-dom';

export default function LoginPage() {
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen bg-[#0b0b0d] text-white flex font-['Geist'] overflow-hidden">
      <style>{`
        @keyframes blurFade {
          0% { opacity: 0; filter: blur(12px); transform: scale(0.99); }
          100% { opacity: 1; filter: blur(0); transform: scale(1); }
        }
        .animate-blur-fade {
          animation: blurFade 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards;
          width: 100%;
          display: flex;
        }
      `}</style>
      <div className="animate-blur-fade">
        {/* Left side: Login Form */}
        <div className="w-full lg:w-1/2 flex flex-col p-8 lg:p-24 justify-center relative z-10">
        <div className="absolute top-8 left-8 lg:top-12 lg:left-16">
          <Link to="/" className="inline-block">
            <span className="text-white text-2xl font-light tracking-[0.1em] notranslate">EVALION</span>
          </Link>
        </div>
        
        <div className="max-w-md w-full mx-auto lg:mx-0 lg:ml-auto lg:mr-24">
          <h1 className="text-4xl font-bold mb-3 tracking-tight">Welcome back</h1>
          <p className="text-slate-400 mb-10 text-sm leading-relaxed">
            Enter your credentials to access your assessment dashboard and continue where you left off.
          </p>
          
          <MemberLogin />
        </div>
      </div>

      {/* Right side: Interactive Visual */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#111116] overflow-hidden border-l border-white/5 items-center justify-center">
        {/* Glowing Orbs tracking mouse */}
        <div 
          className="absolute inset-0 opacity-40 transition-transform duration-1000 ease-out"
          style={{
            background: `radial-gradient(circle at ${mousePos.x}% ${mousePos.y}%, rgba(124, 58, 237, 0.4), transparent 40%),
                         radial-gradient(circle at ${100 - mousePos.x}% ${100 - mousePos.y}%, rgba(37, 99, 235, 0.4), transparent 40%)`
          }}
        />
        {/* Noise overlay for texture */}
        <div className="absolute inset-0 opacity-[0.03]" style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")'}}></div>
        
        <div className="relative z-10 p-16 max-w-lg text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/5 border border-white/10 mb-8 backdrop-blur-sm shadow-2xl">
            <i className="ph-fill ph-chart-polar text-4xl text-indigo-400"></i>
          </div>
          <h2 className="text-3xl font-semibold mb-4 leading-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 to-purple-400">
            Intelligent Assessment Insights
          </h2>
          <p className="text-slate-400 text-lg leading-relaxed">
            Turn every assessment attempt into actionable performance data and measure knowledge precisely.
          </p>
        </div>
      </div>
      </div>
    </div>
  );
}
