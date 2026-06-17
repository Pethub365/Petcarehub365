import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Lock, X, BookOpen, ShoppingBag, Award } from 'lucide-react';
import petApi from '../../api/petApi';
import dailyQuestApi from '../../api/dailyQuestApi';

const CAT_MAP: Record<string, { emoji:string; label:string; color:string; bg:string }> = {
  NUTRITION: { emoji:'🍽️', label:'Dinh dưỡng', color:'#F2994A', bg:'#FFF8E1' },
  DAILY_ROUTINE: { emoji:'🚶', label:'Hoạt động', color:'#2D9CDB', bg:'#E1F0FF' },
  TRAINING: { emoji:'✂️', label:'Chải chuốt', color:'#9B51E0', bg:'#F3E5F5' },
  HEALTH_CARE: { emoji:'❤️', label:'Sức khỏe', color:'#EC4B4B', bg:'#FFF0F0' },
};

function countdown(unlocksAt: string) {
  const diff = new Date(unlocksAt).getTime() - Date.now();
  if (diff <= 0) return 'Sẵn sàng';
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}

const mapCategoryToShop = (cat: string) => {
  if (cat === 'NUTRITION') return 'FOOD';
  if (cat === 'HEALTH_CARE') return 'CARE';
  if (cat === 'TRAINING') return 'TOY';
  if (cat === 'DAILY_ROUTINE') return 'CARE';
  return 'ALL';
};

export default function MissionDetailPage() {
  const navigate = useNavigate();
  const [pets, setPets] = useState<any[]>([]);
  const [selectedPet, setSelectedPet] = useState<any>(null);
  const [quests, setQuests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [completing, setCompleting] = useState<string|null>(null);
  const [, setTick] = useState(0);

  // Modal states
  const [activeQuestId, setActiveQuestId] = useState<string | null>(null);
  const [activeQuestDetails, setActiveQuestDetails] = useState<any | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setTick(n => n + 1), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const res = await petApi.getPets() as any;
      if (res?.success) {
        const list = res.data.pets || [];
        setPets(list);
        const saved = localStorage.getItem('selectedPetId');
        const pet = list.find((p:any) => p._id === saved) || list[0];
        if (pet) { setSelectedPet(pet); await loadQuests(pet._id); }
      }
      setLoading(false);
    };
    load();
  }, []);

  const loadQuests = async (petId: string) => {
    const res = await dailyQuestApi.getDailyQuests(petId) as any;
    if (res?.success) setQuests(res.data.quests || []);
  };

  const handleComplete = async (questId: string) => {
    setCompleting(questId);
    try {
      const res = await dailyQuestApi.completeQuest(questId) as any;
      if (res?.success && activeQuestDetails && activeQuestDetails._id === questId) {
        // Update details in modal if open
        setActiveQuestDetails((prev: any) => ({ ...prev, status: 'COMPLETED' }));
      }
    } catch (err) {
      console.error(err);
    }
    setCompleting(null);
    if (selectedPet) loadQuests(selectedPet._id);
  };

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
          <h1>Nhiệm vụ hàng ngày</h1>
          <p>Hoàn thành nhiệm vụ để nhận XP và phần thưởng</p>
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
              onClick={async () => { setSelectedPet(pet); localStorage.setItem('selectedPetId', pet._id); await loadQuests(pet._id); }}
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

      {/* Progress bar */}
      {selectedPet && quests.length > 0 && (
        <div className="card" style={{ marginBottom:20 }}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8, fontSize:13, fontWeight:600, color:'var(--text-2)' }}>
            <span>Tiến trình hôm nay — {selectedPet.name}</span>
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
            const isLocked = !!quest.isLocked;
            const isDone = quest.status === 'COMPLETED';
            const isWorking = quest.status === 'IN_PROGRESS';
            const cat = CAT_MAP[quest.category] || CAT_MAP.DAILY_ROUTINE;
            const progress = isDone ? 100 : isWorking ? 65 : 0;

            return (
              <div key={quest._id} className="card"
                onClick={() => handleQuestClick(quest)}
                style={{ opacity: isLocked ? 0.65 : 1, transition:'box-shadow .2s', cursor: isLocked ? 'default' : 'pointer' }}
                onMouseEnter={e => { if(!isLocked) (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow)'; }}
                onMouseLeave={e => { if(!isLocked) (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-sm)'; }}>
                <div style={{ display:'flex', alignItems:'flex-start', gap:14 }}>
                  <div style={{ width:52, height:52, borderRadius:14, background:isLocked?'var(--surface2)':cat.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, flexShrink:0 }}>
                    {isLocked ? <Lock size={22} color="#8A9AA9"/> : cat.emoji}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:4 }}>
                      <div style={{ fontWeight:700, fontSize:16, color:'var(--text)' }}>{quest.title}</div>
                      <span className={`chip ${isDone?'chip-green':isLocked?'chip-gray':isWorking?'chip-blue':'chip-yellow'}`}>
                        {isDone?'Hoàn thành':isLocked?'Bị khóa':isWorking?'Đang làm':'Chờ'}
                      </span>
                    </div>
                    <div style={{ fontSize:13, color:'var(--text-3)', marginBottom:8 }}>
                      {isLocked
                        ? `🔒 Mở khóa sau: ${quest.unlocksAt ? countdown(quest.unlocksAt) : '5h cooldown'}`
                        : quest.description}
                    </div>
                    <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:12 }}>
                      <span className="chip chip-green">⭐ +{quest.reward_xp || 0} XP</span>
                      <span className="chip chip-yellow">🪙 +{quest.reward_coin || 10} Coin</span>
                      <span className="chip chip-blue">{cat.label}</span>
                    </div>
                    {!isLocked && (
                      <div>
                        <div className="progress"><div className="progress-fill" style={{ width:`${progress}%` }} /></div>
                        <div style={{ display:'flex', justifyContent:'space-between', marginTop:6, fontSize:11, color:'var(--text-3)', fontWeight:600 }}>
                          <span>{isDone?'HOÀN THÀNH':isWorking?'ĐANG THỰC HIỆN':'SẮP TỚI'}</span>
                          <span>{progress}%</span>
                        </div>
                      </div>
                    )}
                  </div>
                  {!isLocked && !isDone && (
                    <button
                      className="btn btn-primary btn-sm"
                      style={{ flexShrink:0, marginTop:4 }}
                      onClick={(e) => { e.stopPropagation(); handleComplete(quest._id); }}
                      disabled={completing === quest._id}>
                      {completing===quest._id ? <div className="spinner"/> : <><CheckCircle size={15}/> Hoàn thành</>}
                    </button>
                  )}
                  {isDone && <CheckCircle size={28} color="var(--success)" style={{ flexShrink:0, marginTop:2 }} />}
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
                <div className="card" style={{ padding: 14, background: 'var(--surface2)', display: 'flex', justifyContent: 'space-around', marginBottom: 20 }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center', fontWeight: 700, fontSize: 18, color: 'var(--success)' }}>
                      <Award size={18} />
                      +{activeQuestDetails.reward_xp || 0}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 600, marginTop: 2 }}>KINH NGHIỆM XP</div>
                  </div>
                  <div style={{ width: 1, background: 'var(--border)' }} />
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center', fontWeight: 700, fontSize: 18, color: 'var(--gold)' }}>
                      🪙 +{activeQuestDetails.reward_coin || 10}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 600, marginTop: 2 }}>COINS THƯỞNG</div>
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
                        const shopCat = mapCategoryToShop(activeQuestDetails.category);
                        navigate('/shop', { state: { category: shopCat } });
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
    </div>
  );
}
