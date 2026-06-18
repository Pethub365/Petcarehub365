import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, ShieldAlert, Heart, TrendingUp, TrendingDown, AlertCircle, Sparkles } from 'lucide-react';
import petApi from '../../api/petApi';
import { useAuth } from '../../contexts/AuthContext';

const SPECIES = ['dog', 'cat', 'other'];
const GENDERS = [{ value: 'MALE', label: 'Đực' }, { value: 'FEMALE', label: 'Cái' }, { value: 'UNKNOWN', label: 'Không rõ' }];

const DOG_BREEDS = ['Poodle', 'Golden Retriever', 'Corgi', 'Husky', 'Chihuahua', 'Khác'];
const CAT_BREEDS = ['British Shorthair', 'British Longhair', 'Persian', 'Scottish Fold', 'Sphynx', 'Khác'];

const HEALTH_STATUSES = [
  { value: 'NORMAL', label: 'Khỏe mạnh', desc: 'Đã được kiểm tra đầy đủ và cập nhật.', color: 'var(--success)', bg: '#E8F8EF', icon: Heart },
  { value: 'OVERWEIGHT', label: 'Thừa cân (Overweight)', desc: 'Cần kiểm soát calo và tăng cường vận động.', color: 'var(--primary)', bg: '#FFEBEB', icon: TrendingUp },
  { value: 'UNDERWEIGHT', label: 'Thiếu cân (Underweight)', desc: 'Cần bổ sung các cữ ăn phụ và men tiêu hóa.', color: 'var(--gold)', bg: '#FFF6E9', icon: TrendingDown },
  { value: 'SICK', label: 'Yêu cầu chăm sóc (Ốm)', desc: 'Các vấn đề nhỏ hoặc cần kiểm tra sức khỏe.', color: 'var(--gold)', bg: '#FFF6E9', icon: AlertCircle },
  { value: 'POST_SURGERY', label: 'Điều trị y tế (Sau phẫu thuật)', desc: 'Hỗ trợ y tế liên tục.', color: 'var(--primary)', bg: '#FFEBEB', icon: AlertCircle },
];

export default function PetSetupPage() {
  const navigate = useNavigate();
  const { refreshPets } = useAuth();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: '',
    species: 'dog',
    breed: 'Poodle',
    gender: 'MALE',
    dob: new Date().toISOString().split('T')[0],
    weight: '',
    health_status: 'NORMAL',
    activity: 'Bình thường',
    feedReminder: true,
    walkReminder: true,
    vetReminder: false,
  });

  const [selectedBreed, setSelectedBreed] = useState('Poodle');
  const [customBreed, setCustomBreed] = useState('');
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

  const handleSpeciesChange = (s: string) => {
    let defaultBreed = '';
    let selB = '';
    if (s === 'dog') {
      defaultBreed = 'Poodle';
      selB = 'Poodle';
    } else if (s === 'cat') {
      defaultBreed = 'British Shorthair';
      selB = 'British Shorthair';
    } else {
      defaultBreed = '';
      selB = '';
    }
    setSelectedBreed(selB);
    setCustomBreed('');
    setForm(f => ({ ...f, species: s, breed: defaultBreed }));
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      setError('Vui lòng nhập tên thú cưng');
      return;
    }

    let finalBreed = form.breed;
    if (form.species === 'dog' || form.species === 'cat') {
      if (selectedBreed === 'Khác') {
        finalBreed = customBreed.trim();
      } else {
        finalBreed = selectedBreed;
      }
    } else {
      finalBreed = form.breed.trim();
    }

    if (!finalBreed) {
      setError('Vui lòng nhập hoặc chọn giống thú cưng');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k === 'breed') {
          fd.append(k, finalBreed);
        } else if (k === 'feedReminder' || k === 'walkReminder' || k === 'vetReminder') {
          // Send reminders info to the form, backend ignores it but API is cleaner
          fd.append(k, String(v));
        } else {
          fd.append(k, String(v));
        }
      });
      if (avatar) fd.append('avatar', avatar);

      const res = await petApi.createPet(fd) as any;
      if (res?.success) {
        const newPet = res.data?.pet;
        if (newPet?._id) {
          localStorage.setItem('selectedPetId', newPet._id);
        }
        await refreshPets();
        navigate('/pets/setup/analyzing', {
          state: {
            petName: newPet?.name || form.name,
            avatarUrl: preview
          }
        });
      } else {
        setError(res?.message || 'Tạo thú cưng thất bại');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi tạo thú cưng');
    } finally {
      setLoading(false);
    }
  };

  const SPECIES_EMOJI: Record<string, string> = { dog: '🐕', cat: '🐈', other: '🐾' };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', paddingBottom: 40 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
        <button className="icon-btn" onClick={() => navigate('/pets')}><ArrowLeft size={18} /></button>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800 }}>Thêm thú cưng mới</h1>
          <p style={{ color: 'var(--text-3)', fontSize: 13 }}>Bước {step}/2 — {step === 1 ? 'Thông tin cơ bản' : 'Sức khỏe & Thói quen'}</p>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 32 }}>
        {[1, 2].map(s => (
          <div key={s} style={{ flex: 1, height: 5, borderRadius: 3, background: s <= step ? 'var(--primary)' : 'var(--border)', transition: 'background .3s' }} />
        ))}
      </div>

      {error && (
        <div style={{ background: '#FFEBEB', border: '1px solid #FFD2D2', borderRadius: 10, padding: '12px 16px', marginBottom: 16, fontSize: 14, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <ShieldAlert size={18} />
          <span>{error}</span>
        </div>
      )}

      <div className="card" style={{ padding: 28 }}>
        {step === 1 ? (
          // ==========================================
          // STEP 1: BASIC INFORMATION
          // ==========================================
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Thông tin cơ bản</h2>
            <p style={{ color: 'var(--text-3)', fontSize: 13, marginBottom: 24 }}>Cho chúng tôi biết một số thông tin đầu tiên của bé</p>

            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <label style={{ cursor: 'pointer' }}>
                <div style={{
                  width: 110, height: 110, borderRadius: '50%', margin: '0 auto 12px',
                  background: 'var(--primary-bg)', border: '2px dashed var(--primary)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  overflow: 'hidden', fontSize: 40, position: 'relative'
                }}>
                  {preview ? (
                    <img src={preview} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span>{SPECIES_EMOJI[form.species]}</span>
                  )}
                </div>
                <input type="file" accept="image/*" onChange={handleImage} style={{ display: 'none' }} />
                <span style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
                  <Upload size={14} /> Tải ảnh đại diện
                </span>
              </label>
            </div>

            <div className="form-group">
              <label className="form-label">Tên Pet *</label>
              <input className="form-control" placeholder="VD: Rudy, Mochi..." value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
            </div>

            <div className="form-group">
              <label className="form-label">Loài thú cưng *</label>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {SPECIES.map(s => (
                  <button key={s} type="button"
                    onClick={() => handleSpeciesChange(s)}
                    style={{
                      flex: 1, padding: '12px', borderRadius: 14,
                      border: `2px solid ${form.species === s ? 'var(--primary)' : 'var(--border)'}`,
                      background: form.species === s ? 'var(--primary-bg)' : 'var(--surface2)',
                      color: form.species === s ? 'var(--primary)' : 'var(--text-2)',
                      fontWeight: 700, fontSize: 14, cursor: 'pointer', textTransform: 'capitalize', gap: 8,
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                    <span style={{ fontSize: 18 }}>{SPECIES_EMOJI[s]}</span>
                    <span>{s === 'dog' ? 'Chó' : s === 'cat' ? 'Mèo' : s === 'bird' ? 'Chim' : 'Khác'}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-2" style={{ gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Giới tính</label>
                <div style={{ display: 'flex', gap: 8, background: 'var(--surface2)', padding: 4, borderRadius: 12, border: '1px solid var(--border)' }}>
                  {GENDERS.map(g => (
                    <button key={g.value} type="button"
                      onClick={() => setForm(f => ({ ...f, gender: g.value }))}
                      style={{
                        flex: 1, padding: '8px', borderRadius: 10, border: 'none',
                        background: form.gender === g.value ? 'var(--primary)' : 'transparent',
                        color: form.gender === g.value ? '#fff' : 'var(--text-2)',
                        fontWeight: 600, fontSize: 13, cursor: 'pointer', transition: 'all .2s'
                      }}>
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Ngày sinh *</label>
                <input className="form-control" type="date" value={form.dob} onChange={e => setForm(f => ({ ...f, dob: e.target.value }))} required />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Cân nặng (kg)</label>
              <input className="form-control" type="number" step="0.1" placeholder="VD: 5.2" value={form.weight} onChange={e => setForm(f => ({ ...f, weight: e.target.value }))} />
            </div>

            <button className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: 12 }}
              onClick={() => {
                if (!form.name.trim()) {
                  setError('Vui lòng nhập tên thú cưng!');
                  return;
                }
                if (!form.dob) {
                  setError('Vui lòng chọn ngày sinh!');
                  return;
                }
                setError('');
                setStep(2);
              }}>
              Tiếp tục →
            </button>
          </div>
        ) : (
          // ==========================================
          // STEP 2: HEALTH & HABITS (MATCHING APP)
          // ==========================================
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Sức khỏe & Thói quen</h2>
            <p style={{ color: 'var(--text-3)', fontSize: 13, marginBottom: 24 }}>Chia sẻ các chỉ số sức khỏe để thiết lập nhiệm vụ phù hợp</p>

            {/* Giống thú cưng */}
            <div className="form-group">
              <label className="form-label">Giống thú cưng *</label>
              {form.species === 'dog' || form.species === 'cat' ? (
                <div>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
                    {(form.species === 'dog' ? DOG_BREEDS : CAT_BREEDS).map(b => (
                      <button key={b} type="button"
                        onClick={() => {
                          setSelectedBreed(b);
                          if (b !== 'Khác') {
                            setForm(f => ({ ...f, breed: b }));
                            setCustomBreed('');
                          } else {
                            setForm(f => ({ ...f, breed: '' }));
                          }
                        }}
                        style={{
                          padding: '8px 16px',
                          borderRadius: 20,
                          border: `2px solid ${selectedBreed === b ? 'var(--primary)' : 'var(--border)'}`,
                          background: selectedBreed === b ? 'var(--primary-bg)' : 'var(--surface2)',
                          color: selectedBreed === b ? 'var(--primary)' : 'var(--text-2)',
                          fontWeight: 600,
                          fontSize: 13,
                          cursor: 'pointer'
                        }}>
                        {b}
                      </button>
                    ))}
                  </div>
                  {selectedBreed === 'Khác' && (
                    <input className="form-control" placeholder="Nhập giống thú cưng khác..." value={customBreed} onChange={e => setCustomBreed(e.target.value)} required />
                  )}
                </div>
              ) : (
                <input className="form-control" placeholder="VD: Rùa, Nhím..." value={form.breed} onChange={e => setForm(f => ({ ...f, breed: e.target.value }))} />
              )}
            </div>

            {/* Tình trạng sức khỏe (Cards) */}
            <div className="form-group" style={{ marginTop: 24 }}>
              <label className="form-label">Tình trạng sức khỏe *</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {HEALTH_STATUSES.map(item => {
                  const Icon = item.icon;
                  const isSelected = form.health_status === item.value;
                  return (
                    <div
                      key={item.value}
                      onClick={() => setForm(f => ({ ...f, health_status: item.value }))}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 16, padding: '14px 18px', borderRadius: 16,
                        border: `2px solid ${isSelected ? item.color : 'var(--border)'}`,
                        background: isSelected ? 'var(--surface)' : 'var(--surface2)',
                        cursor: 'pointer', transition: 'all .2s'
                      }}
                    >
                      <div style={{ width: 40, height: 40, borderRadius: '50%', background: item.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: item.color, flexShrink: 0 }}>
                        <Icon size={20} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: 14, color: isSelected ? item.color : 'var(--text-1)' }}>{item.label}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>{item.desc}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Mức độ hoạt động */}
            <div className="form-group" style={{ marginTop: 24 }}>
              <label className="form-label">Mức độ hoạt động</label>
              <div style={{ display: 'flex', gap: 12, background: 'var(--surface2)', padding: 6, borderRadius: 16, border: '1px solid var(--border)' }}>
                {['Chậm', 'Bình thường', 'Cao'].map(act => {
                  const isActSelected = form.activity === act;
                  return (
                    <button
                      key={act}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, activity: act }))}
                      style={{
                        flex: 1, padding: '12px 10px', borderRadius: 12, border: 'none',
                        background: isActSelected ? 'var(--primary)' : 'transparent',
                        color: isActSelected ? '#fff' : 'var(--text-2)',
                        fontWeight: 700, fontSize: 13, cursor: 'pointer', transition: 'all .2s'
                      }}
                    >
                      {act}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Nhắc nhở hằng ngày */}
            <div className="form-group" style={{ marginTop: 24 }}>
              <label className="form-label">Nhắc nhở hằng ngày</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { key: 'feedReminder', label: 'Giờ cho thú cưng ăn', color: 'orange', bg: '#FFF6E9' },
                  { key: 'walkReminder', label: 'Giờ dắt đi dạo', color: '#4DACFF', bg: '#EBF3FF' },
                  { key: 'vetReminder', label: 'Lịch khám định kỳ', color: '#C462FF', bg: '#F9EFFF' },
                ].map(rem => {
                  const isVal = (form as any)[rem.key];
                  return (
                    <div key={rem.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', background: 'var(--surface2)', borderRadius: 16, border: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: rem.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
                          🔔
                        </div>
                        <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-1)' }}>{rem.label}</span>
                      </div>
                      {/* Custom switch */}
                      <div
                        onClick={() => setForm(f => ({ ...f, [rem.key]: !isVal }))}
                        style={{
                          width: 48, height: 26, borderRadius: 13, padding: 3, cursor: 'pointer',
                          background: isVal ? 'var(--primary)' : '#CCD3DC',
                          display: 'flex', alignItems: 'center',
                          justifyContent: isVal ? 'flex-end' : 'flex-start',
                          transition: 'background-color 0.2s'
                        }}
                      >
                        <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
              <button className="btn btn-outline btn-lg" style={{ flex: 1 }} onClick={() => setStep(1)}>← Quay lại</button>
              <button className="btn btn-primary btn-lg" style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }} onClick={handleSubmit} disabled={loading}>
                {loading ? (
                  <><div className="spinner" />Đang lưu...</>
                ) : (
                  <>
                    <span>🐾 Hoàn thành</span>
                    <Sparkles size={16} />
                  </>
                )}
              </button>
            </div>
            <div style={{ textAlign: 'center', color: 'var(--text-3)', fontSize: 11, fontWeight: 'bold', marginTop: 12, letterSpacing: '0.5px' }}>
              +50 XP & 10 COINS REWARD
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
