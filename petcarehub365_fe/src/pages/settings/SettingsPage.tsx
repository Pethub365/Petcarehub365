import { useNavigate } from 'react-router-dom';
import { User, Lock, Bell, CreditCard, Users, LogOut, ChevronRight, Star, Crown } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import subscriptionApi from '../../api/subscriptionApi';
import { useState, useEffect } from 'react';

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState<any>(null);

  useEffect(() => {
    subscriptionApi.getMySubscription().then((res: any) => {
      if (res?.success) setSubscription(res.data.subscription);
    }).catch(() => {});
  }, []);

  const handleLogout = async () => {
    if (!confirm('Bạn có chắc muốn đăng xuất?')) return;
    await logout();
    navigate('/login');
  };

  const displayName = user?.profile?.full_name || user?.email?.split('@')[0] || 'User';
  const avatarUrl = user?.profile?.avatar_url;
  const initial = displayName.charAt(0).toUpperCase();
  const plan = subscription?.plan_type || user?.subscription_plan || 'FREE';

  interface MenuItem {
    icon: any;
    label: string;
    to: string;
    color: string;
    action?: () => void;
  }

  const MENU_GROUPS: { label: string; items: MenuItem[] }[] = [
    {
      label: 'Tài khoản',
      items: [
        { icon: User, label: 'Chỉnh sửa hồ sơ', to: '/settings/profile', color: 'var(--secondary)' },
        { icon: Lock, label: 'Đổi mật khẩu', to: '/settings/password', color: 'var(--purple)' },
      ]
    },
    {
      label: 'Ứng dụng',
      items: [
        { icon: Bell, label: 'Thông báo', to: '/notifications', color: 'var(--warning)' },
        { icon: Users, label: 'Quản lý gia đình', to: '/family', color: 'var(--success)' },
        { icon: CreditCard, label: 'Gói đăng ký', to: '/settings/subscription', color: 'var(--gold)' },
      ]
    }
  ];

  return (
    <div style={{ maxWidth: 540, margin: '0 auto', paddingBottom: 40 }}>
      {/* Title */}
      <div className="page-header" style={{ textAlign: 'center', marginBottom: 20 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text)', margin: 0 }}>Cài đặt</h1>
        <p style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 4 }}>Quản lý tài khoản và tùy chỉnh ứng dụng</p>
      </div>

      {/* Main Single Card Form */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', borderRadius: 24, background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
        
        {/* Profile Header Block */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '24px', borderBottom: '1px solid var(--border)', background: 'var(--surface2)' }}>
          <div className="avatar avatar-lg" style={{ fontSize: 24, background: 'var(--surface)', flexShrink: 0, width: 56, height: 56, border: '2px solid var(--primary-border)' }}>
            {avatarUrl ? <img src={avatarUrl} alt={displayName} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} /> : initial}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{displayName}</div>
            <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</div>
            <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
              <span className={`chip ${plan === 'FREE' ? 'chip-gray' : plan === 'PREMIUM' ? 'chip-blue' : 'chip-yellow'}`} style={{ fontSize: 9.5, padding: '1px 6px', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                {plan === 'FREE' && 'FREE'}
                {plan === 'PREMIUM' && <><Star size={10} fill="var(--secondary)" color="transparent" /> PREMIUM</>}
                {plan === 'VIP' && <><Crown size={10} fill="var(--gold)" color="transparent" /> VIP</>}
              </span>
              {user?.profile?.full_name && <span className="chip chip-green" style={{ fontSize: 9.5, padding: '1px 6px' }}>✓ Xác minh</span>}
            </div>
          </div>
        </div>

        {/* Subscription banner if FREE */}
        {plan === 'FREE' && (
          <div style={{ background: 'linear-gradient(135deg,#FFD700,#FF8C00)', color: '#fff', display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Crown size={28} color="#fff" fill="#fff" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 1 }}>Nâng cấp lên VIP!</div>
              <div style={{ fontSize: 11, opacity: .9, lineHeight: '14px' }}>Mở khóa tính năng AI cao cấp, không giới hạn thú cưng.</div>
            </div>
            <button
              onClick={() => navigate('/settings/subscription')}
              style={{ background: '#fff', color: '#FF8C00', fontWeight: 700, fontSize: 12, padding: '6px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap' }}
            >
              Nâng cấp ngay →
            </button>
          </div>
        )}

        {/* Menu Groups */}
        {MENU_GROUPS.map((group) => (
          <div key={group.label} style={{ borderBottom: '1px solid var(--border)' }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '.08em', color: 'var(--text-3)', textTransform: 'uppercase', padding: '12px 20px 6px', background: 'var(--surface2)', borderBottom: '1px solid var(--border)' }}>{group.label}</div>
            <div>
              {group.items.map((item, idx) => (
                <button key={item.label}
                  onClick={() => item.action ? item.action() : navigate(item.to)}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '12px 20px', border: 'none', background: 'none', cursor: 'pointer', borderBottom: idx === group.items.length - 1 ? 'none' : '1px solid var(--border)', textAlign: 'left', borderRadius: 0, transition: 'background 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface2)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
                >
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: `${item.color}12`, display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <item.icon size={16} color={item.color} />
                  </div>
                  <span style={{ flex: 1, fontWeight: 600, fontSize: 14, color: 'var(--text)' }}>{item.label}</span>
                  <ChevronRight size={14} style={{ color: 'var(--text-4)' }} />
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* Danger zone / Logout at the very bottom */}
        <div>
          <button onClick={handleLogout}
            style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '14px 20px', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left', transition: 'background 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--primary-bg)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
          >
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--primary-bg)', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <LogOut size={16} color="var(--primary)" />
            </div>
            <span style={{ flex: 1, fontWeight: 600, fontSize: 14, color: 'var(--primary)' }}>Đăng xuất</span>
            <ChevronRight size={14} style={{ color: 'var(--primary)' }} />
          </button>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: 32, fontSize: 12, color: 'var(--text-3)' }}>
        PetCare Hub v1.0.0 • Phiên bản web
      </div>
    </div>
  );
}
