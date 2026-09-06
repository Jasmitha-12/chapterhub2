import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { getDomainById } from '../data/domains';
import { Modal } from '../components/common/Modal';
import { TaskItem } from '../components/tasks/TaskItem';
import { EventModal } from '../components/calendar/EventModal';
import type { Task, CalendarEvent } from '../types';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  CalendarPlus,
  Clock,
  Calendar as CalendarIcon,
  Edit2,
  Trash2,
  ListTodo,
} from 'lucide-react';

interface LayoutContext {
  openCreateTask: () => void;
  openAddMember: () => void;
}

export const CalendarPage: React.FC = () => {
  const { openCreateTask } = useOutletContext<LayoutContext>();
  const { tasks, members, events, isAdmin, deleteEvent } = useData();

  // Current viewed month state
  const [currentDate, setCurrentDate] = useState(new Date());

  // Day details modal
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Event modal state
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [eventModalDate, setEventModalDate] = useState<string | undefined>(undefined);
  const [deletingEventId, setDeletingEventId] = useState<string | null>(null);

  // Popover state
  const [hoveredDate, setHoveredDate] = useState<{
    dateStr: string;
    tasks: Task[];
    events: CalendarEvent[];
    x: number;
    y: number;
  } | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const goToPrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Calculate calendar grid days
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const calendarDays = [];

  // Previous month trailing days
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    const dayNum = daysInPrevMonth - i;
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    const dateStr = `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    calendarDays.push({
      dayNum,
      isCurrentMonth: false,
      dateStr,
    });
  }

  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    calendarDays.push({
      dayNum: i,
      isCurrentMonth: true,
      dateStr,
    });
  }

  // Next month leading days to complete grid (42 cells total for 6 rows)
  const remainingCells = 42 - calendarDays.length;
  for (let i = 1; i <= remainingCells; i++) {
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;
    const dateStr = `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    calendarDays.push({
      dayNum: i,
      isCurrentMonth: false,
      dateStr,
    });
  }

  const todayStr = new Date().toISOString().split('T')[0];

  // Helper to get tasks due on a date
  const getTasksForDate = (dateStr: string) => {
    return tasks.filter((t) => t.deadline === dateStr);
  };

  // Helper to get events on a date
  const getEventsForDate = (dateStr: string) => {
    return events.filter((e) => e.date === dateStr);
  };

  // Colored indicator for a task
  const getTaskColor = (task: Task) => {
    if (task.status === 'COMPLETED') return '#34A853'; // Google Green
    if (task.priority === 'URGENT') return '#EA4335'; // Google Red
    if (task.priority === 'HIGH') return '#FBBC05'; // Google Yellow
    const domain = getDomainById(task.domainId);
    return domain?.color || '#4285F4'; // Google Blue
  };

  const handleMouseEnterDate = (
    e: React.MouseEvent,
    dateStr: string,
    dayTasks: Task[],
    dayEvents: CalendarEvent[]
  ) => {
    if (dayTasks.length === 0 && dayEvents.length === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setHoveredDate({
      dateStr,
      tasks: dayTasks,
      events: dayEvents,
      x: rect.left + rect.width / 2,
      y: rect.top,
    });
  };

  const handleMouseLeaveDate = () => {
    setHoveredDate(null);
  };

  const handleOpenCreateEvent = (dateStr?: string) => {
    setEditingEvent(null);
    setEventModalDate(dateStr || todayStr);
    setIsEventModalOpen(true);
  };

  const handleOpenEditEvent = (evt: CalendarEvent) => {
    setEditingEvent(evt);
    setEventModalDate(evt.date);
    setIsEventModalOpen(true);
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (deletingEventId) return;
    try {
      setDeletingEventId(eventId);
      await deleteEvent(eventId);
    } finally {
      setDeletingEventId(null);
    }
  };

  const selectedDayEvents = selectedDate ? getEventsForDate(selectedDate) : [];
  const selectedDayTasks = selectedDate ? getTasksForDate(selectedDate) : [];

  return (
    <div className="page-wrapper">
      {/* Header */}
      <header className="page-header">
        <div className="header-title-block">
          <div className="chapter-kicker">
            <span className="dot dot-green" />
            <span>Timeline & Milestones</span>
          </div>
          <h1 className="header-headline">Calendar</h1>
          <p className="header-subline">
            Monthly schedule of chapter events and task deliverables for GDG on Campus GRIET.
          </p>
        </div>

        <div className="header-actions">
          {isAdmin && (
            <>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => handleOpenCreateEvent()}
              >
                <CalendarPlus size={16} />
                <span>Schedule Event</span>
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={openCreateTask}
              >
                <Plus size={16} />
                <span>Schedule Task</span>
              </button>
            </>
          )}
        </div>
      </header>

      {/* Calendar Controls & Month Header */}
      <div className="calendar-panel-surface">
        <div className="calendar-toolbar">
          <div className="month-heading-group">
            <h2 className="current-month-text">
              {monthNames[month]} {year}
            </h2>
            <button
              type="button"
              className="today-pill-btn"
              onClick={goToToday}
            >
              Today
            </button>
          </div>

          <div className="calendar-nav-buttons">
            <button
              type="button"
              className="cal-nav-btn"
              onClick={goToPrevMonth}
              aria-label="Previous Month"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              className="cal-nav-btn"
              onClick={goToNextMonth}
              aria-label="Next Month"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Empty state notice if zero tasks and zero events anywhere */}
        {tasks.length === 0 && events.length === 0 && (
          <div className="calendar-empty-banner">
            <span>Nothing scheduled yet.</span>
            <span className="banner-sub">
              Events and task deadlines will appear as colored Google dots on this calendar.
            </span>
          </div>
        )}

        {/* Calendar Grid */}
        <div className="calendar-grid-wrapper">
          {/* Day of Week Headers */}
          <div className="calendar-weekdays-row">
            {daysOfWeek.map((day) => (
              <div key={day} className="weekday-header-cell">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Day Cells */}
          <div className="calendar-days-grid">
            {calendarDays.map((cell, idx) => {
              const dayTasks = getTasksForDate(cell.dateStr);
              const dayEvents = getEventsForDate(cell.dateStr);
              const totalItems = dayTasks.length + dayEvents.length;
              const isToday = cell.dateStr === todayStr;

              return (
                <div
                  key={idx}
                  className={`cal-day-cell ${
                    !cell.isCurrentMonth ? 'cal-day-inactive' : ''
                  } ${isToday ? 'cal-day-today' : ''} ${
                    totalItems > 0 ? 'cal-day-has-tasks' : ''
                  }`}
                  onClick={() => {
                    setSelectedDate(cell.dateStr);
                  }}
                  onMouseEnter={(e) =>
                    handleMouseEnterDate(e, cell.dateStr, dayTasks, dayEvents)
                  }
                  onMouseLeave={handleMouseLeaveDate}
                >
                  <div className="day-number-row">
                    <span className={`day-number ${isToday ? 'today-badge' : ''}`}>
                      {cell.dayNum}
                    </span>
                    {totalItems > 0 && (
                      <span className="day-tasks-badge">
                        {dayEvents.length > 0 && dayTasks.length > 0
                          ? `${dayEvents.length} ev, ${dayTasks.length} tk`
                          : dayEvents.length > 0
                          ? `${dayEvents.length} ev`
                          : `${dayTasks.length} tk`}
                      </span>
                    )}
                  </div>

                  {/* Indicators */}
                  <div className="day-task-dots">
                    {/* Events dots */}
                    {dayEvents.slice(0, 2).map((evt) => (
                      <span
                        key={evt.id}
                        className="day-indicator-dot dot-event"
                        title={`[Event] ${evt.title}`}
                      />
                    ))}

                    {/* Tasks dots */}
                    {dayTasks.slice(0, 4 - Math.min(dayEvents.length, 2)).map((task) => (
                      <span
                        key={task.id}
                        className="day-indicator-dot dot-task"
                        style={{ backgroundColor: getTaskColor(task) }}
                        title={`[Task] ${task.title}`}
                      />
                    ))}

                    {totalItems > 4 && (
                      <span className="more-tasks-dot">+{totalItems - 4}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Hover Popover */}
      {hoveredDate && (
        <div
          className="calendar-popover"
          style={{
            top: `${hoveredDate.y - 12}px`,
            left: `${hoveredDate.x}px`,
          }}
        >
          <div className="popover-header">
            <span className="popover-date">{hoveredDate.dateStr}</span>
            <span className="popover-count">
              {hoveredDate.events.length + hoveredDate.tasks.length} Scheduled
            </span>
          </div>
          <div className="popover-task-list">
            {/* Events in popover */}
            {hoveredDate.events.slice(0, 2).map((evt) => (
              <div key={evt.id} className="popover-task-item">
                <span className="popover-dot dot-event" />
                <div className="popover-task-info">
                  <span className="popover-task-title">{evt.title}</span>
                  <span className="popover-task-meta">
                    Event • {evt.type} {evt.startTime ? `• ${evt.startTime}` : ''}
                  </span>
                </div>
              </div>
            ))}

            {/* Tasks in popover */}
            {hoveredDate.tasks.slice(0, 3).map((task) => {
              const assigned = members.find((m) => m.id === task.assignedTo);
              const domain = getDomainById(task.domainId);
              return (
                <div key={task.id} className="popover-task-item">
                  <span
                    className="popover-dot"
                    style={{ backgroundColor: getTaskColor(task) }}
                  />
                  <div className="popover-task-info">
                    <span className="popover-task-title">{task.title}</span>
                    <span className="popover-task-meta">
                      Task • {domain?.name} • {assigned?.name || 'Unassigned'}
                    </span>
                  </div>
                </div>
              );
            })}
            {hoveredDate.events.length + hoveredDate.tasks.length > 5 && (
              <div className="popover-more">
                +{hoveredDate.events.length + hoveredDate.tasks.length - 5} more items (click date to view)
              </div>
            )}
          </div>
        </div>
      )}

      {/* Day Details Modal */}
      {selectedDate && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedDate(null)}
          title={`Schedule for ${selectedDate}`}
          subtitle={`${selectedDayEvents.length} events • ${selectedDayTasks.length} task deliverables`}
          maxWidth="680px"
        >
          <div className="day-modal-content">
            {/* Events Section */}
            {selectedDayEvents.length > 0 && (
              <div className="day-modal-section">
                <div className="day-modal-section-title">
                  <CalendarIcon size={14} />
                  <span>Chapter Events ({selectedDayEvents.length})</span>
                </div>
                <div className="day-events-list">
                  {selectedDayEvents.map((evt) => {
                    const domain = evt.domainId ? getDomainById(evt.domainId) : null;
                    return (
                      <div key={evt.id} className="day-event-card">
                        <div className="event-card-main">
                          <div className="event-card-meta">
                            <span className="event-type-chip">{evt.type}</span>
                            {(evt.startTime || evt.endTime) && (
                              <span className="event-time-chip">
                                <Clock size={12} />
                                <span>
                                  {evt.startTime}
                                  {evt.endTime ? ` - ${evt.endTime}` : ''}
                                </span>
                              </span>
                            )}
                            {domain && (
                              <span
                                className="domain-badge"
                                style={{
                                  borderColor: `${domain.color}40`,
                                  color: domain.color,
                                }}
                              >
                                {domain.name}
                              </span>
                            )}
                          </div>
                          <h4 className="event-card-title">{evt.title}</h4>
                          {evt.description && (
                            <p className="event-card-desc">{evt.description}</p>
                          )}
                        </div>

                        {/* Admin event controls */}
                        {isAdmin && (
                          <div className="event-card-actions">
                            <button
                              type="button"
                              className="event-action-btn"
                              onClick={() => handleOpenEditEvent(evt)}
                              title="Edit Event"
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              type="button"
                              className="event-action-btn event-delete-btn"
                              onClick={() => handleDeleteEvent(evt.id)}
                              disabled={deletingEventId === evt.id}
                              title="Delete Event"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tasks Section */}
            {selectedDayTasks.length > 0 && (
              <div className="day-modal-section">
                <div className="day-modal-section-title">
                  <ListTodo size={14} />
                  <span>Task Deliverables ({selectedDayTasks.length})</span>
                </div>
                <div className="task-list-table">
                  <div className="task-table-head">
                    <span className="head-col-task">TASK</span>
                    <span className="head-col-domain">DOMAIN</span>
                    <span className="head-col-assignee">ASSIGNED TO</span>
                    <span className="head-col-priority">PRIORITY</span>
                    <span className="head-col-deadline">DEADLINE</span>
                    <span className="head-col-status">STATUS</span>
                    <span className="head-col-actions" style={{ textAlign: 'right' }}>ACTIONS</span>
                  </div>
                  <div className="task-table-body">
                    {selectedDayTasks.map((task) => (
                      <TaskItem key={task.id} task={task} />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Empty state for the day */}
            {selectedDayEvents.length === 0 && selectedDayTasks.length === 0 && (
              <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-secondary)' }}>
                <CalendarIcon size={32} style={{ margin: '0 auto 10px', opacity: 0.4 }} />
                <p style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                  Nothing scheduled for this day
                </p>
                <p style={{ fontSize: '0.8rem', marginTop: '4px' }}>
                  {isAdmin
                    ? 'Use the actions below to schedule a chapter event or task.'
                    : 'No deliverables or events are scheduled for this date.'}
                </p>
              </div>
            )}

            <div className="day-modal-footer">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setSelectedDate(null)}
              >
                Close
              </button>
              {isAdmin && (
                <>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      const d = selectedDate;
                      setSelectedDate(null);
                      handleOpenCreateEvent(d);
                    }}
                  >
                    <CalendarPlus size={15} />
                    <span>Add Event</span>
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => {
                      setSelectedDate(null);
                      openCreateTask();
                    }}
                  >
                    <Plus size={15} />
                    <span>Add Task</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Event Create / Edit Modal */}
      {isEventModalOpen && (
        <EventModal
          isOpen={isEventModalOpen}
          onClose={() => {
            setIsEventModalOpen(false);
            setEditingEvent(null);
          }}
          event={editingEvent}
          initialDate={eventModalDate}
        />
      )}
    </div>
  );
};

