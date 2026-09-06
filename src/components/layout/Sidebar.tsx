import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { BrandMark } from '../common/BrandMark';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import {
  LayoutDashboard,
  CheckSquare,
  Layers,
  Calendar,
  Users,
  Sun,
  Moon,
  LogOut,
  User as UserIcon,
} from 'lucide-react';

interface SidebarProps {
  onOpenAddMember?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, profile, logout } = useAuth();
  const { tasks } = useData();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  // Real count of open tasks
  const openTaskCount = tasks.filter((t) => t.status !== 'COMPLETED').length;

  const displayName = profile?.name || user?.displayName || 'GRIET Member';
  const displayRole = profile?.role || 'MEMBER';
  const photoURL = profile?.photoURL || user?.photoURL;

  return (
    <aside className="sidebar-container">
      {/* Brand Header */}
      <div className="sidebar-brand">
        <NavLink to="/dashboard" className="brand-link">
          <BrandMark size="md" />
        </NavLink>
      </div>

      {/* Navigation Links */}
      <nav className="sidebar-nav">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `nav-item ${isActive ? 'nav-item-active' : ''}`
          }
        >
          <LayoutDashboard size={18} className="nav-icon" />
          <span className="nav-text">Dashboard</span>
        </NavLink>

        <NavLink
          to="/tasks"
          className={({ isActive }) =>
            `nav-item ${isActive ? 'nav-item-active' : ''}`
          }
        >
          <CheckSquare size={18} className="nav-icon" />
          <span className="nav-text">Tasks</span>
          {openTaskCount > 0 && (
            <span className="nav-badge">{openTaskCount}</span>
          )}
        </NavLink>

        <NavLink
          to="/domains"
          className={({ isActive }) =>
            `nav-item ${isActive ? 'nav-item-active' : ''}`
          }
        >
          <Layers size={18} className="nav-icon" />
          <span className="nav-text">Domains</span>
        </NavLink>

        <NavLink
          to="/calendar"
          className={({ isActive }) =>
            `nav-item ${isActive ? 'nav-item-active' : ''}`
          }
        >
          <Calendar size={18} className="nav-icon" />
          <span className="nav-text">Calendar</span>
        </NavLink>

        <NavLink
          to="/members"
          className={({ isActive }) =>
            `nav-item ${isActive ? 'nav-item-active' : ''}`
          }
        >
          <Users size={18} className="nav-icon" />
          <span className="nav-text">Members</span>
        </NavLink>
      </nav>

      {/* Bottom Area: Theme toggle, User area, Logout */}
      <div className="sidebar-footer">
        {/* Theme Toggle Button */}
        <button
          type="button"
          onClick={toggleTheme}
          className="theme-toggle-btn"
          aria-label={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
        >
          {theme === 'light' ? (
            <>
              <Moon size={16} />
              <span>Dark Mode</span>
            </>
          ) : (
            <>
              <Sun size={16} />
              <span>Light Mode</span>
            </>
          )}
        </button>

        {/* Real Firebase User Profile Area */}
        <div className="user-profile-strip">
          {photoURL ? (
            <img
              src={photoURL}
              alt={displayName}
              className="user-avatar"
              style={{ objectFit: 'cover' }}
              referrerPolicy="no-referrer"
            />
          ) : (
            <div
              className="user-avatar"
              style={{ backgroundColor: '#4285F4' }}
            >
              {displayName ? displayName.charAt(0).toUpperCase() : <UserIcon size={14} />}
            </div>
          )}

          <div className="user-details">
            <span className="user-name" title={displayName}>
              {displayName}
            </span>
            <span className="user-role" title={user?.email || undefined}>
              {displayRole}
            </span>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="logout-icon-btn"
            title="Sign out of Google"
            aria-label="Logout"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
};
