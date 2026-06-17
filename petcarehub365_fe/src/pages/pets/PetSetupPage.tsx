import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload } from 'lucide-react';
import petApi from '../../api/petApi';

const SPECIES = ['dog','cat','bird','rabbit','fish','hamster','other'];
const GENDERS = [{ value:'MALE', label:'Đực' }, { value:'FEMALE', label:'Cái' }, { value:'UNKNOWN', label:'Không rõ' }];

export default function PetSetupPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name:'', species:'dog', breed:'', gender:'MALE', age:'', weight:'', description:'' });
  const [avatar, setAvatar] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatar(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!form.name) { setError('Vui lòng nhập tên thú cưng'); return; }
    setError(''); setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, String(v)));
      if (avatar) fd.append('avatar', avatar);
      const res = await petApi.createPet(fd) as any;
      if (res?.success) navigate('/pets');
      else setError(res?.message || 'Tạo thú cưng thất bại');
    } finally { setLoading(false); }
  };

  const SPECIES_EMOJI: Record<string, string> = { dog:'🐕', cat:'🐈', bird:'🦜', rabbit:'🐇', fish:'🐟', hamster:'🐹', other:'🐾' };

  return (
    <div style={{ maxWidth:560, margin:'0 auto' }}>
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:28 }}>
        <button className="icon-btn" onClick={() => navigate('/pets')}><ArrowLeft size={18}/></button>
        <div>
          <h1 style={{ fontSize:22, fontWeight:800 }}>Thêm thú cưng mới</h1>
          <p style={{ color:'var(--text-3)', fontSize:13 }}>Bước {step}/2</p>
        </div>
      </div>

      {/* Progress */}
      <div style={{ display:'flex', gap:8, marginBottom:32 }}>
        {[1,2].map(s => (
          <div key={s} style={{ flex:1, height:4, borderRadius:2, background: s<=step ? 'var(--primary)' : 'var(--border)', transition:'background .3s' }} />
        ))}
      </div>

      {error && <div style={{ background:'var(--primary-bg)', border:'1px solid var(--primary-border)', borderRadius:10, padding:'12px 16px', marginBottom:16, fontSize:14, color:'var(--primary)' }}>{error}</div>}

      <div className="card">
        {step === 1 ? (
          <div>
            <h2 style={{ fontSize:18, fontWeight:700, marginBottom:4 }}>Thông tin cơ bản</h2>
            <p style={{ color:'var(--text-3)', fontSize:13, marginBottom:24 }}>Cho chúng tôi biết về thú cưng của bạn</p>

            <div className="form-group">
              <label className="form-label">Tên thú cưng *</label>
              <input className="form-control" placeholder="VD: Mochi, Buddy..." value={form.name} onChange={e => setForm(f=>({...f,name:e.target.value}))} />
            </div>

            <div className="form-group">
              <label className="form-label">Loài *</label>
              <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
                {SPECIES.map(s => (
                  <button key={s} type="button"
                    onClick={() => setForm(f=>({...f,species:s}))}
                    style={{
                      padding:'10px 16px', borderRadius:12,
                      border: `2px solid ${form.species===s ? 'var(--primary)' : 'var(--border)'}`,
                      background: form.species===s ? 'var(--primary-bg)' : 'var(--surface2)',
                      color: form.species===s ? 'var(--primary)' : 'var(--text-2)',
                      fontWeight:600, fontSize:14, cursor:'pointer', textTransform:'capitalize', gap:6,
                      display:'flex', alignItems:'center'
                    }}>
                    {SPECIES_EMOJI[s]} {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Giới tính</label>
              <div style={{ display:'flex', gap:10 }}>
                {GENDERS.map(g => (
                  <button key={g.value} type="button"
                    onClick={() => setForm(f=>({...f,gender:g.value}))}
                    style={{
                      flex:1, padding:'10px', borderRadius:12,
                      border:`2px solid ${form.gender===g.value ? 'var(--primary)' : 'var(--border)'}`,
                      background: form.gender===g.value ? 'var(--primary-bg)' : 'var(--surface2)',
                      color: form.gender===g.value ? 'var(--primary)' : 'var(--text-2)',
                      fontWeight:600, fontSize:14, cursor:'pointer'
                    }}>
                    {g.label}
                  </button>
                ))}
              </div>
            </div>

            <button className="btn btn-primary btn-lg" style={{ width:'100%', marginTop:8 }}
              onClick={() => { if(!form.name){ setError('Vui lòng nhập tên!'); return; } setError(''); setStep(2); }}>
              Tiếp tục →
            </button>
          </div>
        ) : (
          <div>
            <h2 style={{ fontSize:18, fontWeight:700, marginBottom:4 }}>Chi tiết & Ảnh đại diện</h2>
            <p style={{ color:'var(--text-3)', fontSize:13, marginBottom:24 }}>Thêm thông tin chi tiết (tuỳ chọn)</p>

            <div style={{ textAlign:'center', marginBottom:24 }}>
              <label style={{ cursor:'pointer' }}>
                <div style={{
                  width:100, height:100, borderRadius:'50%', margin:'0 auto 12px',
                  background:'var(--primary-bg)', border:'2px dashed var(--primary)',
                  display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
                  overflow:'hidden', fontSize:40
                }}>
                  {preview
                    ? <img src={preview} alt="avatar" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                    : <>{SPECIES_EMOJI[form.species]}</>
                  }
                </div>
                <input type="file" accept="image/*" onChange={handleImage} style={{ display:'none' }} />
                <span style={{ fontSize:13, color:'var(--primary)', fontWeight:600, display:'flex', alignItems:'center', gap:6, justifyContent:'center' }}>
                  <Upload size={14}/> Tải ảnh lên
                </span>
              </label>
            </div>

            <div className="grid grid-2">
              <div className="form-group">
                <label className="form-label">Giống</label>
                <input className="form-control" placeholder="VD: Golden Retriever..." value={form.breed} onChange={e => setForm(f=>({...f,breed:e.target.value}))} />
              </div>
              <div className="form-group">
                <label className="form-label">Tuổi (năm)</label>
                <input className="form-control" type="number" placeholder="VD: 2" value={form.age} onChange={e => setForm(f=>({...f,age:e.target.value}))} />
              </div>
              <div className="form-group">
                <label className="form-label">Cân nặng (kg)</label>
                <input className="form-control" type="number" placeholder="VD: 5.5" value={form.weight} onChange={e => setForm(f=>({...f,weight:e.target.value}))} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Ghi chú / Mô tả</label>
              <textarea className="form-control" rows={3} placeholder="Tính cách, đặc điểm nổi bật..." value={form.description} onChange={e => setForm(f=>({...f,description:e.target.value}))} style={{ resize:'vertical' }} />
            </div>

            <div style={{ display:'flex', gap:12, marginTop:8 }}>
              <button className="btn btn-outline btn-lg" style={{ flex:1 }} onClick={() => setStep(1)}>← Quay lại</button>
              <button className="btn btn-primary btn-lg" style={{ flex:2 }} onClick={handleSubmit} disabled={loading}>
                {loading ? <><div className="spinner"/>Đang tạo...</> : '🐾 Tạo thú cưng'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
