import React, { useState, useEffect, useRef } from 'react';
import grietLogo from '../../assets/griet-logo.png';
import {
  CheckCircle2,
  Calendar as CalendarIcon,
  Layers,
  Users,
  Sparkles,
  Loader2,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';

interface LandingHeroProps {
  onSignIn: () => void;
  isSigningIn: boolean;
  authError: string | null;
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  onSignIn,
  isSigningIn,
  authError,
}) => {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    const handleMediaChange = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleMediaChange);

    // Subtle 3D tilt tracking on desktop
    let animationFrameId: number;
    let targetTiltX = 0;
    let targetTiltY = 0;
    let currentTiltX = 0;
    let currentTiltY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      if (mediaQuery.matches || window.innerWidth < 1024) return;
      const { innerWidth, innerHeight } = window;
      // Clamped gentle rotation angles (-4deg to +4deg)
      targetTiltX = ((e.clientY / innerHeight) - 0.5) * -7;
      targetTiltY = ((e.clientX / innerWidth) - 0.5) * 8;
    };

    const handleMouseLeave = () => {
      targetTiltX = 0;
      targetTiltY = 0;
    };

    const updateTilt = () => {
      if (!mediaQuery.matches && window.innerWidth >= 1024) {
        currentTiltX += (targetTiltX - currentTiltX) * 0.06;
        currentTiltY += (targetTiltY - currentTiltY) * 0.06;
        setTilt({ x: currentTiltX, y: currentTiltY });
      }
      animationFrameId = requestAnimationFrame(updateTilt);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseleave', handleMouseLeave);
    animationFrameId = requestAnimationFrame(updateTilt);

    return () => {
      mediaQuery.removeEventListener('change', handleMediaChange);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <section className="landing-hero-section" ref={heroRef}>
      {/* 3D Perspective Viewport */}
      <div
        className="landing-3d-viewport"
        style={{
          transform: reducedMotion
            ? 'none'
            : `perspective(1200px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        }}
      >
        {/* Floating Satellite Card 1: Tasks / Deliverables (Top-Left) */}
        <div
          className="satellite-card satellite-tasks"
          style={{
            transform: reducedMotion
              ? 'none'
              : `translate3d(${tilt.y * -1.8}px, ${tilt.x * -1.5}px, 45px)`,
          }}
          aria-hidden="true"
        >
          <div className="satellite-header">
            <div className="satellite-icon-badge badge-blue">
              <CheckCircle2 size={16} />
            </div>
            <div className="satellite-title-group">
              <span className="satellite-title">Sprint Milestones</span>
              <span className="satellite-pill pill-live">Active Tracking</span>
            </div>
          </div>
          <div className="satellite-body-tasks">
            <div className="task-preview-row">
              <div className="task-preview-indicator indicator-blue" />
              <div className="task-preview-content">
                <span className="task-preview-label">Technical Track</span>
                <div className="task-progress-bar">
                  <div className="progress-fill fill-blue" style={{ width: '85%' }} />
                </div>
              </div>
            </div>
            <div className="task-preview-row">
              <div className="task-preview-indicator indicator-green" />
              <div className="task-preview-content">
                <span className="task-preview-label">Creative & Design</span>
                <div className="task-progress-bar">
                  <div className="progress-fill fill-green" style={{ width: '65%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Satellite Card 2: Calendar / Events (Top-Right) */}
        <div
          className="satellite-card satellite-calendar"
          style={{
            transform: reducedMotion
              ? 'none'
              : `translate3d(${tilt.y * -1.5}px, ${tilt.x * -1.8}px, 40px)`,
          }}
          aria-hidden="true"
        >
          <div className="satellite-header">
            <div className="satellite-icon-badge badge-yellow">
              <CalendarIcon size={16} />
            </div>
            <div className="satellite-title-group">
              <span className="satellite-title">Chapter Calendar</span>
              <span className="satellite-pill">Synchronized</span>
            </div>
          </div>
          <div className="satellite-body-calendar">
            <div className="event-pill-item">
              <div className="event-date-chip">
                <span className="date-month">OCT</span>
                <span className="date-day">24</span>
              </div>
              <div className="event-details">
                <span className="event-name">Community Tech Sprint</span>
                <span className="event-status-tag">Upcoming Chapter Session</span>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Satellite Card 3: Domains & Sub-teams (Bottom-Left) */}
        <div
          className="satellite-card satellite-domains"
          style={{
            transform: reducedMotion
              ? 'none'
              : `translate3d(${tilt.y * -1.2}px, ${tilt.x * -1.4}px, 35px)`,
          }}
          aria-hidden="true"
        >
          <div className="satellite-header">
            <div className="satellite-icon-badge badge-green">
              <Layers size={16} />
            </div>
            <div className="satellite-title-group">
              <span className="satellite-title">Specialized Domains</span>
              <span className="satellite-pill">8 Core Tracks</span>
            </div>
          </div>
          <div className="satellite-body-domains">
            <div className="domain-chips-cluster">
              <span className="domain-chip chip-tech">Technical</span>
              <span className="domain-chip chip-creative">Creative</span>
              <span className="domain-chip chip-outreach">PR & Outreach</span>
              <span className="domain-chip chip-ops">Operations</span>
            </div>
          </div>
        </div>

        {/* Floating Satellite Card 4: Chapter Community (Bottom-Right) */}
        <div
          className="satellite-card satellite-members"
          style={{
            transform: reducedMotion
              ? 'none'
              : `translate3d(${tilt.y * -1.4}px, ${tilt.x * -1.2}px, 38px)`,
          }}
          aria-hidden="true"
        >
          <div className="satellite-header">
            <div className="satellite-icon-badge badge-red">
              <Users size={16} />
            </div>
            <div className="satellite-title-group">
              <span className="satellite-title">Chapter Community</span>
              <span className="satellite-pill">Role Directory</span>
            </div>
          </div>
          <div className="satellite-body-members">
            <div className="member-role-tags">
              <div className="role-tag-item">
                <ShieldCheck size={13} className="role-icon-admin" />
                <span>Club Administrators</span>
              </div>
              <div className="role-tag-item">
                <Sparkles size={13} className="role-icon-leads" />
                <span>Domain Leads & Members</span>
              </div>
            </div>
          </div>
        </div>

        {/* ===============================================================
            CENTRAL 3D WORKSPACE HUB
            =============================================================== */}
        <div
          className="landing-center-hub"
          style={{
            transform: reducedMotion
              ? 'none'
              : `translate3d(${tilt.y * 1.5}px, ${tilt.x * 1.5}px, 60px)`,
          }}
        >
          {/* Subtle Ambient Glow Behind Main Card */}
          <div className="hub-ambient-glow" aria-hidden="true" />

          {/* Central Glass Platform */}
          <div className="hub-card">
            {/* Top Brand Emblem & Institution */}
            <div className="hub-brand-section">
              <div className="hub-logo-container">
                <img
                  src={grietLogo}
                  alt="GRIET logo"
                  className="hub-griet-logo"
                  loading="eager"
                />
              </div>
              <div className="hub-kicker-badge">
                <span className="kicker-dot" />
                <span className="kicker-text">GDG ON CAMPUS • GRIET</span>
              </div>
            </div>

            {/* Typography Hierarchy */}
            <div className="hub-title-section">
              <h1 className="hub-main-title">ChapterHub</h1>
              <p className="hub-tagline">
                Plan together. Build together. Get it done.
              </p>
            </div>

            {/* Error Banner if Auth or Network Fails */}
            {authError && (
              <div className="hub-error-banner" role="alert">
                <AlertCircle size={16} className="error-icon" />
                <span>{authError}</span>
              </div>
            )}

            {/* Primary Action Section */}
            <div className="hub-action-section">
              <button
                type="button"
                onClick={onSignIn}
                disabled={isSigningIn}
                className="hub-google-btn"
                aria-label="Continue with Google authentication"
                style={{ opacity: isSigningIn ? 0.85 : 1 }}
              >
                {isSigningIn ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span className="google-btn-text">Connecting with Google...</span>
                  </>
                ) : (
                  <>
                    {/* Official Google 'G' Vector */}
                    <svg
                      className="google-btn-icon"
                      viewBox="0 0 24 24"
                      width="20"
                      height="20"
                      aria-hidden="true"
                    >
                      <path
                        fill="#4285F4"
                        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.14z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.16 0 10.01 0 12s.45 3.84 1.25 5.42l4.03-3.15z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                      />
                    </svg>
                    <span className="google-btn-text">Continue with Google</span>
                  </>
                )}
              </button>
            </div>

            {/* Hub Subtle Metadata / Security Note */}
            <div className="hub-footer-meta">
              <div className="hub-meta-pill">
                <span className="meta-dot" />
                <span>Internal Student Community Workspace</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
