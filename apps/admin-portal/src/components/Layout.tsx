import { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProject } from '../context/ProjectContext';
import { apiFetch } from '../api';

const navItems = [
  { section: 'Overview', items: [
    { path: '/', icon: '📊', label: 'Dashboard' },
  ]},
  { section: 'Management', items: [
    { path: '/farmers', icon: '👨‍🌾', label: 'Farmer Registry' },
    { path: '/trees', icon: '🌳', label: 'Tree Inventory' },
    { path: '/saplings', icon: '🌱', label: 'Sapling Demand' },
    { path: '/activities', icon: '📋', label: 'Activities' },
  ]},
  { section: 'LCA Engine', items: [
    { path: '/lca', icon: '📈', label: 'LCA Analysis' },
  ]},
  { section: 'Verification', items: [
    { path: '/reports', icon: '📄', label: 'Reports' },
    { path: '/audit', icon: '🔍', label: 'VVB Audit Portal' },
  ]},
];

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/farmers': 'Farmer Registry',
  '/plots': 'Geospatial Plot Hub',
  '/trees': 'Tree Inventory',
  '/saplings': 'Sapling Demand',
  '/activities': 'Activity Monitor',
  '/baseline': 'Baseline Configuration',
  '/lca': 'LCA Analysis',
  '/reports': 'Report Generator',
  '/audit': 'VVB Audit Portal',
};

export default function Layout() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const basePath = '/' + location.pathname.split('/').filter(Boolean)[0] || '/';
  const currentTitle = pageTitles[basePath] || pageTitles[location.pathname] || 'DMRV';

  const { projects, activeProjectId, setActiveProjectId, isLoading } = useProject();
  const [hasBaselines, setHasBaselines] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showProfileMenu && !(event.target as Element).closest('.topbar-right')) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProfileMenu]);

  useEffect(() => {
    if (!activeProjectId) {
      setHasBaselines(false);
      return;
    }

    apiFetch<{ data: any[] }>('/plots')
      .then(res => {
        setHasBaselines(res.data.length > 0);
      })
      .catch(() => setHasBaselines(false));
  }, [activeProjectId]);

  const activeProject = projects.find(p => p._id === activeProjectId);

  // RBAC Navigation Filtering
  const filteredNavItems = navItems.map(section => {
    let items = section.items;

    if (user?.role === 'operator') {
      if (['LCA Engine', 'Verification'].includes(section.section)) {
        items = [];
      }
    }

    if (user?.role === 'auditor') {
      if (['Management', 'LCA Engine'].includes(section.section)) {
        items = [];
      }
    }

    return { ...section, items };
  }).filter(section => section.items.length > 0);

  const visibleNavItems = activeProjectId ? filteredNavItems : [];

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">🌿</div>
          <div>
            <div className="sidebar-logo-text">AgroForestry</div>
            <div className="sidebar-logo-sub">DMRV Platform</div>
          </div>
        </div>
        <nav className="sidebar-nav">
          <div>
            <div className="sidebar-section-label">General</div>
            {user?.role === 'super_admin' && (
              <NavLink to="/launchpad" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <span className="sidebar-link-icon">🚀</span>
                Project Launchpad
              </NavLink>
            )}
            <NavLink to="/" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} end>
              <span className="sidebar-link-icon">📊</span>
              Dashboard
            </NavLink>
          </div>
          {visibleNavItems.map(section => {
            if (section.section === 'Overview') return null;
            if (section.section === 'LCA Engine' && (!activeProjectId || !hasBaselines)) return null;

            return (
              <div key={section.section}>
                <div className="sidebar-section-label">{section.section}</div>
                {section.items.map(item => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === '/'}
                    className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                  >
                    <span className="sidebar-link-icon">{item.icon}</span>
                    {item.label}
                  </NavLink>
                ))}
              </div>
            );
          })}
          {user?.role === 'super_admin' && activeProjectId && (
            <div style={{ marginTop: 'auto', padding: '16px 12px' }}>
              <NavLink to="/launchpad" className="sidebar-link" style={{ background: 'var(--bg-tertiary)', border: '1px dashed var(--border-default)' }}>
                <span className="sidebar-link-icon">➕</span>
                Create New Project
              </NavLink>
            </div>
          )}
        </nav>
        <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '11px', color: 'var(--color-primary-500)', fontWeight: 600 }}>
            v1.1.0 — Project Edition
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="main-content">
        <header className="topbar">
          <div className="topbar-left" style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <h1 className="topbar-title">{currentTitle}</h1>
            
            {activeProjectId && !isLoading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--color-primary-50)', padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--color-primary-100)' }}>
                <span style={{ fontSize: '12px', color: 'var(--color-primary-700)', fontWeight: 600 }}>Workspace:</span>
                <select
                  disabled={user?.role !== 'super_admin'}
                  style={{
                    backgroundColor: 'transparent',
                    color: 'var(--color-primary-700)',
                    fontSize: '14px',
                    fontWeight: 500,
                    outline: 'none',
                    border: 'none',
                    cursor: user?.role === 'super_admin' ? 'pointer' : 'default',
                    appearance: user?.role === 'super_admin' ? 'auto' : 'none',
                  }}
                  value={activeProjectId}
                  onChange={(e) => {
                    setActiveProjectId(e.target.value);
                    window.location.reload();
                  }}
                >
                  {projects.map((p) => (
                    <option key={p._id} value={p._id}>{p.name}</option>
                  ))}
                </select>
              </div>
            )}
            
            {activeProject && (
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                {activeProject.region}
              </div>
            )}
          </div>
          <div className="topbar-right">
            {!activeProjectId && (
              <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-muted)', marginRight: 16 }}>
                Currently in Global View
              </div>
            )}
            <div className="topbar-search-wrapper">
              <span className="topbar-search-icon">🔎</span>
              <input
                className="topbar-search"
                placeholder="Search farmers, plots, trees..."
                type="text"
                disabled={!activeProjectId}
              />
            </div>
            <div className="topbar-avatar-container">
              <div 
                className={`topbar-avatar ${showProfileMenu ? 'active' : ''}`} 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
              >
                {user?.firstName?.[0] || 'A'}
              </div>
              
              {showProfileMenu && (
                <div className="profile-dropdown">
                  <div className="profile-dropdown-header">
                    <div className="profile-name">{user?.firstName} {user?.lastName}</div>
                    <div className="profile-email">{user?.email}</div>
                  </div>
                  <div className="profile-dropdown-divider" />
                  <button className="profile-dropdown-item logout" onClick={logout}>
                    <span className="profile-dropdown-icon">🚪</span>
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
