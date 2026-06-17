import { useState, useEffect } from 'react';
import { Users, UserPlus, Trash2, Mail } from 'lucide-react';
import familyApi from '../../api/familyApi';

export default function FamilyPage() {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [inviting, setInviting] = useState(false);
  const [msg, setMsg] = useState('');

  const load = async () => {
    try {
      const res = await familyApi.getFamilyMembers() as any;
      if (res?.success) setMembers(res.data.members || []);
    } catch { setMembers([]); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setInviting(true);
    const res = await familyApi.inviteMember(email) as any;
    setInviting(false);
    if (res?.success) { setMsg('Lời mời đã được gửi thành công!'); setEmail(''); setTimeout(() => setMsg(''), 3000); }
  };

  const handleRemove = async (id: string) => {
    if (!confirm('Xóa thành viên này?')) return;
    await familyApi.removeMember(id);
    load();
  };

  return (
    <div>
      <div className="page-header">
        <h1>👨‍👩‍👧 Quản lý gia đình</h1>
        <p>Chia sẻ việc chăm sóc thú cưng với các thành viên trong gia đình</p>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 340px', gap:24, alignItems:'start' }}>
        {/* Members */}
        <div className="card">
          <div className="section-title" style={{ marginBottom:16 }}>
            <Users size={16} style={{ marginRight:6, display:'inline' }}/> Thành viên ({members.length})
          </div>
          {loading ? (
            <div className="page-loader"><div className="spinner spinner-lg"/></div>
          ) : members.length === 0 ? (
            <div className="empty-state" style={{ padding:'40px 0' }}>
              <Users size={48}/>
              <h3>Chưa có thành viên nào</h3>
              <p>Mời thành viên gia đình để cùng chăm sóc thú cưng</p>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:2 }}>
              {members.map(m => (
                <div key={m._id} style={{ display:'flex', alignItems:'center', gap:14, padding:'14px', borderBottom:'1px solid var(--border)' }}>
                  <div className="avatar avatar-md" style={{ fontSize:18, background:'var(--primary-bg)' }}>
                    {m.avatar_url ? <img src={m.avatar_url} alt={m.name} style={{width:'100%',height:'100%',objectFit:'cover',borderRadius:'50%'}}/> : '👤'}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:700, fontSize:14 }}>{m.profile?.full_name || m.email}</div>
                    <div style={{ fontSize:12, color:'var(--text-3)' }}>{m.email}</div>
                  </div>
                  <span className={`chip ${m.role==='OWNER'?'chip-red':'chip-blue'}`}>{m.role==='OWNER'?'Chủ sở hữu':'Thành viên'}</span>
                  {m.role !== 'OWNER' && (
                    <button className="icon-btn" onClick={() => handleRemove(m._id)}><Trash2 size={15} style={{color:'var(--primary)'}}/></button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Invite */}
        <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
          <div className="card">
            <div className="section-title" style={{ marginBottom:4 }}>
              <UserPlus size={16} style={{ marginRight:6, display:'inline' }}/>Mời thành viên
            </div>
            <p style={{ fontSize:13, color:'var(--text-3)', marginBottom:16 }}>Nhập email để gửi lời mời tham gia nhóm</p>
            {msg && <div style={{ background:'#E8F8EF', border:'1px solid #B2DFDB', borderRadius:10, padding:'10px 14px', marginBottom:12, fontSize:13, color:'var(--success)' }}>{msg}</div>}
            <form onSubmit={handleInvite}>
              <div className="form-group">
                <label className="form-label">Email</label>
                <div className="input-group">
                  <Mail size={16} className="input-icon"/>
                  <input className="form-control" type="email" placeholder="email@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width:'100%' }} disabled={inviting}>
                {inviting ? <><div className="spinner"/>Đang gửi...</> : <><UserPlus size={15}/>Gửi lời mời</>}
              </button>
            </form>
          </div>

          <div className="card" style={{ background:'var(--primary-bg)', border:'1px solid var(--primary-border)' }}>
            <div style={{ fontSize:20, marginBottom:8 }}>💡</div>
            <div style={{ fontWeight:700, fontSize:14, marginBottom:6 }}>Tính năng gia đình</div>
            <ul style={{ fontSize:13, color:'var(--text-2)', listStyleType:'none', display:'flex', flexDirection:'column', gap:6 }}>
              <li>✅ Chia sẻ thú cưng với gia đình</li>
              <li>✅ Cùng nhau theo dõi nhiệm vụ</li>
              <li>✅ Thông báo nhắc nhở chăm sóc</li>
              <li>✅ Lịch sử hoạt động chung</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
