import React, { useState } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { AtmosphericCanvas } from '../background/AtmosphericCanvas';
import { useAuth } from '../../context/AuthContext';
import { CreateTaskModal } from '../tasks/CreateTaskModal';
import { AddMemberModal } from '../members/AddMemberModal';
import type { DomainId } from '../../types';
import { Loader2 } from 'lucide-react';

export const AppLayout: React.FC = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskModalDomainId, setTaskModalDomainId] = useState<DomainId | undefined>();
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);

  // While auth state is initializing, never show a blank screen
  if (loading) {
    return (
      <div className="app-shell" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <AtmosphericCanvas />
        <div className="atmospheric-overlay" aria-hidden="true" />
        <div
          style={{
            position: 'relative',
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
            color: 'var(--text-secondary)',
          }}
        >
          <Loader2 size={24} className="animate-spin" style={{ color: 'var(--google-blue)' }} />
          <span style={{ fontSize: '0.86rem', fontWeight: 500 }}>
            Entering ChapterHub...
          </span>
        </div>
      </div>
    );
  }

  // If unauthenticated, redirect to /login
  if (!user && location.pathname !== '/login') {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="app-shell">
      {/* Layer 1: 3D Atmosphere */}
      <AtmosphericCanvas />

      {/* Layer 2: Soft translucent overlay filter */}
      <div className="atmospheric-overlay" aria-hidden="true" />

      {/* Layer 3: Application UI */}
      <div className="app-ui-layer">
        {/* Desktop Sidebar */}
        <Sidebar onOpenAddMember={() => setIsMemberModalOpen(true)} />

        {/* Mobile Header & Bottom Bar */}
        <MobileNav />

        {/* Main Content Workspace */}
        <main className="main-viewport">
          <div className="content-container">
            <Outlet
              context={{
                openCreateTask: (domainId?: DomainId) => {
                  setTaskModalDomainId(domainId);
                  setIsTaskModalOpen(true);
                },
                openAddMember: () => setIsMemberModalOpen(true),
              }}
            />
          </div>
        </main>
      </div>

      {/* Shared Modals */}
      <CreateTaskModal
        isOpen={isTaskModalOpen}
        defaultDomainId={taskModalDomainId}
        onClose={() => {
          setIsTaskModalOpen(false);
          setTaskModalDomainId(undefined);
        }}
        onOpenAddMember={() => {
          setIsTaskModalOpen(false);
          setIsMemberModalOpen(true);
        }}
      />

      <AddMemberModal
        isOpen={isMemberModalOpen}
        onClose={() => setIsMemberModalOpen(false)}
      />
    </div>
  );
};
