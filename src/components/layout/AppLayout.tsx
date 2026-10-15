import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Compass,
  PackageOpen,
  Users,
  BookOpen,
  Receipt,
  Percent,
  FileBarChart,
  Settings,
  Menu,
  X,
  LogOut,
  Calendar,
  ShieldCheck,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
  PanelLeft
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCampaign } from '../../context/CampaignContext';

export const AppLayout: React.FC = () => {
  const { user, logout, isSuperAdmin } = useAuth();
  const { campaigns, activeCampaign, activeCampaignId, setActiveCampaignId } = useCampaign();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('zcm_sidebar_collapsed') === 'true';
  });
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleDesktopCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('zcm_sidebar_collapsed', String(next));
      return next;
    });
  };

  const handleHeaderToggle = () => {
    // If on mobile/tablet view (window width <= 768px), toggle drawer
    if (window.innerWidth <= 768) {
      setMobileMenuOpen(!mobileMenuOpen);
    } else {
      // On desktop, toggle collapse
      toggleDesktopCollapse();
    }
  };

  const navItems = [
    { label: 'Overview', to: '/', icon: LayoutDashboard },
    { label: 'Trips', to: '/trips', icon: Compass },
    { label: 'Calendar Inventory', to: '/inventory', icon: PackageOpen },
    { label: 'Students', to: '/students', icon: Users },
    { label: 'Receipt Books', to: '/receipt-books', icon: BookOpen },
    { label: 'Expenses', to: '/expenses', icon: Receipt },
    { label: 'Commission', to: '/commission', icon: Percent },
    { label: 'Reports', to: '/reports', icon: FileBarChart },
    { label: 'Settings', to: '/settings', icon: Settings },
  ];

  return (
    <div className="zcm-app">
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          className="zcm-backdrop"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`zcm-sidebar ${isCollapsed ? 'zcm-sidebar--collapsed' : ''} ${
          mobileMenuOpen ? 'zcm-sidebar--open' : ''
        }`}
      >
        <div className="zcm-sidebar__brand">
          <div className="zcm-brand-left">
            <div className="zcm-brand-logo">Z</div>
            <div className="zcm-brand-text">
              <div className="zcm-brand-title">Zainussunna</div>
              <div className="zcm-brand-sub">Calendar Manager</div>
            </div>
          </div>
          <button
            type="button"
            className="zcm-sidebar-collapse-btn"
            onClick={toggleDesktopCollapse}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label="Toggle sidebar collapse"
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        <nav className="zcm-sidebar__nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                title={item.label}
                className={({ isActive }) =>
                  `zcm-sidebar__item ${isActive ? 'zcm-sidebar__item--active' : ''}`
                }
                onClick={() => setMobileMenuOpen(false)}
              >
                <Icon size={17} style={{ flexShrink: 0 }} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="zcm-sidebar__footer">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', overflow: 'hidden' }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: '#334155',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#F8FAFC',
                fontSize: '0.75rem',
                fontWeight: 600,
                flexShrink: 0,
              }}
              title={user?.display_name}
            >
              {user?.display_name?.charAt(0) || 'U'}
            </div>
            <div className="zcm-user-details" style={{ overflow: 'hidden' }}>
              <div
                style={{
                  fontSize: '0.78125rem',
                  color: '#F8FAFC',
                  fontWeight: 600,
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                }}
              >
                {user?.display_name}
              </div>
              <div style={{ fontSize: '0.6875rem', color: '#94A3B8' }}>
                {user?.role === 'super_admin' ? 'Super Admin' : 'Admin'}
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Log out"
            style={{
              color: '#94A3B8',
              padding: '0.35rem',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <LogOut size={15} />
          </button>
        </div>
      </aside>

      {/* Main Content Shell */}
      <div className="zcm-main-shell">
        <header className="zcm-header">
          <div className="zcm-header__left">
            <button
              className="zcm-sidebar-toggle"
              onClick={handleHeaderToggle}
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              aria-label="Toggle navigation"
            >
              {isCollapsed ? <PanelLeft size={17} /> : <PanelLeftClose size={17} />}
            </button>

            {/* Active Campaign Selector */}
            <div className="zcm-campaign-badge">
              <Calendar size={14} style={{ color: '#10B981', flexShrink: 0 }} />
              <span className="zcm-campaign-label">Campaign:</span>
              <select
                value={activeCampaignId || ''}
                onChange={(e) => setActiveCampaignId(Number(e.target.value))}
                aria-label="Select active campaign"
              >
                {campaigns.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.year}) {c.status === 'closed' ? '[CLOSED]' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="zcm-header__right">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78125rem' }}>
              {isSuperAdmin ? (
                <span className="zcm-badge zcm-badge--success" title="Full application permissions">
                  <ShieldCheck size={11} />
                  Super Administrator
                </span>
              ) : (
                <span className="zcm-badge zcm-badge--neutral" title="Operational staff permissions">
                  <UserCheck size={11} />
                  Administrator
                </span>
              )}
            </div>
          </div>
        </header>

        <main className="zcm-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
