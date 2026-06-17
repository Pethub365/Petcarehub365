import { useState, useEffect } from 'react';
import { Activity, Plus, Trash2 } from 'lucide-react';
import petApi from '../../api/petApi';
import healthApi from '../../api/healthApi';

export default function HealthDashboardPage() {
  const [pets, setPets] = useState<any[]>([]);
  const [selectedPet, setSelectedPet] = useState<any>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ type:'WEIGHT', value:'', note:'', date: new Date().toISOString().split('T')[0] });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      const res = await petApi.getPets() as any;
      if (res?.success) {
        const list = res.data.pets || [];
        setPets(list);
        const saved = localStorage.getItem('selectedPetId');
        const pet = list.find((p:any) => p._id === saved) || list[0];
        if (pet) { setSelectedPet(pet); await loadRecords(pet._id); }
      }
      setLoading(false);
    };
    load();
  }, []);

  const loadRecords = async (petId: string) => {
    const res = await healthApi.getHealthRecords(petId) as any;
    if (res?.success) setRecords(res.data.records || []);
  };

  const handleAdd = async () => {
    if (!form.value) return;
    setSaving(true);
    await healthApi.createHealthRecord({ ...form, pet_id: selectedPet._id });
    setSaving(false);
    setShowModal(false);
    setForm({ type:'WEIGHT', value:'', note:'', date: new Date().toISOString().split('T')[0] });
    if (selectedPet) loadRecords(selectedPet._id);
  };

  const handleDelete = async (id: string) => {
    await healthApi.deleteHealthRecord(id);
    if (selectedPet) loadRecords(selectedPet._id);
  };

  const HEALTH_TYPES = [
    { value:'WEIGHT', label:'Cân nặng', icon:'⚖️', unit:'kg', color:'#2D9CDB', bg:'#E1F0FF' },
    { value:'TEMPERATURE', label:'Nhiệt độ', icon:'🌡️', unit:'°C', color:'#EC4B4B', bg:'#FFF0F0' },
    { value:'HEART_RATE', label:'Nhịp tim', icon:'❤️', unit:'bpm', color:'var(--success)', bg:'#E8F8EF' },
    { value:'VACCINE', label:'Vaccine', icon:'💉', unit:'', color:'#9B51E0', bg:'#F3E5F5' },
    { value:'VET_VISIT', label:'Khám thú y', icon:'🏥', unit:'', color:'#F2994A', bg:'#FFF8E1' },
    { value:'OTHER', label:'Khác', icon:'📋', unit:'', color:'var(--text-3)', bg:'var(--surface2)' },
  ];

  const typeInfo = (type: string) => HEALTH_TYPES.find(t => t.value === type) || HEALTH_TYPES[5];

  return (
    <div>
      <div className="page-header" style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
        <div>
          <h1>Sức khỏe thú cưng</h1>
          <p>Theo dõi sức khỏe và lịch sử khám bệnh</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)} disabled={!selectedPet}>
          <Plus size={16}/> Thêm hồ sơ
        </button>
      </div>

      {/* Pet selector */}
      {pets.length > 0 && (
        <div style={{ display:'flex', gap:10, marginBottom:20, overflowX:'auto' }}>
          {pets.map(pet => (
            <button key={pet._id}
              onClick={async () => { setSelectedPet(pet); localStorage.setItem('selectedPetId', pet._id); await loadRecords(pet._id); }}
              style={{
                display:'flex', alignItems:'center', gap:8, padding:'8px 16px', borderRadius:20,
                border:`2px solid ${selectedPet?._id===pet._id?'var(--primary)':'var(--border)'}`,
                background: selectedPet?._id===pet._id?'var(--primary-bg)':'var(--surface)',
                color: selectedPet?._id===pet._id?'var(--primary)':'var(--text-2)',
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

      {/* Stats summary */}
      {selectedPet && (
        <div className="grid grid-4" style={{ marginBottom:24 }}>
          {[
            { icon:'⚖️', label:'Cân nặng', value: selectedPet.weight ? `${selectedPet.weight} kg` : '—', color:'#2D9CDB', bg:'#E1F0FF' },
            { icon:'🌡️', label:'Nhiệt độ', value:'38.5°C', color:'#EC4B4B', bg:'#FFF0F0' },
            { icon:'❤️', label:'Nhịp tim', value:'85 bpm', color:'var(--success)', bg:'#E8F8EF' },
            { icon:'💉', label:'Vaccine', value:'Đã tiêm', color:'#9B51E0', bg:'#F3E5F5' },
          ].map(s => (
            <div key={s.label} className="card" style={{ display:'flex', alignItems:'center', gap:12 }}>
              <div style={{ width:48, height:48, borderRadius:14, background:s.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, flexShrink:0 }}>{s.icon}</div>
              <div>
                <div style={{ fontSize:18, fontWeight:800, color:s.color }}>{s.value}</div>
                <div style={{ fontSize:12, color:'var(--text-3)' }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Records */}
      <div className="card">
        <div className="section-header" style={{ marginBottom:16 }}>
          <span className="section-title">Lịch sử sức khỏe</span>
          <span style={{ fontSize:13, color:'var(--text-3)' }}>{records.length} hồ sơ</span>
        </div>

        {loading ? (
          <div className="page-loader"><div className="spinner spinner-lg"/></div>
        ) : records.length === 0 ? (
          <div className="empty-state" style={{ padding:'40px 0' }}>
            <Activity size={48}/>
            <h3>Chưa có hồ sơ sức khỏe</h3>
            <p>Nhấn "Thêm hồ sơ" để bắt đầu theo dõi</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Loại</th><th>Giá trị</th><th>Ngày</th><th>Ghi chú</th><th></th>
                </tr>
              </thead>
              <tbody>
                {records.map(r => {
                  const t = typeInfo(r.type);
                  return (
                    <tr key={r._id}>
                      <td>
                        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                          <div style={{ width:36, height:36, borderRadius:10, background:t.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>{t.icon}</div>
                          <span style={{ fontWeight:600 }}>{t.label}</span>
                        </div>
                      </td>
                      <td style={{ fontWeight:700, color:t.color }}>{r.value} {t.unit}</td>
                      <td style={{ color:'var(--text-3)' }}>{new Date(r.date || r.createdAt).toLocaleDateString('vi-VN')}</td>
                      <td style={{ color:'var(--text-3)', fontSize:13 }}>{r.note || '—'}</td>
                      <td>
                        <button className="icon-btn" onClick={() => handleDelete(r._id)}>
                          <Trash2 size={15} style={{ color:'var(--primary)' }} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">Thêm hồ sơ sức khỏe</h2>
            <p style={{ color:'var(--text-3)', fontSize:13, marginBottom:20 }}>Cho {selectedPet?.name}</p>

            <div className="form-group">
              <label className="form-label">Loại</label>
              <select className="form-control" value={form.type} onChange={e => setForm(f=>({...f,type:e.target.value}))}>
                {HEALTH_TYPES.map(t => <option key={t.value} value={t.value}>{t.icon} {t.label}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Giá trị</label>
              <input className="form-control" placeholder="Nhập giá trị..." value={form.value} onChange={e => setForm(f=>({...f,value:e.target.value}))} />
            </div>
            <div className="form-group">
              <label className="form-label">Ngày</label>
              <input className="form-control" type="date" value={form.date} onChange={e => setForm(f=>({...f,date:e.target.value}))} />
            </div>
            <div className="form-group">
              <label className="form-label">Ghi chú</label>
              <textarea className="form-control" rows={2} placeholder="Ghi chú thêm..." value={form.note} onChange={e => setForm(f=>({...f,note:e.target.value}))} style={{resize:'vertical'}} />
            </div>
            <div style={{ display:'flex', gap:12 }}>
              <button className="btn btn-outline" style={{ flex:1 }} onClick={() => setShowModal(false)}>Huỷ</button>
              <button className="btn btn-primary" style={{ flex:2 }} onClick={handleAdd} disabled={saving}>
                {saving ? <><div className="spinner"/>Đang lưu...</> : 'Lưu hồ sơ'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
