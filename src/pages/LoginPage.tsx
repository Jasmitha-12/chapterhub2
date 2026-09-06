import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LandingAtmosphere } from '../components/landing/LandingAtmosphere';
import { LandingHero } from '../components/landing/LandingHero';
import { BrandMark } from '../components/common/BrandMark';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { user, loading, authError, signInWithGoogle, clearAuthError } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [isSigningIn, setIsSigningIn] = useState(false);

  // If already authenticated with real Firebase user, navigate to /dashboard
  useEffect(() => {
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
    <div className="landing-page-root">
      {/* Dynamic 3D Atmospheric Moving Bubble Background */}
      <LandingAtmosphere />

      {/* Top Navigation Bar */}
      <header className="landing-top-nav">
        <div className="landing-nav-container">
          <div className="landing-nav-brand">
            <BrandMark size="sm" showSubtitle={true} />
          </div>

          <div className="landing-nav-actions">
            <div className="landing-status-badge">
              <span className="landing-status-dot" />
              <span>Workspace Active</span>
            </div>

            <button
              type="button"
              onClick={toggleTheme}
              className="landing-theme-toggle-btn"
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
              <span className="theme-toggle-label">
                {theme === 'light' ? 'Dark' : 'Light'}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Main 3D Hero Workspace Experience */}
      <main className="landing-main-content">
        <LandingHero
          onSignIn={handleGoogleSignIn}
          isSigningIn={isSigningIn}
          authError={authError}
        />
      </main>

      {/* Editorial Footer */}
      <footer className="landing-footer">
        <div className="landing-footer-container">
          <p className="landing-footer-institution">
            GRIET • Gokaraju Rangaraju Institute of Engineering and Technology
          </p>
          <p className="landing-footer-copyright">
            GDG on Campus ChapterHub • Plan together. Build together. Get it done.
          </p>
        </div>
      </footer>
    </div>
  );
};
