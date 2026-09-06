import React, { useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { DOMAINS } from '../data/domains';
import { TaskItem } from '../components/tasks/TaskItem';
import { EmptyState } from '../components/common/EmptyState';
import {
  Plus,
  ArrowRight,
  ListTodo,
} from 'lucide-react';

interface LayoutContext {
  openCreateTask: () => void;
  openAddMember: () => void;
}

export const DashboardPage: React.FC = () => {
  const { openCreateTask, openAddMember } = useOutletContext<LayoutContext>();
  const { tasks, currentUser, isAdmin } = useData();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'all' | 'my'>('all');

  // Dynamic greeting based on current local hour
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning.';
    if (hour < 17) return 'Good afternoon.';
    return 'Good evening.';
  };

  // REAL counts from frontend state (Strictly zero when empty)
  const myTasksCount = currentUser
    ? tasks.filter((t) => t.assignedTo === currentUser.id).length
    : 0;
  const openTasksCount = tasks.filter((t) => t.status === 'NOT_STARTED').length;
  const inProgressCount = tasks.filter((t) => t.status === 'IN_PROGRESS').length;
  const completedCount = tasks.filter((t) => t.status === 'COMPLETED').length;

  const displayedTasks =
    activeTab === 'my' && currentUser
      ? tasks.filter((t) => t.assignedTo === currentUser.id)
      : tasks;

  return (
    <div className="page-wrapper">
      {/* Page Header */}
      <header className="page-header">
        <div className="header-title-block">
          <div className="chapter-kicker">
            <span className="dot dot-blue" />
            <span>GDG on Campus GRIET Chapter</span>
          </div>
          <h1 className="header-headline">{getGreeting()}</h1>
          <p className="header-subline">
            Here's what's happening in the chapter.
          </p>
        </div>

        <div className="header-actions">
          {isAdmin && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={openCreateTask}
            >
              <Plus size={16} />
              <span>New Task</span>
            </button>
          )}
        </div>
      </header>

      {/* Metrics Row (Strictly empty / zero initial state) */}
      <section className="metrics-grid" aria-label="Chapter Task Metrics">
        <div
          className={`metric-card ${activeTab === 'my' ? 'metric-card-selected' : ''}`}
          onClick={() => setActiveTab('my')}
          role="button"
          tabIndex={0}
        >
          <div className="metric-header">
            <span className="metric-label">My Tasks</span>
            <span className="metric-indicator dot-blue" />
          </div>
          <div className="metric-value">{myTasksCount}</div>
          <p className="metric-caption">
            {currentUser?.name || 'Your assigned deliverables'}
          </p>
        </div>

        <div
          className={`metric-card ${activeTab === 'all' ? 'metric-card-selected' : ''}`}
          onClick={() => setActiveTab('all')}
          role="button"
          tabIndex={0}
        >
          <div className="metric-header">
            <span className="metric-label">Open Tasks</span>
            <span className="metric-indicator dot-yellow" />
          </div>
          <div className="metric-value">{openTasksCount}</div>
          <p className="metric-caption">Not started yet</p>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-label">In Progress</span>
            <span className="metric-indicator dot-blue" />
          </div>
          <div className="metric-value">{inProgressCount}</div>
          <p className="metric-caption">Currently being built</p>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-label">Completed</span>
            <span className="metric-indicator dot-green" />
          </div>
          <div className="metric-value">{completedCount}</div>
          <p className="metric-caption">Shipped & verified</p>
        </div>
      </section>

      {/* Main Chapter Board Workspace */}
      <section className="dashboard-content-grid">
        <div className="tasks-feed-panel">
          <div className="section-header-bar">
            <div className="section-title-group">
              <h2 className="section-title">Chapter Tasks</h2>
              <div className="tab-pill-group">
                <button
                  type="button"
                  className={`tab-pill ${activeTab === 'all' ? 'active' : ''}`}
                  onClick={() => setActiveTab('all')}
                >
                  All Tasks ({tasks.length})
                </button>
                <button
                  type="button"
                  className={`tab-pill ${activeTab === 'my' ? 'active' : ''}`}
                  onClick={() => setActiveTab('my')}
                >
                  My Tasks ({myTasksCount})
                </button>
              </div>
            </div>

            {tasks.length > 0 && (
              <button
                type="button"
                className="view-all-link"
                onClick={() => navigate('/tasks')}
              >
                <span>Full Board</span>
                <ArrowRight size={14} />
              </button>
            )}
          </div>

          {/* If there are no tasks: Aesthetic Empty State */}
          {displayedTasks.length === 0 ? (
            <div className="surface-card empty-card">
              <EmptyState
                icon={ListTodo}
                title="No tasks yet."
                description={
                  isAdmin
                    ? 'Create a task and get the chapter moving.'
                    : 'Tasks will appear here once assigned or scheduled.'
                }
                actionLabel={isAdmin ? '+ New Task' : undefined}
                onAction={isAdmin ? openCreateTask : undefined}
                accentColor="#4285F4"
              />
            </div>
          ) : (
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
                {displayedTasks.map((task) => (
                  <TaskItem key={task.id} task={task} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Quick Domain Sidebar Overview */}
        <div className="domains-sidebar-panel">
          <div className="section-header-bar">
            <h2 className="section-title">Domains ({DOMAINS.length})</h2>
            <button
              type="button"
              className="view-all-link"
              onClick={() => navigate('/domains')}
            >
              <span>Explore</span>
              <ArrowRight size={14} />
            </button>
          </div>

          <div className="surface-card domains-quick-card">
            <div className="domain-pill-list">
              {DOMAINS.map((domain) => {
                const domainTasks = tasks.filter((t) => t.domainId === domain.id);
                return (
                  <div
                    key={domain.id}
                    className="domain-quick-item"
                    onClick={() => navigate(`/domains?id=${domain.id}`)}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="domain-item-left">
                      <span
                        className="domain-dot"
                        style={{ backgroundColor: domain.color }}
                      />
                      <span className="domain-name-text">{domain.name}</span>
                    </div>
                    <span className="domain-task-tally">
                      {domainTasks.length === 0 ? '0' : domainTasks.length}
                    </span>
                  </div>
                );
              })}
            </div>

            {isAdmin && (
              <div className="quick-action-strip">
                <button
                  type="button"
                  className="btn btn-outline btn-full-width"
                  onClick={openAddMember}
                >
                  <span>+ Invite Member</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
