import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { DOMAINS, getDomainById } from '../data/domains';
import { EmptyState } from '../components/common/EmptyState';
import { Modal } from '../components/common/Modal';
import type { Member, DomainId } from '../types';
import {
  Users,
  UserPlus,
  Mail,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  AlertCircle,
  Loader2,
  Search,
} from 'lucide-react';

interface LayoutContext {
  openCreateTask: () => void;
  openAddMember: () => void;
}

export const MembersPage: React.FC = () => {
  const { openAddMember } = useOutletContext<LayoutContext>();
  const {
    members,
    tasks,
    currentUser,
    isAdmin,
    updateMemberRole,
    updateMemberDomain,
    deleteMember,
  } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<string>('ALL');
  const [selectedRole, setSelectedRole] = useState<string>('ALL');

  // Confirmation modal states
  const [roleChangeTarget, setRoleChangeTarget] = useState<{
    member: Member;
    targetRole: 'ADMIN' | 'MEMBER';
  } | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<Member | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Filter members based on search and filters
  const filteredMembers = members.filter((member) => {
    if (
      searchQuery &&
      !member.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !member.email.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    if (selectedDomain !== 'ALL' && member.domainId !== selectedDomain) {
      return false;
    }
    if (selectedRole !== 'ALL' && member.role.toUpperCase() !== selectedRole) {
      return false;
    }
    return true;
  });

  const handleConfirmRoleChange = async () => {
    if (!roleChangeTarget || isProcessing) return;

    try {
      setIsProcessing(true);
      setActionError(null);
      const res = await updateMemberRole(
        roleChangeTarget.member.id,
        roleChangeTarget.targetRole
      );
      if (!res.success) {
        setActionError(res.message || 'Failed to update member role.');
      } else {
        setRoleChangeTarget(null);
      }
    } catch (err: any) {
      setActionError(err.message || 'Error occurred while updating role.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget || isProcessing) return;

    try {
      setIsProcessing(true);
      setActionError(null);
      const res = await deleteMember(deleteTarget.id);
      if (!res.success) {
        setActionError(res.message || 'Failed to delete member.');
      } else {
        setDeleteTarget(null);
      }
    } catch (err: any) {
      setActionError(err.message || 'Error occurred while deleting member.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDomainChange = async (memberId: string, domainId: DomainId) => {
    try {
      await updateMemberDomain(memberId, domainId);
    } catch (err) {
      console.error('Failed to change domain:', err);
    }
  };

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
          {isAdmin && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={openAddMember}
            >
              <UserPlus size={16} />
              <span>Invite Member</span>
            </button>
          )}
        </div>
      </header>

      {/* Filter and Search Bar */}
      <section className="filter-panel-surface" style={{ marginBottom: '24px' }}>
        <div className="filter-controls-row">
          <div className="search-input-wrapper">
            <Search size={15} className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search members by name or email..."
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

          <div className="filter-select-group">
            <select
              className="filter-select"
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
            >
              <option value="ALL">All Domains ({members.length})</option>
              {DOMAINS.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>

            <select
              className="filter-select"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
            >
              <option value="ALL">All Roles</option>
              <option value="ADMIN">Admins Only</option>
              <option value="MEMBER">Members Only</option>
            </select>
          </div>
        </div>
      </section>

      {/* Members Directory Surface */}
      <section className="members-directory-surface">
        {filteredMembers.length === 0 ? (
          <div className="surface-card empty-card">
            <EmptyState
              icon={Users}
              title={members.length === 0 ? 'No members yet.' : 'No matching members found.'}
              description={
                members.length === 0
                  ? 'Members will appear here when they sign into ChapterHub with their Google account.'
                  : 'Try clearing your search filters to view the full directory.'
              }
              actionLabel={isAdmin && members.length === 0 ? '+ Invite Member' : undefined}
              onAction={isAdmin && members.length === 0 ? openAddMember : undefined}
              accentColor="#4285F4"
            />
          </div>
        ) : (
          <div className="members-grid-layout">
            {filteredMembers.map((member) => {
              const domain = getDomainById(member.domainId);
              const assignedTasks = tasks.filter((t) => t.assignedTo === member.id);
              const completedTasks = assignedTasks.filter(
                (t) => t.status === 'COMPLETED'
              );
              const isCurrent = currentUser?.id === member.id;
              const isMemberAdmin = member.role?.toUpperCase() === 'ADMIN';

              return (
                <div
                  key={member.id}
                  className={`member-profile-card ${isCurrent ? 'member-is-current' : ''}`}
                >
                  <div className="member-card-top">
                    {member.photoURL ? (
                      <img
                        src={member.photoURL}
                        alt={member.name}
                        className="member-avatar-lg"
                        style={{ objectFit: 'cover' }}
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div
                        className="member-avatar-lg"
                        style={{ backgroundColor: member.avatarColor }}
                      >
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                    )}

                    <div className="member-badge-strip" style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      {isCurrent && (
                        <span className="current-user-tag">You</span>
                      )}
                      <span
                        className={
                          isMemberAdmin ? 'role-badge-admin' : 'role-badge-member'
                        }
                      >
                        {isMemberAdmin ? (
                          <>
                            <ShieldCheck size={12} />
                            <span>ADMIN</span>
                          </>
                        ) : (
                          <span>MEMBER</span>
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="member-main-info">
                    <h3 className="member-name-heading">{member.name}</h3>
                    <div className="member-role-line">
                      <Shield size={13} className="role-icon" />
                      <span>{isMemberAdmin ? 'Chapter Administrator' : 'Chapter Member'}</span>
                    </div>

                    <div className="member-email-line">
                      <Mail size={13} className="email-icon" />
                      <span title={member.email}>{member.email}</span>
                    </div>
                  </div>

                  <div className="member-domain-row">
                    {isAdmin ? (
                      <select
                        className="member-domain-select"
                        value={member.domainId}
                        onChange={(e) =>
                          handleDomainChange(member.id, e.target.value as DomainId)
                        }
                        title="Change domain assignment"
                      >
                        {DOMAINS.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span
                        className="domain-pill"
                        style={{
                          borderColor: `${domain?.color || '#4285F4'}40`,
                          color: domain?.color || 'inherit',
                        }}
                      >
                        {domain?.name || member.domainId}
                      </span>
                    )}
                  </div>

                  <div className="member-card-footer">
                    <div className="member-stats-group">
                      <div className="member-stat-item">
                        <span className="stat-label">Assigned</span>
                        <span className="stat-val">{assignedTasks.length}</span>
                      </div>
                      <div className="member-stat-item">
                        <span className="stat-label">Done</span>
                        <span className="stat-val">{completedTasks.length}</span>
                      </div>
                    </div>

                    {/* Admin Role Management Controls */}
                    {isAdmin && (
                      <div className="member-admin-actions">
                        {isMemberAdmin ? (
                          !isCurrent && (
                            <button
                              type="button"
                              className="btn-role-change btn-role-demote"
                              onClick={() =>
                                setRoleChangeTarget({
                                  member,
                                  targetRole: 'MEMBER',
                                })
                              }
                              title="Change to Member"
                            >
                              <span>Make Member</span>
                            </button>
                          )
                        ) : (
                          <button
                            type="button"
                            className="btn-role-change btn-role-promote"
                            onClick={() =>
                              setRoleChangeTarget({
                                member,
                                targetRole: 'ADMIN',
                              })
                            }
                            title="Promote to Chapter Administrator"
                          >
                            <Shield size={12} />
                            <span>Make Admin</span>
                          </button>
                        )}

                        {!isCurrent && (
                          <button
                            type="button"
                            className="btn-member-delete"
                            onClick={() => setDeleteTarget(member)}
                            title="Remove from directory"
                            aria-label={`Remove ${member.name}`}
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Role Change Confirmation Modal */}
      {roleChangeTarget && (
        <Modal
          isOpen={true}
          onClose={() => {
            if (!isProcessing) {
              setRoleChangeTarget(null);
              setActionError(null);
            }
          }}
          title={
            roleChangeTarget.targetRole === 'ADMIN'
              ? 'Promote to Chapter Admin'
              : 'Demote to Chapter Member'
          }
          subtitle={`Managing permissions for ${roleChangeTarget.member.name}`}
          maxWidth="480px"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {actionError && (
              <div className="form-error-banner">
                <AlertCircle size={15} />
                <span>{actionError}</span>
              </div>
            )}

            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              {roleChangeTarget.targetRole === 'ADMIN' ? (
                <>
                  Are you sure you want to promote <strong>{roleChangeTarget.member.name}</strong> ({roleChangeTarget.member.email}) to <strong>ADMIN</strong>?
                  <br /><br />
                  Admins have permissions to create, edit, and delete chapter tasks, schedule calendar events, and manage member roles.
                </>
              ) : (
                <>
                  Are you sure you want to change <strong>{roleChangeTarget.member.name}</strong> ({roleChangeTarget.member.email}) to <strong>MEMBER</strong>?
                  <br /><br />
                  They will only be able to update status on tasks assigned to them, and will lose admin privileges across ChapterHub.
                </>
              )}
            </p>

            <div className="modal-actions" style={{ marginTop: '8px' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setRoleChangeTarget(null)}
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button
                type="button"
                className={roleChangeTarget.targetRole === 'ADMIN' ? 'btn btn-primary' : 'btn btn-outline'}
                onClick={handleConfirmRoleChange}
                disabled={isProcessing}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: roleChangeTarget.targetRole === 'ADMIN' ? 'var(--google-blue)' : undefined,
                  color: roleChangeTarget.targetRole === 'ADMIN' ? '#fff' : 'var(--google-red)',
                  borderColor: roleChangeTarget.targetRole === 'ADMIN' ? undefined : 'var(--google-red)',
                }}
              >
                {isProcessing && <Loader2 size={15} className="animate-spin" />}
                <span>
                  Confirm {roleChangeTarget.targetRole === 'ADMIN' ? 'Promotion' : 'Role Change'}
                </span>
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Member Deletion Confirmation Modal */}
      {deleteTarget && (
        <Modal
          isOpen={true}
          onClose={() => {
            if (!isProcessing) {
              setDeleteTarget(null);
              setActionError(null);
            }
          }}
          title="Remove Member from Directory"
          subtitle="Remove user profile from chapterhub_users"
          maxWidth="480px"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {actionError && (
              <div className="form-error-banner">
                <AlertCircle size={15} />
                <span>{actionError}</span>
              </div>
            )}

            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(234, 67, 53, 0.08)',
                border: '1px solid rgba(234, 67, 53, 0.2)',
              }}
            >
              <ShieldAlert size={20} style={{ color: 'var(--google-red)', flexShrink: 0, marginTop: '2px' }} />
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                Are you sure you want to remove <strong>{deleteTarget.name}</strong> ({deleteTarget.email}) from ChapterHub?
                <br /><br />
                This will delete their profile from the <code>chapterhub_users</code> directory. It does not delete their Google account.
              </div>
            </div>

            <div className="modal-actions" style={{ marginTop: '8px' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setDeleteTarget(null)}
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleConfirmDelete}
                disabled={isProcessing}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: 'var(--google-red)',
                  color: '#fff',
                }}
              >
                {isProcessing && <Loader2 size={15} className="animate-spin" />}
                <span>Remove Member</span>
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

