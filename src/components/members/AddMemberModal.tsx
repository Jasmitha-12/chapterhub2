import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useData } from '../../context/DataContext';
import { DOMAINS } from '../../data/domains';
import type { DomainId } from '../../types';

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultDomainId?: DomainId;
}

export const AddMemberModal: React.FC<AddMemberModalProps> = ({
  isOpen,
  onClose,
  defaultDomainId = 'tech_team',
}) => {
  const { addMember } = useData();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [domainId, setDomainId] = useState<DomainId>(defaultDomainId);
  const [role, setRole] = useState('Core Team Member');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter the member name');
      return;
    }
    if (!email.trim()) {
      setError('Please enter an email address');
      return;
    }

    addMember({
      name: name.trim(),
      email: email.trim(),
      domainId,
      role: role.trim(),
    });

    // Reset
    setName('');
    setEmail('');
    setRole('Core Team Member');
    setError('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Chapter Member"
      subtitle="Register a member into the chapter workspace"
    >
      <form onSubmit={handleSubmit} className="form-stack">
        {error && <div className="form-error-banner">{error}</div>}

        <div className="form-group">
          <label htmlFor="member-name" className="form-label">
            Full Name <span className="required-star">*</span>
          </label>
          <input
            id="member-name"
            type="text"
            className="form-input"
            placeholder="e.g. Aadhya Reddy"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError('');
            }}
            autoFocus
          />
        </div>

        <div className="form-group">
          <label htmlFor="member-email" className="form-label">
            College / Club Email <span className="required-star">*</span>
          </label>
          <input
            id="member-email"
            type="email"
            className="form-input"
            placeholder="e.g. aadhya@grietcollege.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError('');
            }}
          />
        </div>

        <div className="form-row">
          <div className="form-group" style={{ flex: 1 }}>
            <label htmlFor="member-domain" className="form-label">
              Domain
            </label>
            <select
              id="member-domain"
              className="form-select"
              value={domainId}
              onChange={(e) => setDomainId(e.target.value as DomainId)}
            >
              {DOMAINS.map((domain) => (
                <option key={domain.id} value={domain.id}>
                  {domain.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ flex: 1 }}>
            <label htmlFor="member-role" className="form-label">
              Role
            </label>
            <input
              id="member-role"
              type="text"
              className="form-input"
              placeholder="e.g. Domain Lead, Core Member"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            />
          </div>
        </div>

        <div className="modal-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            Add to Chapter
          </button>
        </div>
      </form>
    </Modal>
  );
};
