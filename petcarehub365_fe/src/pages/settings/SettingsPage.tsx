import { useNavigate } from 'react-router-dom';
import { User, Lock, Bell, CreditCard, Users, LogOut, ChevronRight } from 'lucide-react';
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
      label:'Tài khoản',
      items:[
        { icon: User, label:'Chỉnh sửa hồ sơ', to:'/settings/profile', color:'var(--secondary)' },
        { icon: Lock, label:'Đổi mật khẩu', to:'/settings/password', color:'var(--purple)' },
      ]
    },
    {
      label:'Ứng dụng',
      items:[
        { icon: Bell, label:'Thông báo', to:'/notifications', color:'var(--warning)' },
        { icon: Users, label:'Quản lý gia đình', to:'/family', color:'var(--success)' },
        { icon: CreditCard, label:'Gói đăng ký', to:'/settings/subscription', color:'var(--gold)' },
      ]
    }
  ];

  return (
    <div style={{ maxWidth:680, margin:'0 auto' }}>
      <div className="page-header">
        <h1>Cài đặt</h1>
        <p>Quản lý tài khoản và tùy chỉnh ứng dụng</p>
      </div>

      {/* Profile card */}
      <div className="card" style={{ display:'flex', alignItems:'center', gap:20, marginBottom:24 }}>
        <div className="avatar avatar-xl" style={{ fontSize:36, background:'var(--primary-bg)' }}>
          {avatarUrl ? <img src={avatarUrl} alt={displayName} style={{width:'100%',height:'100%',objectFit:'cover',borderRadius:'50%'}}/> : initial}
        </div>
        <div style={{ flex:1 }}>
          <div style={{ fontWeight:800, fontSize:20 }}>{displayName}</div>
          <div style={{ fontSize:13, color:'var(--text-3)', marginTop:2 }}>{user?.email}</div>
          <div style={{ display:'flex', gap:8, marginTop:10 }}>
            <span className={`chip ${plan==='FREE'?'chip-gray':plan==='PREMIUM'?'chip-blue':'chip-yellow'}`}>
              {plan === 'FREE' ? '🆓 FREE' : plan === 'PREMIUM' ? '⭐ PREMIUM' : '👑 VIP'}
            </span>
            {user?.profile?.full_name && <span className="chip chip-green">✓ Đã xác minh</span>}
          </div>
        </div>
        <button className="btn btn-outline btn-sm" onClick={() => navigate('/settings/profile')}>
          Chỉnh sửa
        </button>
      </div>

      {/* Subscription banner */}
      {plan === 'FREE' && (
        <div className="card" style={{ background:'linear-gradient(135deg,#FFD700,#FF8C00)', border:'none', marginBottom:24, color:'#fff', display:'flex', alignItems:'center', gap:16 }}>
          <div style={{ fontSize:40 }}>👑</div>
          <div style={{ flex:1 }}>
            <div style={{ fontWeight:800, fontSize:16, marginBottom:4 }}>Nâng cấp lên VIP!</div>
            <div style={{ fontSize:13, opacity:.85 }}>Mở khóa tính năng cao cấp, không giới hạn thú cưng và ưu tiên hỗ trợ.</div>
          </div>
          <button 
            onClick={() => navigate('/settings/subscription')}
            style={{ background:'#fff', color:'#FF8C00', fontWeight:700, fontSize:13, padding:'8px 16px', borderRadius:10, border:'none', cursor:'pointer', flexShrink:0, whiteSpace:'nowrap' }}>
            Nâng cấp ngay →
          </button>
        </div>
      )}

      {/* Menu groups */}
      {MENU_GROUPS.map(group => (
        <div key={group.label} className="card" style={{ marginBottom:16 }}>
          <div style={{ fontSize:11, fontWeight:700, letterSpacing:'.08em', color:'var(--text-3)', textTransform:'uppercase', marginBottom:8, padding:'0 4px' }}>{group.label}</div>
          {group.items.map(item => (
            <button key={item.label}
              onClick={() => item.action ? item.action() : navigate(item.to)}
              style={{ display:'flex', alignItems:'center', gap:14, width:'100%', padding:'14px 8px', border:'none', background:'none', cursor:'pointer', borderBottom:'1px solid var(--border)', textAlign:'left', borderRadius:0 }}>
              <div style={{ width:40, height:40, borderRadius:12, background:`${item.color}18`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <item.icon size={18} color={item.color} />
              </div>
              <span style={{ flex:1, fontWeight:600, fontSize:14, color:'var(--text)' }}>{item.label}</span>
              <ChevronRight size={16} style={{ color:'var(--text-3)' }}/>
            </button>
          ))}
        </div>
      ))}

      {/* Danger zone */}
      <div className="card" style={{ borderColor:'var(--primary-border)' }}>
        <div style={{ fontSize:11, fontWeight:700, letterSpacing:'.08em', color:'var(--primary)', textTransform:'uppercase', marginBottom:8, padding:'0 4px' }}>Nguy hiểm</div>
        <button onClick={handleLogout}
          style={{ display:'flex', alignItems:'center', gap:14, width:'100%', padding:'14px 8px', border:'none', background:'none', cursor:'pointer', textAlign:'left' }}>
          <div style={{ width:40, height:40, borderRadius:12, background:'var(--primary-bg)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <LogOut size={18} color="var(--primary)" />
          </div>
          <span style={{ fontWeight:600, fontSize:14, color:'var(--primary)' }}>Đăng xuất</span>
          <ChevronRight size={16} style={{ color:'var(--primary)', marginLeft:'auto' }}/>
        </button>
      </div>

      <div style={{ textAlign:'center', marginTop:24, fontSize:12, color:'var(--text-3)' }}>
        PetCare Hub v1.0.0 • Phiên bản web
      </div>
    </div>
  );
}
