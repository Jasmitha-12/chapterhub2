import React, { useState } from 'react';
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
  Menu,
  X,
} from 'lucide-react';

export const MobileNav: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { user, profile, logout } = useAuth();
  const { tasks } = useData();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    setIsOpen(false);
    navigate('/login', { replace: true });
  };

  const openTaskCount = tasks.filter((t) => t.status !== 'COMPLETED').length;

  const displayName = profile?.name || user?.displayName || 'GRIET Member';
  const displayEmail = profile?.email || user?.email || '';

  return (
    <>
      {/* Mobile Top Header */}
      <header className="mobile-header">
        <NavLink to="/dashboard" onClick={() => setIsOpen(false)}>
          <BrandMark size="sm" showSubtitle={false} />
        </NavLink>

        <div className="mobile-header-actions">
          <button
            type="button"
            onClick={toggleTheme}
            className="mobile-icon-btn"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="mobile-icon-btn"
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="mobile-drawer-overlay" onClick={() => setIsOpen(false)}>
          <div
            className="mobile-drawer-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="drawer-header">
              <BrandMark size="md" />
              <button
                type="button"
                className="drawer-close-btn"
                onClick={() => setIsOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            <nav className="drawer-nav">
              <NavLink
                to="/dashboard"
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `drawer-nav-item ${isActive ? 'active' : ''}`
                }
              >
                <LayoutDashboard size={18} />
                <span>Dashboard</span>
              </NavLink>

              <NavLink
                to="/tasks"
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `drawer-nav-item ${isActive ? 'active' : ''}`
                }
              >
                <CheckSquare size={18} />
                <span>Tasks</span>
                {openTaskCount > 0 && (
                  <span className="drawer-badge">{openTaskCount}</span>
                )}
              </NavLink>

              <NavLink
                to="/domains"
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `drawer-nav-item ${isActive ? 'active' : ''}`
                }
              >
                <Layers size={18} />
                <span>Domains</span>
              </NavLink>

              <NavLink
                to="/calendar"
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `drawer-nav-item ${isActive ? 'active' : ''}`
                }
              >
                <Calendar size={18} />
                <span>Calendar</span>
              </NavLink>

              <NavLink
                to="/members"
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `drawer-nav-item ${isActive ? 'active' : ''}`
                }
              >
                <Users size={18} />
                <span>Members</span>
              </NavLink>
            </nav>

            <div className="drawer-footer">
              <div className="drawer-user-info">
                <span className="user-name">{displayName}</span>
                <span className="user-email">{displayEmail}</span>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="drawer-logout-btn"
              >
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar */}
      <nav className="mobile-bottom-bar" aria-label="Mobile Navigation">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `bottom-nav-tab ${isActive ? 'active' : ''}`
          }
        >
          <LayoutDashboard size={18} />
          <span>Overview</span>
        </NavLink>

        <NavLink
          to="/tasks"
          className={({ isActive }) =>
            `bottom-nav-tab ${isActive ? 'active' : ''}`
          }
        >
          <CheckSquare size={18} />
          <span>Tasks</span>
        </NavLink>

        <NavLink
          to="/domains"
          className={({ isActive }) =>
            `bottom-nav-tab ${isActive ? 'active' : ''}`
          }
        >
          <Layers size={18} />
          <span>Domains</span>
        </NavLink>

        <NavLink
          to="/calendar"
          className={({ isActive }) =>
            `bottom-nav-tab ${isActive ? 'active' : ''}`
          }
        >
          <Calendar size={18} />
          <span>Calendar</span>
        </NavLink>

        <NavLink
          to="/members"
          className={({ isActive }) =>
            `bottom-nav-tab ${isActive ? 'active' : ''}`
          }
        >
          <Users size={18} />
          <span>Members</span>
        </NavLink>
      </nav>
    </>
  );
};
