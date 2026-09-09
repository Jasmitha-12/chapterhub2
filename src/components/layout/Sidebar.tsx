import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { BrandMark } from '../common/BrandMark';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { DOMAINS, getDomainSlug } from '../../data/domains';
import {
  LayoutDashboard,
  CheckSquare,
  Layers,
  Calendar,
  Users,
  Sun,
  Moon,
  LogOut,
  ChevronDown,
  User as UserIcon,
} from 'lucide-react';

interface SidebarProps {
  onOpenAddMember?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, profile, logout } = useAuth();
  const { tasks, currentUser, isAdmin } = useData();
  const navigate = useNavigate();
  const location = useLocation();

  const [isDomainsOpen, setIsDomainsOpen] = useState(true);
  const isDomainsActive = location.pathname.startsWith('/domains');

  const memberDomain = DOMAINS.find(
    (d) =>
      d.id === currentUser?.domainId ||
      d.name === currentUser?.domain ||
      d.id === profile?.domainId ||
      d.name === profile?.domain
  );

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  // Real count of open tasks
  const openTaskCount = tasks.filter((t) => t.status !== 'COMPLETED').length;

  const displayName = currentUser?.name || profile?.name || user?.displayName || 'GRIET Member';
  const displayRole = currentUser?.role || profile?.role || 'MEMBER';
  const photoURL = currentUser?.photoURL || profile?.photoURL || user?.photoURL;

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

        {/* Domains Dropdown Navigation */}
        <div className="nav-dropdown-group">
          <div
            className={`nav-item nav-item-parent ${isDomainsActive ? 'nav-item-active' : ''}`}
            onClick={() => {
              if (isAdmin) {
                navigate('/domains');
              } else if (memberDomain) {
                navigate(`/domains/${getDomainSlug(memberDomain)}`);
              }
            }}
            role="button"
            tabIndex={0}
            style={{ cursor: 'pointer', justifyContent: 'space-between' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Layers size={18} className="nav-icon" />
              <span className="nav-text">Domains</span>
            </div>
            <button
              type="button"
              className="nav-dropdown-toggle-btn"
              onClick={(e) => {
                e.stopPropagation();
                setIsDomainsOpen(!isDomainsOpen);
              }}
              aria-label="Toggle domains list"
              style={{
                background: 'none',
                border: 'none',
                padding: '2px 4px',
                color: 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
              }}
            >
              <ChevronDown
                size={14}
                style={{
                  transform: isDomainsOpen ? 'rotate(0deg)' : 'rotate(-90deg)',
                  transition: 'transform 0.2s ease',
                }}
              />
            </button>
          </div>

          {isDomainsOpen && (
            <div
              className="nav-sub-list"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '2px',
                paddingLeft: '12px',
                marginTop: '4px',
                marginBottom: '6px',
                borderLeft: '2px solid var(--border-subtle)',
                marginLeft: '18px',
              }}
            >
              {isAdmin ? (
                DOMAINS.map((d) => {
                  const slug = getDomainSlug(d);
                  return (
                    <NavLink
                      key={d.id}
                      to={`/domains/${slug}`}
                      className={({ isActive }) =>
                        `nav-sub-item ${isActive ? 'nav-sub-item-active' : ''}`
                      }
                      style={({ isActive }) => ({
                        fontSize: '0.8rem',
                        padding: '5px 10px',
                        borderRadius: 'var(--radius-sm)',
                        color: isActive ? 'var(--google-blue)' : 'var(--text-secondary)',
                        fontWeight: isActive ? 600 : 500,
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        backgroundColor: isActive ? 'rgba(66, 133, 244, 0.08)' : 'transparent',
                      })}
                    >
                      <span
                        style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          backgroundColor: d.color,
                          display: 'inline-block',
                          flexShrink: 0,
                        }}
                      />
                      <span>{d.name}</span>
                    </NavLink>
                  );
                })
              ) : memberDomain ? (
                <NavLink
                  to={`/domains/${getDomainSlug(memberDomain)}`}
                  className={({ isActive }) =>
                    `nav-sub-item ${isActive ? 'nav-sub-item-active' : ''}`
                  }
                  style={({ isActive }) => ({
                    fontSize: '0.8rem',
                    padding: '5px 10px',
                    borderRadius: 'var(--radius-sm)',
                    color: isActive ? 'var(--google-blue)' : 'var(--text-secondary)',
                    fontWeight: isActive ? 600 : 500,
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    backgroundColor: isActive ? 'rgba(66, 133, 244, 0.08)' : 'transparent',
                  })}
                >
                  <span
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: memberDomain.color,
                      display: 'inline-block',
                      flexShrink: 0,
                    }}
                  />
                  <span>{memberDomain.name}</span>
                </NavLink>
              ) : null}
            </div>
          )}
        </div>

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
