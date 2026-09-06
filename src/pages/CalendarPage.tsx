import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { getDomainById } from '../data/domains';
import { Modal } from '../components/common/Modal';
import { TaskItem } from '../components/tasks/TaskItem';
import type { Task } from '../types';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
} from 'lucide-react';

interface LayoutContext {
  openCreateTask: () => void;
  openAddMember: () => void;
}

export const CalendarPage: React.FC = () => {
  const { openCreateTask } = useOutletContext<LayoutContext>();
  const { tasks, members } = useData();

  // Current viewed month state
  const [currentDate, setCurrentDate] = useState(new Date());
  // Selected date modal for day view
  const [selectedDayTasks, setSelectedDayTasks] = useState<{
    dateStr: string;
    tasks: Task[];
  } | null>(null);

  // Popover state
  const [hoveredDate, setHoveredDate] = useState<{
    dateStr: string;
    tasks: Task[];
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
    dayTasks: Task[]
  ) => {
    if (dayTasks.length === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setHoveredDate({
      dateStr,
      tasks: dayTasks,
      x: rect.left + rect.width / 2,
      y: rect.top,
    });
  };

  const handleMouseLeaveDate = () => {
    setHoveredDate(null);
  };

  return (
    <div className="page-wrapper">
      {/* Header */}
      <header className="page-header">
        <div className="header-title-block">
          <div className="chapter-kicker">
            <span className="dot dot-green" />
            <span>Timeline & Deadlines</span>
          </div>
          <h1 className="header-headline">Calendar</h1>
          <p className="header-subline">
            Monthly schedule of chapter milestones and task deliverables.
          </p>
        </div>

        <div className="header-actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={openCreateTask}
          >
            <Plus size={16} />
            <span>Schedule Task</span>
          </button>
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

        {/* Empty state notice if zero tasks anywhere */}
        {tasks.length === 0 && (
          <div className="calendar-empty-banner">
            <span>Nothing scheduled yet.</span>
            <span className="banner-sub">
              Task deadlines will appear as colored Google dots on this calendar.
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
              const isToday = cell.dateStr === todayStr;

              return (
                <div
                  key={idx}
                  className={`cal-day-cell ${
                    !cell.isCurrentMonth ? 'cal-day-inactive' : ''
                  } ${isToday ? 'cal-day-today' : ''} ${
                    dayTasks.length > 0 ? 'cal-day-has-tasks' : ''
                  }`}
                  onClick={() => {
                    if (dayTasks.length > 0) {
                      setSelectedDayTasks({
                        dateStr: cell.dateStr,
                        tasks: dayTasks,
                      });
                    }
                  }}
                  onMouseEnter={(e) =>
                    handleMouseEnterDate(e, cell.dateStr, dayTasks)
                  }
                  onMouseLeave={handleMouseLeaveDate}
                >
                  <div className="day-number-row">
                    <span className={`day-number ${isToday ? 'today-badge' : ''}`}>
                      {cell.dayNum}
                    </span>
                    {dayTasks.length > 0 && (
                      <span className="day-tasks-badge">
                        {dayTasks.length === 1 ? '1 task' : `${dayTasks.length} tasks`}
                      </span>
                    )}
                  </div>

                  {/* Task Indicator Dots */}
                  <div className="day-task-dots">
                    {dayTasks.slice(0, 4).map((task) => (
                      <span
                        key={task.id}
                        className="day-indicator-dot"
                        style={{ backgroundColor: getTaskColor(task) }}
                        title={task.title}
                      />
                    ))}
                    {dayTasks.length > 4 && (
                      <span className="more-tasks-dot">+{dayTasks.length - 4}</span>
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
              {hoveredDate.tasks.length}{' '}
              {hoveredDate.tasks.length === 1 ? 'Task' : 'Tasks'}
            </span>
          </div>
          <div className="popover-task-list">
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
                      {domain?.name} • {assigned?.name || 'Unassigned'}
                    </span>
                  </div>
                </div>
              );
            })}
            {hoveredDate.tasks.length > 3 && (
              <div className="popover-more">
                +{hoveredDate.tasks.length - 3} more tasks (click date to view)
              </div>
            )}
          </div>
        </div>
      )}

      {/* Day Tasks Detail Modal */}
      {selectedDayTasks && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedDayTasks(null)}
          title={`Tasks for ${selectedDayTasks.dateStr}`}
          subtitle={`${selectedDayTasks.tasks.length} deliverables scheduled on this day`}
          maxWidth="640px"
        >
          <div className="day-modal-content">
            <div className="task-list-table">
              <div className="task-table-head">
                <span className="head-col-task">TASK</span>
                <span className="head-col-domain">DOMAIN</span>
                <span className="head-col-assignee">ASSIGNED TO</span>
                <span className="head-col-priority">PRIORITY</span>
                <span className="head-col-deadline">DEADLINE</span>
                <span className="head-col-status">STATUS</span>
              </div>
              <div className="task-table-body">
                {selectedDayTasks.tasks.map((task) => (
                  <TaskItem key={task.id} task={task} />
                ))}
              </div>
            </div>

            <div className="day-modal-footer">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setSelectedDayTasks(null)}
              >
                Close
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  setSelectedDayTasks(null);
                  openCreateTask();
                }}
              >
                <Plus size={15} />
                <span>Add Another Task</span>
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
