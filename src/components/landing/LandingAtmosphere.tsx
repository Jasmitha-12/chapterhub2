import React, { useEffect, useState } from 'react';
import { useTheme } from '../../context/ThemeContext';

export const LandingAtmosphere: React.FC = () => {
  const { theme } = useTheme();
  const [reducedMotion, setReducedMotion] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // Check user preference for reduced motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    const handleMediaChange = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleMediaChange);

    // Subtle, smooth mouse parallax on desktop (disabled on touch / mobile / reduced motion)
    let animationFrameId: number;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      if (mediaQuery.matches || window.innerWidth < 768) return;
      // Normalized between -1 and 1
      targetX = (e.clientX / window.innerWidth - 0.5) * 2;
      targetY = (e.clientY / window.innerHeight - 0.5) * 2;
    };

    const updateParallax = () => {
      if (!mediaQuery.matches && window.innerWidth >= 768) {
        // Smooth interpolation
        currentX += (targetX - currentX) * 0.05;
        currentY += (targetY - currentY) * 0.05;
        setMousePos({ x: currentX, y: currentY });
      }
      animationFrameId = requestAnimationFrame(updateParallax);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    animationFrameId = requestAnimationFrame(updateParallax);

    return () => {
      mediaQuery.removeEventListener('change', handleMediaChange);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div
      className={`landing-atmosphere-root ${theme === 'dark' ? 'dark' : ''} ${
        reducedMotion ? 'reduced-motion' : ''
      }`}
      aria-hidden="true"
    >
      {/* Background Lighting Base */}
      <div className="landing-ambient-light" />

      {/* Layer 1: Deep Background Glows (Slowest drift, wide blur) */}
      <div
        className="landing-bubble bubble-deep-blue"
        style={{
          transform: reducedMotion
            ? 'none'
            : `translate3d(${mousePos.x * 12}px, ${mousePos.y * 10}px, 0)`,
        }}
      />
      <div
        className="landing-bubble bubble-deep-amber"
        style={{
          transform: reducedMotion
            ? 'none'
            : `translate3d(${-mousePos.x * 14}px, ${-mousePos.y * 12}px, 0)`,
        }}
      />

      {/* Layer 2: Midground Atmospheric Blobs (Medium blur, organic movement) */}
      <div
        className="landing-bubble bubble-mid-green"
        style={{
          transform: reducedMotion
            ? 'none'
            : `translate3d(${mousePos.x * 20}px, ${mousePos.y * 16}px, 0)`,
        }}
      />
      <div
        className="landing-bubble bubble-mid-terracotta"
        style={{
          transform: reducedMotion
            ? 'none'
            : `translate3d(${-mousePos.x * 18}px, ${-mousePos.y * 15}px, 0)`,
        }}
      />
      <div
        className="landing-bubble bubble-mid-sky"
        style={{
          transform: reducedMotion
            ? 'none'
            : `translate3d(${mousePos.x * 15}px, ${-mousePos.y * 18}px, 0)`,
        }}
      />

      {/* Layer 3: Foreground Floating Bubbles (Sharper, floating closer with depth) */}
      <div
        className="landing-bubble bubble-fore-soft1"
        style={{
          transform: reducedMotion
            ? 'none'
            : `translate3d(${mousePos.x * 32}px, ${mousePos.y * 26}px, 0)`,
        }}
      />
      <div
        className="landing-bubble bubble-fore-soft2"
        style={{
          transform: reducedMotion
            ? 'none'
            : `translate3d(${-mousePos.x * 28}px, ${mousePos.y * 22}px, 0)`,
        }}
      />
      <div
        className="landing-bubble bubble-fore-soft3"
        style={{
          transform: reducedMotion
            ? 'none'
            : `translate3d(${mousePos.x * 24}px, ${-mousePos.y * 20}px, 0)`,
        }}
      />

      {/* Layer 4: Subtle Floating Atmosphere Particles */}
      {!reducedMotion && (
        <div className="landing-particles-layer">
          <div className="landing-particle particle-1" />
          <div className="landing-particle particle-2" />
          <div className="landing-particle particle-3" />
          <div className="landing-particle particle-4" />
          <div className="landing-particle particle-5" />
          <div className="landing-particle particle-6" />
        </div>
      )}

      {/* Layer 5: Soft Vignette Overlay for Crisp Readability */}
      <div className="landing-vignette-overlay" />
    </div>
  );
};
