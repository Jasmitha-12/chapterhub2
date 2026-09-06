import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  accentColor?: string; // Google color accent
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  accentColor = '#4285F4',
}) => {
  return (
    <div className="empty-state-container">
      <div
        className="empty-state-icon-wrapper"
        style={{ borderColor: `${accentColor}33`, background: `${accentColor}0a` }}
      >
        {Icon ? (
          <Icon size={24} style={{ color: accentColor }} />
        ) : (
          <div className="empty-state-dots">
            <span className="dot dot-blue" />
            <span className="dot dot-red" />
            <span className="dot dot-yellow" />
            <span className="dot dot-green" />
          </div>
        )}
      </div>

      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-description">{description}</p>

      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="empty-state-action-btn"
          style={{ borderColor: `${accentColor}55` }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
