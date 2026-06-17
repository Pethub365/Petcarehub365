import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
  Home, PawPrint, CheckSquare, Heart, Trophy, CreditCard,
  Bell, Settings, Users, Star, Menu, X, LogOut, ChevronRight, BarChart2
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';

const navItems = [
  { to: '/', icon: Home, label: 'Trang chủ', end: true },
  { to: '/pets', icon: PawPrint, label: 'Thú cưng' },
  { to: '/missions', icon: CheckSquare, label: 'Nhiệm vụ' },
  { to: '/health', icon: Heart, label: 'Sức khỏe' },
  { to: '/ranks', icon: Trophy, label: 'Bảng xếp hạng' },
  { to: '/settings/subscription', icon: CreditCard, label: 'Mua gói' },
  { to: '/achievements', icon: Star, label: 'Thành tích' },
  { to: '/family', icon: Users, label: 'Gia đình' },
];

export default function AppShell() {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const emailLower = user?.email?.toLowerCase() || '';
  const isOnlyAdmin = emailLower.includes('admin');

  const dynamicNavItems = isOnlyAdmin
    ? [ { to: '/admin/stats', icon: BarChart2, label: 'Thống kê Admin' } ]
    : navItems;

  const displayName = user?.profile?.full_name || user?.email?.split('@')[0] || 'User';
  const avatarUrl = user?.profile?.avatar_url;
  const initial = displayName.charAt(0).toUpperCase();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="app-shell">
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          style={{ position:'fixed',inset:0,background:'rgba(0,0,0,.4)',zIndex:99 }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div className="paw-icon">🐾</div>
          <span>PetCare Hub</span>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">Menu chính</div>
          {dynamicNavItems.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}

          {!isOnlyAdmin && (
            <>
              <div className="nav-section-label" style={{ marginTop: 8 }}>Tài khoản</div>
              <NavLink
                to="/notifications"
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <Bell size={18} />
                Thông báo
                {unreadCount > 0 && <span className="nav-badge">{unreadCount}</span>}
              </NavLink>
              <NavLink
                to="/settings"
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <Settings size={18} />
                Cài đặt
              </NavLink>
            </>
          )}
        </nav>

        <div className="sidebar-footer">
          <div className="dropdown">
            <div className="user-mini" onClick={() => setShowUserMenu(!showUserMenu)}>
              <div className="user-mini-avatar">
                {avatarUrl ? <img src={avatarUrl} alt={displayName} /> : initial}
              </div>
              <div className="user-mini-info">
                <div className="user-mini-name">{displayName}</div>
                <div className="user-mini-role">{user?.subscription_plan || 'FREE'}</div>
              </div>
              <ChevronRight size={14} style={{ color: 'var(--text-3)', flexShrink: 0 }} />
            </div>
            {showUserMenu && (
              <div className="dropdown-menu" style={{ bottom: '100%', top: 'auto', marginBottom: 6 }}>
                {!isOnlyAdmin && (
                  <div className="dropdown-item" onClick={() => { navigate('/settings/profile'); setShowUserMenu(false); }}>
                    <Settings size={15} /> Chỉnh sửa hồ sơ
                  </div>
                )}
                {!isOnlyAdmin && <div className="dropdown-sep" />}
                <div className="dropdown-item danger" onClick={handleLogout}>
                  <LogOut size={15} /> Đăng xuất
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="main-content">
        <header className="topbar">
          <button className="icon-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
          <div className="topbar-title" />
          <div className="topbar-actions">
            {!isOnlyAdmin && (
              <button className="icon-btn" onClick={() => navigate('/notifications')}>
                <Bell size={18} />
                {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
              </button>
            )}
            <div className="avatar avatar-sm" style={{ cursor: isOnlyAdmin ? 'default' : 'pointer' }} onClick={() => !isOnlyAdmin && navigate('/settings/profile')}>
              {avatarUrl ? <img src={avatarUrl} alt={displayName} /> : initial}
            </div>
          </div>
        </header>

        <main className="page-body">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
