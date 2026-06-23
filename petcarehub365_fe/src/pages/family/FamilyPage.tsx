import { useState, useEffect } from 'react';
import { Users, UserPlus, Trash2, Mail, Home, ShieldAlert, Check, RefreshCw, Settings, ClipboardList, PawPrint, X, Utensils, Footprints, Scissors, Heart } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import familyApi from '../../api/familyApi';
import dailyQuestApi from '../../api/dailyQuestApi';

export default function FamilyPage() {
  const { user, pets } = useAuth();
  const [familyGroup, setFamilyGroup] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [pendingInvites, setPendingInvites] = useState<any[]>([]);
  const [sentInvites, setSentInvites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Task Assignment & Pets Management
  const [familyQuests, setFamilyQuests] = useState<any[]>([]);
  const [loadingQuests, setLoadingQuests] = useState(false);
  const [managePetsModal, setManagePetsModal] = useState(false);
  const [selectedPetIds, setSelectedPetIds] = useState<string[]>([]);
  const [savingPets, setSavingPets] = useState(false);
  const [assigningQuestId, setAssigningQuestId] = useState<string | null>(null);

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
      if (res?.success) {
        if (res.data) {
          setFamilyGroup(res.data);
          setMembers(res.data.members || []);
          setPendingInvites([]);

          // Populate selectedPetIds
          const currentPetIds = res.data.pet_ids?.map((p: any) => p._id) || [];
          setSelectedPetIds(currentPetIds);

          // Fetch daily quests for all family pets in parallel
          const fPets = res.data.pet_ids || [];
          if (fPets.length > 0) {
            if (!isBackground) setLoadingQuests(true);
            const questPromises = fPets.map(async (pet: any) => {
              try {
                const qRes = await dailyQuestApi.getDailyQuests(pet._id) as any;
                if (qRes?.success) {
                  return qRes.data.quests.map((q: any) => ({
                    ...q,
                    petName: pet.name,
                  }));
                }
              } catch (err) {
                console.error(`Error loading quests for pet ${pet._id}:`, err);
              }
              return [];
            });
            const allQuestsArray = await Promise.all(questPromises);
            setFamilyQuests(allQuestsArray.flat());
          } else {
            setFamilyQuests([]);
          }

          // Get sent invites if admin
          const isAdmin = res.data.members?.some((m: any) => m.user_id?._id === user?._id && m.role === 'ADMIN');
          if (isAdmin) {
            try {
              const sentRes = await familyApi.getSentInvitations() as any;
              if (sentRes?.success) {
                setSentInvites(sentRes.data || []);
              }
            } catch {
              setSentInvites([]);
            }
          } else {
            setSentInvites([]);
          }
        } else {
          // Success is true, but data is null (meaning no family group exists)
          setFamilyGroup(null);
          setMembers([]);
          setSentInvites([]);
          setFamilyQuests([]);
          // Get pending invites for this user
          const inviteRes = await familyApi.getPendingInvitations() as any;
          if (inviteRes?.success) {
            setPendingInvites(inviteRes.data || []);
          }
        }
      } else {
        // Success is false or response is invalid
        if (!isBackground) {
          setErrorMsg('Không thể tải dữ liệu gia đình từ máy chủ.');
        }
      }
    } catch (err: any) {
      console.error('Error loading family details:', err);
      if (!isBackground) {
        setErrorMsg('Không thể kết nối đến máy chủ gia đình.');
      }
    } finally {
      if (!isBackground) setLoading(false);
      setLoadingQuests(false);
    }
  };

  useEffect(() => {
    load();
    const interval = setInterval(() => {
      load(true);
    }, 10000); // Poll every 10 seconds

    return () => clearInterval(interval);
  }, [user?._id]);

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
        await load(true);
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

  const handleUpdateFamilyPets = async () => {
    try {
      setSavingPets(true);
      setErrorMsg('');
      const res = await familyApi.updateFamilyPets(selectedPetIds) as any;
      if (res?.success) {
        setManagePetsModal(false);
        await load();
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Không thể cập nhật danh sách thú cưng.');
    } finally {
      setSavingPets(false);
    }
  };

  const handleAssignQuest = async (questId: string, memberId: string | null) => {
    try {
      setAssigningQuestId(questId);
      setErrorMsg('');
      const res = await familyApi.assignQuest(questId, memberId) as any;
      if (res?.success) {
        // Optimistically update or background reload
        setFamilyQuests(prev => prev.map(q => {
          if (q._id === questId) {
            // Find member details
            const memberObj = members.find(m => m.user_id?._id === memberId);
            return {
              ...q,
              assigned_to: memberId ? {
                _id: memberId,
                email: memberObj?.user_id?.email,
                profile: memberObj?.user_id?.profile
              } : null
            };
          }
          return q;
        }));
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Không thể phân công công việc.');
    } finally {
      setAssigningQuestId(null);
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
          {/* Left Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Family Pets Card */}
            <div className="card">
              <div className="section-title" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <PawPrint size={18} />
                  <span>Thú cưng gia đình ({familyGroup.pet_ids?.length || 0})</span>
                </div>
                {isFamilyAdmin && (
                  <button 
                    className="btn btn-outline btn-sm"
                    onClick={() => setManagePetsModal(true)}
                    style={{ padding: '4px 8px', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}
                  >
                    <Settings size={14} />
                    <span>Quản lý</span>
                  </button>
                )}
              </div>

              {(!familyGroup.pet_ids || familyGroup.pet_ids.length === 0) ? (
                <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--text-3)' }}>
                  Chưa chia sẻ thú cưng nào với gia đình.
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
                  {familyGroup.pet_ids.map((pet: any) => (
                    <div key={pet._id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 12, marginBottom: 0, background: 'var(--surface2)', border: '1px solid var(--border)' }}>
                      <div className="avatar avatar-md" style={{ fontSize: 16, flexShrink: 0 }}>
                        {pet.avatar_url ? (
                          <img src={pet.avatar_url} alt={pet.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                        ) : '🐾'}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{pet.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {pet.species === 'DOG' ? 'Chó' : pet.species === 'CAT' ? 'Mèo' : pet.species} • {pet.breed || 'Không rõ giống'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

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

            {/* Task Assignment Card */}
            <div className="card">
              <div className="section-title" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <ClipboardList size={18} />
                <span>Phân công công việc</span>
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 16 }}>Giao nhiệm vụ chăm sóc thú cưng hàng ngày cho các thành viên trong gia đình.</p>

              {loadingQuests ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: 20 }}>
                  <div className="spinner" />
                </div>
              ) : familyQuests.length === 0 ? (
                <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--text-3)' }}>
                  Không tìm thấy nhiệm vụ nào cần phân công cho hôm nay.
                </div>
              ) : (
                 <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {familyQuests.map((quest: any) => {
                    const isCompleted = quest.status === 'COMPLETED';
                    const categoryMap: Record<string, { icon: any; color: string; bg: string }> = {
                      NUTRITION: { icon: Utensils, color: '#F2994A', bg: '#FFF8E1' },
                      DAILY_ROUTINE: { icon: Footprints, color: '#2D9CDB', bg: '#E1F0FF' },
                      HEALTH_CARE: { icon: Heart, color: '#EC4B4B', bg: '#FFF0F0' },
                      TRAINING: { icon: Scissors, color: '#9B51E0', bg: '#F3E5F5' }
                    };
                    const cat = categoryMap[quest.category];
                    const IconComponent = cat ? cat.icon : ClipboardList;
                    const iconColor = cat ? cat.color : 'var(--text-3)';
                    const iconBg = cat ? cat.bg : 'var(--surface2)';
                    const currentAssignee = quest.assigned_to?._id || quest.assigned_to || '';

                    return (
                      <div key={quest._id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 14, marginBottom: 0, border: '1px solid var(--border)', background: isCompleted ? 'rgba(39, 174, 96, 0.05)' : 'var(--surface)' }}>
                        <div style={{ width: 40, height: 40, borderRadius: 10, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <IconComponent size={20} color={iconColor} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                            <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>{quest.title}</span>
                            <span className="chip chip-blue" style={{ fontSize: 10, padding: '1px 5px' }}>{quest.petName}</span>
                            {isCompleted && <span className="chip chip-green" style={{ fontSize: 10, padding: '1px 5px' }}>Đã xong ✓</span>}
                          </div>
                          <div style={{ fontSize: 12, color: 'var(--text-3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {quest.description}
                          </div>
                        </div>

                        {/* Assign Select */}
                        <div style={{ flexShrink: 0 }}>
                          <select
                            className="form-control"
                            style={{ padding: '4px 8px', fontSize: 12, height: 'auto', width: 150 }}
                            value={currentAssignee}
                            disabled={assigningQuestId === quest._id}
                            onChange={(e) => handleAssignQuest(quest._id, e.target.value || null)}
                          >
                            <option value="">Chưa phân công</option>
                            {members.map((m: any) => {
                              const mUser = m.user_id;
                              if (!mUser) return null;
                              return (
                                <option key={mUser._id} value={mUser._id}>
                                  {mUser.profile?.full_name || mUser.email}
                                </option>
                              );
                            })}
                          </select>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Invitation / Right column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {isFamilyAdmin ? (
              <>
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

                {sentInvites.length > 0 && (
                  <div className="card">
                    <div className="section-title" style={{ marginBottom: 12, fontSize: 14 }}>
                      ✉️ Lời mời đã gửi ({sentInvites.length})
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {sentInvites.map((invite: any) => (
                        <div key={invite._id} style={{ display: 'flex', flexDirection: 'column', padding: '10px 12px', background: 'var(--surface2)', borderRadius: 10, border: '1px solid var(--border)', fontSize: 13 }}>
                          <div style={{ fontWeight: 600, color: 'var(--text)' }}>{invite.invited_email}</div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                            <span style={{ fontSize: 11, color: 'var(--text-3)' }}>Mã mời: <strong style={{ color: 'var(--primary)', letterSpacing: '0.5px' }}>{invite.token_hash}</strong></span>
                            <span className="chip chip-blue" style={{ fontSize: 10, padding: '2px 6px' }}>ĐANG CHỜ</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
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

      {/* Manage Pets Modal */}
      {managePetsModal && (
        <div className="modal-overlay" onClick={() => setManagePetsModal(false)}>
          <div className="modal" style={{ position: 'relative', maxWidth: 460, width: '90%', maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setManagePetsModal(false)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>
              <X size={16} />
            </button>
            
            <h3 className="modal-title" style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)', marginBottom: 10 }}>
              Quản lý thú cưng gia đình
            </h3>
            
            <p style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 20, lineHeight: 1.5 }}>
              Chọn các thú cưng bạn muốn chia sẻ quyền chăm sóc với các thành viên khác trong gia đình.
            </p>

            {pets.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 20, color: 'var(--text-3)' }}>
                Bạn chưa tạo thú cưng nào để chia sẻ.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
                {pets.map((pet: any) => {
                  const isChecked = selectedPetIds.includes(pet._id);
                  return (
                    <label 
                      key={pet._id} 
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 12, 
                        padding: 12, 
                        background: 'var(--surface2)', 
                        border: '1px solid var(--border)', 
                        borderRadius: 12, 
                        cursor: 'pointer' 
                      }}
                    >
                      <input 
                        type="checkbox" 
                        checked={isChecked} 
                        style={{ width: 16, height: 16 }}
                        onChange={() => {
                          setSelectedPetIds(prev => 
                            prev.includes(pet._id) 
                              ? prev.filter(id => id !== pet._id) 
                              : [...prev, pet._id]
                          );
                        }}
                      />
                      <div className="avatar avatar-sm">
                        {pet.avatar_url ? <img src={pet.avatar_url} alt={pet.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} /> : '🐾'}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: 13 }}>{pet.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-3)' }}>
                          {pet.species === 'DOG' ? 'Chó' : pet.species === 'CAT' ? 'Mèo' : pet.species} • {pet.breed || 'Không rõ giống'}
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
              <button className="btn btn-outline" onClick={() => setManagePetsModal(false)}>
                Đóng
              </button>
              <button 
                className="btn btn-primary" 
                onClick={handleUpdateFamilyPets} 
                disabled={savingPets || pets.length === 0}
              >
                {savingPets ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
