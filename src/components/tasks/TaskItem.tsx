import React, { useState } from 'react';
import type { Task, TaskStatus } from '../../types';
import { useData } from '../../context/DataContext';
import { getDomainById } from '../../data/domains';
import { EditTaskModal } from './EditTaskModal';
import {
  Clock,
  CheckCircle2,
  Lock,
  Trash2,
  Edit2,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface TaskItemProps {
  task: Task;
}

export const TaskItem: React.FC<TaskItemProps> = ({ task }) => {
  const {
    members,
    updateTaskStatus,
    deleteTask,
    canEditTaskStatus,
    canEditTaskDetails,
    canDeleteTask,
  } = useData();

  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const domain = getDomainById(task.domainId);
  const assignedMember = members.find((m) => m.id === task.assignedTo);
  const canEdit = canEditTaskStatus(task);
  const canEditDetails = canEditTaskDetails(task);
  const canDelete = canDeleteTask(task);

  // Overdue check
  const isOverdue =
    task.status !== 'COMPLETED' && new Date(task.deadline).getTime() < Date.now();

  const handleStatusChange = async (newStatus: TaskStatus) => {
    if (newStatus === task.status || isUpdating) return;

    try {
      setIsUpdating(true);
      const res = await updateTaskStatus(task.id, newStatus);
      if (res.success) {
        if (newStatus === 'COMPLETED') {
          // Delicate confetti celebration
          try {
            confetti({
              particleCount: 40,
              spread: 55,
              origin: { y: 0.7 },
              colors: ['#4285F4', '#EA4335', '#FBBC05', '#34A853'],
            });
          } catch {
            // ignore
          }
        }
        setStatusMessage(null);
      } else if (res.message) {
        setStatusMessage(res.message);
        setTimeout(() => setStatusMessage(null), 4000);
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (isDeleting) return;
    try {
      setIsDeleting(true);
      const res = await deleteTask(task.id);
      if (!res.success && res.message) {
        setStatusMessage(res.message);
        setTimeout(() => setStatusMessage(null), 4000);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const getPriorityBadge = () => {
    switch (task.priority) {
      case 'URGENT':
        return <span className="priority-badge priority-urgent">Urgent</span>;
      case 'HIGH':
        return <span className="priority-badge priority-high">High</span>;
      case 'MEDIUM':
        return <span className="priority-badge priority-medium">Medium</span>;
      case 'LOW':
        return <span className="priority-badge priority-low">Low</span>;
    }
  };

  const getStatusIndicatorColor = () => {
    if (task.status === 'COMPLETED') return '#34A853'; // Google Green
    if (isOverdue) return '#EA4335'; // Google Red
    if (task.priority === 'URGENT') return '#EA4335';
    if (task.status === 'IN_PROGRESS') return '#FBBC05'; // Google Yellow
    return '#4285F4'; // Google Blue
  };

  return (
    <>
      <div className={`task-row ${task.status === 'COMPLETED' ? 'is-completed' : ''}`}>
        {/* Subtle colored accent strip */}
        <div
          className="task-accent-strip"
          style={{ backgroundColor: getStatusIndicatorColor() }}
        />

        {/* Task Info */}
        <div className="task-col-main">
          <div className="task-title-line">
            <span className="task-title-text">{task.title}</span>
            {task.subTrack && (
              <span className="task-subtrack-tag">{task.subTrack}</span>
            )}
          </div>
          {task.description && (
            <p className="task-desc-text">{task.description}</p>
          )}
        </div>

        {/* Domain */}
        <div className="task-col-domain">
          <span
            className="domain-badge"
            style={{
              borderColor: `${domain?.color || '#4285F4'}40`,
              color: domain?.color || 'inherit',
            }}
          >
            {domain?.name || task.domainId}
          </span>
        </div>

        {/* Assignee */}
        <div className="task-col-assignee">
          {assignedMember ? (
            <div className="assignee-pill" title={assignedMember.email}>
              {assignedMember.photoURL ? (
                <img
                  src={assignedMember.photoURL}
                  alt={assignedMember.name}
                  className="assignee-avatar"
                  style={{ objectFit: 'cover' }}
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div
                  className="assignee-avatar"
                  style={{ backgroundColor: assignedMember.avatarColor }}
                >
                  {assignedMember.name.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="assignee-name">{assignedMember.name}</span>
            </div>
          ) : (
            <span className="unassigned-pill">Unassigned</span>
          )}
        </div>

        {/* Priority */}
        <div className="task-col-priority">{getPriorityBadge()}</div>

        {/* Deadline */}
        <div className="task-col-deadline">
          <div className={`deadline-tag ${isOverdue ? 'deadline-overdue' : ''}`}>
            <Clock size={12} />
            <span>{task.deadline}</span>
          </div>
        </div>

        {/* Status Controls */}
        <div className="task-col-status">
          <div className="status-control-wrapper">
            {canEdit ? (
              <div className="status-btn-group">
                <button
                  type="button"
                  disabled={isUpdating}
                  className={`status-chip ${
                    task.status === 'NOT_STARTED' ? 'active not-started' : ''
                  }`}
                  onClick={() => handleStatusChange('NOT_STARTED')}
                  title="Mark Not Started"
                >
                  Not Started
                </button>
                <button
                  type="button"
                  disabled={isUpdating}
                  className={`status-chip ${
                    task.status === 'IN_PROGRESS' ? 'active in-progress' : ''
                  }`}
                  onClick={() => handleStatusChange('IN_PROGRESS')}
                  title="Mark In Progress"
                >
                  In Progress
                </button>
                <button
                  type="button"
                  disabled={isUpdating}
                  className={`status-chip ${
                    task.status === 'COMPLETED' ? 'active completed' : ''
                  }`}
                  onClick={() => handleStatusChange('COMPLETED')}
                  title="Mark Completed"
                >
                  <CheckCircle2 size={12} />
                  <span>Done</span>
                </button>
              </div>
            ) : (
              <div
                className="status-readonly-badge"
                title={
                  task.assignedTo
                    ? `Assigned to ${assignedMember?.name || 'another member'}. Only they or an Admin can advance this task.`
                    : 'Assign to a member to update status'
                }
              >
                <Lock size={12} className="lock-icon" />
                <span>
                  {task.status === 'NOT_STARTED'
                    ? 'Not Started'
                    : task.status === 'IN_PROGRESS'
                    ? 'In Progress'
                    : 'Completed'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Actions Controls (Dedicated Column) */}
        <div className="task-col-actions">
          <div className="task-actions-group">
            {/* Edit button: visible for ADMIN on every task */}
            {canEditDetails && (
              <button
                type="button"
                className="task-action-btn task-edit-btn"
                onClick={() => setIsEditModalOpen(true)}
                title="Edit task details"
                aria-label={`Edit task ${task.title}`}
              >
                <Edit2 size={14} />
              </button>
            )}

            {/* Delete button: visible for ADMIN on every task */}
            {canDelete && (
              <button
                type="button"
                className="task-action-btn task-delete-btn"
                onClick={handleDelete}
                disabled={isDeleting}
                title="Delete task"
                aria-label={`Delete task ${task.title}`}
              >
                {isDeleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
              </button>
            )}
          </div>
        </div>

        {statusMessage && (
          <div className="task-row-alert">
            <AlertCircle size={13} />
            <span>{statusMessage}</span>
          </div>
        )}
      </div>

      {/* Edit Task Modal */}
      {isEditModalOpen && (
        <EditTaskModal
          task={task}
          isOpen={true}
          onClose={() => setIsEditModalOpen(false)}
        />
      )}
    </>
  );
};
