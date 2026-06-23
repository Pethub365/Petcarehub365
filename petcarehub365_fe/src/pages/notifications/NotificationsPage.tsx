import { useState, useEffect } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';

export default function NotificationsPage() {
  const { notifications, unreadCount, fetchNotifications, markAllRead, markAsRead } = useNotifications();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => { await fetchNotifications(); setLoading(false); };
    load();
  }, []);

  const ICONS: Record<string, string> = { QUEST:'✅', HEALTH:'❤️', ACHIEVEMENT:'🏆', SYSTEM:'🔔', SHOP:'🛒', VACCINE_REMINDER:'💉', SUBSCRIPTION_EXPIRING:'⏰', SUBSCRIPTION:'🌟' };

  return (
    <div>
      <style>{`
        .notification-item {
          cursor: pointer;
          transition: background 0.2s;
        }
        .notification-item:hover {
          background-color: var(--surface2) !important;
        }
      `}</style>

      <div className="page-header" style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
        <div>
          <h1>Thông báo</h1>
          <p>{unreadCount} thông báo chưa đọc</p>
        </div>
        {unreadCount > 0 && (
          <button className="btn btn-outline btn-sm" onClick={markAllRead}>
            <CheckCheck size={15}/> Đánh dấu tất cả đã đọc
          </button>
        )}
      </div>

      <div className="card">
        {loading ? (
          <div className="page-loader"><div className="spinner spinner-lg"/></div>
        ) : notifications.length === 0 ? (
          <div className="empty-state" style={{ padding:'60px 0' }}>
            <Bell size={48}/>
            <h3>Chưa có thông báo nào</h3>
            <p>Thông báo mới sẽ xuất hiện tại đây</p>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column' }}>
            {notifications.map(n => {
              const read = !!(n.isRead || n.is_read);
              return (
                <div key={n._id} 
                  className="notification-item"
                  onClick={() => !read && markAsRead(n._id)}
                  style={{
                    display:'flex', gap:14, padding:'16px',
                    borderBottom:'1px solid var(--border)',
                    background: read ? 'transparent' : 'var(--primary-bg)',
                  }}
                >
                  <div style={{ width:44, height:44, borderRadius:12, background: read?'var(--surface2)':'#FFE0E0', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0 }}>
                    {ICONS[n.type] || '🔔'}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight: read ? 500 : 700, fontSize:14, color:'var(--text)', marginBottom:3 }}>{n.title || n.message}</div>
                    {n.body && <div style={{ fontSize:13, color:'var(--text-3)' }}>{n.body}</div>}
                    <div style={{ fontSize:11, color:'var(--text-3)', marginTop:6, fontWeight:500 }}>
                      {new Date(n.created_at || n.createdAt).toLocaleString('vi-VN')}
                    </div>
                  </div>
                  {!read && (
                    <div style={{ width:8, height:8, borderRadius:'50%', background:'var(--primary)', flexShrink:0, marginTop:6 }} />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
