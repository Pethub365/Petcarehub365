import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { SquareCheck, Plus, Lock, ChevronRight, Heart } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import dailyQuestApi from '../../api/dailyQuestApi';

const CATEGORY_ICON: Record<string, { icon: string; color: string; bg: string }> = {
  NUTRITION: { icon: '🍽️', color: '#F2994A', bg: '#FFF8E1' },
  DAILY_ROUTINE: { icon: '🚶', color: '#2D9CDB', bg: '#E1F0FF' },
  TRAINING: { icon: '✂️', color: '#9B51E0', bg: '#F3E5F5' },
  HEALTH_CARE: { icon: '❤️', color: '#EC4B4B', bg: '#FFF0F0' },
};

function getCountdown(unlocksAt: string) {
  const diff = new Date(unlocksAt).getTime() - Date.now();
  if (diff <= 0) return 'Sẵn sàng';
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}

export default function HomePage() {
  const { user, pets, loadingPets, refreshPets } = useAuth();
  const navigate = useNavigate();
  const [selectedPet, setSelectedPet] = useState<any>(null);
  const [quests, setQuests] = useState<any[]>([]);
  const [, setTick] = useState(0);
  const loading = loadingPets;

  useEffect(() => {
    const timer = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (user?.email?.toLowerCase().includes('admin')) {
      navigate('/admin/stats', { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    refreshPets();
  }, []);

  const loadQuests = useCallback(async (petId: string) => {
    try {
      const qRes = await dailyQuestApi.getDailyQuests(petId) as any;
      if (qRes?.success) {
        setQuests(qRes.data.quests || []);
      }
    } catch (err) {
      console.error('Error loading quests:', err);
    }
  }, []);

  useEffect(() => {
    if (pets.length > 0) {
      const saved = localStorage.getItem('selectedPetId');
      const pet = pets.find((p: any) => p._id === saved) || pets[0];
      setSelectedPet(pet);
      localStorage.setItem('selectedPetId', pet._id);
    } else {
      setSelectedPet(null);
      setQuests([]);
    }
  }, [pets]);

  useEffect(() => {
    if (selectedPet?._id) {
      loadQuests(selectedPet._id);
    }
  }, [selectedPet?._id, loadQuests]);

  const handleSelectPet = async (pet: any) => {
    setSelectedPet(pet);
    localStorage.setItem('selectedPetId', pet._id);
    await loadQuests(pet._id);
  };

  const displayName = user?.profile?.full_name || user?.email?.split('@')[0] || 'Bạn';
  const completedCount = quests.filter(q => q.status === 'COMPLETED').length;
  const xp = selectedPet?.stats?.xp ?? 0;
  const level = selectedPet?.stats?.level ?? 1;
  const xpNeeded = level * 100 + 800;
  const xpPercent = Math.min(100, Math.round((xp / xpNeeded) * 100));

  return (
    <div>
      <div className="page-header">
        <h1>Xin chào, {displayName}! 👋</h1>
        <p>Hôm nay thú cưng của bạn cần được chăm sóc đấy!</p>
      </div>

      {loading ? (
        <div>
          {/* Skeleton Stats row */}
          <div className="grid grid-4" style={{ marginBottom: 24 }}>
            {[1,2,3,4].map(i => (
              <div key={i} className="stat-card" style={{ height: 114 }}>
                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
                  <div className="skeleton" style={{ width:40, height:40, borderRadius:10 }} />
                  <div className="skeleton" style={{ width:100, height:16 }} />
                </div>
                <div className="skeleton" style={{ width:60, height:32, marginBottom:8 }} />
                <div className="skeleton" style={{ width:80, height:14 }} />
              </div>
            ))}
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 360px', gap:24, alignItems:'start' }}>
            {/* LEFT: Pets + Quests */}
            <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
              <div className="card" style={{ height: 150 }}>
                <div className="skeleton" style={{ width:150, height:20, marginBottom:16 }} />
                <div style={{ display:'flex', gap:16 }}>
                  {[1,2,3].map(i => (
                    <div key={i} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8 }}>
                      <div className="skeleton" style={{ width:64, height:64, borderRadius:'50%' }} />
                      <div className="skeleton" style={{ width:50, height:12 }} />
                    </div>
                  ))}
                </div>
              </div>
              <div className="card">
                <div className="skeleton" style={{ width:180, height:20, marginBottom:20 }} />
                <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                  {[1,2,3].map(i => (
                    <div key={i} style={{ display:'flex', alignItems:'center', gap:12, padding:'14px 16px', border:'1px solid var(--border)', borderRadius:'var(--radius)' }}>
                      <div className="skeleton" style={{ width:44, height:44, borderRadius:12 }} />
                      <div style={{ flex:1 }}>
                        <div className="skeleton" style={{ width:'40%', height:16, marginBottom:6 }} />
                        <div className="skeleton" style={{ width:'70%', height:12 }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* RIGHT: Level + Quick Actions */}
            <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
              <div className="card" style={{ height: 130 }}>
                <div className="skeleton" style={{ width:100, height:14, marginBottom:8 }} />
                <div className="skeleton" style={{ width:120, height:32, marginBottom:12 }} />
                <div className="skeleton" style={{ width:'100%', height:8, borderRadius:4 }} />
              </div>
              <div className="card">
                <div className="skeleton" style={{ width:120, height:18, marginBottom:16 }} />
                {[1,2,3,4].map(i => (
                  <div key={i} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 0', borderBottom:'1px solid var(--border)' }}>
                    <div className="skeleton" style={{ width:40, height:40, borderRadius:10 }} />
                    <div style={{ flex:1 }}>
                      <div className="skeleton" style={{ width:80, height:14, marginBottom:6 }} />
                      <div className="skeleton" style={{ width:120, height:10 }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : pets.length === 0 ? (
        <div className="empty-state" style={{ marginTop: 60 }}>
          <div style={{ fontSize: 80, marginBottom: 20 }}>🐾</div>
          <h3>Bạn chưa có thú cưng nào</h3>
          <p style={{ marginBottom: 24 }}>Hãy thêm thú cưng để bắt đầu theo dõi sức khỏe và nhiệm vụ hàng ngày!</p>
          <button className="btn btn-primary" onClick={() => navigate('/pets/setup')}>
            <Plus size={16} /> Thêm thú cưng ngay
          </button>
        </div>
      ) : (
        <>
          {/* Stats row */}
          <div className="grid grid-4" style={{ marginBottom: 24 }}>
            <div className="stat-card">
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
                <div style={{ width:40, height:40, borderRadius:10, background:'var(--primary-bg)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>🐾</div>
                <span className="stat-label">Thú cưng</span>
              </div>
              <div className="stat-value">{pets.length}</div>
              <span className="stat-change up">Đang hoạt động</span>
            </div>
            <div className="stat-card">
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
                <div style={{ width:40, height:40, borderRadius:10, background:'#E1F0FF', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>✅</div>
                <span className="stat-label">Nhiệm vụ hôm nay</span>
              </div>
              <div className="stat-value">{completedCount}/{quests.length}</div>
              <span className="stat-change up">Đã hoàn thành</span>
            </div>
            <div className="stat-card">
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
                <div style={{ width:40, height:40, borderRadius:10, background:'#FFF8E1', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>⭐</div>
                <span className="stat-label">XP tích lũy</span>
              </div>
              <div className="stat-value">{xp}</div>
              <span className="stat-change up">Cấp độ {level}</span>
            </div>
            <div className="stat-card">
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
                <div style={{ width:40, height:40, borderRadius:10, background:'#E8F8EF', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>🔥</div>
                <span className="stat-label">Streak</span>
              </div>
              <div className="stat-value">7</div>
              <span className="stat-change up">Ngày liên tiếp</span>
            </div>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 360px', gap:24, alignItems:'start' }}>
            {/* LEFT: Pets + Quests */}
            <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
              {/* Pet selector */}
              <div className="card">
                <div className="section-header">
                  <span className="section-title">Thú cưng của bạn</span>
                  <button className="btn btn-outline btn-sm" onClick={() => navigate('/pets/setup')}>
                    <Plus size={14} /> Thêm thú cưng
                  </button>
                </div>
                <div style={{ display:'flex', gap:16, flexWrap:'wrap' }}>
                  {pets.map(pet => {
                    const isSelected = selectedPet?._id === pet._id;
                    const done = !!pet.isTodayQuestsCompleted;
                    return (
                      <button key={pet._id} onClick={() => handleSelectPet(pet)}
                        style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8, background:'none', border:'none', cursor:'pointer' }}>
                        <div className={`pet-ring ${isSelected ? 'active' : ''}`} style={{ position:'relative' }}>
                          <div className="avatar avatar-lg" style={{ background:'var(--primary-bg)' }}>
                            {pet.avatar_url ? <img src={pet.avatar_url} alt={pet.name} style={{ width:'100%', height:'100%', objectFit:'cover', borderRadius:'50%' }} /> : '🐾'}
                          </div>
                          <span style={{
                            position:'absolute', bottom:0, right:0, width:18, height:18,
                            borderRadius:'50%', background: done ? 'var(--success)' : 'var(--primary)',
                            border:'2px solid #fff', fontSize:10, color:'#fff',
                            display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700
                          }}>{done ? '✓' : '!'}</span>
                        </div>
                        <span style={{ fontSize:12, fontWeight:600, color: isSelected ? 'var(--primary)' : 'var(--text-2)' }}>{pet.name}</span>
                      </button>
                    );
                  })}
                </div>

                {selectedPet && (
                  <div style={{ marginTop:20, background:'var(--primary-bg)', borderRadius:'var(--radius-sm)', padding:'14px 16px', display:'flex', alignItems:'center', gap:12 }}>
                    <div style={{ width:44, height:44, borderRadius:12, background:'var(--primary)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>🌱</div>
                    <div>
                      <div style={{ fontWeight:700, fontSize:14, color:'var(--text)' }}>{selectedPet.name} đang làm rất tốt!</div>
                      <div style={{ fontSize:12, color:'var(--text-3)', marginTop:2 }}>Cấp độ {level} • {xp}/{xpNeeded} XP • {xpPercent}% đến cấp {level + 1}</div>
                    </div>
                    <div style={{ marginLeft:'auto', display:'flex', gap:8 }}>
                      <button className="btn btn-outline btn-sm" onClick={() => navigate('/health')}><Heart size={13}/> Sức khỏe</button>
                      <button className="btn btn-primary btn-sm" onClick={() => navigate('/missions')}>Nhiệm vụ <ChevronRight size={13}/></button>
                    </div>
                  </div>
                )}
              </div>

              {/* Quests */}
              <div className="card">
                <div className="section-header">
                  <span className="section-title">Nhiệm vụ hôm nay {selectedPet ? `- ${selectedPet.name}` : ''}</span>
                  <button className="section-link" onClick={() => navigate('/missions')}>Xem tất cả →</button>
                </div>

                {quests.length === 0 ? (
                  <div className="empty-state" style={{ padding:'30px 0' }}>
                    <SquareCheck size={40} />
                    <p>Không có nhiệm vụ nào hôm nay</p>
                  </div>
                ) : (
                  <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                    {quests.slice(0, 5).map(quest => {
                      const isLocked = !!quest.isLocked;
                      const isDone = quest.status === 'COMPLETED';
                      const isWorking = quest.status === 'IN_PROGRESS';
                      const cat = CATEGORY_ICON[quest.category] || CATEGORY_ICON.DAILY_ROUTINE;
                      const progress = isDone ? 100 : isWorking ? 65 : 0;

                      return (
                        <div key={quest._id}
                          onClick={() => !isLocked && navigate('/missions')}
                          style={{
                            background:'var(--surface)', border:'1px solid var(--border)',
                            borderRadius:'var(--radius)', padding:'14px 16px',
                            cursor: isLocked ? 'not-allowed' : 'pointer',
                            opacity: isLocked ? 0.6 : 1,
                            transition:'box-shadow .2s',
                          }}
                          onMouseEnter={e => { if(!isLocked) (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow)'; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}
                        >
                          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                            <div style={{ width:44, height:44, borderRadius:12, background: isLocked ? '#F3F4F6' : cat.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>
                              {isLocked ? <Lock size={18} color="#8A9AA9" /> : cat.icon}
                            </div>
                            <div style={{ flex:1, minWidth:0 }}>
                              <div style={{ fontWeight:700, fontSize:14, color:'var(--text)', marginBottom:2 }}>{quest.title}</div>
                              <div style={{ fontSize:12, color:'var(--text-3)' }}>
                                {isLocked ? `Mở khóa sau: ${quest.unlocksAt ? getCountdown(quest.unlocksAt) : '5h'}` : quest.description}
                              </div>
                              <div style={{ display:'flex', gap:8, marginTop:6 }}>
                                <span className="chip chip-green">⭐ +{quest.reward_xp || 0} XP</span>
                                <span className="chip chip-yellow">🪙 +{quest.reward_coin || 10}</span>
                              </div>
                            </div>
                            <div style={{
                              width:28, height:28, borderRadius:'50%',
                              background: isDone ? 'var(--primary)' : isLocked ? '#ECEFF1' : 'var(--border)',
                              display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0
                            }}>
                              {isDone && <span style={{ color:'#fff', fontSize:14, fontWeight:700 }}>✓</span>}
                              {isLocked && <Lock size={12} color="#8A9AA9" />}
                            </div>
                          </div>
                          {!isLocked && (
                            <div style={{ marginTop:10 }}>
                              <div className="progress"><div className="progress-fill" style={{ width:`${progress}%` }} /></div>
                              <div style={{ display:'flex', justifyContent:'space-between', marginTop:4, fontSize:10, color:'var(--text-3)', fontWeight:600 }}>
                                <span>{isDone ? 'HOÀN THÀNH' : isWorking ? 'ĐANG THỰC HIỆN' : 'SẮP TỚI'}</span>
                                <span>{progress}%</span>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT: Level + Quick Actions */}
            <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
              {/* XP Progress */}
              <div className="card" style={{ background:'linear-gradient(135deg, #EC4B4B, #FF8C69)', color:'#fff', border:'none' }}>
                <div style={{ fontSize:13, fontWeight:600, opacity:.85, marginBottom:4 }}>Tiến trình hiện tại</div>
                <div style={{ fontSize:32, fontWeight:800, marginBottom:4 }}>Cấp {level}</div>
                <div style={{ fontSize:13, opacity:.8, marginBottom:12 }}>{xp} / {xpNeeded} XP</div>
                <div style={{ height:8, background:'rgba(255,255,255,.3)', borderRadius:4, overflow:'hidden' }}>
                  <div style={{ height:'100%', background:'#fff', borderRadius:4, width:`${xpPercent}%`, transition:'width .6s' }} />
                </div>
                <div style={{ fontSize:12, opacity:.75, marginTop:8 }}>{xpPercent}% đến cấp {level + 1}!</div>
              </div>

              {/* Quick actions */}
              <div className="card">
                <div className="section-title" style={{ marginBottom:14 }}>Truy cập nhanh</div>
                {[
                  { icon:'✅', label:'Nhiệm vụ', sub:`${completedCount}/${quests.length} hoàn thành`, to:'/missions', bg:'#E1F0FF' },
                  { icon:'❤️', label:'Sức khỏe', sub:'Theo dõi sức khỏe', to:'/health', bg:'#E8F8EF' },
                  { icon:'🏆', label:'Bảng xếp hạng', sub:'Xem thứ hạng', to:'/ranks', bg:'#FFF8E1' },
                  { icon:'💳', label:'Mua gói', sub:'Nâng cấp VIP', to:'/settings/subscription', bg:'#F3E5F5' },
                  { icon:'🌟', label:'Thành tích', sub:'Huy hiệu & danh hiệu', to:'/achievements', bg:'var(--primary-bg)' },
                ].map(item => (
                  <button key={item.to} onClick={() => navigate(item.to)}
                    style={{ display:'flex', alignItems:'center', gap:12, width:'100%', padding:'10px 0', border:'none', background:'none', cursor:'pointer', borderBottom:'1px solid var(--border)', textAlign:'left' }}
                  >
                    <div style={{ width:40, height:40, borderRadius:10, background:item.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>{item.icon}</div>
                    <div>
                      <div style={{ fontWeight:600, fontSize:14, color:'var(--text)' }}>{item.label}</div>
                      <div style={{ fontSize:12, color:'var(--text-3)' }}>{item.sub}</div>
                    </div>
                    <ChevronRight size={16} style={{ marginLeft:'auto', color:'var(--text-3)' }} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
