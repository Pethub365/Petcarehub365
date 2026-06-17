import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit2, Heart, Star, Calendar, Scale } from 'lucide-react';
import petApi from '../../api/petApi';
import dailyQuestApi from '../../api/dailyQuestApi';

export default function PetDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [pet, setPet] = useState<any>(null);
  const [quests, setQuests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await petApi.getPetById(id!) as any;
        if (res?.success) {
          setPet(res.data.pet);
          setForm({ name: res.data.pet.name, breed: res.data.pet.breed || '', weight: res.data.pet.weight || '', age: res.data.pet.age || '' });
          const qRes = await dailyQuestApi.getDailyQuests(id!) as any;
          if (qRes?.success) setQuests(qRes.data.quests || []);
        }
      } finally { setLoading(false); }
    };
    load();
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, String(v)));
    await petApi.updatePet(id!, fd);
    setSaving(false);
    setEditMode(false);
    setMsg('Đã lưu thành công!');
    setTimeout(() => setMsg(''), 3000);
  };

  if (loading) return <div className="page-loader"><div className="spinner spinner-lg" /></div>;
  if (!pet) return <div className="empty-state"><h3>Không tìm thấy thú cưng</h3></div>;

  const level = pet.stats?.level ?? 1;
  const xp = pet.stats?.xp ?? 0;
  const xpNeeded = level * 100 + 800;
  const completedCount = quests.filter(q => q.status === 'COMPLETED').length;

  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:24 }}>
        <button className="icon-btn" onClick={() => navigate('/pets')}><ArrowLeft size={18} /></button>
        <h1 style={{ fontSize:22, fontWeight:800 }}>{pet.name}</h1>
        <button className="btn btn-outline btn-sm" style={{ marginLeft:'auto' }} onClick={() => setEditMode(!editMode)}>
          <Edit2 size={14} /> {editMode ? 'Huỷ' : 'Chỉnh sửa'}
        </button>
      </div>

      {msg && <div style={{ background:'#E8F8EF', border:'1px solid #B2DFDB', borderRadius:10, padding:'12px 16px', marginBottom:16, fontSize:14, color:'var(--success)' }}>{msg}</div>}

      <div style={{ display:'grid', gridTemplateColumns:'300px 1fr', gap:24, alignItems:'start' }}>
        {/* Left: avatar + info */}
        <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
          <div className="card" style={{ textAlign:'center' }}>
            <div className="avatar avatar-xl" style={{ margin:'0 auto 16px', fontSize:40, background:'var(--primary-bg)' }}>
              {pet.avatar_url
                ? <img src={pet.avatar_url} alt={pet.name} style={{ width:'100%', height:'100%', objectFit:'cover', borderRadius:'50%' }} />
                : '🐾'}
            </div>
            {editMode ? (
              <div>
                <div className="form-group"><label className="form-label">Tên</label><input className="form-control" value={form.name} onChange={e => setForm((f:any) => ({...f, name:e.target.value}))} /></div>
                <div className="form-group"><label className="form-label">Giống</label><input className="form-control" value={form.breed} onChange={e => setForm((f:any) => ({...f, breed:e.target.value}))} /></div>
                <div className="form-group"><label className="form-label">Cân nặng (kg)</label><input className="form-control" type="number" value={form.weight} onChange={e => setForm((f:any) => ({...f, weight:e.target.value}))} /></div>
                <div className="form-group"><label className="form-label">Tuổi</label><input className="form-control" type="number" value={form.age} onChange={e => setForm((f:any) => ({...f, age:e.target.value}))} /></div>
                <button className="btn btn-primary" style={{ width:'100%' }} onClick={handleSave} disabled={saving}>
                  {saving ? <><div className="spinner"/>Đang lưu...</> : 'Lưu thay đổi'}
                </button>
              </div>
            ) : (
              <div>
                <div style={{ fontSize:20, fontWeight:800, marginBottom:4 }}>{pet.name}</div>
                <div style={{ fontSize:13, color:'var(--text-3)', textTransform:'capitalize', marginBottom:16 }}>{pet.species} • {pet.breed || 'Không rõ giống'}</div>
                <div style={{ display:'flex', gap:8, justifyContent:'center', flexWrap:'wrap' }}>
                  {pet.age && <span className="chip chip-blue"><Calendar size={11}/> {pet.age} tuổi</span>}
                  {pet.weight && <span className="chip chip-green"><Scale size={11}/> {pet.weight} kg</span>}
                  <span className="chip chip-red"><Star size={11}/> Cấp {level}</span>
                </div>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="card">
            <div className="card-title" style={{ marginBottom:14 }}>Chỉ số</div>
            {[
              { label:'XP', value:`${xp} / ${xpNeeded}`, percent: Math.min(100, Math.round((xp/xpNeeded)*100)), color:'var(--primary)' },
              { label:'Sức khỏe', value:'85%', percent:85, color:'var(--success)' },
              { label:'Hạnh phúc', value:'92%', percent:92, color:'#9B51E0' },
            ].map(s => (
              <div key={s.label} style={{ marginBottom:14 }}>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, marginBottom:6 }}>
                  <span style={{ fontWeight:600, color:'var(--text-2)' }}>{s.label}</span>
                  <span style={{ color:'var(--text-3)' }}>{s.value}</span>
                </div>
                <div className="progress"><div className="progress-fill" style={{ width:`${s.percent}%`, background:s.color }} /></div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Quests today */}
        <div className="card">
          <div className="section-header">
            <span className="section-title">Nhiệm vụ hôm nay ({completedCount}/{quests.length})</span>
            <button className="section-link" onClick={() => navigate('/missions')}>Xem chi tiết →</button>
          </div>
          {quests.length === 0 ? (
            <div className="empty-state"><Heart size={40}/><p>Không có nhiệm vụ hôm nay</p></div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {quests.map(q => (
                <div key={q._id} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 14px', background:'var(--surface2)', borderRadius:12 }}>
                  <div style={{ width:36, height:36, borderRadius:10, background: q.status==='COMPLETED' ? '#E8F8EF' : 'var(--primary-bg)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>
                    {q.status === 'COMPLETED' ? '✅' : q.isLocked ? '🔒' : '⏳'}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:600, fontSize:14 }}>{q.title}</div>
                    <div style={{ fontSize:12, color:'var(--text-3)' }}>{q.description}</div>
                  </div>
                  <span className={`chip ${q.status==='COMPLETED' ? 'chip-green' : q.isLocked ? 'chip-gray' : 'chip-yellow'}`}>
                    {q.status==='COMPLETED' ? 'Xong' : q.isLocked ? 'Khóa' : 'Chưa'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
