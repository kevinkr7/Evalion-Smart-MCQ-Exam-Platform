import React, { useEffect } from 'react';

export function LandingHero({ showVeils = true }: { showVeils?: boolean }) {
  useEffect(() => {
    // Initialize IsoPlayer as soon as it's available
    let interval: ReturnType<typeof setInterval>;
    const init = () => {
      const IsoPlayer = (window as any).IsoPlayer;
      if (!IsoPlayer) return;
      const container = document.getElementById('hr-hero-iso');
      if (!container || (container as any)._isoInit) return;

      (container as any)._isoInit = true;
      clearInterval(interval);
      IsoPlayer.load(container, '/prolibu_assets/iso-human.json?v=4', {
        autoplay: false,
        loop: false,
        responsive: true,
        cover: true,
      }).then((player: any) => {
        // Pan the 3D camera down by 250 units (roughly 50% relative shift of the 3D objects)
        player.setPan(0, 300);

        const handleScroll = () => {
          // Map scroll progress relative to the window height
          let progress = window.scrollY / (window.innerHeight * 0.8);
          progress = Math.max(0, Math.min(1, progress));
          // Limit the motion so it doesn't go through the complete frame range
          const maxFrame = (player.totalFrames || 60) * 0.25;
          // Pass the raw float value (no Math.round) for sub-frame interpolation
          const frame = progress * maxFrame;
          player.setFrame(frame);
        };
        (container as any)._isoScrollHandler = handleScroll;
        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll(); // Initial frame
      }).catch((e: any) => console.error('IsoPlayer load failed:', e));
    };

    interval = setInterval(init, 200);
    // Also try immediately
    init();

    return () => {
      clearInterval(interval);
      if (typeof window !== 'undefined') {
        const container = document.getElementById('hr-hero-iso');
        if (container && (container as any)._isoScrollHandler) {
          window.removeEventListener('scroll', (container as any)._isoScrollHandler);
        }
      }
    };
  }, []);

  return (
    <>
      <section className="hr-hero" style={{ position: 'relative' }}>
        {/* IsoPlayer renders into this container */}
        <div
          id="hr-hero-iso"
          className="hero-iso--revealed"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            zIndex: 1,
            overflow: 'hidden',
          }}
        />
        {/* Loading veil shown until animation sequence completes */}
        {showVeils && (
          <div
            id="bg-veil"
            style={{ position: 'absolute', inset: 0, background: '#000', zIndex: 2 }}
          />
        )}
        <div className="hr-hero__content" style={{ transform: 'translateY(0px)' }}>
          <h1 className="hr-title--revealed notranslate" style={{
            fontFamily: "'Raleway', sans-serif",
            fontSize: 'clamp(4rem, 12vw, 12rem)',
            textTransform: 'uppercase',
            fontWeight: 100,
            lineHeight: 1,
            letterSpacing: '0.02em',
            margin: '0 0 20px 0'
          }}>EVALION</h1>
          <p className="hr-hero__desc hr-title--revealed">
            Create assessments, conduct secure evaluations, and turn every attempt into meaningful performance data.
          </p>
          <div className="hr-hero__scroll-hint hr-title--revealed">
            <div className="scroll-mouse">
              <div className="scroll-mouse__wheel" />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
