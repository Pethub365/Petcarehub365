import { useState, useEffect } from 'react';
import { Activity, Plus, TrendingUp } from 'lucide-react';
import petApi from '../../api/petApi';
import healthApi from '../../api/healthApi';
import { useAuth } from '../../contexts/AuthContext';



export default function HealthDashboardPage() {
  const { pets, refreshPets } = useAuth();
  const [selectedPet, setSelectedPet] = useState<any>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [rawLogs, setRawLogs] = useState<any[]>([]); // For health milestone chart
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'log' | 'vaccine'>('log');
  
  // Chart metric tabs toggle: 'STATUS' (Mốc sức khỏe) is default
  const [selectedMetric, setSelectedMetric] = useState<'STATUS' | 'WEIGHT'>('STATUS');
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

  const [logForm, setLogForm] = useState({
    weight: '',
    healthStatus: 'NORMAL',
    date: new Date().toISOString().split('T')[0],
    note: ''
  });

  // Inline update states for the unified card
  const [showInlineUpdate, setShowInlineUpdate] = useState(false);
  const [inlineWeight, setInlineWeight] = useState('');
  const [inlineStatus, setInlineStatus] = useState('NORMAL');

  const [vaccineForm, setVaccineForm] = useState({
    vaccineName: '',
    administeredDate: new Date().toISOString().split('T')[0],
    nextDueDate: '',
    notes: '',
    healthStatus: 'NORMAL'
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

      setRawLogs(dbLogs);

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
      });

      const transformedVaccines = dbVaccines.map((v: any) => ({
        _id: v._id,
        type: 'VACCINE',
        value: v.vaccine_name,
        date: v.administered_date,
        next_due_date: v.next_due_date,
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
        if (!logForm.weight) {
          alert("Vui lòng nhập Cân nặng");
          setSaving(false);
          return;
        }
        // 1. Add health log for weight
        await healthApi.addLog(selectedPet._id, {
          weight: parseFloat(logForm.weight),
          measured_at: logForm.date ? new Date(logForm.date).toISOString() : undefined
        });

        // 2. Update pet health status
        const fd = new FormData();
        fd.append('health_status', logForm.healthStatus);
        const res = await petApi.updatePet(selectedPet._id, fd) as any;
        if (res?.success) {
          setSelectedPet(res.data.pet);
        }

        setLogForm({
          weight: '',
          healthStatus: 'NORMAL',
          date: new Date().toISOString().split('T')[0],
          note: ''
        });
      } else {
        if (!vaccineForm.vaccineName || !vaccineForm.administeredDate) {
          alert("Vui lòng nhập Tên vaccine và Ngày tiêm");
          setSaving(false);
          return;
        }
        // 1. Add vaccine
        await healthApi.addVaccine(selectedPet._id, {
          vaccine_name: vaccineForm.vaccineName,
          administered_date: new Date(vaccineForm.administeredDate).toISOString(),
          next_due_date: vaccineForm.nextDueDate ? new Date(vaccineForm.nextDueDate).toISOString() : undefined,
          notes: vaccineForm.notes
        });

        // 2. Update pet health status
        const fd = new FormData();
        fd.append('health_status', vaccineForm.healthStatus);
        const res = await petApi.updatePet(selectedPet._id, fd) as any;
        if (res?.success) {
          setSelectedPet(res.data.pet);
        }

        setVaccineForm({
          vaccineName: '',
          administeredDate: new Date().toISOString().split('T')[0],
          nextDueDate: '',
          notes: '',
          healthStatus: 'NORMAL'
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

  const handleToggleInlineUpdate = () => {
    setShowInlineUpdate(!showInlineUpdate);
    if (!showInlineUpdate) {
      setInlineWeight(selectedPet?.weight?.toString() || '');
      setInlineStatus(selectedPet?.health_status || 'NORMAL');
    }
  };

  const handleInlineSave = async () => {
    if (!selectedPet) return;
    if (!inlineWeight) {
      alert("Vui lòng nhập cân nặng");
      return;
    }
    setSaving(true);
    try {
      // 1. Add log (weight)
      await healthApi.addLog(selectedPet._id, {
        weight: parseFloat(inlineWeight),
        measured_at: new Date().toISOString()
      });
      // 2. Update pet health status
      const fd = new FormData();
      fd.append('health_status', inlineStatus);
      const res = await petApi.updatePet(selectedPet._id, fd) as any;
      if (res?.success) {
        setSelectedPet(res.data.pet);
      }
      setShowInlineUpdate(false);
      await loadRecords(selectedPet._id);
      await refreshPets();
    } catch (err) {
      console.error("Failed to update health status and weight", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteVaccine = async (vacId: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa lịch tiêm vaccine này?")) return;
    try {
      const res = await healthApi.deleteVaccine(vacId) as any;
      if (res?.success) {
        await loadRecords(selectedPet._id);
        await refreshPets();
      }
    } catch (err) {
      console.error("Failed to delete vaccine record", err);
    }
  };






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
      case 'SICK': return 'Đang bệnh';
      case 'POST_SURGERY': return 'Hồi phục sau phẫu thuật';
      default: return 'Bình thường';
    }
  };

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'NORMAL': return '#10B981'; // Green
      case 'OVERWEIGHT': return '#3B82F6'; // Blue
      case 'UNDERWEIGHT': return '#F59E0B'; // Orange/Gold
      case 'SICK': return '#EF4444'; // Red
      case 'POST_SURGERY': return '#8B5CF6'; // Purple
      default: return 'var(--text-2)';
    }
  };

  // reference ranges based on species
  const getRanges = (species: string = '') => {
    const isCat = species?.toLowerCase() === 'cat' || species?.toLowerCase() === 'mèo';
    return {
      WEIGHT: isCat ? { min: 3.5, max: 5.5, unit: 'kg' } : { min: 5.0, max: 30.0, unit: 'kg' },
      TEMPERATURE: isCat ? { min: 38.0, max: 39.2, unit: '°C' } : { min: 37.5, max: 39.2, unit: '°C' },
      HEART_RATE: isCat ? { min: 120, max: 200, unit: 'bpm' } : { min: 70, max: 120, unit: 'bpm' },
      HEIGHT: isCat ? { min: 20, max: 30, unit: 'cm' } : { min: 20, max: 70, unit: 'cm' }
    };
  };

  const getMetricColor = (metric: string) => {
    switch (metric) {
      case 'STATUS': return '#8B5CF6';
      case 'WEIGHT': return '#2D9CDB';
      case 'TEMPERATURE': return '#EC4B4B';
      case 'HEART_RATE': return '#22C55E';
      default: return '#2D9CDB';
    }
  };

  const getSparklineData = () => {
    const metricRecords = records
      .filter(r => r.type === selectedMetric)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return metricRecords.slice(-10);
  };

  const chartDataPoints = getSparklineData();
  const metricColor = getMetricColor(selectedMetric);

  // Health Status Milestones Weekly Chart Calculations
  const getStatusValue = (statusStr: string) => {
    switch (statusStr) {
      case 'NORMAL': return 4;
      case 'UNDERWEIGHT':
      case 'OVERWEIGHT': return 3;
      case 'POST_SURGERY': return 2;
      case 'SICK': return 1;
      default: return 4;
    }
  };

  const getStatusLabel = (statusVal: number) => {
    switch (statusVal) {
      case 4: return '🟢 Khỏe mạnh';
      case 3: return '🟡 Cân nặng';
      case 2: return '🟣 Sau mổ';
      case 1: return '🔴 Đang bệnh';
      default: return '🟢 Khỏe';
    }
  };

  const getStatusColor = (statusVal: number) => {
    switch (statusVal) {
      case 4: return '#10B981';
      case 3: return '#F59E0B';
      case 2: return '#8B5CF6';
      case 1: return '#EF4444';
      default: return '#10B981';
    }
  };

  const getLogComputedStatus = (log: any, species: string = '') => {
    const isCat = species?.toLowerCase() === 'cat' || species?.toLowerCase() === 'mèo';
    const ranges = {
      WEIGHT: isCat ? { min: 3.5, max: 5.5 } : { min: 5.0, max: 30.0 }
    };

    if (log.weight !== null && log.weight !== undefined && log.weight !== 0) {
      const w = Number(log.weight);
      if (w < ranges.WEIGHT.min) return 'UNDERWEIGHT';
      if (w > ranges.WEIGHT.max) return 'OVERWEIGHT';
    }

    return 'NORMAL';
  };

  // Calculate vaccine alerts
  const vaccineRecords = records.filter(r => r.isVaccine);
  const getVaccineAlerts = () => {
    let overdue = 0;
    let dueSoon = 0;
    vaccineRecords.forEach(v => {
      if (v.next_due_date) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const due = new Date(v.next_due_date);
        due.setHours(0, 0, 0, 0);
        const daysDiff = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        if (daysDiff < 0) overdue++;
        else if (daysDiff <= 15) dueSoon++;
      }
    });
    return { overdue, dueSoon, total: vaccineRecords.length };
  };

  const vacAlerts = getVaccineAlerts();

  return (
    <div style={{ paddingBottom: 40 }}>
      {/* Page Header - Match screenshot */}
      <div className="page-header" style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800 }}>Sức khỏe thú cưng</h1>
          <p style={{ fontSize: 13, color: 'var(--text-3)' }}>Theo dõi sức khỏe và lịch sử khám bệnh</p>
        </div>
        <button className="btn btn-primary" onClick={() => {
          setShowModal(true);
          setLogForm(f => ({
            ...f,
            weight: '',
            healthStatus: selectedPet?.health_status || 'NORMAL',
            date: new Date().toISOString().split('T')[0],
            note: ''
          }));
        }} disabled={!selectedPet}>
          <Plus size={16}/> Thêm hồ sơ
        </button>
      </div>

      {/* Pet Selector Capsules - Match screenshot style */}
      {pets.length > 0 && (
        <div style={{ display:'flex', gap:10, marginBottom:20, overflowX:'auto', paddingBottom: 6 }}>
          {pets.map(pet => (
            <button key={pet._id}
              onClick={async () => { 
                setSelectedPet(pet); 
                localStorage.setItem('selectedPetId', pet._id); 
                await loadRecords(pet._id); 
              }}
              style={{
                display:'flex', alignItems:'center', gap:8, padding:'6px 16px', borderRadius:20,
                border:`1px solid ${selectedPet?._id===pet._id?'var(--primary)':'var(--border)'}`,
                background: selectedPet?._id===pet._id?'var(--primary-bg)':'var(--surface)',
                color: selectedPet?._id===pet._id?'var(--primary)':'var(--text-2)',
                fontWeight:600, fontSize:13, cursor:'pointer', whiteSpace:'nowrap', flexShrink:0,
                transition: 'all 0.15s'
              }}>
              <div className="avatar avatar-sm" style={{ fontSize:12, width: 22, height: 22 }}>
                {pet.avatar_url ? <img src={pet.avatar_url} alt={pet.name} style={{width:'100%',height:'100%',objectFit:'cover',borderRadius:'50%'}}/> : '🐾'}
              </div>
              {pet.name}
            </button>
          ))}
        </div>
      )}

      {selectedPet ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Unified Pet Health Card */}
          <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Upper row: Avatar, Info, and current stats */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
              {/* Pet identity */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div className="avatar avatar-md" style={{ fontSize: 18, width: 48, height: 48 }}>
                  {selectedPet.avatar_url ? <img src={selectedPet.avatar_url} alt={selectedPet.name} style={{width:'100%',height:'100%',objectFit:'cover',borderRadius:'50%'}}/> : '🐾'}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>{selectedPet.name}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                    <span style={{ fontSize: 13, color: 'var(--text-3)' }}>Tình trạng:</span>
                    <span style={{ 
                      fontSize: 12, 
                      fontWeight: 700, 
                      padding: '2px 8px', 
                      borderRadius: 12, 
                      background: `${getHealthStatusColor(selectedPet.health_status)}15`, 
                      color: getHealthStatusColor(selectedPet.health_status) 
                    }}>
                      {translateHealthStatus(selectedPet.health_status)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Stats & Actions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
                {/* Weight Stat Pill */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#E1F0FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2D9CDB', fontSize: 16 }}>
                    ⚖️
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text)' }}>
                      {getLatestValue('WEIGHT', 'kg', selectedPet.weight ? `${selectedPet.weight} kg` : '—')}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-3)' }}>Cân nặng</div>
                  </div>
                </div>

                {/* Vaccine Stat Pill */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#F3E5F5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9B51E0', fontSize: 16 }}>
                    💉
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text)' }}>
                      {vacAlerts.overdue > 0 ? `Quá hạn` : vacAlerts.dueSoon > 0 ? `Sắp tiêm` : vaccineRecords.length > 0 ? `Đã tiêm` : `Chưa tiêm`}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-3)' }}>Vaccine</div>
                  </div>
                </div>

                {/* Toggle Button */}
                <button 
                  className={`btn ${showInlineUpdate ? 'btn-secondary' : 'btn-primary'}`} 
                  onClick={handleToggleInlineUpdate}
                  style={{ padding: '8px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  ⚙️ Cập nhật sức khỏe
                </button>
              </div>
            </div>

            {/* Collapsible Detail Panel to Update Health Status & Weight */}
            {showInlineUpdate && (
              <div style={{ 
                background: 'var(--surface2)', 
                borderRadius: '12px', 
                padding: '16px', 
                border: '1px solid var(--border)',
                animation: 'slideDown 0.2s ease-out' 
              }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: 14, fontWeight: 700, color: 'var(--text-2)' }}>
                  📝 Cập nhật cân nặng & tình trạng sức khỏe
                </h4>
                
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                  {/* Weight input */}
                  <div style={{ flex: '1 1 150px' }}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 6 }}>
                      Cân nặng mới (kg) <span style={{ color: 'red' }}>*</span>
                    </label>
                    <input 
                      type="number" 
                      step="0.1" 
                      className="form-control" 
                      placeholder="Nhập số kg..." 
                      value={inlineWeight} 
                      onChange={e => setInlineWeight(e.target.value)}
                      style={{ height: '38px', minHeight: 'auto' }}
                    />
                  </div>

                  {/* Health status select */}
                  <div style={{ flex: '1 1 180px' }}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 6 }}>
                      Tình trạng sức khỏe
                    </label>
                    <select 
                      className="form-control" 
                      value={inlineStatus} 
                      onChange={e => setInlineStatus(e.target.value)}
                      style={{ height: '38px', minHeight: 'auto', background: 'var(--surface)' }}
                    >
                      <option value="NORMAL">Khỏe mạnh</option>
                      <option value="OVERWEIGHT">Thừa cân</option>
                      <option value="UNDERWEIGHT">Thiếu cân</option>
                      <option value="SICK">Đang bệnh</option>
                      <option value="POST_SURGERY">Sau phẫu thuật</option>
                    </select>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                    <button 
                      className="btn btn-outline" 
                      onClick={() => setShowInlineUpdate(false)}
                      style={{ padding: '8px 16px', height: '38px', borderRadius: 10, fontSize: 13 }}
                    >
                      Hủy
                    </button>
                    <button 
                      className="btn btn-primary" 
                      onClick={handleInlineSave}
                      disabled={saving}
                      style={{ padding: '8px 16px', height: '38px', borderRadius: 10, fontSize: 13 }}
                    >
                      {saving ? 'Đang lưu...' : 'Cập nhật'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Weekly Status & Metrics Chart Card */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
              <div>
                <h3 className="card-title" style={{ fontSize: 15, fontWeight: 700 }}>📊 Biểu đồ cập nhật sức khỏe</h3>
                <p className="card-sub" style={{ fontSize: 11 }}>
                  {selectedMetric === 'STATUS' ? 'Theo dõi các mốc sức khỏe (khỏe, ốm, cân nặng...) cập nhật theo tuần' : 'Theo dõi chỉ số sinh lý đo được theo thời gian'}
                </p>
              </div>
              
              {/* Metric Selector Tabs */}
              <div style={{ display: 'flex', gap: 6, background: 'var(--surface2)', padding: 4, borderRadius: 10 }}>
                <button 
                  onClick={() => { setSelectedMetric('STATUS'); setHoveredPoint(null); }}
                  style={{
                    padding: '5px 12px', fontSize: 11, fontWeight: 600, borderRadius: 8,
                    background: selectedMetric === 'STATUS' ? 'var(--surface)' : 'transparent',
                    color: selectedMetric === 'STATUS' ? '#8B5CF6' : 'var(--text-3)',
                    boxShadow: selectedMetric === 'STATUS' ? 'var(--shadow-xs)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  Mốc sức khỏe
                </button>
                <button 
                  onClick={() => { setSelectedMetric('WEIGHT'); setHoveredPoint(null); }}
                  style={{
                    padding: '5px 12px', fontSize: 11, fontWeight: 600, borderRadius: 8,
                    background: selectedMetric === 'WEIGHT' ? 'var(--surface)' : 'transparent',
                    color: selectedMetric === 'WEIGHT' ? '#2D9CDB' : 'var(--text-3)',
                    boxShadow: selectedMetric === 'WEIGHT' ? 'var(--shadow-xs)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  Cân nặng
                </button>
              </div>
            </div>

            {/* SVG Chart display */}
            {loading ? (
              <div className="page-loader" style={{ height: 180 }}><div className="spinner"/></div>
            ) : selectedMetric === 'STATUS' ? (
              /* Milestone Status chart */
              rawLogs.length < 2 ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 180, color: 'var(--text-3)' }}>
                  <TrendingUp size={36} opacity={0.3} style={{ marginBottom: 8 }} />
                  <p style={{ fontSize: 13, fontWeight: 500 }}>Cần tối thiểu 2 mốc nhật ký để vẽ biểu đồ.</p>
                </div>
              ) : (
                <div style={{ width: '100%', overflow: 'hidden' }}>
                  {(() => {
                    const padding = { top: 25, right: 30, bottom: 40, left: 110 };
                    const chartWidth = 500 - padding.left - padding.right;
                    const chartHeight = 200 - padding.top - padding.bottom;

                    const sortedLogs = [...rawLogs].sort(
                      (a, b) => new Date(a.measured_at || a.created_at).getTime() - new Date(b.measured_at || b.created_at).getTime()
                    );

                    const dates = sortedLogs.map(l => new Date(l.measured_at || l.created_at).getTime());
                    const minDate = Math.min(...dates);
                    const maxDate = Math.max(...dates);
                    const dateRange = maxDate - minDate || 1;

                    const getX = (dateMs: number) => padding.left + ((dateMs - minDate) / dateRange) * chartWidth;
                    const getY = (val: number) => padding.top + chartHeight - ((val - 1) / 3) * chartHeight;

                    const points = sortedLogs.map(log => {
                      const dateMs = new Date(log.measured_at || log.created_at).getTime();
                      const statusStr = getLogComputedStatus(log, selectedPet?.species);
                      const statusVal = getStatusValue(statusStr);
                      return {
                        x: getX(dateMs),
                        y: getY(statusVal),
                        statusStr,
                        statusVal,
                        weight: log.weight,
                        temp: log.temperature,
                        hr: log.heart_rate,
                        date: log.measured_at || log.created_at
                      };
                    });


                    return (
                      <svg viewBox="0 0 500 200" width="100%" height="100%" style={{ overflow: 'visible' }}>
                        {[1, 2, 3, 4].map(val => (
                          <g key={val}>
                            <line x1={padding.left} y1={getY(val)} x2={padding.left + chartWidth} y2={getY(val)} stroke="var(--border)" strokeWidth="1" strokeDasharray="3 3" />
                            <text x={padding.left - 10} y={getY(val) + 3} fill="var(--text-2)" fontSize="9" fontWeight="700" textAnchor="end">
                              {getStatusLabel(val)}
                            </text>
                          </g>
                        ))}

                        {points.map((p, i) => (
                          <g key={i}>
                            <rect 
                              x={p.x - 7} 
                              y={p.y} 
                              width="14" 
                              height={Math.max(1, padding.top + chartHeight - p.y)} 
                              fill={getStatusColor(p.statusVal)} 
                              rx="3"
                              style={{ 
                                transition: 'all 0.15s ease', 
                                cursor: 'pointer',
                                opacity: hoveredPoint === i ? 1.0 : 0.8
                              }}
                              onMouseEnter={() => setHoveredPoint(i)}
                              onMouseLeave={() => setHoveredPoint(null)}
                            />
                            <circle 
                              cx={p.x} 
                              cy={p.y} 
                              r={hoveredPoint === i ? "5" : "3.5"} 
                              fill={getStatusColor(p.statusVal)} 
                              stroke="#fff" 
                              strokeWidth="1.5" 
                              style={{ pointerEvents: 'none', transition: 'all 0.1s ease' }} 
                            />
                          </g>
                        ))}

                        {points.map((p, i) => {
                          if (i === 0 || i === points.length - 1 || (points.length > 4 && i === Math.floor(points.length / 2))) {
                            return (
                              <text key={i} x={p.x} y={padding.top + chartHeight + 20} fill="var(--text-3)" fontSize="9.5" textAnchor="middle" fontWeight="500">
                                {new Date(p.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                              </text>
                            );
                          }
                          return null;
                        })}

                        {hoveredPoint !== null && points[hoveredPoint] && (() => {
                          const p = points[hoveredPoint];
                          const tooltipX = Math.max(80, Math.min(440, p.x));
                          const label = getStatusLabel(p.statusVal).split(' ')[1];
                          return (
                            <g>
                              <rect x={tooltipX - 60} y={p.y - 48} width="120" height="38" rx="6" fill="var(--text)" filter="drop-shadow(0px 2px 4px rgba(0,0,0,0.15))" />
                              <text x={tooltipX} y={p.y - 35} fill="#fff" fontSize="9.5" fontWeight="800" textAnchor="middle">
                                Mốc: {label}
                              </text>
                              <text x={tooltipX} y={p.y - 22} fill="var(--text-4)" fontSize="8.5" fontWeight="600" textAnchor="middle">
                                Cân nặng: {p.weight}kg
                              </text>
                              <path d={`M ${tooltipX - 4} ${p.y - 10} L ${tooltipX} ${p.y - 6} L ${tooltipX + 4} ${p.y - 10} Z`} fill="var(--text)" />
                            </g>
                          );
                        })()}
                      </svg>
                    );
                  })()}
                </div>
              )
            ) : (
              /* Numerical physiological metrics line charts */
              chartDataPoints.length < 2 ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 180, color: 'var(--text-3)' }}>
                  <TrendingUp size={36} opacity={0.3} style={{ marginBottom: 8 }} />
                  <p style={{ fontSize: 13, fontWeight: 500 }}>Cần tối thiểu 2 điểm dữ liệu để vẽ biểu đồ xu hướng.</p>
                </div>
              ) : (
                <div style={{ position: 'relative', width: '100%', overflow: 'hidden' }}>
                  {(() => {
                    const padding = { top: 30, right: 30, bottom: 40, left: 50 };
                    const chartWidth = 500 - padding.left - padding.right;
                    const chartHeight = 200 - padding.top - padding.bottom;
                    
                    const values = chartDataPoints.map(d => Number(d.value));
                    let minVal = Math.min(...values);
                    let maxVal = Math.max(...values);
                    
                    if (minVal === maxVal) {
                      minVal -= 1;
                      maxVal += 1;
                    } else {
                      const valRange = maxVal - minVal;
                      minVal -= valRange * 0.15;
                      maxVal += valRange * 0.15;
                    }

                    const dates = chartDataPoints.map(d => new Date(d.date).getTime());
                    const minDate = Math.min(...dates);
                    const maxDate = Math.max(...dates);
                    const dateRange = maxDate - minDate || 1;

                    const getX = (dateMs: number) => padding.left + ((dateMs - minDate) / dateRange) * chartWidth;
                    const getY = (val: number) => padding.top + chartHeight - ((val - minVal) / (maxVal - minVal)) * chartHeight;

                    const points = chartDataPoints.map(d => ({
                      x: getX(new Date(d.date).getTime()),
                      y: getY(Number(d.value)),
                      val: d.value,
                      date: d.date
                    }));



                    return (
                      <svg viewBox="0 0 500 200" width="100%" height="100%" style={{ overflow: 'visible' }}>
                        <defs>
                          <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={metricColor} stopOpacity="0.25"/>
                            <stop offset="100%" stopColor={metricColor} stopOpacity="0.00"/>
                          </linearGradient>
                        </defs>

                        {/* Normal range background reference box */}
                        {(() => {
                          const ranges = getRanges(selectedPet?.species);
                          const range = ranges[selectedMetric as keyof typeof ranges];
                          if (range) {
                            const yMax = Math.max(padding.top, getY(range.max));
                            const yMin = Math.min(padding.top + chartHeight, getY(range.min));
                            const rectHeight = yMin - yMax;
                            if (rectHeight > 0) {
                              return (
                                <>
                                  <rect x={padding.left} y={yMax} width={chartWidth} height={rectHeight} fill="rgba(34, 197, 94, 0.05)" rx="4" />
                                  <line x1={padding.left} y1={yMax} x2={padding.left + chartWidth} y2={yMax} stroke="rgba(34, 197, 94, 0.15)" strokeDasharray="4 4" />
                                  <line x1={padding.left} y1={yMin} x2={padding.left + chartWidth} y2={yMin} stroke="rgba(34, 197, 94, 0.15)" strokeDasharray="4 4" />
                                  <text x={padding.left + 8} y={yMax + 14} fill="#10B981" fontSize="8" fontWeight="700" opacity="0.6">
                                    KHOẢNG CHUẨN
                                  </text>
                                </>
                              );
                            }
                          }
                          return null;
                        })()}

                        {/* Horizontal Grid lines */}
                        {[0, 0.5, 1].map((ratio, i) => {
                          const val = minVal + (maxVal - minVal) * ratio;
                          const y = getY(val);
                          return (
                            <g key={i}>
                              <line x1={padding.left} y1={y} x2={padding.left + chartWidth} y2={y} stroke="var(--border)" strokeWidth="1" strokeDasharray="3 3" />
                              <text x={padding.left - 8} y={y + 3} fill="var(--text-3)" fontSize="9" textAnchor="end">
                                {val.toFixed(1)}
                              </text>
                            </g>
                          );
                        })}

                        <defs>
                          <linearGradient id="chartColGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={metricColor} stopOpacity="1.0"/>
                            <stop offset="100%" stopColor={metricColor} stopOpacity="0.3"/>
                          </linearGradient>
                        </defs>

                        {points.map((p, i) => (
                          <g key={i}>
                            <rect 
                              x={p.x - 8} 
                              y={p.y} 
                              width="16" 
                              height={Math.max(1, padding.top + chartHeight - p.y)} 
                              fill="url(#chartColGrad)" 
                              rx="3"
                              style={{ 
                                transition: 'all 0.15s ease', 
                                cursor: 'pointer',
                                opacity: hoveredPoint === i ? 1.0 : 0.8
                              }}
                              onMouseEnter={() => setHoveredPoint(i)}
                              onMouseLeave={() => setHoveredPoint(null)}
                            />
                            <circle 
                              cx={p.x} 
                              cy={p.y} 
                              r={hoveredPoint === i ? "5" : "3.5"} 
                              fill={metricColor} 
                              stroke="#fff" 
                              strokeWidth="1.5" 
                              style={{ pointerEvents: 'none', transition: 'all 0.1s ease' }} 
                            />
                          </g>
                        ))}

                        {points.map((p, i) => {
                          if (i === 0 || i === points.length - 1 || (points.length > 4 && i === Math.floor(points.length / 2))) {
                            return (
                              <text key={i} x={p.x} y={padding.top + chartHeight + 20} fill="var(--text-3)" fontSize="9.5" textAnchor="middle" fontWeight="500">
                                {new Date(p.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                              </text>
                            );
                          }
                          return null;
                        })}

                        {hoveredPoint !== null && points[hoveredPoint] && (() => {
                          const p = points[hoveredPoint];
                          const tooltipX = Math.max(50, Math.min(450, p.x));
                          return (
                            <g>
                              <rect x={tooltipX - 50} y={p.y - 36} width="100" height="25" rx="6" fill="var(--text)" filter="drop-shadow(0px 2px 4px rgba(0,0,0,0.1))" />
                              <text x={tooltipX} y={p.y - 20} fill="#fff" fontSize="10.5" fontWeight="700" textAnchor="middle">
                                {p.val} {getRanges(selectedPet?.species)[selectedMetric as keyof ReturnType<typeof getRanges>]?.unit || ''}
                              </text>
                              <path d={`M ${tooltipX - 4} ${p.y - 11} L ${tooltipX} ${p.y - 7} L ${tooltipX + 4} ${p.y - 11} Z`} fill="var(--text)" />
                            </g>
                          );
                        })()}
                      </svg>
                    );
                  })()}
                </div>
              )
            )}
          </div>

          {/* Vaccine Schedule & Reminders Card */}
          <div className="card" style={{ padding: '20px' }}>
            <h3 className="card-title" style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>
              💉 Lịch tiêm phòng & Nhắc lịch
            </h3>
            
            {vaccineRecords.length === 0 ? (
              <p style={{ color: 'var(--text-3)', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>
                Chưa có lịch sử tiêm vaccine cho {selectedPet.name}.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {vaccineRecords.map((vac) => {
                  const hasDueDate = !!vac.next_due_date;
                  let badgeText = 'Đã hoàn thành';
                  let badgeBg = '#E8F8EF';
                  let badgeColor = '#10B981';

                  if (hasDueDate) {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const due = new Date(vac.next_due_date);
                    due.setHours(0, 0, 0, 0);
                    const daysDiff = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

                    if (daysDiff < 0) {
                      badgeText = 'Quá hạn';
                      badgeBg = '#FFF0F0';
                      badgeColor = '#EF4444';
                    } else if (daysDiff <= 15) {
                      badgeText = `Sắp tiêm (còn ${daysDiff} ngày)`;
                      badgeBg = '#FFF9E6';
                      badgeColor = '#F59E0B';
                    } else {
                      badgeText = 'Đã lên lịch';
                      badgeBg = '#EFF6FF';
                      badgeColor = '#3B82F6';
                    }
                  }

                  return (
                    <div 
                      key={vac._id} 
                      style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        padding: '12px 16px', 
                        background: 'var(--surface2)', 
                        borderRadius: '12px',
                        border: '1px solid var(--border)',
                        flexWrap: 'wrap',
                        gap: 12
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ 
                          width: 38, 
                          height: 38, 
                          borderRadius: '50%', 
                          background: '#F3E5F5', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          color: '#9B51E0',
                          fontSize: 16
                        }}>
                          💉
                        </div>
                        <div>
                          <strong style={{ fontSize: 14, color: 'var(--text)' }}>{vac.value}</strong>
                          <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>
                            Ngày tiêm: {new Date(vac.date).toLocaleDateString('vi-VN')}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                        {hasDueDate && (
                          <div style={{ fontSize: 12, color: 'var(--text-2)', textAlign: 'right' }}>
                            <span style={{ color: 'var(--text-3)' }}>Lịch nhắc:</span>{' '}
                            <strong>{new Date(vac.next_due_date).toLocaleDateString('vi-VN')}</strong>
                          </div>
                        )}
                        <span style={{ 
                          fontSize: 11, 
                          fontWeight: 700, 
                          padding: '4px 10px', 
                          borderRadius: 12, 
                          background: badgeBg, 
                          color: badgeColor 
                        }}>
                          {badgeText}
                        </span>
                        
                        <button 
                          onClick={() => handleDeleteVaccine(vac._id)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#EF4444',
                            cursor: 'pointer',
                            padding: '4px',
                            fontSize: 12,
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4
                          }}
                        >
                          ❌ Hủy
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      ) : (
        <div className="empty-state" style={{ marginTop: 60 }}>
          <Activity size={64} style={{ color: 'var(--text-4)', marginBottom: 16 }} />
          <h3>Chưa chọn thú cưng</h3>
          <p>Chọn một thú cưng để bắt đầu theo dõi sức khỏe.</p>
        </div>
      )}

      {/* Modal - Keep existing form logic */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px', width: '100%', position: 'relative' }}>
            <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
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
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <div className="form-group" style={{ flex: 1, minWidth: '180px' }}>
                    <label className="form-label">Cân nặng (kg) <span style={{ color: 'red' }}>*</span></label>
                    <input className="form-control" type="number" step="0.1" placeholder="Ví dụ: 5.2" value={logForm.weight} onChange={e => setLogForm(f=>({...f,weight:e.target.value}))} />
                  </div>
                  <div className="form-group" style={{ flex: 1, minWidth: '180px' }}>
                    <label className="form-label">Tình trạng sức khỏe</label>
                    <select 
                      className="form-control" 
                      value={logForm.healthStatus} 
                      onChange={e => setLogForm(f=>({...f,healthStatus:e.target.value}))}
                      style={{ background: 'var(--surface2)' }}
                    >
                      <option value="NORMAL">Khỏe mạnh</option>
                      <option value="OVERWEIGHT">Thừa cân</option>
                      <option value="UNDERWEIGHT">Thiếu cân</option>
                      <option value="SICK">Đang bệnh</option>
                      <option value="POST_SURGERY">Sau phẫu thuật</option>
                    </select>
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
                  <label className="form-label">Tình trạng sức khỏe hiện tại</label>
                  <select 
                    className="form-control" 
                    value={vaccineForm.healthStatus} 
                    onChange={e => setVaccineForm(f=>({...f,healthStatus:e.target.value}))}
                    style={{ background: 'var(--surface2)' }}
                  >
                    <option value="NORMAL">Khỏe mạnh</option>
                    <option value="OVERWEIGHT">Thừa cân</option>
                    <option value="UNDERWEIGHT">Thiếu cân</option>
                    <option value="SICK">Đang bệnh</option>
                    <option value="POST_SURGERY">Sau phẫu thuật</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Ghi chú</label>
                  <textarea className="form-control" rows={2} placeholder="Ghi chú thêm..." value={vaccineForm.notes} onChange={e => setVaccineForm(f=>({...f,notes:e.target.value}))} style={{resize:'vertical'}} />
                </div>
              </>
            )}

            <div style={{ display:'flex', gap:12, marginTop: 20 }}>
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
