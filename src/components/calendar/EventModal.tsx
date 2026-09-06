import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { useData } from '../../context/DataContext';
import { DOMAINS } from '../../data/domains';
import type { CalendarEvent, EventType, DomainId } from '../../types';
import { AlertCircle } from 'lucide-react';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event?: CalendarEvent | null; // If provided, edit mode; otherwise create mode
  initialDate?: string;
}

const EVENT_TYPES: { value: EventType; label: string }[] = [
  { value: 'GENERAL', label: 'General Event' },
  { value: 'WORKSHOP', label: 'Technical Workshop' },
  { value: 'MEETING', label: 'Team / Core Meeting' },
  { value: 'HACKATHON', label: 'Hackathon / Sprint' },
  { value: 'INFO_SESSION', label: 'Info Session' },
];

export const EventModal: React.FC<EventModalProps> = ({
  isOpen,
  onClose,
  event,
  initialDate,
}) => {
  const { createEvent, updateEvent } = useData();

  const isEdit = !!event;

  const [title, setTitle] = useState(event?.title || '');
  const [description, setDescription] = useState(event?.description || '');
  const [date, setDate] = useState(
    event?.date || initialDate || new Date().toISOString().split('T')[0]
  );
  const [startTime, setStartTime] = useState(event?.startTime || '');
  const [endTime, setEndTime] = useState(event?.endTime || '');
  const [type, setType] = useState<EventType>(event?.type || 'GENERAL');
  const [domainId, setDomainId] = useState<string>(event?.domainId || '');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (event) {
      setTitle(event.title || '');
      setDescription(event.description || '');
      setDate(event.date || initialDate || '');
      setStartTime(event.startTime || '');
      setEndTime(event.endTime || '');
      setType(event.type || 'GENERAL');
      setDomainId(event.domainId || '');
    } else {
      setTitle('');
      setDescription('');
      setDate(initialDate || new Date().toISOString().split('T')[0]);
      setStartTime('');
      setEndTime('');
      setType('GENERAL');
      setDomainId('');
    }
    setError('');
  }, [event, initialDate, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide an event title');
      return;
    }
    if (!date) {
      setError('Please select an event date');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');

      if (isEdit && event) {
        const res = await updateEvent(event.id, {
          title: title.trim(),
          description: description.trim(),
          date,
          startTime: startTime || null,
          endTime: endTime || null,
          type,
          domainId: domainId ? (domainId as DomainId) : null,
        });

        if (res.success) {
          onClose();
        } else if (res.message) {
          setError(res.message);
        }
      } else {
        const res = await createEvent({
          title: title.trim(),
          description: description.trim(),
          date,
          startTime: startTime || null,
          endTime: endTime || null,
          type,
          domainId: domainId ? (domainId as DomainId) : null,
        });

        if (res.success) {
          onClose();
        } else if (res.message) {
          setError(res.message);
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Chapter Event' : 'Schedule Chapter Event'}
      subtitle={
        isEdit
          ? 'Update event details, timing, or domain focus'
          : 'Plan an upcoming milestone, session, or meeting for GDGOC GRIET'
      }
      maxWidth="560px"
    >
      <form onSubmit={handleSubmit} className="form-stack">
        {error && (
          <div className="form-error-banner">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <div className="form-group">
          <label htmlFor="event-title" className="form-label">
            Event Title <span className="required-star">*</span>
          </label>
          <input
            id="event-title"
            type="text"
            className="form-input"
            placeholder="e.g. Android Study Jam Kickoff"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setError('');
            }}
            autoFocus
            disabled={isSubmitting}
          />
        </div>

        <div className="form-row">
          <div className="form-group" style={{ flex: 1 }}>
            <label htmlFor="event-type" className="form-label">
              Event Type <span className="required-star">*</span>
            </label>
            <select
              id="event-type"
              className="form-select"
              value={type}
              onChange={(e) => setType(e.target.value as EventType)}
              disabled={isSubmitting}
            >
              {EVENT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ flex: 1 }}>
            <label htmlFor="event-domain" className="form-label">
              Domain (Optional)
            </label>
            <select
              id="event-domain"
              className="form-select"
              value={domainId}
              onChange={(e) => setDomainId(e.target.value)}
              disabled={isSubmitting}
            >
              <option value="">All Chapter / General</option>
              {DOMAINS.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group" style={{ flex: 1.2 }}>
            <label htmlFor="event-date" className="form-label">
              Date <span className="required-star">*</span>
            </label>
            <input
              id="event-date"
              type="date"
              className="form-input"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="form-group" style={{ flex: 1 }}>
            <label htmlFor="event-start-time" className="form-label">
              Start Time
            </label>
            <input
              id="event-start-time"
              type="time"
              className="form-input"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="form-group" style={{ flex: 1 }}>
            <label htmlFor="event-end-time" className="form-label">
              End Time
            </label>
            <input
              id="event-end-time"
              type="time"
              className="form-input"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="event-desc" className="form-label">
            Description / Agenda
          </label>
          <textarea
            id="event-desc"
            className="form-textarea"
            rows={3}
            placeholder="Key topics, speaker, venue, or joining link..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isSubmitting}
          />
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
            {isSubmitting
              ? isEdit
                ? 'Updating...'
                : 'Scheduling...'
              : isEdit
              ? 'Update Event'
              : 'Schedule Event'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
