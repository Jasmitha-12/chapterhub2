import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
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
  Menu,
  X,
  ChevronDown,
} from 'lucide-react';

export const MobileNav: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDomainsDrawerOpen, setIsDomainsDrawerOpen] = useState(true);
  const { theme, toggleTheme } = useTheme();
  const { user, profile, logout } = useAuth();
  const { tasks, currentUser, isAdmin } = useData();
  const navigate = useNavigate();

  const memberDomain = DOMAINS.find(
    (d) =>
      d.id === currentUser?.domainId ||
      d.name === currentUser?.domain ||
      d.id === profile?.domainId ||
      d.name === profile?.domain
  );

  const handleLogout = async () => {
    await logout();
    setIsOpen(false);
    navigate('/login', { replace: true });
  };

  const openTaskCount = tasks.filter((t) => t.status !== 'COMPLETED').length;

  const displayName = currentUser?.name || profile?.name || user?.displayName || 'GRIET Member';
  const displayEmail = currentUser?.email || profile?.email || user?.email || '';

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

              {/* Domains in drawer */}
              <div className="drawer-domains-group">
                <div
                  className="drawer-nav-item"
                  onClick={() => {
                    if (isAdmin) {
                      navigate('/domains');
                      setIsOpen(false);
                    } else if (memberDomain) {
                      navigate(`/domains/${getDomainSlug(memberDomain)}`);
                      setIsOpen(false);
                    }
                  }}
                  style={{ cursor: 'pointer', justifyContent: 'space-between' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Layers size={18} />
                    <span>Domains</span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsDomainsDrawerOpen(!isDomainsDrawerOpen);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                    aria-label="Toggle domains"
                  >
                    <ChevronDown
                      size={14}
                      style={{
                        transform: isDomainsDrawerOpen ? 'rotate(0deg)' : 'rotate(-90deg)',
                        transition: 'transform 0.2s ease',
                      }}
                    />
                  </button>
                </div>

                {isDomainsDrawerOpen && (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      paddingLeft: '32px',
                      marginBottom: '8px',
                    }}
                  >
                    {isAdmin ? (
                      DOMAINS.map((d) => (
                        <NavLink
                          key={d.id}
                          to={`/domains/${getDomainSlug(d)}`}
                          onClick={() => setIsOpen(false)}
                          style={({ isActive }) => ({
                            fontSize: '0.85rem',
                            padding: '6px 8px',
                            borderRadius: '4px',
                            color: isActive ? 'var(--google-blue)' : 'var(--text-secondary)',
                            fontWeight: isActive ? 600 : 500,
                            textDecoration: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                          })}
                        >
                          <span
                            style={{
                              width: '6px',
                              height: '6px',
                              borderRadius: '50%',
                              backgroundColor: d.color,
                            }}
                          />
                          <span>{d.name}</span>
                        </NavLink>
                      ))
                    ) : memberDomain ? (
                      <NavLink
                        to={`/domains/${getDomainSlug(memberDomain)}`}
                        onClick={() => setIsOpen(false)}
                        style={({ isActive }) => ({
                          fontSize: '0.85rem',
                          padding: '6px 8px',
                          borderRadius: '4px',
                          color: isActive ? 'var(--google-blue)' : 'var(--text-secondary)',
                          fontWeight: isActive ? 600 : 500,
                          textDecoration: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                        })}
                      >
                        <span
                          style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            backgroundColor: memberDomain.color,
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
          to={isAdmin ? '/domains' : memberDomain ? `/domains/${getDomainSlug(memberDomain)}` : '/domains'}
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
