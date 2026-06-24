import { useState, useEffect } from 'react';
import { Users, Trash2, Home, ShieldAlert, RefreshCw, Settings, ClipboardList, PawPrint, X, Utensils, Footprints, Scissors, Heart, User, Mail, MailOpen, Key, PlusCircle, Crown } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import familyApi from '../../api/familyApi';
import dailyQuestApi from '../../api/dailyQuestApi';

export default function FamilyPage() {
  const { user, pets } = useAuth();
  const [familyGroup, setFamilyGroup] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [pendingInvites, setPendingInvites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Task Assignment & Pets Management
  const [familyQuests, setFamilyQuests] = useState<any[]>([]);
  const [loadingQuests, setLoadingQuests] = useState(false);
  const [managePetsModal, setManagePetsModal] = useState(false);
  const [selectedPetIds, setSelectedPetIds] = useState<string[]>([]);
  const [savingPets, setSavingPets] = useState(false);
  const [assigningQuestId, setAssigningQuestId] = useState<string | null>(null);
  const [selectedQuestPetId, setSelectedQuestPetId] = useState<string | null>(null);

  // Create & Join Forms
  const [groupName, setGroupName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Invite member states
  const [inviteEmail, setInviteEmail] = useState('');
  const [sentInvitations, setSentInvitations] = useState<any[]>([]);
  const [inviting, setInviting] = useState(false);
  const [inviteSuccessMsg, setInviteSuccessMsg] = useState('');

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

          if (currentPetIds.length > 0) {
            setSelectedQuestPetId(prev => {
              if (prev && currentPetIds.includes(prev)) return prev;
              const savedId = localStorage.getItem('selectedPetId');
              if (savedId && currentPetIds.includes(savedId)) return savedId;
              return currentPetIds[0];
            });
          } else {
            setSelectedQuestPetId(null);
          }

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
                    petId: pet._id,
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

          // Fetch sent invitations if user is admin
          const isAdmin = res.data.members?.some(
            (m: any) => m.user_id?._id === user?._id && m.role === 'ADMIN'
          );
          if (isAdmin) {
            try {
              const sentInvRes = await familyApi.getSentInvitations() as any;
              if (sentInvRes?.success) {
                setSentInvitations(sentInvRes.data || []);
              }
            } catch (err) {
              console.error('Error loading sent invitations:', err);
            }
          }

        } else {
          // Success is true, but data is null (meaning no family group exists)
          setFamilyGroup(null);
          setMembers([]);
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

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    try {
      setInviting(true);
      setErrorMsg('');
      setInviteSuccessMsg('');
      const res = await familyApi.inviteMember(inviteEmail.trim()) as any;
      if (res?.success) {
        setInviteSuccessMsg(res.message || `Đã gửi mã mời thành công tới ${inviteEmail}`);
        setInviteEmail('');
        // Reload sent invitations
        const sentInvRes = await familyApi.getSentInvitations() as any;
        if (sentInvRes?.success) {
          setSentInvitations(sentInvRes.data || []);
        }
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Không thể gửi lời mời.');
    } finally {
      setInviting(false);
    }
  };

  const isFamilyAdmin = familyGroup?.members?.some(
    (m: any) => m.user_id?._id === user?._id && m.role === 'ADMIN'
  );

  const isVip = user?.subscription_plan === 'VIP';

  const questsByPet = familyGroup?.pet_ids?.map((pet: any) => {
    const petQuests = familyQuests.filter(q => q.pet_id === pet._id || q.pet_id?._id === pet._id);
    const totalQuests = petQuests.length;
    const completedQuests = petQuests.filter(q => q.status === 'COMPLETED').length;
    const isAllCompleted = totalQuests > 0 && completedQuests === totalQuests;

    return {
      pet,
      quests: petQuests,
      totalQuests,
      completedQuests,
      isAllCompleted
    };
  }) || [];

  if (loading) {
    return (
      <div style={{ padding: 24 }}>
        <div className="page-header">
          <h1 style={{ display: 'flex', alignItems: 'center', gap: 10 }}><Users size={24} color="var(--primary)" /> Quản lý gia đình</h1>
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
        <h1 style={{ display: 'flex', alignItems: 'center', gap: 10 }}><Users size={24} color="var(--primary)" /> Quản lý gia đình {familyGroup && <span style={{ fontSize: 16, color: 'var(--text-3)' }}>({familyGroup.group_name})</span>}</h1>
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
                      <div className="avatar avatar-md" style={{ fontSize: 18, background: 'var(--primary-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {memberUser.profile?.avatar_url ? (
                          <img src={memberUser.profile.avatar_url} alt={memberUser.profile.full_name || memberUser.email} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                        ) : <User size={18} color="var(--primary)" />}
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

            {/* Invite Member Card */}
            {isFamilyAdmin && (
              <div className="card">
                <div className="section-title" style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Mail size={16} /> Mời thành viên tham gia gia đình
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 16 }}>
                  Nhập email của thành viên gia đình để gửi email mời và tạo mã kích hoạt.
                </p>
                <form onSubmit={handleInvite} style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                  <input
                    className="form-control"
                    style={{ flex: 1 }}
                    type="email"
                    placeholder="Email người nhận (VD: name@example.com)"
                    value={inviteEmail}
                    onChange={e => setInviteEmail(e.target.value)}
                    required
                  />
                  <button type="submit" className="btn btn-primary" style={{ padding: '0 24px' }} disabled={inviting}>
                    {inviting ? 'Đang gửi...' : 'Gửi lời mời'}
                  </button>
                </form>

                {inviteSuccessMsg && (
                  <div style={{ background: '#E8F8EF', border: '1px solid #B2DFDB', borderRadius: 10, padding: '8px 12px', fontSize: 13, color: 'var(--success)', marginBottom: 16 }}>
                    {inviteSuccessMsg}
                  </div>
                )}

                {sentInvitations.length > 0 && (
                  <div style={{ marginTop: 16 }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-2)', marginBottom: 8 }}>
                      Lời mời đã gửi (chưa tham gia) ({sentInvitations.length})
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {sentInvitations.map((inv: any) => (
                        <div key={inv._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: 'var(--surface2)', borderRadius: 10, border: '1px solid var(--border)', fontSize: 12 }}>
                          <div>
                            <span style={{ fontWeight: 600 }}>{inv.invited_email}</span>
                            <span style={{ color: 'var(--text-3)', marginLeft: 8 }}>
                              Hết hạn: {new Date(inv.expires_at).toLocaleDateString('vi-VN')}
                            </span>
                          </div>
                          <div>
                            Mã mời: <strong style={{ color: 'var(--primary)', letterSpacing: '1px' }}>{inv.token_hash}</strong>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

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
                <>
                  {/* Pet Selector Capsules for Tasks */}
                  {familyGroup.pet_ids?.length > 0 && (
                    <div style={{ display:'flex', gap:10, marginBottom:20, overflowX:'auto', paddingBottom: 6 }}>
                      {familyGroup.pet_ids.map((pet: any) => {
                        const petQuests = familyQuests.filter(q => q.pet_id === pet._id || q.pet_id?._id === pet._id);
                        const totalQuests = petQuests.length;
                        const completedQuests = petQuests.filter(q => q.status === 'COMPLETED').length;
                        const isAllCompleted = totalQuests > 0 && completedQuests === totalQuests;

                        return (
                          <button key={pet._id}
                            type="button"
                            onClick={() => {
                              setSelectedQuestPetId(pet._id);
                              localStorage.setItem('selectedPetId', pet._id);
                            }}
                            style={{
                              display:'flex', alignItems:'center', gap:8, padding:'6px 16px', borderRadius:20,
                              border:`2px solid ${selectedQuestPetId===pet._id?'var(--primary)':'var(--border)'}`,
                              background: selectedQuestPetId===pet._id?'var(--primary-bg)':'var(--surface)',
                              color: selectedQuestPetId===pet._id?'var(--primary)':'var(--text-2)',
                              fontWeight:600, fontSize:13, cursor:'pointer', whiteSpace:'nowrap', flexShrink:0,
                              transition: 'all 0.15s'
                            }}>
                            <div className="avatar avatar-sm" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 22, height: 22, background: 'var(--primary-bg)' }}>
                              {pet.avatar_url ? <img src={pet.avatar_url} alt={pet.name} style={{width:'100%',height:'100%',objectFit:'cover',borderRadius:'50%'}}/> : <PawPrint size={12} color="var(--primary)" />}
                            </div>
                            <span>{pet.name}</span>
                            {isAllCompleted ? (
                              <span style={{ fontSize: 11, color: 'var(--success)' }}>✨</span>
                            ) : totalQuests > 0 ? (
                              <span style={{ fontSize: 10, opacity: 0.7 }}>({completedQuests}/{totalQuests})</span>
                            ) : null}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Quests list of the selected pet */}
                  {(() => {
                    const activePetGroup = questsByPet.find((group: any) => group.pet._id === selectedQuestPetId);
                    if (!activePetGroup) {
                      return (
                        <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--text-3)' }}>
                          Chọn một thú cưng ở trên để xem công việc.
                        </div>
                      );
                    }

                    const { pet, quests, totalQuests, completedQuests, isAllCompleted } = activePetGroup;

                    return (
                      <div style={{ border: '1px solid var(--border)', borderRadius: 16, padding: 16, background: 'var(--surface2)' }}>
                        {/* Pet Header */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, borderBottom: '1px solid var(--border)', paddingBottom: 10 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div className="avatar avatar-sm" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--primary-bg)', width: 32, height: 32 }}>
                              {pet.avatar_url ? (
                                <img src={pet.avatar_url} alt={pet.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                              ) : <PawPrint size={16} color="var(--primary)" />}
                            </div>
                            <div>
                              <span style={{ fontWeight: 800, fontSize: 15 }}>{pet.name}</span>
                              <span style={{ fontSize: 12, color: 'var(--text-3)', marginLeft: 8 }}>
                                ({totalQuests} nhiệm vụ)
                              </span>
                            </div>
                          </div>
                          <div>
                            {isAllCompleted ? (
                              <span className="chip chip-green" style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 700, padding: '4px 10px', fontSize: 12 }}>
                                ✨ Hoàn thành 100%
                              </span>
                            ) : totalQuests > 0 ? (
                              <span className="chip chip-blue" style={{ padding: '4px 10px', fontSize: 12 }}>
                                Tiến độ: {completedQuests}/{totalQuests}
                              </span>
                            ) : (
                              <span style={{ fontSize: 12, color: 'var(--text-3)', fontStyle: 'italic' }}>
                                Chưa có nhiệm vụ
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Quests list for this pet */}
                        {quests.length === 0 ? (
                          <div style={{ textAlign: 'center', padding: '12px 0', color: 'var(--text-3)', fontSize: 13 }}>
                            Chưa thiết lập nhiệm vụ hôm nay cho {pet.name}.
                          </div>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {quests.map((quest: any) => {
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
                              const iconBg = cat ? cat.bg : 'var(--surface)';
                              const currentAssignee = quest.assigned_to?._id || quest.assigned_to || '';

                              return (
                                <div key={quest._id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, marginBottom: 0, border: '1px solid var(--border)', background: isCompleted ? 'rgba(39, 174, 96, 0.03)' : 'var(--surface)' }}>
                                  <div style={{ width: 36, height: 36, borderRadius: 8, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <IconComponent size={18} color={iconColor} />
                                  </div>
                                  <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 2 }}>
                                      <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--text)', textDecoration: isCompleted ? 'line-through' : 'none', opacity: isCompleted ? 0.7 : 1 }}>{quest.title}</span>
                                      {isCompleted && <span className="chip chip-green" style={{ fontSize: 9, padding: '1px 4px' }}>✓</span>}
                                    </div>
                                    <div style={{ fontSize: 11, color: 'var(--text-3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                      {quest.description}
                                    </div>
                                  </div>

                                  {/* Assign Select */}
                                  <div style={{ flexShrink: 0 }}>
                                    <select
                                      className="form-control"
                                      style={{ padding: '2px 6px', fontSize: 11, height: 'auto', width: 130 }}
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
                    );
                  })()}
                </>
              )}
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
                <div className="section-title" style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <MailOpen size={16} /> Lời mời đang chờ bạn ({pendingInvites.length})
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
              <div className="section-title" style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Key size={16} /> Gia nhập gia đình bằng mã mời
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
            <div className="section-title" style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <PlusCircle size={16} /> Tạo nhóm gia đình mới
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
                <div style={{ marginBottom: 10, display: 'flex', justifyContent: 'center' }}>
                  <Crown size={36} color="#F59E0B" fill="#F59E0B" />
                </div>
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
                      <div className="avatar avatar-sm" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--primary-bg)' }}>
                        {pet.avatar_url ? <img src={pet.avatar_url} alt={pet.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} /> : <PawPrint size={14} color="var(--primary)" />}
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
