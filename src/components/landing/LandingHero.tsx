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
  ArrowRight,
  ArrowLeft,
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
  const [isLoginMode, setIsLoginMode] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const googleBtnRef = useRef<HTMLButtonElement>(null);

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

  // Keyboard accessibility: Escape key collapses login card back to landing state
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isLoginMode) {
        setIsLoginMode(false);
        setTimeout(() => {
          cardRef.current?.focus();
        }, 100);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLoginMode]);

  // When expanding into login mode, gently set focus to the Google button for seamless accessibility
  useEffect(() => {
    if (isLoginMode) {
      const timer = setTimeout(() => {
        googleBtnRef.current?.focus();
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [isLoginMode]);

  const handleCardClick = () => {
    if (!isLoginMode) {
      setIsLoginMode(true);
    }
  };

  const handleCardKeyDown = (e: React.KeyboardEvent) => {
    if (!isLoginMode && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      setIsLoginMode(true);
    }
  };

  const handleCollapseToLanding = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLoginMode(false);
    setTimeout(() => {
      cardRef.current?.focus();
    }, 100);
  };

  return (
    <section className="landing-hero-section" ref={heroRef}>
      {/* 3D Perspective Viewport */}
      <div
        className={`landing-3d-viewport ${isLoginMode ? 'landing-3d-viewport--login' : ''}`}
        style={{
          transform: reducedMotion
            ? 'none'
            : `perspective(1200px) rotateX(${tilt.x * (isLoginMode ? 0.4 : 1)}deg) rotateY(${tilt.y * (isLoginMode ? 0.4 : 1)}deg)`,
          /* Flatten 3D stacking context in login mode to prevent GPU compositing
             from creating phantom hit-test layers that block child button events */
          transformStyle: isLoginMode ? 'flat' : undefined,
        }}
      >
        {/* Floating Satellite Card 1: Tasks / Deliverables (Top-Left) */}
        <div
          className={`satellite-card satellite-tasks ${isLoginMode ? 'satellite-card--retracted' : ''}`}
          style={{
            transform: reducedMotion
              ? 'none'
              : `translate3d(${tilt.y * -1.8}px, ${tilt.x * -1.5}px, 45px)`,
          }}
          aria-hidden={isLoginMode ? 'true' : undefined}
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
          className={`satellite-card satellite-calendar ${isLoginMode ? 'satellite-card--retracted' : ''}`}
          style={{
            transform: reducedMotion
              ? 'none'
              : `translate3d(${tilt.y * -1.5}px, ${tilt.x * -1.8}px, 40px)`,
          }}
          aria-hidden={isLoginMode ? 'true' : undefined}
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
          className={`satellite-card satellite-domains ${isLoginMode ? 'satellite-card--retracted' : ''}`}
          style={{
            transform: reducedMotion
              ? 'none'
              : `translate3d(${tilt.y * -1.2}px, ${tilt.x * -1.4}px, 35px)`,
          }}
          aria-hidden={isLoginMode ? 'true' : undefined}
        >
          <div className="satellite-header">
            <div className="satellite-icon-badge badge-green">
              <Layers size={16} />
            </div>
            <div className="satellite-title-group">
              <span className="satellite-title">Specialized Domains</span>
              <span className="satellite-pill">9 Domains</span>
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
          className={`satellite-card satellite-members ${isLoginMode ? 'satellite-card--retracted' : ''}`}
          style={{
            transform: reducedMotion
              ? 'none'
              : `translate3d(${tilt.y * -1.4}px, ${tilt.x * -1.2}px, 38px)`,
          }}
          aria-hidden={isLoginMode ? 'true' : undefined}
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
          className={`landing-center-hub ${isLoginMode ? 'landing-center-hub--login' : ''}`}
          style={{
            /* In login mode: drop Z-axis and flatten 3D context.
               The preserve-3d + translate3d(z) combo creates a GPU-composited
               layer that fails pointer hit-testing in production builds. */
            transform: reducedMotion
              ? 'none'
              : isLoginMode
                ? `translate(${tilt.y * 0.7}px, ${tilt.x * 0.7}px)` /* 2D only — no Z */
                : `translate3d(${tilt.y * 1.5}px, ${tilt.x * 1.5}px, 60px)`,
            transformStyle: isLoginMode ? 'flat' : undefined,
          }}
        >
          {/* Subtle Ambient Glow Behind Main Card */}
          <div
            className={`hub-ambient-glow ${isLoginMode ? 'hub-ambient-glow--login' : ''}`}
            aria-hidden="true"
          />

          {/* Central Glass Platform */}
          <div
            ref={cardRef}
            tabIndex={!isLoginMode ? 0 : -1}
            role={!isLoginMode ? 'button' : 'region'}
            aria-label={!isLoginMode ? 'Enter ChapterHub workspace sign in' : 'ChapterHub sign in dialog'}
            aria-expanded={isLoginMode}
            onClick={!isLoginMode ? handleCardClick : undefined}
            onKeyDown={!isLoginMode ? handleCardKeyDown : undefined}
            className={`hub-card ${!isLoginMode ? 'hub-card--landing' : 'hub-card--login-active'}`}
          >
            {/* Back Button inside expanded login card */}
            {isLoginMode && (
              <div className="hub-login-top-bar">
                <button
                  type="button"
                  onClick={handleCollapseToLanding}
                  className="hub-back-btn"
                  aria-label="Back to overview"
                  title="Back to landing overview (Esc)"
                >
                  <ArrowLeft size={15} />
                  <span>Back</span>
                </button>
                <span className="hub-login-mode-tag">Member Access</span>
              </div>
            )}

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
                {isLoginMode
                  ? 'Sign in to access your chapter dashboard and workflows'
                  : 'Plan together. Build together. Get it done.'}
              </p>
            </div>

            {/* -------------------------------------------------------------
                LANDING STATE: Elegant interactive prompt (No Google button)
                ------------------------------------------------------------- */}
            {!isLoginMode && (
              <div className="hub-landing-action-prompt">
                <div className="hub-enter-action-pill">
                  <span className="enter-action-text">Enter Workspace</span>
                  <div className="enter-action-arrow-bubble">
                    <ArrowRight size={14} className="enter-arrow-icon" />
                  </div>
                </div>
                <p className="hub-action-subprompt">
                  Click card or press <kbd className="hub-kbd">Enter</kbd> to sign in
                </p>
              </div>
            )}

            {/* -------------------------------------------------------------
                LOGIN STATE: Google Auth, Error Banner & Sign In Controls
                ------------------------------------------------------------- */}
            {isLoginMode && (
              <div className="hub-login-reveal-container">
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
                    ref={googleBtnRef}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSignIn();
                    }}
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
              </div>
            )}

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
