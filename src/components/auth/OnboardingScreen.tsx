import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BrandMark } from '../common/BrandMark';
import { LandingAtmosphere } from '../landing/LandingAtmosphere';
import { DOMAINS, YEAR_OPTIONS, getDomainSlug } from '../../data/domains';
import { useAuth } from '../../context/AuthContext';
import type { DomainId } from '../../types';
import { AlertCircle, ArrowRight, Loader2, Sparkles, LogOut } from 'lucide-react';

interface OnboardingScreenProps {
  onCompleted?: (domainSlug: string) => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onCompleted }) => {
  const { user, profile, updateProfileDoc, logout } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState(profile?.name || user?.displayName || '');
  const [year, setYear] = useState<string>(profile?.year || '');
  const [domainId, setDomainId] = useState<DomainId | ''>(
    (profile?.domainId as DomainId) ||
      (profile?.domain ? (DOMAINS.find((d) => d.name === profile.domain)?.id as DomainId) : '') ||
      ''
  );
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError('Please enter your name.');
      return;
    }
    if (!year) {
      setError('Please select your college year.');
      return;
    }
    if (!domainId) {
      setError('Please select your chapter domain.');
      return;
    }

    const selectedDomain = DOMAINS.find((d) => d.id === domainId);
    if (!selectedDomain) {
      setError('Invalid domain selected.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');

      await updateProfileDoc({
        name: name.trim(),
        year,
        domain: selectedDomain.name,
        domainId: selectedDomain.id,
      });

      const slug = getDomainSlug(selectedDomain);

      if (onCompleted) {
        onCompleted(slug);
      } else {
        navigate(`/domains/${slug}`, { replace: true });
      }
    } catch (err: any) {
      console.error('[ChapterHub] Onboarding submission error:', err);
      setError(err.message || 'Failed to complete profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="landing-page-root" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* 3D Atmospheric Background */}
      <LandingAtmosphere />

      {/* Top Brand Bar */}
      <header className="landing-top-nav">
        <div className="landing-nav-container">
          <BrandMark size="sm" showSubtitle={true} />
          <button
            type="button"
            onClick={() => logout()}
            className="text-link-btn"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem' }}
          >
            <LogOut size={14} />
            <span>Sign out</span>
          </button>
        </div>
      </header>

      {/* Centered Onboarding Card */}
      <main
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          position: 'relative',
          zIndex: 10,
        }}
      >
        <div
          className="surface-card"
          style={{
            width: '100%',
            maxWidth: '460px',
            padding: '36px',
            borderRadius: 'var(--radius-lg)',
            background: 'var(--bg-surface-elevated)',
            boxShadow: 'var(--shadow-lg)',
            border: '1px solid var(--border-medium)',
          }}
        >
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(66, 133, 244, 0.1)',
                color: 'var(--google-blue)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '14px',
              }}
            >
              <Sparkles size={22} />
            </div>
            <h1
              style={{
                fontSize: '1.45rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                letterSpacing: '-0.02em',
                marginBottom: '6px',
              }}
            >
              Complete your profile
            </h1>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
              Set up your year and chapter domain to access your workspace.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="form-stack" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {error && (
              <div className="form-error-banner">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            {/* Name Input */}
            <div className="form-group">
              <label htmlFor="onboarding-name" className="form-label" style={{ fontWeight: 600 }}>
                Full Name <span className="required-star">*</span>
              </label>
              <input
                id="onboarding-name"
                type="text"
                className="form-input"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError('');
                }}
                placeholder="e.g. Alex Rivera"
                disabled={isSubmitting}
                autoFocus
              />
            </div>

            {/* Year Select */}
            <div className="form-group">
              <label htmlFor="onboarding-year" className="form-label" style={{ fontWeight: 600 }}>
                College Year <span className="required-star">*</span>
              </label>
              <select
                id="onboarding-year"
                className="form-select"
                value={year}
                onChange={(e) => {
                  setYear(e.target.value);
                  setError('');
                }}
                disabled={isSubmitting}
              >
                <option value="">Select your college year</option>
                {YEAR_OPTIONS.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            {/* Domain Select */}
            <div className="form-group">
              <label htmlFor="onboarding-domain" className="form-label" style={{ fontWeight: 600 }}>
                Chapter Domain <span className="required-star">*</span>
              </label>
              <select
                id="onboarding-domain"
                className="form-select"
                value={domainId}
                onChange={(e) => {
                  setDomainId(e.target.value as DomainId);
                  setError('');
                }}
                disabled={isSubmitting}
              >
                <option value="">Select your domain</option>
                {DOMAINS.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Continue Button */}
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: '12px 18px',
                marginTop: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontWeight: 600,
              }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Entering Workspace...</span>
                </>
              ) : (
                <>
                  <span>Continue</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};
