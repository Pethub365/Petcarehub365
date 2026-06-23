import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Lock, ChevronRight, Heart, Utensils, Footprints,
  Scissors, Zap, Trophy, CheckCircle2, PawPrint, Star,
  X, Award, BookOpen, ShoppingBag, CheckCircle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import dailyQuestApi from '../../api/dailyQuestApi';

/* ── Category icon map ── */
const CATEGORY: Record<string, { icon: any; label: string; color: string; bg: string }> = {
  NUTRITION:     { icon: Utensils,  label: 'Dinh dưỡng', color: '#FFA94D', bg: '#FFF3E0' },
  DAILY_ROUTINE: { icon: Footprints, label: 'Hoạt động',   color: '#4F8EF7', bg: '#EFF6FF' },
  TRAINING:      { icon: Scissors,  label: 'Chải chuốt',   color: '#A855F7', bg: '#F3E8FF' },
  HEALTH_CARE:   { icon: Heart,     label: 'Sức khỏe',    color: '#FF6B6B', bg: '#FFF5F5' },
};

/* ── Greeting by time ── */
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Chào buổi sáng';
  if (h < 17) return 'Chào buổi chiều';
  return 'Chào buổi tối';
}

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
  const [quests, setQuests]           = useState<any[]>([]);
  const [, setTick]                   = useState(0);
  const loading = loadingPets;

  /* Quest Modal and Completion States */
  const [activeQuestId, setActiveQuestId] = useState<string | null>(null);
  const [activeQuestDetails, setActiveQuestDetails] = useState<any | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [completing, setCompleting] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successRewards, setSuccessRewards] = useState<{
    xp: number;
    leveledUp: boolean;
    currentLevel?: number;
    unlockedAchievements?: string[];
  } | null>(null);

  const handleQuestClick = async (quest: any) => {
    if (quest.isLocked) return;
    setActiveQuestId(quest._id);
    setLoadingDetails(true);
    try {
      const res = await dailyQuestApi.getQuestById(quest._id) as any;
      if (res?.success) {
        setActiveQuestDetails(res.data.quest);
      } else {
        setActiveQuestDetails(quest);
      }
    } catch {
      setActiveQuestDetails(quest);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleComplete = async (questId: string) => {
    setCompleting(questId);
    try {
      const res = await dailyQuestApi.completeQuest(questId) as any;
      if (res?.success) {
        if (activeQuestDetails && activeQuestDetails._id === questId) {
          setActiveQuestDetails((prev: any) => ({ ...prev, status: 'COMPLETED' }));
        }

        const { rewards } = res.data;
        const unlockedAchievements = res.data.unlockedAchievements || [];

        setSuccessRewards({
          xp: rewards.xp,
          leveledUp: rewards.leveledUp,
          currentLevel: rewards.currentLevel,
          unlockedAchievements
        });
        setShowSuccessModal(true);

        // Close details modal if open
        setActiveQuestId(null);
        setActiveQuestDetails(null);

        await refreshPets(); // Refresh stats on frontend context
        if (selectedPet?._id) {
          await loadQuests(selectedPet._id);
        }
      }
    } catch (err) {
      console.error('Lỗi khi hoàn thành nhiệm vụ:', err);
    } finally {
      setCompleting(null);
    }
  };

  const closeModal = () => {
    setActiveQuestId(null);
    setActiveQuestDetails(null);
  };


  /* Countdown tick */
  useEffect(() => {
    const t = setInterval(() => setTick(n => n + 1), 1000);
    return () => clearInterval(t);
  }, []);

  /* Admin redirect */
  useEffect(() => {
    if (user?.email?.toLowerCase().includes('admin')) {
      navigate('/admin/stats', { replace: true });
    }
  }, [user, navigate]);

  /* Initial pet load */
  useEffect(() => { refreshPets(); }, []);

  const loadQuests = useCallback(async (petId: string) => {
    try {
      const res = await dailyQuestApi.getDailyQuests(petId) as any;
      if (res?.success) setQuests(res.data.quests || []);
    } catch (err) { console.error('Quest load error:', err); }
  }, []);

  /* Auto-select saved pet */
  useEffect(() => {
    if (pets.length > 0) {
      const saved = localStorage.getItem('selectedPetId');
      const pet   = pets.find((p: any) => p._id === saved) || pets[0];
      setSelectedPet(pet);
      localStorage.setItem('selectedPetId', pet._id);
    } else {
      setSelectedPet(null);
      setQuests([]);
    }
  }, [pets]);

  useEffect(() => {
    if (selectedPet?._id) loadQuests(selectedPet._id);
  }, [selectedPet?._id, loadQuests]);

  const handleSelectPet = async (pet: any) => {
    setSelectedPet(pet);
    localStorage.setItem('selectedPetId', pet._id);
    await loadQuests(pet._id);
  };

  /* ── Computed values ── */
  const displayName    = user?.profile?.full_name || user?.email?.split('@')[0] || 'Bạn';
  const completedCount = quests.filter(q => q.status === 'COMPLETED').length;
  const xp             = selectedPet?.stats?.xp   ?? 0;
  const level          = selectedPet?.stats?.level ?? 1;
  const xpNeeded       = level * 100 + 800;
  const xpPercent      = Math.min(100, Math.round((xp / xpNeeded) * 100));
  const questPercent   = quests.length ? Math.round((completedCount / quests.length) * 100) : 0;
  const greeting       = getGreeting();

  /* ═══════════════════════
     LOADING STATE
  ═══════════════════════ */
  if (loading) {
    return (
      <div>
        {/* Skeleton Hero */}
        <div className="skeleton" style={{ height: 84, borderRadius: 'var(--radius-lg)', marginBottom: 24 }} />
        <div className="grid grid-4" style={{ marginBottom: 24 }}>
          {[1,2,3,4].map(i => (
            <div key={i} className="stat-card">
              <div className="skeleton" style={{ width: 44, height: 44, borderRadius: 12 }} />
              <div className="skeleton" style={{ width: 70, height: 32 }} />
              <div className="skeleton" style={{ width: 100, height: 14 }} />
            </div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 22 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="skeleton" style={{ height: 160, borderRadius: 'var(--radius-lg)' }} />
            <div className="skeleton" style={{ height: 300, borderRadius: 'var(--radius-lg)' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="skeleton" style={{ height: 190, borderRadius: 'var(--radius-lg)' }} />
            <div className="skeleton" style={{ height: 120, borderRadius: 'var(--radius-lg)' }} />
          </div>
        </div>
      </div>
    );
  }

  /* ═══════════════════════
     EMPTY STATE
  ═══════════════════════ */
  if (pets.length === 0) {
    return (
      <div>
        {/* Minimal hero */}
        <div className="hero-banner" style={{ marginBottom: 32 }}>
          <div className="hero-greeting">{greeting} 👋</div>
          <div className="hero-name">{displayName}</div>
        </div>

        <div style={{
          background: 'var(--surface)', borderRadius: 'var(--radius-xl)',
          padding: '60px 40px', textAlign: 'center',
          border: '2px dashed var(--border2)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
        }}>
          <div style={{
            width: 88, height: 88, borderRadius: '50%',
            background: 'var(--primary-bg)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: 'float 3s ease-in-out infinite',
          }}>
            <PawPrint size={42} color="var(--primary)" strokeWidth={1.5} />
          </div>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', marginBottom: 8 }}>
              Bạn chưa có thú cưng nào
            </h2>
            <p style={{ color: 'var(--text-3)', fontSize: 14, maxWidth: 360 }}>
              Thêm thú cưng để theo dõi sức khỏe, hoàn thành nhiệm vụ hàng ngày và nhận thưởng XP!
            </p>
          </div>
          <button className="btn btn-primary btn-lg" onClick={() => navigate('/pets/setup')} style={{ marginTop: 8 }}>
            <Plus size={18} /> Thêm thú cưng ngay
          </button>
        </div>
      </div>
    );
  }

  /* ═══════════════════════
     MAIN DASHBOARD
  ═══════════════════════ */
  return (
    <div>

      {/* ── SUMMARY BANNER ── */}
      <div style={{
        background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 50%, #FFA94D 100%)',
        borderRadius: 24,
        padding: '24px 32px',
        marginBottom: 24,
        color: '#fff',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 12px 40px rgba(255,107,107,.35)',
      }}>
        {/* Background decorations */}
        <div style={{
          position: 'absolute', top: -40, right: -40,
          width: 200, height: 200, borderRadius: '50%',
          background: 'rgba(255,255,255,.10)',
        }} />
        <div style={{
          position: 'absolute', bottom: -60, right: 120,
          width: 160, height: 160, borderRadius: '50%',
          background: 'rgba(255,255,255,.07)',
        }} />
        <div style={{
          position: 'absolute', top: 20, right: 200,
          width: 80, height: 80, borderRadius: '50%',
          background: 'rgba(255,255,255,.06)',
        }} />

        <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
          {/* Left: greeting */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, opacity: 0.85, marginBottom: 4, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              {greeting} 👋
            </div>
            <div style={{ fontSize: 26, fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.15 }}>
              {displayName}
            </div>
            <div style={{ fontSize: 13, opacity: 0.8, marginTop: 6 }}>
              {completedCount}/{quests.length} nhiệm vụ hôm nay · Cấp {level}
            </div>
          </div>

          {/* Right: stat pills */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {/* Pets */}
            <div style={{
              background: 'rgba(255,255,255,.20)',
              backdropFilter: 'blur(12px)',
              borderRadius: 16,
              padding: '12px 20px',
              textAlign: 'center',
              minWidth: 80,
              border: '1px solid rgba(255,255,255,.25)',
            }}>
              <div style={{ fontSize: 24, fontWeight: 900, lineHeight: 1 }}>{pets.length}</div>
              <div style={{ fontSize: 11, opacity: 0.85, marginTop: 4, fontWeight: 600 }}>🐾 Thú cưng</div>
            </div>
            {/* XP */}
            <div style={{
              background: 'rgba(255,255,255,.20)',
              backdropFilter: 'blur(12px)',
              borderRadius: 16,
              padding: '12px 20px',
              textAlign: 'center',
              minWidth: 80,
              border: '1px solid rgba(255,255,255,.25)',
            }}>
              <div style={{ fontSize: 24, fontWeight: 900, lineHeight: 1 }}>{xp}</div>
              <div style={{ fontSize: 11, opacity: 0.85, marginTop: 4, fontWeight: 600 }}>⚡ Điểm XP</div>
            </div>
            {/* Quest progress */}
            <div style={{
              background: 'rgba(255,255,255,.20)',
              backdropFilter: 'blur(12px)',
              borderRadius: 16,
              padding: '12px 20px',
              textAlign: 'center',
              minWidth: 80,
              border: '1px solid rgba(255,255,255,.25)',
            }}>
              <div style={{ fontSize: 24, fontWeight: 900, lineHeight: 1 }}>{questPercent}%</div>
              <div style={{ fontSize: 11, opacity: 0.85, marginTop: 4, fontWeight: 600 }}>✅ Hoàn thành</div>
            </div>
          </div>
        </div>

        {/* XP progress bar */}
        <div style={{ position: 'relative', zIndex: 1, marginTop: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, opacity: 0.8, marginBottom: 6, fontWeight: 600 }}>
            <span>Tiến trình XP — Cấp {level} → {level + 1}</span>
            <span>{xp} / {xpNeeded} XP</span>
          </div>
          <div style={{ height: 6, background: 'rgba(255,255,255,.25)', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{
              height: '100%', width: `${xpPercent}%`,
              background: '#fff',
              borderRadius: 99,
              transition: 'width .8s ease',
              boxShadow: '0 0 10px rgba(255,255,255,.6)',
            }} />
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT: full width ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* ── Pet Gallery ── */}
          <div className="card">
            <div className="section-header">
              <span className="section-title">🐾 Thú cưng của bạn</span>
              <button className="btn btn-outline btn-sm" onClick={() => navigate('/pets/setup')}>
                <Plus size={14} /> Thêm thú cưng
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: 12 }}>
              {pets.map(pet => {
                const isSelected = selectedPet?._id === pet._id;
                const isDone     = !!pet.isTodayQuestsCompleted;
                return (
                  <button
                    key={pet._id}
                    onClick={() => handleSelectPet(pet)}
                    className={`pet-card-grid ${isSelected ? 'active' : ''}`}
                    style={{ textAlign: 'center' }}
                  >
                    <span className={`pet-status-dot ${isDone ? '' : 'pending'}`} />
                    <div className="pet-card-avatar">
                      {pet.avatar_url
                        ? <img src={pet.avatar_url} alt={pet.name} />
                        : <PawPrint size={28} color="var(--primary)" strokeWidth={1.5} />}
                    </div>
                    <div className="pet-card-name">{pet.name}</div>
                    <div className="pet-card-species">{pet.species || 'Thú cưng'}</div>
                    {isSelected && (
                      <span className="chip chip-red" style={{ fontSize: 10 }}>Đang chọn</span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* ── Divider ── */}
            {selectedPet && (
              <div style={{
                borderTop: '1.5px solid var(--border)',
                margin: '18px -22px 0',
                paddingTop: 18,
                paddingLeft: 22,
                paddingRight: 22,
              }}>
                {/* Selected pet XP bar */}
                <div style={{
                  background: 'var(--primary-bg)',
                  borderRadius: 'var(--radius)',
                  padding: '14px 16px',
                  border: '1px solid var(--primary-border)',
                }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>
                    {selectedPet.name} — Cấp {level}
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-outline btn-sm" onClick={() => navigate('/health')}>
                      <Heart size={13} /> Sức khỏe
                    </button>
                    <button className="btn btn-primary btn-sm" onClick={() => navigate('/missions')}>
                      Nhiệm vụ <ChevronRight size={13} />
                    </button>
                  </div>
                </div>
                <div className="progress progress-lg">
                  <div className="progress-fill" style={{ width: `${xpPercent}%` }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 11.5, color: 'var(--primary)', fontWeight: 600 }}>
                  <span>{xp} / {xpNeeded} XP</span>
                  <span>{xpPercent}% đến Cấp {level + 1}</span>
                </div>
                </div>
              </div>
            )}
          </div>

          {/* ── Daily Quests ── */}
          <div className="card">
            <div className="section-header">
              <div>
                <div className="section-title">
                  <CheckCircle2 size={16} style={{ display: 'inline', marginRight: 6, color: 'var(--green)', verticalAlign: 'middle' }} />
                  Nhiệm vụ hôm nay {selectedPet ? `— ${selectedPet.name}` : ''}
                </div>
                {quests.length > 0 && (
                  <div style={{ fontSize: 12, color: 'var(--text-4)', marginTop: 2 }}>
                    {completedCount} / {quests.length} nhiệm vụ hoàn thành
                  </div>
                )}
              </div>
              <button className="section-link" onClick={() => navigate('/missions')}>
                Xem tất cả →
              </button>
            </div>

            {/* Progress bar for all quests */}
            {quests.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div className="progress">
                  <div className="progress-fill green" style={{ width: `${questPercent}%` }} />
                </div>
              </div>
            )}

            {quests.length === 0 ? (
              <div className="empty-state" style={{ padding: '30px 0' }}>
                <CheckCircle2 size={40} style={{ margin: '0 auto 12px', opacity: .3 }} />
                <p>Không có nhiệm vụ nào hôm nay</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                {quests.slice(0, 8).map(quest => {
                  const isLocked  = !!quest.isLocked;
                  const isDone    = quest.status === 'COMPLETED';
                  const isWorking = quest.status === 'IN_PROGRESS';
                  const cat       = CATEGORY[quest.category] || CATEGORY.DAILY_ROUTINE;
                  const progress  = isDone ? 100 : isWorking ? 65 : 0;

                  return (
                    <div
                      key={quest._id}
                      onClick={() => !isLocked && handleQuestClick(quest)}
                      style={{
                        background: isDone
                          ? '#E8F8EF'
                          : isLocked ? 'var(--surface2)' : 'var(--surface)',
                        border: `1.5px solid ${
                          isDone ? 'rgba(39,174,96,.2)'
                          : isLocked ? 'var(--border)'
                          : 'var(--border)'
                        }`,
                        borderRadius: 'var(--radius)',
                        padding: '11px 13px',
                        cursor: isLocked ? 'not-allowed' : 'pointer',
                        opacity: isLocked ? .55 : 1,
                        display: 'flex', flexDirection: 'column', gap: 8,
                        transition: 'all .2s ease',
                        position: 'relative',
                        overflow: 'hidden',
                      }}
                      onMouseEnter={e => { if (!isLocked && !isDone) (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow)'; (e.currentTarget as HTMLElement).style.transform = isLocked ? 'none' : 'translateY(-2px)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = 'none'; (e.currentTarget as HTMLElement).style.transform = 'none'; }}
                    >
                      {/* Top row: icon + status dot */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                          background: isLocked ? 'var(--surface3)' : cat.bg,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          {isLocked
                            ? <Lock size={16} color="var(--text-4)" />
                            : (() => { const IconComp = cat.icon; return <IconComp size={18} color={cat.color} />; })()}
                        </div>
                        {/* Done checkmark */}
                        <div style={{
                          width: 20, height: 20, borderRadius: '50%',
                          background: isDone ? 'var(--green)' : 'var(--border)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0, transition: 'all .2s',
                        }}>
                          {isDone && (
                            <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                              <path d="M2 6L5 9L10 3" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </div>
                      </div>

                      {/* Title */}
                      <div>
                        <div style={{
                          fontWeight: 700, fontSize: 12.5,
                          color: isDone ? 'var(--green)' : isLocked ? 'var(--text-3)' : 'var(--text)',
                          lineHeight: 1.35,
                          display: '-webkit-box', WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical', overflow: 'hidden',
                        }}>
                          {quest.title}
                        </div>
                        {isLocked && (
                          <div style={{ fontSize: 10.5, color: 'var(--text-4)', marginTop: 3 }}>
                            🔒 {quest.unlocksAt ? getCountdown(quest.unlocksAt) : '5h'}
                          </div>
                        )}
                      </div>

                      {/* Bottom: XP chip + progress */}
                      <div style={{ marginTop: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                          <span className="chip chip-purple" style={{ fontSize: 9.5, padding: '1.5px 6px' }}>
                            <Zap size={8} /> +{quest.reward_xp || 0} XP
                          </span>
                          {isWorking && <span className="chip chip-blue" style={{ fontSize: 9.5, padding: '1.5px 6px' }}>⏳</span>}
                        </div>
                        {!isLocked && (
                          <div className="progress" style={{ height: 4 }}>
                            <div
                              className={`progress-fill ${isDone ? 'green' : 'blue'}`}
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {quests.length > 8 && (
                  <div style={{ gridColumn: '1 / -1' }}>
                    <button
                      className="btn btn-outline"
                      style={{ width: '100%' }}
                      onClick={() => navigate('/missions')}
                    >
                      Xem thêm {quests.length - 8} nhiệm vụ <ChevronRight size={15} />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
      </div>

      {/* Quest Detail Modal */}
      {activeQuestId && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" style={{ position: 'relative', maxWidth: 540, width: '90%', maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>
              <X size={16} />
            </button>

            {loadingDetails ? (
              <div style={{ display:'flex', justifyContent:'center', padding:40 }}><div className="spinner spinner-lg"/></div>
            ) : activeQuestDetails ? (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <span className={`chip ${
                    activeQuestDetails.status === 'COMPLETED' ? 'chip-green' : 'chip-yellow'
                  }`}>
                    {activeQuestDetails.status === 'COMPLETED' ? 'Đã hoàn thành' : 'Đang chờ'}
                  </span>
                  <span className="chip chip-blue">
                    {CATEGORY[activeQuestDetails.category]?.label || 'Nhiệm vụ'}
                  </span>
                </div>

                <h3 className="modal-title" style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)', marginBottom: 10 }}>
                  {activeQuestDetails.title}
                </h3>

                <p style={{ fontSize: 14, color: 'var(--text-2)', marginBottom: 20, lineHeight: 1.6 }}>
                  {activeQuestDetails.description}
                </p>

                {/* Rewards section */}
                <div className="card" style={{ padding: 14, background: 'var(--surface2)', display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center', fontWeight: 700, fontSize: 18, color: 'var(--success)' }}>
                      <Award size={18} />
                      +{activeQuestDetails.reward_xp || 0} XP
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 600, marginTop: 2 }}>KINH NGHIỆM TÍCH LŨY</div>
                  </div>
                </div>

                {/* Medical Reference Section (VetKnowledge) */}
                {activeQuestDetails.source_knowledge_id && (
                  <div style={{
                    padding: 16,
                    borderRadius: 12,
                    background: '#F0F7FF',
                    border: '1px solid #D2E8FF',
                    marginBottom: 20
                  }}>
                    <h4 style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: 14, color: 'var(--secondary)', marginBottom: 10 }}>
                      <BookOpen size={16} /> Tri thức thú y khuyên dùng
                    </h4>
                    <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text)', marginBottom: 6 }}>
                      {activeQuestDetails.source_knowledge_id.title}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 10, lineHeight: 1.5 }}>
                      <strong>Lý thuyết Y khoa:</strong> {activeQuestDetails.source_knowledge_id.medical_fact}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.5 }}>
                      <strong>Khuyến nghị chăm sóc:</strong> {activeQuestDetails.source_knowledge_id.recommended_action}
                    </div>
                    {activeQuestDetails.source_knowledge_id.related_product_metadata?.promo_code && (
                      <div style={{
                        marginTop: 10,
                        padding: '4px 10px',
                        background: 'var(--primary-bg)',
                        color: 'var(--primary)',
                        borderRadius: 6,
                        display: 'inline-block',
                        fontWeight: 700,
                        fontSize: 11
                      }}>
                        🎁 Mã giảm giá: {activeQuestDetails.source_knowledge_id.related_product_metadata.promo_code}
                      </div>
                    )}
                  </div>
                )}

                {/* Suggested Action / Product Affiliate link */}
                {(activeQuestDetails.suggested_action?.has_product || activeQuestDetails.source_knowledge_id?.related_product_metadata?.product_category) && (
                  <div style={{
                    padding: 16,
                    borderRadius: 12,
                    background: '#FFF8E1',
                    border: '1px solid #FFE082',
                    marginBottom: 20,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: 13, color: 'var(--gold)', marginBottom: 4 }}>
                        <ShoppingBag size={15} /> Gợi ý mua sắm hỗ trợ
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-2)' }}>
                        Nhiệm vụ này có các sản phẩm bổ trợ khuyên dùng đang bán tại Cửa Hàng.
                      </div>
                    </div>
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => {
                        closeModal();
                        navigate('/settings/subscription');
                      }}
                      style={{ flexShrink: 0, borderColor: 'var(--gold)', color: 'var(--gold)' }}>
                      Xem ngay
                    </button>
                  </div>
                )}

                {/* Complete action inside modal */}
                <div style={{ display: 'flex', justifyItems: 'flex-end', justifyContent: 'flex-end', gap: 10, marginTop: 24 }}>
                  <button className="btn btn-outline" onClick={closeModal}>
                    Đóng
                  </button>
                  {activeQuestDetails.status !== 'COMPLETED' && (
                    <button
                      className="btn btn-primary"
                      onClick={() => handleComplete(activeQuestDetails._id)}
                      disabled={completing === activeQuestDetails._id}>
                      {completing === activeQuestDetails._id ? <div className="spinner"/> : <><CheckCircle size={15}/> Hoàn thành</>}
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-3)' }}>Không thể hiển thị chi tiết nhiệm vụ</div>
            )}
          </div>
        </div>
      )}

      {/* Success Celebration Reward Modal */}
      {showSuccessModal && successRewards && (
        <div className="modal-overlay" onClick={() => setShowSuccessModal(false)} style={{ zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="modal" style={{ position: 'relative', maxWidth: 420, width: '90%', textAlign: 'center', padding: '30px 24px', background: '#fff', borderRadius: 32, boxShadow: 'var(--shadow-lg)' }} onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowSuccessModal(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', position: 'absolute', top: 16, right: 16 }}>
              <X size={16} />
            </button>
            
            <div style={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: '#FFF8E1',
              border: '3px solid #FFF0D0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px auto',
              color: '#FFB000'
            }}>
              <Trophy size={42} />
            </div>

            <h3 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', marginBottom: 10 }}>
              Hoàn thành xuất sắc! 🎉
            </h3>
            <p style={{ fontSize: 13, color: 'var(--text-3)', lineHeight: 1.6, marginBottom: 24 }}>
              Bạn và thú cưng đang thực hiện thói quen chăm sóc rất tốt! Hãy tiếp tục phát huy nhé.
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
              <div style={{
                width: '100%',
                background: '#E8F8F0',
                border: '1px solid #27AE6033',
                borderRadius: 16,
                padding: '16px 12px',
                textAlign: 'center'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, color: '#27AE60', fontWeight: 700, fontSize: 18 }}>
                  <Star size={18} fill="#27AE60" />
                  +{successRewards.xp} XP
                </div>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', marginTop: 4, textTransform: 'uppercase' }}>Kinh nghiệm nhận được</div>
              </div>
            </div>

            {/* Level up alerts */}
            {successRewards.leveledUp && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                background: '#FFF0F0',
                border: '1px solid #FFEBEB',
                borderRadius: 12,
                padding: '10px 16px',
                marginBottom: 24,
                color: 'var(--primary)',
                fontWeight: 700,
                fontSize: 13
              }}>
                <Award size={18} />
                Thú cưng đã thăng cấp lên CẤP {successRewards.currentLevel}! 🌟
              </div>
            )}

            {/* Achievements list */}
            {successRewards.unlockedAchievements && successRewards.unlockedAchievements.length > 0 && (
              <div style={{
                background: '#FFF9E6',
                border: '1px solid #FFB00033',
                borderRadius: 16,
                padding: '12px 16px',
                marginBottom: 24,
                textAlign: 'left'
              }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#FFB000', marginBottom: 8, textAlign: 'center', letterSpacing: 0.5 }}>
                  🏆 THÀNH TỰU MỚI ĐẠT ĐƯỢC!
                </div>
                {successRewards.unlockedAchievements.map((title: string, idx: number) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>
                    <Trophy size={14} color="#FFB000" />
                    <span>{title}</span>
                  </div>
                ))}
              </div>
            )}

            <button className="btn btn-primary" style={{ width: '100%', padding: '12px', borderRadius: 16 }} onClick={() => setShowSuccessModal(false)}>
              Nhận phần thưởng
            </button>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 900px) {
          .dashboard-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
