import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useData } from '../../context/DataContext';
import { DOMAINS, getDomainById } from '../../data/domains';
import type { Task, DomainId, TaskPriority, TaskStatus } from '../../types';
import { AlertCircle } from 'lucide-react';

interface EditTaskModalProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
}

export const EditTaskModal: React.FC<EditTaskModalProps> = ({
  task,
  isOpen,
  onClose,
}) => {
  const { members, updateTask } = useData();

  const [title, setTitle] = useState(task.title || '');
  const [description, setDescription] = useState(task.description || '');
  const [domainId, setDomainId] = useState<DomainId>(task.domainId || 'tech_team');
  const [subTrack, setSubTrack] = useState<string>(task.subTrack || '');
  const [assignedTo, setAssignedTo] = useState<string>(task.assignedTo || '');
  const [priority, setPriority] = useState<TaskPriority>(task.priority || 'MEDIUM');
  const [status, setStatus] = useState<TaskStatus>(task.status || 'NOT_STARTED');
  const [deadline, setDeadline] = useState(task.deadline || '');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Synchronize state whenever a task is loaded or opened
  React.useEffect(() => {
    setTitle(task.title || '');
    setDescription(task.description || '');
    setDomainId(task.domainId || 'tech_team');
    setSubTrack(task.subTrack || '');
    setAssignedTo(task.assignedTo || '');
    setPriority(task.priority || 'MEDIUM');
    setStatus(task.status || 'NOT_STARTED');
    setDeadline(task.deadline || '');
    setError('');
  }, [task.id]);

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
      setIsSaving(true);
      setError('');
      const res = await updateTask(task.id, {
        title: title.trim(),
        description: description.trim(),
        domainId,
        subTrack: selectedDomain?.subTracks && subTrack ? subTrack : null,
        assignedTo: assignedTo ? assignedTo : null,
        priority,
        status,
        deadline,
      });

      if (res.success) {
        onClose();
      } else if (res.message) {
        setError(res.message);
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Chapter Task"
      subtitle="Update deliverable details, domain or assignment"
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
          <label htmlFor="edit-task-title" className="form-label">
            Task Title <span className="required-star">*</span>
          </label>
          <input
            id="edit-task-title"
            type="text"
            className="form-input"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setError('');
            }}
            autoFocus
          />
        </div>

        <div className="form-group">
          <label htmlFor="edit-task-desc" className="form-label">
            Description
          </label>
          <textarea
            id="edit-task-desc"
            className="form-textarea"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="form-row">
          <div className="form-group" style={{ flex: 1 }}>
            <label htmlFor="edit-task-domain" className="form-label">
              Domain <span className="required-star">*</span>
            </label>
            <select
              id="edit-task-domain"
              className="form-select"
              value={domainId}
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
              <label htmlFor="edit-task-subtrack" className="form-label">
                {selectedDomain?.name ? `${selectedDomain.name} Sub-team` : 'Sub-team / Track'}
              </label>
              <select
                id="edit-task-subtrack"
                className="form-select"
                value={subTrack}
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
          <label htmlFor="edit-task-assign" className="form-label">
            Assign To
          </label>
          <select
            id="edit-task-assign"
            className="form-select"
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
          >
            <option value="">Unassigned (Open for pickup)</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.role} • {getDomainById(m.domainId)?.name || 'General'})
              </option>
            ))}
          </select>
        </div>

        <div className="form-row">
          <div className="form-group" style={{ flex: 1 }}>
            <label htmlFor="edit-task-priority" className="form-label">
              Priority
            </label>
            <select
              id="edit-task-priority"
              className="form-select"
              value={priority}
              onChange={(e) => setPriority(e.target.value as TaskPriority)}
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent (Red)</option>
            </select>
          </div>

          <div className="form-group" style={{ flex: 1 }}>
            <label htmlFor="edit-task-status" className="form-label">
              Status
            </label>
            <select
              id="edit-task-status"
              className="form-select"
              value={status}
              onChange={(e) => setStatus(e.target.value as TaskStatus)}
            >
              <option value="NOT_STARTED">Not Started</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>

          <div className="form-group" style={{ flex: 1 }}>
            <label htmlFor="edit-task-deadline" className="form-label">
              Deadline <span className="required-star">*</span>
            </label>
            <input
              id="edit-task-deadline"
              type="date"
              className="form-input"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </div>
        </div>

        <div className="modal-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={isSaving}
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
