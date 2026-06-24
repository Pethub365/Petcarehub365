import { useState, useEffect, useCallback } from 'react';
import { CheckCircle, Lock, X, BookOpen, Award, Trophy, Star, Utensils, Footprints, Scissors, Heart, Zap, Sparkles } from 'lucide-react';
import dailyQuestApi from '../../api/dailyQuestApi';
import { useAuth } from '../../contexts/AuthContext';

const CAT_MAP: Record<string, { icon: any; label:string; color:string; bg:string }> = {
  NUTRITION:     { icon: Utensils,  label: 'Dinh dưỡng', color: '#FFA94D', bg: '#FFF3E0' },
  DAILY_ROUTINE: { icon: Footprints, label: 'Hoạt động',   color: '#4F8EF7', bg: '#EFF6FF' },
  TRAINING:      { icon: Scissors,  label: 'Chải chuốt',   color: '#A855F7', bg: '#F3E8FF' },
  HEALTH_CARE:   { icon: Heart,     label: 'Sức khỏe',    color: '#FF6B6B', bg: '#FFF5F5' },
};

function countdown(unlocksAt: string) {
  const diff = new Date(unlocksAt).getTime() - Date.now();
  if (diff <= 0) return 'Sẵn sàng';
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}



export default function MissionDetailPage() {
  const { user, pets, loadingPets, refreshPets } = useAuth();
  const [selectedPet, setSelectedPet] = useState<any>(null);
  const [quests, setQuests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [completing, setCompleting] = useState<string|null>(null);
  const [, setTick] = useState(0);

  // Period Tabs state: matches mobile app's daily, weekly, monthly, annual
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'monthly' | 'annual'>('daily');

  // Modal states for quest details
  const [activeQuestId, setActiveQuestId] = useState<string | null>(null);
  const [activeQuestDetails, setActiveQuestDetails] = useState<any | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Success Celebration Modal states: matches mobile app celebration
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successRewards, setSuccessRewards] = useState<{
    xp: number;
    coins: number;
    leveledUp: boolean;
    currentLevel?: number;
    unlockedAchievements?: string[];
  } | null>(null);

  useEffect(() => {
    const t = setInterval(() => setTick(n => n + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const loadQuests = useCallback(async (petId: string, tab: string) => {
    setLoading(true);
    try {
      let res;
      if (tab === 'daily') {
        res = await dailyQuestApi.getDailyQuests(petId) as any;
      } else {
        const periodMap = {
          weekly: 'WEEKLY',
          monthly: 'MONTHLY',
          annual: 'ANNUAL'
        } as const;
        const apiPeriod = periodMap[tab as 'weekly' | 'monthly' | 'annual'];
        res = await dailyQuestApi.getWeeklyQuests(petId, apiPeriod) as any;
      }
      if (res?.success) {
        setQuests(res.data.quests || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshPets();
  }, []);

  useEffect(() => {
    if (pets.length > 0) {
      const saved = localStorage.getItem('selectedPetId');
      const pet = pets.find((p:any) => p._id === saved) || pets[0];
      setSelectedPet(pet);
      localStorage.setItem('selectedPetId', pet._id);
    } else {
      setSelectedPet(null);
      setQuests([]);
      if (!loadingPets) setLoading(false);
    }
  }, [pets, loadingPets]);

  useEffect(() => {
    if (selectedPet?._id) {
      loadQuests(selectedPet._id, activeTab);
    }
  }, [selectedPet?._id, activeTab, loadQuests]);

  const handleComplete = async (questId: string) => {
    setCompleting(questId);
    try {
      let res;
      if (activeTab === 'daily') {
        res = await dailyQuestApi.completeQuest(questId) as any;
      } else {
        res = await dailyQuestApi.completeWeeklyQuest(questId) as any;
      }
      if (res?.success) {
        if (activeQuestDetails && activeQuestDetails._id === questId) {
          // Update details in modal if open
          setActiveQuestDetails((prev: any) => ({ ...prev, status: 'COMPLETED' }));
        }

        const { rewards } = res.data;
        const unlockedAchievements = res.data.unlockedAchievements || [];

        // Save rewards details to trigger the Celebration modal
        setSuccessRewards({
          xp: rewards.xp,
          coins: rewards.coins,
          leveledUp: rewards.leveledUp,
          currentLevel: rewards.currentLevel,
          unlockedAchievements
        });
        setShowSuccessModal(true);

        await refreshPets(); // Refresh stats on frontend context
      }
    } catch (err) {
      console.error(err);
    }
    setCompleting(null);
    if (selectedPet) loadQuests(selectedPet._id, activeTab);
  };

  const handleQuestClick = async (quest: any) => {
    if (quest.isLocked) return;
    setActiveQuestId(quest._id);
    setLoadingDetails(true);
    try {
      let res;
      if (activeTab === 'daily') {
        res = await dailyQuestApi.getQuestById(quest._id) as any;
      } else {
        res = await dailyQuestApi.getWeeklyQuestById(quest._id) as any;
      }
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

  const closeModal = () => {
    setActiveQuestId(null);
    setActiveQuestDetails(null);
  };

  const filtered = filter === 'ALL' ? quests : quests.filter(q =>
    filter === 'COMPLETED' ? q.status === 'COMPLETED'
    : filter === 'PENDING' ? q.status !== 'COMPLETED' && !q.isLocked
    : filter === 'LOCKED' ? q.isLocked : true
  );

  const doneCount = quests.filter(q => q.status === 'COMPLETED').length;

  return (
    <div>
      <div className="page-header" style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
        <div>
          <h1>Nhiệm vụ thú cưng</h1>
          <p>Hoàn thành các thử thách chăm sóc để nhận XP và phần thưởng</p>
        </div>
        {selectedPet && (
          <div style={{ background:'var(--primary-bg)', borderRadius:12, padding:'8px 16px', textAlign:'right' }}>
            <div style={{ fontWeight:700, color:'var(--primary)', fontSize:15 }}>{doneCount}/{quests.length}</div>
            <div style={{ fontSize:12, color:'var(--text-3)' }}>Đã hoàn thành</div>
          </div>
        )}
      </div>

      {/* Pet tabs */}
      {pets.length > 0 && (
        <div style={{ display:'flex', gap:10, marginBottom:20, overflowX:'auto', paddingBottom:4 }}>
          {pets.map(pet => (
            <button key={pet._id}
              onClick={async () => { setSelectedPet(pet); localStorage.setItem('selectedPetId', pet._id); await loadQuests(pet._id, activeTab); }}
              style={{
                display:'flex', alignItems:'center', gap:8, padding:'8px 16px', borderRadius:20,
                border: `2px solid ${selectedPet?._id===pet._id ? 'var(--primary)' : 'var(--border)'}`,
                background: selectedPet?._id===pet._id ? 'var(--primary-bg)' : 'var(--surface)',
                color: selectedPet?._id===pet._id ? 'var(--primary)' : 'var(--text-2)',
                fontWeight:600, fontSize:13, cursor:'pointer', whiteSpace:'nowrap', flexShrink:0
              }}>
              <div className="avatar avatar-sm" style={{ fontSize:14 }}>
                {pet.avatar_url ? <img src={pet.avatar_url} alt={pet.name} style={{width:'100%',height:'100%',objectFit:'cover',borderRadius:'50%'}}/> : '🐾'}
              </div>
              {pet.name}
            </button>
          ))}
        </div>
      )}

      {/* Period Tabs: Daily, Weekly, Monthly, Annual to mirror the mobile app */}
      <div style={{ display:'flex', borderBottom:'1px solid var(--border)', marginBottom:20 }}>
        {[
          { id: 'daily', label: 'Hàng ngày' },
          { id: 'weekly', label: 'Hàng tuần' },
          { id: 'monthly', label: 'Hàng tháng' },
          { id: 'annual', label: 'Hàng năm' },
        ].map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button key={tab.id}
              onClick={() => { setActiveTab(tab.id as any); setFilter('ALL'); }}
              style={{
                flex: 1,
                padding: '12px 4px',
                border: 'none',
                borderBottom: `2px solid ${isActive ? 'var(--primary)' : 'transparent'}`,
                background: 'none',
                color: isActive ? 'var(--primary)' : 'var(--text-3)',
                fontWeight: 700,
                fontSize: 14,
                cursor: 'pointer',
                transition: 'all 0.2s',
                textAlign: 'center'
              }}>
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Progress bar */}
      {selectedPet && quests.length > 0 && (
        <div className="card" style={{ marginBottom:20 }}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8, fontSize:13, fontWeight:600, color:'var(--text-2)' }}>
            <span>Tiến trình {activeTab === 'daily' ? 'hôm nay' : activeTab === 'weekly' ? 'tuần này' : activeTab === 'monthly' ? 'tháng này' : 'năm nay'} — {selectedPet.name}</span>
            <span style={{ color:'var(--primary)' }}>{Math.round((doneCount/quests.length)*100)}%</span>
          </div>
          <div className="progress" style={{ height:10 }}>
            <div className="progress-fill" style={{ width:`${Math.round((doneCount/quests.length)*100)}%` }} />
          </div>
          <div style={{ display:'flex', gap:20, marginTop:12 }}>
            {[
              { label:'Hoàn thành', val:doneCount, color:'var(--success)' },
              { label:'Chưa làm', val:quests.filter(q=>q.status!=='COMPLETED'&&!q.isLocked).length, color:'var(--warning)' },
              { label:'Bị khóa', val:quests.filter(q=>q.isLocked).length, color:'var(--text-3)' },
            ].map(s => (
              <div key={s.label} style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, color:s.color, fontWeight:600 }}>
                <div style={{ width:8, height:8, borderRadius:'50%', background:s.color }} />{s.val} {s.label}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter */}
      <div style={{ display:'flex', gap:8, marginBottom:20 }}>
        {['ALL','PENDING','COMPLETED','LOCKED'].map(f => (
          <button key={f}
            onClick={() => setFilter(f)}
            className={`btn btn-sm ${filter===f ? 'btn-primary' : 'btn-outline'}`}>
            {f==='ALL'?'Tất cả':f==='PENDING'?'Đang chờ':f==='COMPLETED'?'Hoàn thành':'Bị khóa'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="page-loader"><div className="spinner spinner-lg"/></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state"><p>Không có nhiệm vụ nào</p></div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          {filtered.map(quest => {
            const isMissed = quest.status === 'MISSED';
            const isLocked = !!quest.isLocked || isMissed;
            const isDone = quest.status === 'COMPLETED';
            const isWorking = quest.status === 'IN_PROGRESS';
            const cat = CAT_MAP[quest.category] || CAT_MAP.DAILY_ROUTINE;
            const IconComponent = cat.icon;
            const progress = isDone ? 100 : isWorking ? 65 : 0;

            return (
              <div key={quest._id}
                onClick={() => !isLocked && handleQuestClick(quest)}
                style={{
                  background: isDone
                    ? 'linear-gradient(135deg, #F3FBF7 0%, #E6F7ED 100%)'
                    : isMissed
                    ? 'linear-gradient(135deg, #FBFBFB 0%, #F5F5F5 100%)'
                    : isLocked
                    ? 'linear-gradient(135deg, #FAFAFA 0%, #F4F4F4 100%)'
                    : 'var(--surface)',
                  border: isDone
                    ? '1px solid rgba(16, 185, 129, 0.3)'
                    : isMissed
                    ? '1px solid rgba(239, 68, 68, 0.2)'
                    : isLocked
                    ? '1px solid var(--border2)'
                    : `1.5px solid ${cat.color}25`,
                  borderRadius: 16,
                  padding: '16px 20px',
                  cursor: isLocked ? 'not-allowed' : 'pointer',
                  opacity: isLocked ? 0.75 : 1,
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: isDone 
                    ? '0 4px 12px rgba(16, 185, 129, 0.05)'
                    : '0 4px 12px rgba(0, 0, 0, 0.02)',
                  marginBottom: 14
                }}
                onMouseEnter={e => {
                  if (!isLocked) {
                    (e.currentTarget as HTMLElement).style.boxShadow = isDone 
                      ? '0 8px 24px rgba(16, 185, 129, 0.12)'
                      : `0 8px 24px ${cat.color}15`;
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                    (e.currentTarget as HTMLElement).style.borderColor = isDone 
                      ? 'rgba(16, 185, 129, 0.5)'
                      : `${cat.color}60`;
                  }
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.boxShadow = isDone 
                    ? '0 4px 12px rgba(16, 185, 129, 0.05)'
                    : '0 4px 12px rgba(0, 0, 0, 0.02)';
                  (e.currentTarget as HTMLElement).style.transform = 'none';
                  (e.currentTarget as HTMLElement).style.borderColor = isDone
                    ? 'rgba(16, 185, 129, 0.3)'
                    : isMissed
                    ? 'rgba(239, 68, 68, 0.2)'
                    : isLocked
                    ? 'var(--border2)'
                    : `${cat.color}25`;
                }}>
                
                <div style={{ display:'flex', alignItems:'flex-start', gap:16 }}>
                  {/* Left Side Icon */}
                  <div style={{
                    width: 52,
                    height: 52,
                    borderRadius: 14,
                    background: isLocked ? 'var(--surface3)' : cat.bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {isLocked && !isMissed ? (
                      <Lock size={22} color="var(--text-4)" />
                    ) : (
                      <IconComponent size={24} color={isLocked ? 'var(--text-4)' : cat.color} />
                    )}
                  </div>

                  {/* Middle Details */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                      <div style={{
                        fontWeight: 700,
                        fontSize: 16,
                        color: isDone 
                          ? '#065F46' 
                          : isMissed 
                          ? '#991B1B'
                          : isLocked 
                          ? 'var(--text-3)' 
                          : 'var(--text)'
                      }}>
                        {quest.title}
                      </div>
                      
                      <span className={`chip ${
                        isDone ? 'chip-green' 
                        : isMissed ? 'chip-red'
                        : isLocked ? 'chip-gray' 
                        : isWorking ? 'chip-blue' 
                        : 'chip-yellow'
                      }`} style={{ textTransform: 'uppercase', fontSize: 10.5, fontWeight: 700 }}>
                        {isDone ? 'Hoàn thành' 
                         : isMissed ? 'Trễ hạn' 
                         : isLocked ? 'Bị khóa' 
                         : isWorking ? 'Đang làm' 
                         : 'Chờ'}
                      </span>
                    </div>

                    <div style={{ fontSize: 13.5, color: isLocked ? 'var(--text-4)' : 'var(--text-2)', marginBottom: 10, lineHeight: 1.5 }}>
                      {isMissed ? (
                        <span style={{ color: '#EF4444', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <Lock size={12} /> Nhiệm vụ đã bị khóa do trễ hạn chăm sóc.
                        </span>
                      ) : isLocked && quest.unlocksAt ? (
                        <span style={{ color: 'var(--text-4)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <Lock size={12} /> Mở khóa sau: {countdown(quest.unlocksAt)}
                        </span>
                      ) : isLocked && quest.lockMessage ? (
                        <span style={{ color: 'var(--text-4)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <Lock size={12} /> {quest.lockMessage}
                        </span>
                      ) : (
                        quest.description
                      )}
                    </div>

                    {/* Chips section */}
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                      <span style={{
                        fontSize: 10.5,
                        fontWeight: 700,
                        color: isLocked ? 'var(--text-4)' : '#6B21A8',
                        background: isLocked ? 'var(--surface3)' : '#F3E8FF',
                        padding: '2px 8px',
                        borderRadius: 6,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4
                      }}>
                        <Zap size={10} fill={isLocked ? 'var(--text-4)' : '#A855F7'} color="transparent" /> +{quest.reward_xp || 0} XP
                      </span>
                      
                      <span style={{
                        fontSize: 10.5,
                        fontWeight: 700,
                        color: isLocked ? 'var(--text-4)' : cat.color,
                        background: isLocked ? 'var(--surface3)' : `${cat.color}15`,
                        padding: '2px 8px',
                        borderRadius: 6,
                        textTransform: 'uppercase'
                      }}>
                        {cat.label}
                      </span>
                      
                      {quest.source_knowledge_id && (
                        <span className="chip" style={{ background: '#E1F0FF', color: '#2D9CDB', border: '1px solid #2D9CDB33', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <BookOpen size={10} /> Tri thức y khoa
                        </span>
                      )}
                      
                      {(!quest.source_knowledge_id && (
                        quest.title.includes(selectedPet?.name) || 
                        quest.title.includes('Canxi') || 
                        quest.title.includes('khớp') || 
                        quest.title.includes('cân') || 
                        quest.title.includes('Hạ nhiệt') ||
                        quest.title.includes('Thư giãn')
                      )) && (
                        <span className="chip" style={{ background: '#FFF9E6', color: '#FFB000', border: '1px solid #FFB00033', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <Sparkles size={10} /> Cá nhân hóa
                        </span>
                      )}
                      
                      {quest.assigned_to && (
                        <span className="chip" style={{ 
                          background: (quest.assigned_to._id || quest.assigned_to) === user?._id ? '#E8F8EF' : 'var(--surface2)', 
                          color: (quest.assigned_to._id || quest.assigned_to) === user?._id ? '#27AE60' : 'var(--text-3)', 
                          border: (quest.assigned_to._id || quest.assigned_to) === user?._id ? '1px solid #27AE6033' : '1px solid var(--border)', 
                          fontWeight: 700 
                        }}>
                          👤 {(quest.assigned_to._id || quest.assigned_to) === user?._id ? 'Giao cho Bạn' : `Giao cho: ${quest.assigned_to.profile?.full_name || quest.assigned_to.email}`}
                        </span>
                      )}
                    </div>

                    {/* Progress indicator */}
                    {!isLocked && (
                      <div style={{ marginTop: 8 }}>
                        <div style={{
                          height: 6,
                          background: 'var(--border2)',
                          borderRadius: 99,
                          overflow: 'hidden'
                        }}>
                          <div style={{
                            height: '100%',
                            width: `${progress}%`,
                            background: isDone 
                              ? 'linear-gradient(90deg, #10B981 0%, #059669 100%)' 
                              : 'linear-gradient(90deg, #3B82F6 0%, #2563EB 100%)',
                            borderRadius: 99,
                            transition: 'width 0.4s ease'
                          }} />
                        </div>
                        <div style={{ display:'flex', justifyContent:'space-between', marginTop:6, fontSize:11, color:'var(--text-3)', fontWeight:600 }}>
                          <span>{isDone ? 'HOÀN THÀNH' : isWorking ? 'ĐANG THỰC HIỆN' : 'SẮP TỚI'}</span>
                          <span>{progress}%</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions (Complete / Checkmark) */}
                  <div style={{ display: 'flex', alignItems: 'center', alignSelf: 'center' }}>
                    {!isLocked && !isDone && (
                      <button
                        className="btn btn-primary btn-sm"
                        style={{ flexShrink:0 }}
                        onClick={(e) => { e.stopPropagation(); handleComplete(quest._id); }}
                        disabled={completing === quest._id}>
                        {completing === quest._id ? <div className="spinner"/> : <><CheckCircle size={15}/> Hoàn thành</>}
                      </button>
                    )}
                    {isDone && <CheckCircle size={28} color="var(--success)" style={{ flexShrink:0 }} />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

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
                    {CAT_MAP[activeQuestDetails.category]?.label || 'Nhiệm vụ'}
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

      {/* Success Celebration Reward Modal: matches mobile app exactly */}
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
    </div>
  );
}
