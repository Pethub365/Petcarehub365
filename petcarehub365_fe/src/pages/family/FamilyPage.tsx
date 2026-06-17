import { useState, useEffect } from 'react';
import { Users, UserPlus, Trash2, Mail, Home, ShieldAlert, Check, RefreshCw } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import familyApi from '../../api/familyApi';

export default function FamilyPage() {
  const { user } = useAuth();
  const [familyGroup, setFamilyGroup] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [pendingInvites, setPendingInvites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Invitation Form
  const [email, setEmail] = useState('');
  const [inviting, setInviting] = useState(false);
  const [msg, setMsg] = useState('');

  // Create & Join Forms
  const [groupName, setGroupName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const load = async (isBackground = false) => {
    try {
      if (!isBackground) setLoading(true);
      setErrorMsg('');
      const res = await familyApi.getFamilyGroup() as any;
      if (res?.success && res.data) {
        setFamilyGroup(res.data);
        setMembers(res.data.members || []);
        setPendingInvites([]);
      } else {
        setFamilyGroup(null);
        setMembers([]);
        // Get pending invites for this user
        const inviteRes = await familyApi.getPendingInvitations() as any;
        if (inviteRes?.success) {
          setPendingInvites(inviteRes.data || []);
        }
      }
    } catch (err: any) {
      setFamilyGroup(null);
      setMembers([]);
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const interval = setInterval(() => {
      load(true);
    }, 10000); // Poll every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setInviting(true);
    setErrorMsg('');
    setMsg('');
    try {
      const res = await familyApi.inviteMember(email) as any;
      if (res?.success) {
        setMsg(res.message || 'Lời mời đã được gửi thành công!');
        setEmail('');
        setTimeout(() => setMsg(''), 5000);
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Thành viên đã có nhóm.');
    } finally {
      setInviting(false);
    }
  };

  const handleRemove = async (memberId: string) => {
    if (!confirm('Xóa thành viên này khỏi nhóm gia đình?')) return;
    try {
      const res = await familyApi.removeMember(memberId) as any;
      if (res?.success) {
        await load();
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Không thể xóa thành viên.');
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim()) return;

    const isVip = user?.subscription_plan === 'VIP';
    if (!isVip) {
      setErrorMsg('Chức năng Tạo nhóm Gia đình chỉ dành riêng cho tài khoản gói VIP. Vui lòng nâng cấp gói cước.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg('');
      const res = await familyApi.createFamilyGroup(groupName) as any;
      if (res?.success) {
        setGroupName('');
        await load();
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Có lỗi xảy ra khi tạo nhóm.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleJoinGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim()) return;

    try {
      setSubmitting(true);
      setErrorMsg('');
      const res = await familyApi.joinFamily(inviteCode) as any;
      if (res?.success) {
        setInviteCode('');
        await load();
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Mã mời không đúng hoặc đã hết hạn.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAcceptInvite = async (code: string) => {
    try {
      setSubmitting(true);
      setErrorMsg('');
      const res = await familyApi.joinFamily(code) as any;
      if (res?.success) {
        await load();
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Không thể gia nhập nhóm.');
    } finally {
      setSubmitting(false);
    }
  };

  const isFamilyAdmin = familyGroup?.members?.some(
    (m: any) => m.user_id?._id === user?._id && m.role === 'ADMIN'
  );

  const isVip = user?.subscription_plan === 'VIP';

  if (loading) {
    return (
      <div style={{ padding: 24 }}>
        <div className="page-header">
          <h1>👨‍👩‍👧 Quản lý gia đình</h1>
          <p>Tải thông tin gia đình...</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24 }}>
          <div className="card" style={{ height: 250 }}>
            <div className="skeleton" style={{ width: 150, height: 20, marginBottom: 16 }} />
            <div className="skeleton" style={{ width: '100%', height: 50, marginBottom: 12 }} />
            <div className="skeleton" style={{ width: '100%', height: 50 }} />
          </div>
          <div className="card" style={{ height: 250 }}>
            <div className="skeleton" style={{ width: 100, height: 20, marginBottom: 16 }} />
            <div className="skeleton" style={{ width: '100%', height: 40 }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1>👨‍👩‍👧 Quản lý gia đình {familyGroup && <span style={{ fontSize: 16, color: 'var(--text-3)' }}>({familyGroup.group_name})</span>}</h1>
        <p>Chia sẻ việc chăm sóc thú cưng với các thành viên trong gia đình</p>
      </div>

      {errorMsg && (
        <div style={{ background: '#FFEBEB', border: '1px solid #FFD2D2', borderRadius: 12, padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10, color: 'var(--primary)', fontSize: 14 }}>
          <ShieldAlert size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      {familyGroup ? (
        // ==========================================
        // USER IS ALREADY IN A FAMILY GROUP
        // ==========================================
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'start' }}>
          {/* Members List */}
          <div className="card">
            <div className="section-title" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Users size={18} />
                <span>Thành viên gia đình ({members.length})</span>
              </div>
              <button 
                className="icon-btn" 
                onClick={() => load(false)} 
                title="Tải lại danh sách"
                style={{ padding: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <RefreshCw size={16} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {members.map(m => {
                const memberUser = m.user_id;
                const isMemberAdmin = m.role === 'ADMIN';
                if (!memberUser) return null;
                return (
                  <div key={m._id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
                    <div className="avatar avatar-md" style={{ fontSize: 18, background: 'var(--primary-bg)' }}>
                      {memberUser.profile?.avatar_url ? (
                        <img src={memberUser.profile.avatar_url} alt={memberUser.profile.full_name || memberUser.email} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                      ) : '👤'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{memberUser.profile?.full_name || memberUser.email}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-3)' }}>{memberUser.email}</div>
                    </div>
                    <span className={`chip ${isMemberAdmin ? 'chip-red' : 'chip-blue'}`}>{isMemberAdmin ? 'Chủ sở hữu' : 'Thành viên'}</span>
                    {!isMemberAdmin && isFamilyAdmin && (
                      <button className="icon-btn" onClick={() => handleRemove(memberUser._id)} title="Xóa khỏi gia đình">
                        <Trash2 size={15} style={{ color: 'var(--primary)' }} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Invitation / Right column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {isFamilyAdmin ? (
              <div className="card">
                <div className="section-title" style={{ marginBottom: 4 }}>
                  <UserPlus size={16} style={{ marginRight: 6, display: 'inline' }} /> Mời thành viên
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 16 }}>Nhập email người thân để gửi lời mời tham gia nhóm</p>
                {msg && (
                  <div style={{ background: '#E8F8EF', border: '1px solid #B2DFDB', borderRadius: 10, padding: '10px 14px', marginBottom: 12, fontSize: 13, color: 'var(--success)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Check size={16} />
                    <span>{msg}</span>
                  </div>
                )}
                <form onSubmit={handleInvite}>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <div className="input-group">
                      <Mail size={16} className="input-icon" />
                      <input className="form-control" type="email" placeholder="email@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
                    </div>
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={inviting}>
                    {inviting ? <><div className="spinner" />Đang gửi...</> : <><UserPlus size={15} />Gửi lời mời</>}
                  </button>
                </form>
              </div>
            ) : (
              <div className="card" style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}>
                <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-2)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ShieldAlert size={16} />
                  <span>Quyền hạn thành viên</span>
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 8 }}>
                  Bạn tham gia nhóm với tư cách thành viên. Chỉ có <strong>Chủ sở hữu (ADMIN)</strong> mới có quyền mời hoặc xóa thành viên khỏi nhóm gia đình.
                </p>
              </div>
            )}

            <div className="card" style={{ background: 'var(--primary-bg)', border: '1px solid var(--primary-border)' }}>
              <div style={{ fontSize: 20, marginBottom: 8 }}>💡</div>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6 }}>Tính năng nhóm gia đình</div>
              <ul style={{ fontSize: 13, color: 'var(--text-2)', listStyleType: 'none', display: 'flex', flexDirection: 'column', gap: 6, padding: 0 }}>
                <li>✅ Chia sẻ thú cưng với mọi thành viên</li>
                <li>✅ Cùng nhau theo dõi và tích điểm nhiệm vụ</li>
                <li>✅ Gửi thông báo nhắc nhở chăm sóc chung</li>
                <li>✅ Xem lịch sử sức khỏe đồng bộ</li>
              </ul>
            </div>
          </div>
        </div>
      ) : (
        // ==========================================
        // USER IS NOT IN A FAMILY GROUP
        // ==========================================
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'start' }}>
          {/* Join group / Pending invites */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div className="card" style={{ background: 'var(--primary-bg)', border: '1px solid var(--primary-border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <Home size={20} style={{ color: 'var(--primary)' }} />
                <h3 style={{ margin: 0, color: 'var(--primary)' }}>Bạn chưa tham gia gia đình nào</h3>
              </div>
              <p style={{ color: 'var(--text-2)', fontSize: 13, lineHeight: '20px', margin: 0 }}>
                Thiết lập nhóm gia đình giúp bạn chia sẻ trách nhiệm chăm sóc bé cưng với người thân. Bạn có thể tự tạo một nhóm gia đình mới (yêu cầu gói VIP) hoặc gia nhập một nhóm đã có thông qua mã mời.
              </p>
            </div>

            {/* Pending Invitations list */}
            {pendingInvites.length > 0 && (
              <div className="card" style={{ borderColor: 'var(--primary-border)' }}>
                <div className="section-title" style={{ marginBottom: 12 }}>
                  📨 Lời mời đang chờ bạn ({pendingInvites.length})
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {pendingInvites.map(invite => (
                    <div key={invite._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 14, background: 'var(--surface2)', borderRadius: 12, border: '1px solid var(--border)' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>{invite.group_id?.group_name || 'Nhóm gia đình'}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 4 }}>Mã mời: <strong style={{ color: 'var(--primary)' }}>{invite.token_hash}</strong></div>
                      </div>
                      <button className="btn btn-primary btn-sm" onClick={() => handleAcceptInvite(invite.token_hash)} disabled={submitting}>
                        Đồng ý tham gia
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Join with Invite Code form */}
            <div className="card">
              <div className="section-title" style={{ marginBottom: 12 }}>
                🔑 Gia nhập gia đình bằng mã mời
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 16 }}>Nhập mã mời gồm 6 ký tự viết hoa nhận được từ chủ nhóm để tham gia.</p>
              <form onSubmit={handleJoinGroup} style={{ display: 'flex', gap: 12 }}>
                <input
                  className="form-control"
                  style={{ textTransform: 'uppercase', flex: 1, letterSpacing: '2px', fontWeight: 700, textAlign: 'center' }}
                  type="text"
                  placeholder="MÃ MỜI (VD: AB12CD)"
                  value={inviteCode}
                  onChange={e => setInviteCode(e.target.value.toUpperCase())}
                  maxLength={10}
                  required
                />
                <button type="submit" className="btn btn-primary" style={{ padding: '0 24px' }} disabled={submitting}>
                  Gia nhập
                </button>
              </form>
            </div>
          </div>

          {/* Create new group */}
          <div className="card">
            <div className="section-title" style={{ marginBottom: 12 }}>
              🏠 Tạo nhóm gia đình mới
            </div>
            {isVip ? (
              <>
                <p style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 16 }}>
                  Đặt tên cho nhóm chăm sóc thú cưng của bạn (Ví dụ: Gia đình Mochi Corgi).
                </p>
                <form onSubmit={handleCreateGroup}>
                  <div className="form-group">
                    <label className="form-label">Tên nhóm gia đình</label>
                    <input
                      className="form-control"
                      type="text"
                      placeholder="Nhập tên nhóm..."
                      value={groupName}
                      onChange={e => setGroupName(e.target.value)}
                      required
                    />
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={submitting}>
                    {submitting ? 'Đang tạo...' : 'Tạo nhóm mới'}
                  </button>
                </form>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '10px 0' }}>
                <div style={{ fontSize: 32, marginBottom: 10 }}>👑</div>
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 8 }}>Yêu cầu gói VIP</div>
                <p style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 16 }}>
                  Chức năng Tạo nhóm gia đình mới để chia sẻ quyền quản lý thú cưng chỉ khả dụng đối với tài khoản VIP.
                </p>
                <Link to="/settings/subscription" className="btn btn-primary" style={{ display: 'inline-block', width: '100%', textDecoration: 'none', textAlign: 'center' }}>
                  Nâng cấp VIP ngay
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
