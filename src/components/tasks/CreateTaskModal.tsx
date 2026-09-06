import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useData } from '../../context/DataContext';
import { DOMAINS, getDomainById } from '../../data/domains';
import type { DomainId, TaskPriority, TaskStatus } from '../../types';
import { AlertCircle, UserPlus, Loader2 } from 'lucide-react';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultDomainId?: DomainId;
  onOpenAddMember?: () => void;
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  isOpen,
  onClose,
  defaultDomainId = 'tech_team',
  onOpenAddMember,
}) => {
  const { members, createTask } = useData();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [domainId, setDomainId] = useState<DomainId>(defaultDomainId);
  const [subTrack, setSubTrack] = useState<string>('');
  const [assignedTo, setAssignedTo] = useState<string>('');
  const [priority, setPriority] = useState<TaskPriority>('MEDIUM');
  const [status, setStatus] = useState<TaskStatus>('NOT_STARTED');
  const [deadline, setDeadline] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedDomain = getDomainById(domainId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a task title');
      return;
    }
    if (!deadline) {
      setError('Please select a deadline');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');

      await createTask({
        title: title.trim(),
        description: description.trim(),
        domainId,
        subTrack: selectedDomain?.subTracks && subTrack ? subTrack : undefined,
        assignedTo: assignedTo || undefined,
        priority,
        status,
        deadline,
      });

      // Reset form
      setTitle('');
      setDescription('');
      setAssignedTo('');
      setPriority('MEDIUM');
      setStatus('NOT_STARTED');
      setError('');
      onClose();
    } catch (err: any) {
      console.error('[ChapterHub] Task creation error:', err);
      setError(err.message || 'Failed to create task in Firestore.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Chapter Task"
      subtitle="Define what needs to get done for GDGOC GRIET"
      maxWidth="580px"
    >
      <form onSubmit={handleSubmit} className="form-stack">
        {error && (
          <div className="form-error-banner">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <div className="form-group">
          <label htmlFor="task-title" className="form-label">
            Task Title <span className="required-star">*</span>
          </label>
          <input
            id="task-title"
            type="text"
            className="form-input"
            placeholder="e.g. Build DevFest 2026 landing page"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setError('');
            }}
            autoFocus
            disabled={isSubmitting}
          />
        </div>

        <div className="form-group">
          <label htmlFor="task-desc" className="form-label">
            Description
          </label>
          <textarea
            id="task-desc"
            className="form-textarea"
            rows={3}
            placeholder="Key deliverables, requirements, or links..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isSubmitting}
          />
        </div>

        <div className="form-row">
          <div className="form-group" style={{ flex: 1 }}>
            <label htmlFor="task-domain" className="form-label">
              Domain <span className="required-star">*</span>
            </label>
            <select
              id="task-domain"
              className="form-select"
              value={domainId}
              disabled={isSubmitting}
              onChange={(e) => {
                const newDomainId = e.target.value as DomainId;
                setDomainId(newDomainId);
                const d = getDomainById(newDomainId);
                if (d?.subTracks && d.subTracks.length > 0) {
                  setSubTrack(d.subTracks[0]);
                } else {
                  setSubTrack('');
                }
              }}
            >
              {DOMAINS.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          {selectedDomain?.subTracks && selectedDomain.subTracks.length > 0 && (
            <div className="form-group" style={{ flex: 1 }}>
              <label htmlFor="task-subtrack" className="form-label">
                Track
              </label>
              <select
                id="task-subtrack"
                className="form-select"
                value={subTrack}
                disabled={isSubmitting}
                onChange={(e) => setSubTrack(e.target.value)}
              >
                {selectedDomain.subTracks.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Assign To Member Selection */}
        <div className="form-group">
          <div className="form-label-row">
            <label htmlFor="task-assign" className="form-label">
              Assign To
            </label>
            {members.length === 0 && onOpenAddMember && (
              <button
                type="button"
                className="text-link-btn"
                onClick={() => {
                  onClose();
                  onOpenAddMember();
                }}
              >
                <UserPlus size={13} />
                <span>+ Invite Members First</span>
              </button>
            )}
          </div>

          {members.length === 0 ? (
            <div className="empty-member-select-hint">
              <span className="muted-text">No members available yet.</span>
              <span className="hint-subtext">
                (Anyone in the club can see and take responsibility once added)
              </span>
            </div>
          ) : (
            <select
              id="task-assign"
              className="form-select"
              value={assignedTo}
              disabled={isSubmitting}
              onChange={(e) => setAssignedTo(e.target.value)}
            >
              <option value="">Unassigned (Open for pickup)</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.role} • {getDomainById(m.domainId)?.name || 'General'})
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="form-row">
          <div className="form-group" style={{ flex: 1 }}>
            <label htmlFor="task-priority" className="form-label">
              Priority
            </label>
            <select
              id="task-priority"
              className="form-select"
              value={priority}
              disabled={isSubmitting}
              onChange={(e) => setPriority(e.target.value as TaskPriority)}
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent (Red)</option>
            </select>
          </div>

          <div className="form-group" style={{ flex: 1 }}>
            <label htmlFor="task-status" className="form-label">
              Initial Status
            </label>
            <select
              id="task-status"
              className="form-select"
              value={status}
              disabled={isSubmitting}
              onChange={(e) => setStatus(e.target.value as TaskStatus)}
            >
              <option value="NOT_STARTED">Not Started</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>

          <div className="form-group" style={{ flex: 1 }}>
            <label htmlFor="task-deadline" className="form-label">
              Deadline <span className="required-star">*</span>
            </label>
            <input
              id="task-deadline"
              type="date"
              className="form-input"
              value={deadline}
              disabled={isSubmitting}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </div>
        </div>

        <div className="modal-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                <span>Creating...</span>
              </>
            ) : (
              <span>Create Task</span>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};
