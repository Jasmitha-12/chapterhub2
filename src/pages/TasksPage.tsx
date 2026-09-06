import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { DOMAINS } from '../data/domains';
import { TaskItem } from '../components/tasks/TaskItem';
import { EmptyState } from '../components/common/EmptyState';
import {
  Plus,
  Search,
  CheckCircle2,
  Clock,
  CircleDashed,
  ListTodo,
} from 'lucide-react';

interface LayoutContext {
  openCreateTask: () => void;
  openAddMember: () => void;
}

export const TasksPage: React.FC = () => {
  const { openCreateTask } = useOutletContext<LayoutContext>();
  const { tasks, isAdmin } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedDomain, setSelectedDomain] = useState<string>('ALL');

  // Filter tasks based on search, status, and domain
  const filteredTasks = tasks.filter((task) => {
    if (
      searchQuery &&
      !task.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !task.description.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    if (selectedStatus !== 'ALL' && task.status !== selectedStatus) {
      return false;
    }
    if (selectedDomain !== 'ALL' && task.domainId !== selectedDomain) {
      return false;
    }
    return true;
  });

  const notStartedCount = tasks.filter((t) => t.status === 'NOT_STARTED').length;
  const inProgressCount = tasks.filter((t) => t.status === 'IN_PROGRESS').length;
  const completedCount = tasks.filter((t) => t.status === 'COMPLETED').length;

  return (
    <div className="page-wrapper">
      {/* Page Header */}
      <header className="page-header">
        <div className="header-title-block">
          <div className="chapter-kicker">
            <span className="dot dot-blue" />
            <span>Workspace Execution</span>
          </div>
          <h1 className="header-headline">Tasks</h1>
          <p className="header-subline">
            Track ownership, domain coordination, and chapter progress.
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
              <span>Create Task</span>
            </button>
          )}
        </div>
      </header>

      {/* Filter and Search Bar */}
      <section className="filter-panel-surface">
        <div className="filter-controls-row">
          {/* Search input */}
          <div className="search-input-wrapper">
            <Search size={15} className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search chapter tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                className="clear-search-btn"
                onClick={() => setSearchQuery('')}
              >
                Clear
              </button>
            )}
          </div>

          {/* Domain Filter Dropdown */}
          <div className="filter-select-wrapper">
            <select
              className="filter-select"
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
            >
              <option value="ALL">All Domains ({DOMAINS.length})</option>
              {DOMAINS.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Status Filter Chips */}
        <div className="status-filter-tabs">
          <button
            type="button"
            className={`status-tab ${selectedStatus === 'ALL' ? 'active' : ''}`}
            onClick={() => setSelectedStatus('ALL')}
          >
            <span>All Tasks</span>
            <span className="tab-count">{tasks.length}</span>
          </button>

          <button
            type="button"
            className={`status-tab ${
              selectedStatus === 'NOT_STARTED' ? 'active not-started' : ''
            }`}
            onClick={() => setSelectedStatus('NOT_STARTED')}
          >
            <CircleDashed size={13} className="tab-icon" />
            <span>Not Started</span>
            <span className="tab-count">{notStartedCount}</span>
          </button>

          <button
            type="button"
            className={`status-tab ${
              selectedStatus === 'IN_PROGRESS' ? 'active in-progress' : ''
            }`}
            onClick={() => setSelectedStatus('IN_PROGRESS')}
          >
            <Clock size={13} className="tab-icon" />
            <span>In Progress</span>
            <span className="tab-count">{inProgressCount}</span>
          </button>

          <button
            type="button"
            className={`status-tab ${
              selectedStatus === 'COMPLETED' ? 'active completed' : ''
            }`}
            onClick={() => setSelectedStatus('COMPLETED')}
          >
            <CheckCircle2 size={13} className="tab-icon" />
            <span>Completed</span>
            <span className="tab-count">{completedCount}</span>
          </button>
        </div>
      </section>

      {/* Task List Surface */}
      <section className="task-workspace-surface">
        {tasks.length === 0 ? (
          <div className="surface-card empty-card">
            <EmptyState
              icon={ListTodo}
              title="No work on the board yet."
              description={
                isAdmin
                  ? 'Create the first task for the chapter.'
                  : 'Tasks will appear here once scheduled by chapter admins.'
              }
              actionLabel={isAdmin ? '+ Create Task' : undefined}
              onAction={isAdmin ? openCreateTask : undefined}
              accentColor="#4285F4"
            />
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="surface-card empty-card">
            <EmptyState
              title="No matching tasks found."
              description="Try adjusting your filter criteria or search keywords."
              actionLabel="Reset Filters"
              onAction={() => {
                setSearchQuery('');
                setSelectedStatus('ALL');
                setSelectedDomain('ALL');
              }}
              accentColor="#FBBC05"
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
              {filteredTasks.map((task) => (
                <TaskItem key={task.id} task={task} />
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
