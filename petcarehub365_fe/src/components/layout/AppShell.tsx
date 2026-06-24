import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  Home, PawPrint, CheckSquare, Heart, Trophy, CreditCard,
  Bell, Settings, Users, Star, LogOut, ChevronRight,
  BarChart2, Menu, X, Zap
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import FeedbackModal from './FeedbackModal';

const navItems = [
  { to: '/',                    icon: Home,        label: 'Trang chủ',     end: true },
  { to: '/pets',                icon: PawPrint,    label: 'Thú cưng' },
  { to: '/missions',            icon: CheckSquare, label: 'Nhiệm vụ' },
  { to: '/health',              icon: Heart,       label: 'Sức khỏe' },
  { to: '/ranks',               icon: Trophy,      label: 'Bảng xếp hạng' },
  { to: '/achievements',        icon: Star,        label: 'Thành tích' },
  { to: '/family',              icon: Users,       label: 'Gia đình' },
];

const accountItems = [
  { to: '/settings/subscription', icon: CreditCard, label: 'Nâng cấp VIP' },
  { to: '/notifications',         icon: Bell,       label: 'Thông báo' },
  { to: '/settings',              icon: Settings,   label: 'Cài đặt' },
];

export default function AppShell() {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  const emailLower = user?.email?.toLowerCase() || '';
  const isOnlyAdmin = emailLower.includes('admin');

  const dynamicNavItems = isOnlyAdmin
    ? [{ to: '/admin/stats', icon: BarChart2, label: 'Thống kê Admin', end: false }]
    : navItems;

  const displayName = user?.profile?.full_name || user?.email?.split('@')[0] || 'User';
  const avatarUrl   = user?.profile?.avatar_url;
  const initial     = displayName.charAt(0).toUpperCase();
  const plan        = user?.subscription_plan || 'FREE';

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  useEffect(() => {
    if (isOnlyAdmin) return;

    const isSubmitted = localStorage.getItem('feedback_submitted');
    const isOptedOutSession = sessionStorage.getItem('feedback_opt_out_session');
    const isSnoozedSession = sessionStorage.getItem('feedback_snoozed_session');

    if (isSubmitted || isOptedOutSession || isSnoozedSession) {
      return;
    }

    const timer = setTimeout(() => {
      setShowFeedbackModal(true);
    }, 60000); // 1 minute

    return () => clearTimeout(timer);
  }, [isOnlyAdmin]);

  return (
    <div className="app-shell">
      {/* ── Mobile overlay ── */}
      {sidebarOpen && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,.45)', zIndex: 99 }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ════════════════════════════════
          SIDEBAR
      ════════════════════════════════ */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>

        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <PawPrint size={18} strokeWidth={2.5} />
          </div>
          <span className="sidebar-logo-text">PetCare Hub</span>
          <button
            style={{ marginLeft: 'auto', display: 'none' }}
            className="icon-btn"
            onClick={() => setSidebarOpen(false)}
            id="sidebar-close-btn"
          >
            <X size={16} />
          </button>
        </div>

        {/* Navigation */}
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
              <Icon size={17} strokeWidth={1.8} />
              {label}
            </NavLink>
          ))}

          {!isOnlyAdmin && (
            <>
              <div className="nav-section-label" style={{ marginTop: 10 }}>Tài khoản</div>
              {accountItems.map(({ to, icon: Icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon size={17} strokeWidth={1.8} />
                  {label}
                  {to === '/notifications' && unreadCount > 0 && (
                    <span className="nav-badge">{unreadCount}</span>
                  )}
                </NavLink>
              ))}
            </>
          )}
        </nav>

        {/* User footer */}
        <div className="sidebar-footer">
          <div className="dropdown">
            <div className="user-mini" onClick={() => setShowUserMenu(!showUserMenu)}>
              <div className="user-mini-avatar">
                {avatarUrl ? <img src={avatarUrl} alt={displayName} /> : initial}
              </div>
              <div className="user-mini-info">
                <div className="user-mini-name">{displayName}</div>
                <div className="user-mini-role">
                  {plan !== 'FREE' && (
                    <span className="user-plan-badge"><Zap size={8} style={{ display: 'inline' }} /> {plan}</span>
                  )}
                  {plan === 'FREE' && 'Gói miễn phí'}
                </div>
              </div>
              <ChevronRight size={14} style={{ color: 'var(--text-4)', flexShrink: 0, transition: 'transform .2s', transform: showUserMenu ? 'rotate(90deg)' : 'none' }} />
            </div>

            {showUserMenu && (
              <div className="dropdown-menu" style={{ bottom: '100%', top: 'auto', marginBottom: 6 }}>
                {!isOnlyAdmin && (
                  <div
                    className="dropdown-item"
                    onClick={() => { navigate('/settings/profile'); setShowUserMenu(false); }}
                  >
                    <Settings size={14} /> Chỉnh sửa hồ sơ
                  </div>
                )}
                {!isOnlyAdmin && <div className="dropdown-sep" />}
                <div className="dropdown-item danger" onClick={handleLogout}>
                  <LogOut size={14} /> Đăng xuất
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* ════════════════════════════════
          MAIN CONTENT
      ════════════════════════════════ */}
      <div className="main-content">
        {/* Topbar */}
        <header className="topbar">
          {/* Mobile hamburger */}
          <button
            className="icon-btn"
            style={{ display: 'none' }}
            id="hamburger-btn"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={18} />
          </button>

          <div className="topbar-title" />

          <div className="topbar-actions">
            {!isOnlyAdmin && (
              <button className="icon-btn" onClick={() => navigate('/notifications')} title="Thông báo">
                <Bell size={18} strokeWidth={1.8} />
                {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
              </button>
            )}
            <div
              className="avatar avatar-sm"
              style={{
                cursor: isOnlyAdmin ? 'default' : 'pointer',
                border: '2px solid var(--primary-border)',
                transition: 'transform .2s var(--spring)',
              }}
              onClick={() => !isOnlyAdmin && navigate('/settings/profile')}
              onMouseEnter={e => { if (!isOnlyAdmin) (e.currentTarget as HTMLElement).style.transform = 'scale(1.08)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; }}
            >
              {avatarUrl ? <img src={avatarUrl} alt={displayName} /> : initial}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="page-body">
          <Outlet />
        </main>
      </div>

      <style>{`
        @media (max-width: 768px) {
          #hamburger-btn { display: flex !important; }
          #sidebar-close-btn { display: flex !important; }
        }
      `}</style>

      {showFeedbackModal && (
        <FeedbackModal onClose={() => setShowFeedbackModal(false)} />
      )}
    </div>
  );
}
