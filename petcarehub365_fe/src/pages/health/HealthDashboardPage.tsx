import { useState, useEffect } from 'react';
import { Activity, Plus, Trash2 } from 'lucide-react';
import petApi from '../../api/petApi';
import healthApi from '../../api/healthApi';
import { useAuth } from '../../contexts/AuthContext';

export default function HealthDashboardPage() {
  const { pets, refreshPets } = useAuth();
  const [selectedPet, setSelectedPet] = useState<any>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'log' | 'vaccine'>('log');

  const [logForm, setLogForm] = useState({
    weight: '',
    height: '',
    temperature: '',
    heartRate: '',
    date: new Date().toISOString().split('T')[0],
    note: ''
  });

  const [vaccineForm, setVaccineForm] = useState({
    vaccineName: '',
    administeredDate: new Date().toISOString().split('T')[0],
    nextDueDate: '',
    notes: ''
  });

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const savedId = localStorage.getItem('selectedPetId');
        const pet = pets.find((p: any) => p._id === savedId) || pets[0];
        if (pet) {
          setSelectedPet(pet);
          await loadRecords(pet._id);
        }
      } catch (err) {
        console.error("Error loading health records", err);
      } finally {
        setLoading(false);
      }
    };
    if (pets && pets.length > 0) {
      load();
    } else {
      setLoading(false);
    }
  }, [pets]);

  const loadRecords = async (petId: string) => {
    try {
      const [logsRes, vacRes] = await Promise.all([
        healthApi.getLogs(petId),
        healthApi.getVaccines(petId)
      ]) as any[];

      const dbLogs = logsRes?.success ? (logsRes.data || []) : [];
      const dbVaccines = vacRes?.success ? (vacRes.data || []) : [];

      const transformedLogs: any[] = [];
      dbLogs.forEach((log: any) => {
        transformedLogs.push({
          _id: log._id,
          type: 'WEIGHT',
          value: log.weight,
          date: log.measured_at || log.created_at,
          note: log.note || '',
          isLog: true
        });
        transformedLogs.push({
          _id: log._id,
          type: 'HEIGHT',
          value: log.height,
          date: log.measured_at || log.created_at,
          note: log.note || '',
          isLog: true
        });
        if (log.temperature !== undefined && log.temperature !== null) {
          transformedLogs.push({
            _id: log._id,
            type: 'TEMPERATURE',
            value: log.temperature,
            date: log.measured_at || log.created_at,
            note: log.note || '',
            isLog: true
          });
        }
        if (log.heart_rate !== undefined && log.heart_rate !== null) {
          transformedLogs.push({
            _id: log._id,
            type: 'HEART_RATE',
            value: log.heart_rate,
            date: log.measured_at || log.created_at,
            note: log.note || '',
            isLog: true
          });
        }
      });

      const transformedVaccines = dbVaccines.map((v: any) => ({
        _id: v._id,
        type: 'VACCINE',
        value: v.vaccine_name,
        date: v.administered_date,
        note: v.notes || '',
        isVaccine: true
      }));

      const combined = [...transformedLogs, ...transformedVaccines].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      setRecords(combined);
    } catch (err) {
      console.error("Failed to load health records", err);
    }
  };

  const handleAdd = async () => {
    if (!selectedPet) return;
    setSaving(true);
    try {
      if (activeTab === 'log') {
        if (!logForm.weight || !logForm.height) {
          alert("Vui lòng nhập Cân nặng và Chiều cao");
          setSaving(false);
          return;
         }
        await healthApi.addLog(selectedPet._id, {
          weight: parseFloat(logForm.weight),
          height: parseFloat(logForm.height),
          temperature: logForm.temperature ? parseFloat(logForm.temperature) : undefined,
          heart_rate: logForm.heartRate ? parseInt(logForm.heartRate) : undefined,
          measured_at: logForm.date ? new Date(logForm.date).toISOString() : undefined
        });
        setLogForm({
          weight: '',
          height: '',
          temperature: '',
          heartRate: '',
          date: new Date().toISOString().split('T')[0],
          note: ''
        });
      } else {
        if (!vaccineForm.vaccineName || !vaccineForm.administeredDate) {
          alert("Vui lòng nhập Tên vaccine và Ngày tiêm");
          setSaving(false);
          return;
        }
        await healthApi.addVaccine(selectedPet._id, {
          vaccine_name: vaccineForm.vaccineName,
          administered_date: new Date(vaccineForm.administeredDate).toISOString(),
          next_due_date: vaccineForm.nextDueDate ? new Date(vaccineForm.nextDueDate).toISOString() : undefined,
          notes: vaccineForm.notes
        });
        setVaccineForm({
          vaccineName: '',
          administeredDate: new Date().toISOString().split('T')[0],
          nextDueDate: '',
          notes: ''
        });
      }
      setShowModal(false);
      await loadRecords(selectedPet._id);
      await refreshPets();
    } catch (err) {
      console.error("Failed to save health record", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (record: any) => {
    if (record.isVaccine) {
      await healthApi.deleteVaccine(record._id);
    } else {
      await healthApi.deleteLog(record._id);
    }
    if (selectedPet) loadRecords(selectedPet._id);
  };

  const HEALTH_TYPES = [
    { value:'WEIGHT', label:'Cân nặng', icon:'⚖️', unit:'kg', color:'#2D9CDB', bg:'#E1F0FF' },
    { value:'HEIGHT', label:'Chiều cao', icon:'📏', unit:'cm', color:'#4DACFF', bg:'#E1F0FF' },
    { value:'TEMPERATURE', label:'Nhiệt độ', icon:'🌡️', unit:'°C', color:'#EC4B4B', bg:'#FFF0F0' },
    { value:'HEART_RATE', label:'Nhịp tim', icon:'❤️', unit:'bpm', color:'var(--success)', bg:'#E8F8EF' },
    { value:'VACCINE', label:'Vaccine', icon:'💉', unit:'', color:'#9B51E0', bg:'#F3E5F5' },
    { value:'VET_VISIT', label:'Khám thú y', icon:'🏥', unit:'', color:'#F2994A', bg:'#FFF8E1' },
    { value:'OTHER', label:'Khác', icon:'📋', unit:'', color:'var(--text-3)', bg:'var(--surface2)' },
  ];

  const typeInfo = (type: string) => HEALTH_TYPES.find(t => t.value === type) || HEALTH_TYPES[6];

  const getLatestValue = (type: string, unit = '', fallback = '—') => {
    const sorted = [...records]
      .filter(r => r.type === type)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    if (sorted.length > 0) {
      return `${sorted[0].value}${unit ? ' ' + unit : ''}`;
    }
    return fallback;
  };

  const translateHealthStatus = (status: string) => {
    switch (status) {
      case 'NORMAL': return 'Khỏe mạnh';
      case 'OVERWEIGHT': return 'Thừa cân';
      case 'UNDERWEIGHT': return 'Thiếu cân';
      case 'SICK': return 'Yêu cầu chăm sóc (Ốm)';
      case 'POST_SURGERY': return 'Điều trị sau phẫu thuật';
      default: return 'Bình thường';
    }
  };

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'NORMAL': return 'var(--success)';
      case 'OVERWEIGHT': return 'var(--primary)';
      case 'UNDERWEIGHT': return 'var(--gold)';
      case 'SICK': return 'var(--gold)';
      case 'POST_SURGERY': return 'var(--primary)';
      default: return 'var(--text-1)';
    }
  };

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

      {/* Health Status Updater */}
      {selectedPet && (
        <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12, padding: '16px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="avatar avatar-md" style={{ fontSize: 20, background: 'var(--primary-bg)' }}>
              {selectedPet.avatar_url ? <img src={selectedPet.avatar_url} alt={selectedPet.name} style={{width:'100%',height:'100%',objectFit:'cover',borderRadius:'50%'}}/> : '🐾'}
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>{selectedPet.name}</h3>
              <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-3)' }}>
                Tình trạng sức khỏe hiện tại: <strong style={{ color: getHealthStatusColor(selectedPet.health_status) }}>{translateHealthStatus(selectedPet.health_status)}</strong>
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-2)' }}>Cập nhật tình trạng:</span>
            <select 
              className="form-control" 
              style={{ width: 'auto', padding: '6px 12px', borderRadius: 10, minHeight: 'auto', display: 'inline-block' }}
              value={selectedPet.health_status || 'NORMAL'}
              onChange={async (e) => {
                const newStatus = e.target.value;
                try {
                  const fd = new FormData();
                  fd.append('health_status', newStatus);
                  const res = await petApi.updatePet(selectedPet._id, fd) as any;
                  if (res?.success) {
                    const updatedPet = res.data.pet;
                    setSelectedPet(updatedPet);
                    await refreshPets();
                  }
                } catch (err) {
                  console.error("Failed to update health status", err);
                }
              }}
            >
              <option value="NORMAL">Khỏe mạnh</option>
              <option value="OVERWEIGHT">Thừa cân</option>
              <option value="UNDERWEIGHT">Thiếu cân</option>
              <option value="SICK">Yêu cầu chăm sóc (Ốm)</option>
              <option value="POST_SURGERY">Sau phẫu thuật</option>
            </select>
          </div>
        </div>
      )}

      {/* Stats summary */}
      {selectedPet && (
        <div className="grid grid-4" style={{ marginBottom:24 }}>
          {[
            { icon:'⚖️', label:'Cân nặng', value: getLatestValue('WEIGHT', 'kg', selectedPet.weight ? `${selectedPet.weight} kg` : '—'), color:'#2D9CDB', bg:'#E1F0FF' },
            { icon:'🌡️', label:'Nhiệt độ', value: getLatestValue('TEMPERATURE', '°C'), color:'#EC4B4B', bg:'#FFF0F0' },
            { icon:'❤️', label:'Nhịp tim', value: getLatestValue('HEART_RATE', 'bpm'), color:'var(--success)', bg:'#E8F8EF' },
            { icon:'💉', label:'Vaccine', value: getLatestValue('VACCINE', '', 'Chưa tiêm'), color:'#9B51E0', bg:'#F3E5F5' },
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
                    <tr key={`${r._id}-${r.type}`}>
                      <td>
                        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                          <div style={{ width:36, height:36, borderRadius:10, background:t.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>{t.icon}</div>
                          <span style={{ fontWeight:600 }}>{t.label}</span>
                        </div>
                      </td>
                      <td style={{ fontWeight:700, color:t.color }}>{r.value} {t.unit}</td>
                      <td style={{ color:'var(--text-3)' }}>{new Date(r.date).toLocaleDateString('vi-VN')}</td>
                      <td style={{ color:'var(--text-3)', fontSize:13 }}>{r.note || '—'}</td>
                      <td>
                        <button className="icon-btn" onClick={() => handleDelete(r)}>
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
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px', width: '100%' }}>
            <h2 className="modal-title">Thêm hồ sơ sức khỏe</h2>
            <p style={{ color:'var(--text-3)', fontSize:13, marginBottom:20 }}>Cho {selectedPet?.name}</p>

            {/* Tab Header */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
              <button 
                className={`btn ${activeTab === 'log' ? 'btn-primary' : 'btn-outline'}`} 
                style={{ flex: 1, padding: '8px 16px', borderRadius: '12px', fontSize: '14px', fontWeight: 600 }}
                onClick={() => setActiveTab('log')}
              >
                ⚖️ Chỉ số sức khỏe
              </button>
              <button 
                className={`btn ${activeTab === 'vaccine' ? 'btn-primary' : 'btn-outline'}`} 
                style={{ flex: 1, padding: '8px 16px', borderRadius: '12px', fontSize: '14px', fontWeight: 600 }}
                onClick={() => setActiveTab('vaccine')}
              >
                💉 Vaccine
              </button>
            </div>

            {activeTab === 'log' ? (
              <>
                <div style={{ display: 'flex', gap: 12 }}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Cân nặng (kg) <span style={{ color: 'red' }}>*</span></label>
                    <input className="form-control" type="number" step="0.1" placeholder="Ví dụ: 5.2" value={logForm.weight} onChange={e => setLogForm(f=>({...f,weight:e.target.value}))} />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Chiều cao (cm) <span style={{ color: 'red' }}>*</span></label>
                    <input className="form-control" type="number" placeholder="Ví dụ: 30" value={logForm.height} onChange={e => setLogForm(f=>({...f,height:e.target.value}))} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Nhiệt độ (°C)</label>
                    <input className="form-control" type="number" step="0.1" placeholder="Ví dụ: 38.5" value={logForm.temperature} onChange={e => setLogForm(f=>({...f,temperature:e.target.value}))} />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Nhịp tim (bpm)</label>
                    <input className="form-control" type="number" placeholder="Ví dụ: 100" value={logForm.heartRate} onChange={e => setLogForm(f=>({...f,heartRate:e.target.value}))} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Ngày đo</label>
                  <input className="form-control" type="date" value={logForm.date} onChange={e => setLogForm(f=>({...f,date:e.target.value}))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Ghi chú</label>
                  <textarea className="form-control" rows={2} placeholder="Ghi chú thêm về sức khỏe..." value={logForm.note} onChange={e => setLogForm(f=>({...f,note:e.target.value}))} style={{resize:'vertical'}} />
                </div>
              </>
            ) : (
              <>
                <div className="form-group">
                  <label className="form-label">Tên Vaccine <span style={{ color: 'red' }}>*</span></label>
                  <input className="form-control" placeholder="Ví dụ: Dại (Rabies)" value={vaccineForm.vaccineName} onChange={e => setVaccineForm(f=>({...f,vaccineName:e.target.value}))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Ngày tiêm <span style={{ color: 'red' }}>*</span></label>
                  <input className="form-control" type="date" value={vaccineForm.administeredDate} onChange={e => setVaccineForm(f=>({...f,administeredDate:e.target.value}))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Ngày nhắc lại (Tùy chọn)</label>
                  <input className="form-control" type="date" value={vaccineForm.nextDueDate} onChange={e => setVaccineForm(f=>({...f,nextDueDate:e.target.value}))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Ghi chú</label>
                  <textarea className="form-control" rows={2} placeholder="Ghi chú thêm..." value={vaccineForm.notes} onChange={e => setVaccineForm(f=>({...f,notes:e.target.value}))} style={{resize:'vertical'}} />
                </div>
              </>
            )}

            <div style={{ display:'flex', gap:12, marginTop: 15 }}>
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
