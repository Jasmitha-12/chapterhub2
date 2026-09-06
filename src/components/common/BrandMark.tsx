import React from 'react';
import grietLogo from '../../assets/griet-logo.png';

interface BrandMarkProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  showTagline?: boolean;
  className?: string;
}

export const BrandMark: React.FC<BrandMarkProps> = ({
  size = 'md',
  showSubtitle = true,
  showTagline = false,
  className = '',
}) => {
  return (
    <div className={`brand-mark brand-mark-${size} ${className}`}>
      <div className="brand-logo-container">
        <img
          src={grietLogo}
          alt="GRIET logo"
          className="brand-griet-logo"
          loading="eager"
        />
      </div>

      <div className="brand-text">
        <span className="brand-institution">GRIET</span>
        <span className="brand-title">ChapterHub</span>
        {showTagline && (
          <span className="brand-tagline">
            Plan together. Build together. Get it done.
          </span>
        )}
        {showSubtitle && !showTagline && (
          <span className="brand-badge">GDG on Campus</span>
        )}
      </div>
    </div>
  );
};

