import React, { useEffect, useState } from 'react';
import { LandingNavbar } from './LandingNavbar';
import { LandingHero } from './LandingHero';
import { LandingContent } from './LandingContent';
import { LandingFooter } from './LandingFooter';

export function LandingLayout() {
  const [showVeils, setShowVeils] = useState(true);
  useEffect(() => {
    // We add the .lenis class to html just like the original template
    document.documentElement.classList.add('lenis');

    // Load external scripts sequentially to ensure dependencies are met
    const loadScript = (src: string) => {
      return new Promise<void>((resolve, reject) => {
        // Prevent loading duplicates
        if (document.querySelector(`script[src="${src}"]`)) {
          resolve();
          return;
        }
        const script = document.createElement('script');
        script.src = src;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Failed to load ${src}`));
        document.body.appendChild(script);
      });
    };

    const initScripts = async () => {
      try {
        await loadScript('/prolibu_assets/lenis.min.js');
        await loadScript('/prolibu_assets/iso-player.js');
        await loadScript('/prolibu_assets/human-resources.js');
      } catch (err) {
        console.error("Error loading Prolibu native scripts:", err);
      }
    };

    // Only inject the animation logic once
    if (!document.getElementById('prolibu-global-css')) { const link1 = document.createElement('link'); link1.id = 'prolibu-global-css'; link1.rel = 'stylesheet'; link1.href = '/prolibu_assets/global.css'; document.head.appendChild(link1); const link2 = document.createElement('link'); link2.id = 'prolibu-hr-css'; link2.rel = 'stylesheet'; link2.href = '/prolibu_assets/human-resources.css'; document.head.appendChild(link2); } if (!document.getElementById('page-load-animation-style')) {
      const style = document.createElement('style');
      style.id = 'page-load-animation-style';
      style.innerHTML = `
@media (prefers-reduced-motion: no-preference) {
  body:not(.page-loaded-done) .nav-visible {
    opacity: 0;
    transform: translateY(-100%);
  }
  
  body:not(.page-loaded-done) .hr-hero__content {
    opacity: 0;
    transform: translateY(40px);
    filter: blur(8px);
    position: relative;
    z-index: 10;
  }

  body.page-loaded .hr-hero__content {
    animation: textFloatUp 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards;
    animation-delay: 0.1s;
  }

  body.page-loaded #bg-veil,
  body.page-loaded #full-page-veil {
    animation: veilFadeOut 0.8s ease-in-out forwards;
    animation-delay: 0.4s;
  }

  body.page-loaded .nav-visible {
    animation: navDrop 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards;
    animation-delay: 0.8s;
  }

  @keyframes textFloatUp {
    0% { opacity: 0; transform: translateY(40px); filter: blur(8px); }
    100% { opacity: 1; transform: translateY(0); filter: blur(0); }
  }

  @keyframes veilFadeOut {
    0% { background-color: rgba(0,0,0,1); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); }
    100% { background-color: rgba(0,0,0,0); backdrop-filter: blur(0px); -webkit-backdrop-filter: blur(0px); opacity: 0; display: none; }
  }

  @keyframes navDrop {
    0% { opacity: 0; transform: translateY(-100%); }
    100% { opacity: 1; transform: translateY(0); }
  }
}
@media (prefers-reduced-motion: reduce) {
  #bg-veil, #full-page-veil { display: none !important; }
}
      `;
      document.head.appendChild(style);
    }

    // Load iso-player immediately so IsoPlayer is available for the hero
    loadScript('/prolibu_assets/iso-player.js').catch(() => { });

    // Animation execution
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        document.body.classList.add('page-loaded');
        setTimeout(() => {
          document.body.classList.remove('page-loaded');
          document.body.classList.add('page-loaded-done');
          setShowVeils(false);

          // Load remaining scripts after animation completes
          loadScript('/prolibu_assets/lenis.min.js')
            .then(() => loadScript('/prolibu_assets/human-resources.js'))
            .catch((err) => console.error("Error loading scripts:", err));
        }, 1600);
      });
    });

    return () => {
      // Cleanup
      document.documentElement.classList.remove('lenis');
    };
  }, []);

  return (
    <div style={{ minHeight: '100vh' }}>
      {showVeils && <div id="full-page-veil" style={{ position: 'fixed', inset: 0, background: '#000', zIndex: 9 }}></div>}
      <div className="mobile-menu" style={{ display: 'none' }}></div>
      <div className="nav-backdrop" style={{ position: 'fixed', inset: 0, zIndex: 40, pointerEvents: 'none', opacity: 0 }}></div>
      <LandingNavbar />
      <div id="human-resources">
        <LandingHero showVeils={showVeils} />
        <LandingContent />
      </div>
      <LandingFooter />
    </div>
  );
}
