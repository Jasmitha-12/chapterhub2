import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams, useOutletContext } from 'react-router-dom';
import { DOMAINS, getDomainSlug, getDomainBySlugOrId } from '../data/domains';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import type { Domain, DomainId } from '../types';
import { TaskItem } from '../components/tasks/TaskItem';
import { EmptyState } from '../components/common/EmptyState';
import {
  Code2,
  Palette,
  CalendarDays,
  Handshake,
  Megaphone,
  Share2,
  Boxes,
  FileText,
  ArrowLeft,
  Plus,
  Layers,
  Users,
  CheckCircle2,
} from 'lucide-react';

interface LayoutContext {
  openCreateTask: (domainId?: DomainId) => void;
  openAddMember: () => void;
}

export const DomainsPage: React.FC = () => {
  const { domainSlug } = useParams<{ domainSlug?: string }>();
  const navigate = useNavigate();
  const { openCreateTask, openAddMember } = useOutletContext<LayoutContext>();
  const { tasks, members, currentUser, isAdmin } = useData();
  const { profile } = useAuth();
  const [searchParams] = useSearchParams();
  const domainParamId = searchParams.get('id');

  const memberDomain = DOMAINS.find(
    (d) =>
      d.id === currentUser?.domainId ||
      d.name === currentUser?.domain ||
      d.id === profile?.domainId ||
      d.name === profile?.domain
  );

  const [selectedDomain, setSelectedDomain] = useState<Domain | null>(() => {
    if (!isAdmin && memberDomain) return memberDomain;
    const target = domainSlug || domainParamId;
    return target ? getDomainBySlugOrId(target) || null : null;
  });

  // Enforce member access boundary: MEMBER can ONLY access their own domain
  useEffect(() => {
    if (!isAdmin) {
      if (memberDomain) {
        const allowedSlug = getDomainSlug(memberDomain);
        if (domainSlug !== allowedSlug) {
          navigate(`/domains/${allowedSlug}`, { replace: true });
        }
        setSelectedDomain(memberDomain);
      }
    } else {
      const target = domainSlug || domainParamId;
      if (target) {
        const match = getDomainBySlugOrId(target);
        setSelectedDomain(match || null);
      } else {
        setSelectedDomain(null);
      }
    }
  }, [isAdmin, memberDomain, domainSlug, domainParamId, navigate]);

  const handleSelectDomain = (domain: Domain) => {
    const slug = getDomainSlug(domain);
    navigate(`/domains/${slug}`);
  };

  const handleClearSelection = () => {
    if (isAdmin) {
      navigate('/domains');
    }
  };

  const getDomainIcon = (iconName: string) => {
    switch (iconName) {
      case 'Code2':
        return <Code2 size={20} />;
      case 'Palette':
        return <Palette size={20} />;
      case 'CalendarDays':
        return <CalendarDays size={20} />;
      case 'Handshake':
        return <Handshake size={20} />;
      case 'Megaphone':
        return <Megaphone size={20} />;
      case 'Share2':
        return <Share2 size={20} />;
      case 'Boxes':
        return <Boxes size={20} />;
      case 'FileText':
        return <FileText size={20} />;
      case 'Users':
        return <Users size={20} />;
      default:
        return <Layers size={20} />;
    }
  };

  // If a domain is selected, render the Domain Detail View
  if (selectedDomain) {
    const domainTasks = tasks.filter((t) => t.domainId === selectedDomain.id || t.domain === selectedDomain.name);
    const domainMembers = members.filter((m) => m.domainId === selectedDomain.id || m.domain === selectedDomain.name);
    const completedCount = domainTasks.filter((t) => t.status === 'COMPLETED').length;

    return (
      <div className="page-wrapper">
        {isAdmin && (
          <div className="domain-detail-nav">
            <button
              type="button"
              className="back-btn"
              onClick={handleClearSelection}
            >
              <ArrowLeft size={16} />
              <span>All Domains</span>
            </button>
          </div>
        )}

        {/* Domain Detail Header */}
        <header className="domain-detail-hero">
          <div className="domain-hero-content">
            <div
              className="domain-hero-icon"
              style={{
                backgroundColor: `${selectedDomain.color}15`,
                color: selectedDomain.color,
                borderColor: `${selectedDomain.color}35`,
              }}
            >
              {getDomainIcon(selectedDomain.icon)}
            </div>

            <div className="domain-hero-info">
              <div className="domain-hero-kicker">
                <span>GRIET • GDG on Campus</span>
                {selectedDomain.subTracks && (
                  <div className="subtracks-pill-row">
                    {selectedDomain.subTracks.map((st) => (
                      <span key={st} className="subtrack-badge">
                        {st}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <h1 className="header-headline">{selectedDomain.name}</h1>
              <p className="header-subline">{selectedDomain.description}</p>
            </div>
          </div>

          {isAdmin && (
            <div className="domain-hero-actions">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => openCreateTask(selectedDomain.id)}
              >
                <Plus size={16} />
                <span>Add Task for {selectedDomain.name}</span>
              </button>
            </div>
          )}
        </header>

        {/* Stats Row for Domain */}
        <section className="domain-stats-row">
          <div className="domain-mini-stat">
            <span className="stat-label">Tasks</span>
            <span className="stat-number">{domainTasks.length}</span>
          </div>
          <div className="domain-mini-stat">
            <span className="stat-label">Completed</span>
            <span className="stat-number">{completedCount}</span>
          </div>
          <div className="domain-mini-stat">
            <span className="stat-label">Members</span>
            <span className="stat-number">{domainMembers.length}</span>
          </div>
        </section>

        {/* Domain Tasks Section */}
        <section className="domain-tasks-section">
          <div className="section-header-bar">
            <h2 className="section-title">
              {selectedDomain.name} Tasks ({domainTasks.length})
            </h2>
          </div>

          {domainTasks.length === 0 ? (
            <div className="surface-card empty-card">
              <EmptyState
                icon={Layers}
                title="Nothing here yet."
                description={
                  isAdmin
                    ? `No tasks have been scheduled for ${selectedDomain.name} yet.`
                    : `No tasks scheduled for ${selectedDomain.name}.`
                }
                actionLabel={isAdmin ? `+ Create ${selectedDomain.name} Task` : undefined}
                onAction={isAdmin ? () => openCreateTask(selectedDomain.id) : undefined}
                accentColor={selectedDomain.color}
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
                {domainTasks.map((task) => (
                  <TaskItem key={task.id} task={task} />
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Domain Members Section */}
        <section className="domain-members-section">
          <div className="section-header-bar">
            <h2 className="section-title">
              Team Members ({domainMembers.length})
            </h2>
            {isAdmin && (
              <button
                type="button"
                className="text-link-btn"
                onClick={openAddMember}
              >
                + Add Member to {selectedDomain.name}
              </button>
            )}
          </div>

          {domainMembers.length === 0 ? (
            <div className="domain-empty-members-note">
              <span>No members assigned to {selectedDomain.name} yet.</span>
            </div>
          ) : (
            <div className="members-grid-mini">
              {domainMembers.map((member) => (
                <div key={member.id} className="member-card-mini">
                  <div
                    className="member-avatar-mini"
                    style={{ backgroundColor: member.avatarColor }}
                  >
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="member-info-mini">
                    <span className="member-name-mini">{member.name}</span>
                    <span className="member-role-mini">{member.role}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    );
  }

  // All Domains Grid View
  const totalTasks = tasks.length;

  return (
    <div className="page-wrapper">
      {/* Header */}
      <header className="page-header">
        <div className="header-title-block">
          <div className="chapter-kicker">
            <span className="dot dot-yellow" />
            <span>Club Structure</span>
          </div>
          <h1 className="header-headline">Domains</h1>
          <p className="header-subline">
            The {DOMAINS.length} operational wings driving GDG on Campus GRIET.
          </p>
        </div>

        <div className="header-actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => openCreateTask()}
          >
            <Plus size={16} />
            <span>New Task</span>
          </button>
        </div>
      </header>

      {/* Aesthetic banner reminder */}
      {totalTasks === 0 && (
        <div className="domain-intro-banner">
          <p className="domain-intro-quote">
            "Your domains will come to life as work is added."
          </p>
        </div>
      )}

      {/* 8 Domains Grid */}
      <section className="domains-card-grid" aria-label="GDGOC GRIET Domains">
        {DOMAINS.map((domain) => {
          const domainTasks = tasks.filter((t) => t.domainId === domain.id);
          const domainMembers = members.filter((m) => m.domainId === domain.id);
          const hasTasks = domainTasks.length > 0;

          return (
            <div
              key={domain.id}
              className="domain-card"
              onClick={() => handleSelectDomain(domain)}
              role="button"
              tabIndex={0}
            >
              <div className="domain-card-top">
                <div
                  className="domain-card-icon-box"
                  style={{
                    backgroundColor: `${domain.color}15`,
                    color: domain.color,
                    borderColor: `${domain.color}35`,
                  }}
                >
                  {getDomainIcon(domain.icon)}
                </div>

                <div className="domain-card-badges">
                  {domain.subTracks && (
                    <span className="subtrack-indicator">
                      {domain.subTracks.join(' • ')}
                    </span>
                  )}
                  <span
                    className="domain-count-badge"
                    style={{
                      borderColor: `${domain.color}30`,
                      color: hasTasks ? domain.color : 'inherit',
                    }}
                  >
                    {domainTasks.length} {domainTasks.length === 1 ? 'task' : 'tasks'}
                  </span>
                </div>
              </div>

              <div className="domain-card-body">
                <h3 className="domain-card-title">{domain.name}</h3>
                <p className="domain-card-description">{domain.description}</p>
              </div>

              <div className="domain-card-footer">
                <div className="domain-card-meta">
                  <span className="meta-item">
                    <Users size={12} />
                    <span>{domainMembers.length} members</span>
                  </span>
                  {hasTasks && (
                    <span className="meta-item">
                      <CheckCircle2 size={12} />
                      <span>
                        {
                          domainTasks.filter((t) => t.status === 'COMPLETED')
                            .length
                        }{' '}
                        done
                      </span>
                    </span>
                  )}
                </div>

                <span className="domain-enter-arrow">→</span>
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
};
