import React, { useEffect, useState } from 'react';
import { useTheme } from '../../context/ThemeContext';

export const AtmosphericCanvas: React.FC = () => {
  const { theme } = useTheme();
  const [reducedMotion, setReducedMotion] = useState(false);
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // Check user preference for reduced motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    const handleMediaChange = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleMediaChange);

    // Gentle, high-performance mouse parallax
    let frameId: number;
    const handleMouseMove = (e: MouseEvent) => {
      if (mediaQuery.matches) return;
      cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(() => {
        const x = (e.clientX / window.innerWidth - 0.5) * 16;
        const y = (e.clientY / window.innerHeight - 0.5) * 12;
        setMouseOffset({ x, y });
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    return () => {
      mediaQuery.removeEventListener('change', handleMediaChange);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <div
      className={`atmospheric-canvas-container ${theme === 'dark' ? 'dark' : ''} ${
        reducedMotion ? 'reduced-motion' : ''
      }`}
      aria-hidden="true"
    >
      {/* Drifting soft atmospheric clouds with subtle depth */}
      <div
        className="atmospheric-cloud cloud-blue"
        style={{
          transform: reducedMotion
            ? 'none'
            : `translate3d(${mouseOffset.x * 0.4}px, ${mouseOffset.y * 0.4}px, 0)`,
        }}
      />
      <div
        className="atmospheric-cloud cloud-yellow"
        style={{
          transform: reducedMotion
            ? 'none'
            : `translate3d(${-mouseOffset.x * 0.6}px, ${-mouseOffset.y * 0.5}px, 0)`,
        }}
      />
      <div
        className="atmospheric-cloud cloud-green"
        style={{
          transform: reducedMotion
            ? 'none'
            : `translate3d(${mouseOffset.x * 0.3}px, ${mouseOffset.y * 0.3}px, 0)`,
        }}
      />
      <div
        className="atmospheric-cloud cloud-red"
        style={{
          transform: reducedMotion
            ? 'none'
            : `translate3d(${-mouseOffset.x * 0.2}px, ${-mouseOffset.y * 0.2}px, 0)`,
        }}
      />
    </div>
  );
};

