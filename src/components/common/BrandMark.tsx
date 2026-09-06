import React from 'react';

interface BrandMarkProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
}

export const BrandMark: React.FC<BrandMarkProps> = ({
  size = 'md',
  showSubtitle = true,
}) => {
  const iconDimensions = {
    sm: { w: 26, h: 16 },
    md: { w: 32, h: 20 },
    lg: { w: 42, h: 26 },
  }[size];

  return (
    <div className={`brand-mark brand-mark-${size}`}>
      {/* Official GDG Brackets Mark */}
      <svg
        width={iconDimensions.w}
        height={iconDimensions.h}
        viewBox="0 0 38 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="brand-icon"
        aria-label="GDG on Campus mark"
      >
        {/* Left angle bracket < in Google Blue and Red */}
        <path
          d="M12.5 3.5L4 12L12.5 20.5"
          stroke="#4285F4"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Right angle bracket > in Google Green and Yellow */}
        <path
          d="M25.5 3.5L34 12L25.5 20.5"
          stroke="#34A853"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Center dot / accent */}
        <circle cx="19" cy="12" r="2.2" fill="#FBBC05" />
      </svg>

      <div className="brand-text">
        <div className="brand-row">
          <span className="brand-title">ChapterHub</span>
        </div>
        {showSubtitle && (
          <span className="brand-badge">GDG on Campus GRIET</span>
        )}
      </div>
    </div>
  );
};
