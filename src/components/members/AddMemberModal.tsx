import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Copy, Check, Shield, Sparkles } from 'lucide-react';

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultDomainId?: string;
}

export const AddMemberModal: React.FC<AddMemberModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  const inviteUrl = `${window.location.origin}/login`;

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Invite Chapter Member"
      subtitle="Onboard active contributors and domain leads into ChapterHub"
      maxWidth="540px"
    >
      <div className="invite-modal-content" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div
          style={{
            padding: '14px 16px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(66, 133, 244, 0.08)',
            border: '1px solid rgba(66, 133, 244, 0.2)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
          }}
        >
          <Sparkles size={20} style={{ color: 'var(--google-blue)', flexShrink: 0, marginTop: '2px' }} />
          <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '2px' }}>
              Automatic Google Account Onboarding
            </strong>
            Members join ChapterHub simply by signing in with their Google account. Their profile is instantly created in the directory with the default <strong>MEMBER</strong> role.
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" style={{ fontWeight: 600 }}>
            ChapterHub Sign-in Link
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              readOnly
              value={inviteUrl}
              className="form-input"
              style={{
                fontFamily: 'monospace',
                fontSize: '0.85rem',
                background: 'var(--bg-subtle)',
                color: 'var(--text-secondary)',
              }}
            />
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleCopy}
              style={{ whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              {copied ? <Check size={15} style={{ color: 'var(--google-green)' }} /> : <Copy size={15} />}
              <span>{copied ? 'Copied!' : 'Copy Link'}</span>
            </button>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            padding: '14px 16px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.82rem',
            color: 'var(--text-secondary)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, color: 'var(--text-primary)' }}>
            <Shield size={15} style={{ color: 'var(--google-yellow)' }} />
            <span>Admin Management</span>
          </div>
          <ul style={{ margin: 0, paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <li>Once signed in, members appear immediately in the real-time Members directory.</li>
            <li>Admins can assign members to specific domain tracks (Tech Team, Creative, Logistics, etc.).</li>
            <li>Admins can promote trusted leads to <strong>ADMIN</strong> directly from their member card.</li>
          </ul>
        </div>

        <div className="modal-actions" style={{ marginTop: '8px' }}>
          <button type="button" className="btn btn-primary" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </Modal>
  );
};

