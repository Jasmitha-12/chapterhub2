import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { getDomainById } from '../data/domains';
import { EmptyState } from '../components/common/EmptyState';
import { Users, UserPlus, Mail, Shield } from 'lucide-react';

interface LayoutContext {
  openCreateTask: () => void;
  openAddMember: () => void;
}

export const MembersPage: React.FC = () => {
  const { openAddMember } = useOutletContext<LayoutContext>();
  const { members, tasks, currentUser } = useData();

  return (
    <div className="page-wrapper">
      {/* Header */}
      <header className="page-header">
        <div className="header-title-block">
          <div className="chapter-kicker">
            <span className="dot dot-blue" />
            <span>Community Directory</span>
          </div>
          <h1 className="header-headline">Members</h1>
          <p className="header-subline">
            Active contributors and domain leads in GDG on Campus GRIET.
          </p>
        </div>

        <div className="header-actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={openAddMember}
          >
            <UserPlus size={16} />
            <span>Add Member</span>
          </button>
        </div>
      </header>

      {/* Members Directory Surface */}
      <section className="members-directory-surface">
        {members.length === 0 ? (
          <div className="surface-card empty-card">
            <EmptyState
              icon={Users}
              title="No members yet."
              description="Members will appear here when they join the chapter."
              actionLabel="+ Add Member"
              onAction={openAddMember}
              accentColor="#4285F4"
            />
          </div>
        ) : (
          <div className="members-grid-layout">
            {members.map((member) => {
              const domain = getDomainById(member.domainId);
              const assignedTasks = tasks.filter((t) => t.assignedTo === member.id);
              const completedTasks = assignedTasks.filter(
                (t) => t.status === 'COMPLETED'
              );
              const isCurrent = currentUser?.id === member.id;

              return (
                <div
                  key={member.id}
                  className={`member-profile-card ${isCurrent ? 'member-is-current' : ''}`}
                >
                  <div className="member-card-top">
                    <div
                      className="member-avatar-lg"
                      style={{ backgroundColor: member.avatarColor }}
                    >
                      {member.name.charAt(0).toUpperCase()}
                    </div>

                    <div className="member-badge-strip">
                      {isCurrent && (
                        <span className="current-user-tag">You</span>
                      )}
                    </div>
                  </div>

                  <div className="member-main-info">
                    <h3 className="member-name-heading">{member.name}</h3>
                    <div className="member-role-line">
                      <Shield size={13} className="role-icon" />
                      <span>{member.role}</span>
                    </div>

                    <div className="member-email-line">
                      <Mail size={13} className="email-icon" />
                      <span>{member.email}</span>
                    </div>
                  </div>

                  <div className="member-domain-row">
                    <span
                      className="domain-pill"
                      style={{
                        borderColor: `${domain?.color || '#4285F4'}40`,
                        color: domain?.color || 'inherit',
                      }}
                    >
                      {domain?.name || member.domainId}
                    </span>
                  </div>

                  <div className="member-card-footer">
                    <div className="member-stat-item">
                      <span className="stat-label">Assigned</span>
                      <span className="stat-val">{assignedTasks.length}</span>
                    </div>
                    <div className="member-stat-item">
                      <span className="stat-label">Done</span>
                      <span className="stat-val">{completedTasks.length}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
