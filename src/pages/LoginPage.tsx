import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AtmosphericCanvas } from '../components/background/AtmosphericCanvas';
import { BrandMark } from '../components/common/BrandMark';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, AlertCircle, Loader2 } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { user, loading, authError, signInWithGoogle, clearAuthError } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [isSigningIn, setIsSigningIn] = useState(false);

  // If already authenticated with real Firebase user, navigate to /dashboard
  React.useEffect(() => {
    if (user && !loading) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, loading, navigate]);

  const handleGoogleSignIn = async () => {
    try {
      setIsSigningIn(true);
      clearAuthError();
      const success = await signInWithGoogle();
      if (success) {
        navigate('/dashboard', { replace: true });
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <div className="login-page-root">
      {/* 3D Atmospheric Background */}
      <AtmosphericCanvas />
      <div className="atmospheric-overlay" aria-hidden="true" />

      {/* Top Bar for Theme Toggle */}
      <header className="login-top-bar">
        <div className="login-club-tag">
          <span className="dot dot-blue" />
          <span>Internal Workspace</span>
        </div>
        <button
          type="button"
          onClick={toggleTheme}
          className="login-theme-btn"
          aria-label="Toggle theme"
        >
          {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
        </button>
      </header>

      {/* Login Card */}
      <main className="login-card-wrapper">
        <div className="login-card">
          <div className="login-brand-area">
            <BrandMark size="lg" showSubtitle={true} />
          </div>

          <div className="login-headings">
            <h1 className="login-heading">Welcome back.</h1>
            <p className="login-tagline">
              Plan together. Build together. Get it done.
            </p>
          </div>

          {/* Error Banner if Auth or Config fails */}
          {authError && (
            <div
              className="form-error-banner"
              style={{
                textAlign: 'left',
                margin: '0 auto',
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{authError}</span>
            </div>
          )}

          <div className="login-action-section">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isSigningIn}
              className="google-sign-in-btn"
              style={{ opacity: isSigningIn ? 0.8 : 1 }}
            >
              {isSigningIn ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span className="btn-label">Signing in...</span>
                </>
              ) : (
                <>
                  {/* Google 'G' official colored vector */}
                  <svg className="google-icon" viewBox="0 0 24 24" width="20" height="20">
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
                  <span className="btn-label">Continue with Google</span>
                </>
              )}
            </button>
          </div>

          <div className="login-footer-info">
            <p className="login-note">
              GDG on Campus GRIET • Internal Student Community Workspace
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};
