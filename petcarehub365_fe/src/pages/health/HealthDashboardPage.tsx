import { useState, useEffect } from 'react';
import { 
  Activity, Plus, Scale, Syringe, LineChart, FileText, 
  CheckCircle2, Settings, Trash2, Utensils, Droplet, Moon, Zap, 
  Heart, Thermometer, Clock, Smile, Sparkles, Calendar, Edit2,
  MoreVertical
} from 'lucide-react';
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
  const [editingVaccineId, setEditingVaccineId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'log' | 'vaccine'>('log');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [timelinePage, setTimelinePage] = useState(1);
  const timelineLimit = 6;
  
  // Chart metric tabs toggle
  const [selectedTab, setSelectedTab] = useState<'WEIGHT_ACTIVITY' | 'NUTRITION_WATER' | 'ACTIVITY_SLEEP' | 'VITALS'>('WEIGHT_ACTIVITY');
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);
  const [timeFilter, setTimeFilter] = useState<'7DAYS' | '30DAYS' | 'ALL'>('ALL');

  const [logForm, setLogForm] = useState({
    weight: '',
    height: '',
    heartRate: '',
    temperature: '',
    foodIntake: '',
    waterIntake: '',
    sleepDuration: '',
    activityMinutes: '',
    healthStatus: 'NORMAL',
    date: new Date().toISOString().split('T')[0],
    note: ''
  });

  // Inline update states for the unified card
  const [showInlineUpdate, setShowInlineUpdate] = useState(false);
  const [inlineActiveSubTab, setInlineActiveSubTab] = useState<'BASIC' | 'ACTIVITY' | 'MEDICAL'>('BASIC');
  const [inlineWeight, setInlineWeight] = useState('');
  const [inlineStatus, setInlineStatus] = useState('NORMAL');
  const [inlineFood, setInlineFood] = useState('');
  const [inlineWater, setInlineWater] = useState('');
  const [inlineSleep, setInlineSleep] = useState('');
  const [inlineActivity, setInlineActivity] = useState('');
  const [inlineHeartRate, setInlineHeartRate] = useState('');
  const [inlineTemp, setInlineTemp] = useState('');
  const [inlineHeight, setInlineHeight] = useState('');
  const [inlineNote, setInlineNote] = useState('');

  const [vaccineForm, setVaccineForm] = useState({
    vaccineName: '',
    administeredDate: new Date().toISOString().split('T')[0],
    nextDueDate: '',
    notes: '',
    healthStatus: 'NORMAL'
  });

  useEffect(() => {
    setTimelinePage(1);
  }, [selectedPet?._id]);

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
          height: log.height,
          heart_rate: log.heart_rate,
          temperature: log.temperature,
          food_intake: log.food_intake,
          water_intake: log.water_intake,
          sleep_duration: log.sleep_duration,
          activity_minutes: log.activity_minutes,
          date: log.measured_at || log.created_at,
          note: log.note || '',
          health_status: log.health_status || 'NORMAL',
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
        // 1. Add health log
        await healthApi.addLog(selectedPet._id, {
          weight: parseFloat(logForm.weight),
          height: logForm.height ? parseFloat(logForm.height) : undefined,
          heart_rate: logForm.heartRate ? parseInt(logForm.heartRate) : undefined,
          temperature: logForm.temperature ? parseFloat(logForm.temperature) : undefined,
          food_intake: logForm.foodIntake ? parseInt(logForm.foodIntake) : undefined,
          water_intake: logForm.waterIntake ? parseInt(logForm.waterIntake) : undefined,
          sleep_duration: logForm.sleepDuration ? parseFloat(logForm.sleepDuration) : undefined,
          activity_minutes: logForm.activityMinutes ? parseInt(logForm.activityMinutes) : undefined,
          measured_at: logForm.date ? new Date(logForm.date).toISOString() : undefined,
          health_status: logForm.healthStatus,
          note: logForm.note
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
          height: '',
          heartRate: '',
          temperature: '',
          foodIntake: '',
          waterIntake: '',
          sleepDuration: '',
          activityMinutes: '',
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
        
        if (editingVaccineId) {
          // 1. Update vaccine
          await healthApi.updateVaccine(editingVaccineId, {
            vaccine_name: vaccineForm.vaccineName,
            administered_date: new Date(vaccineForm.administeredDate).toISOString(),
            next_due_date: vaccineForm.nextDueDate ? new Date(vaccineForm.nextDueDate).toISOString() : undefined,
            notes: vaccineForm.notes
          });
        } else {
          // 1. Add vaccine
          await healthApi.addVaccine(selectedPet._id, {
            vaccine_name: vaccineForm.vaccineName,
            administered_date: new Date(vaccineForm.administeredDate).toISOString(),
            next_due_date: vaccineForm.nextDueDate ? new Date(vaccineForm.nextDueDate).toISOString() : undefined,
            notes: vaccineForm.notes
          });
        }

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
        setEditingVaccineId(null);
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
      setInlineActiveSubTab('BASIC');
      setInlineWeight(selectedPet?.weight?.toString() || '');
      setInlineStatus(selectedPet?.health_status || 'NORMAL');
      setInlineFood('');
      setInlineWater('');
      setInlineSleep('');
      setInlineActivity('');
      setInlineHeartRate('');
      setInlineTemp('');
      setInlineHeight('');
      setInlineNote('');
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
      // 1. Add log
      await healthApi.addLog(selectedPet._id, {
        weight: parseFloat(inlineWeight),
        height: inlineHeight ? parseFloat(inlineHeight) : undefined,
        heart_rate: inlineHeartRate ? parseInt(inlineHeartRate) : undefined,
        temperature: inlineTemp ? parseFloat(inlineTemp) : undefined,
        food_intake: inlineFood ? parseInt(inlineFood) : undefined,
        water_intake: inlineWater ? parseInt(inlineWater) : undefined,
        sleep_duration: inlineSleep ? parseFloat(inlineSleep) : undefined,
        activity_minutes: inlineActivity ? parseInt(inlineActivity) : undefined,
        measured_at: new Date().toISOString(),
        health_status: inlineStatus,
        note: inlineNote || 'Cập nhật nhanh'
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
      console.error("Failed to update health status and metrics", err);
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

  const handleCompleteVaccine = async (vac: any) => {
    if (!window.confirm(`Đánh dấu vaccine "${vac.value}" đã hoàn thành?`)) return;
    try {
      setSaving(true);
      await healthApi.updateVaccine(vac._id, {
        vaccine_name: vac.value,
        administered_date: new Date().toISOString(), // Completed today
        next_due_date: null, // Clear due date to mark completed
        notes: vac.note
      });
      await loadRecords(selectedPet._id);
      await refreshPets();
    } catch (err) {
      console.error("Failed to complete vaccine", err);
    } finally {
      setSaving(false);
    }
  };

  /*
  const getLatestValue = (type: string, unit = '', fallback = '—') => {
    const sorted = [...records]
      .filter(r => r.type === type)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    if (sorted.length > 0) {
      return `${sorted[0].value}${unit ? ' ' + unit : ''}`;
    }
    return fallback;
  };
  */

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

  // Health Status Milestones Weekly Chart Calculations
  /*
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
      case 4: return 'Khỏe mạnh';
      case 3: return 'Thể trạng';
      case 2: return 'Sau mổ';
      case 1: return 'Đang bệnh';
      default: return 'Khỏe';
    }
  };
  */

  // Helpers to generate smooth bezier curve paths
  const getBezierPath = (pts: { x: number; y: number }[]) => {
    if (pts.length === 0) return '';
    if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i];
      const p1 = pts[i + 1];
      const cp1x = p0.x + (p1.x - p0.x) / 3;
      const cp1y = p0.y;
      const cp2x = p0.x + 2 * (p1.x - p0.x) / 3;
      const cp2y = p1.y;
      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p1.x} ${p1.y}`;
    }
    return d;
  };

  const getAreaPath = (pts: { x: number; y: number }[], bottomY: number) => {
    if (pts.length === 0) return '';
    const bezier = getBezierPath(pts);
    return `${bezier} L ${pts[pts.length - 1].x} ${bottomY} L ${pts[0].x} ${bottomY} Z`;
  };

  /*
  const getStatusColor = (statusVal: number) => {
    switch (statusVal) {
      case 4: return '#10B981';
      case 3: return '#F59E0B';
      case 2: return '#8B5CF6';
      case 1: return '#EF4444';
      default: return '#10B981';
    }
  };
  */

  // Breed-aware weight ranges lookup (kg)
  const getBreedWeightRange = (species: string = '', breed: string = '') => {
    const sp = species?.toUpperCase();
    const br = breed?.toLowerCase()?.trim();

    // ── Cat Breeds ──
    if (sp === 'CAT' || sp === 'MÈO') {
      const catBreeds: Record<string, { min: number; max: number }> = {
        // Small cats
        'munchkin':        { min: 2.5, max: 4.0 },
        'singapura':       { min: 2.0, max: 3.5 },
        'devon rex':       { min: 2.5, max: 4.5 },
        'cornish rex':     { min: 2.5, max: 4.5 },
        // Medium cats
        'mèo ta':          { min: 3.0, max: 6.0 },
        'mèo mướp':        { min: 3.0, max: 6.0 },
        'mèo tam thể':     { min: 3.0, max: 5.5 },
        'siamese':         { min: 3.0, max: 5.5 },
        'abyssinian':      { min: 3.0, max: 5.5 },
        'burmese':         { min: 3.5, max: 5.5 },
        'scottish fold':   { min: 3.0, max: 6.0 },
        'russian blue':    { min: 3.0, max: 5.5 },
        'sphynx':          { min: 3.0, max: 5.5 },
        'american shorthair': { min: 3.5, max: 6.5 },
        // Large cats
        'persian':         { min: 3.5, max: 7.0 },
        'ba tư':           { min: 3.5, max: 7.0 },
        'british shorthair': { min: 4.0, max: 8.0 },
        'aln':             { min: 4.0, max: 8.0 },
        'ragdoll':         { min: 4.5, max: 9.0 },
        'maine coon':      { min: 5.0, max: 11.0 },
        'norwegian forest': { min: 4.5, max: 9.0 },
        'bengal':          { min: 3.5, max: 7.0 },
        'savannah':        { min: 5.0, max: 11.0 },
      };
      // Try to find a matching breed
      for (const [key, range] of Object.entries(catBreeds)) {
        if (br.includes(key) || key.includes(br)) return range;
      }
      // Default cat range (wider than before)
      return { min: 2.5, max: 8.0 };
    }

    // ── Dog Breeds ──
    if (sp === 'DOG' || sp === 'CHÓ') {
      const dogBreeds: Record<string, { min: number; max: number }> = {
        // Toy / Small dogs
        'chihuahua':       { min: 1.5, max: 3.0 },
        'pomeranian':      { min: 1.5, max: 3.5 },
        'phốc sóc':        { min: 1.5, max: 3.5 },
        'yorkshire':       { min: 2.0, max: 3.5 },
        'maltese':         { min: 2.0, max: 3.5 },
        'shih tzu':        { min: 4.0, max: 7.5 },
        'pug':             { min: 6.0, max: 9.0 },
        'dachshund':       { min: 4.0, max: 12.0 },
        'lạp xưởng':       { min: 4.0, max: 12.0 },
        // Medium dogs
        'poodle':          { min: 3.0, max: 30.0 },  // Toy to Standard
        'french bulldog':  { min: 8.0, max: 14.0 },
        'bull pháp':       { min: 8.0, max: 14.0 },
        'beagle':          { min: 8.0, max: 14.0 },
        'corgi':           { min: 10.0, max: 14.0 },
        'cocker spaniel':  { min: 11.0, max: 15.0 },
        'border collie':   { min: 12.0, max: 20.0 },
        'phú quốc':        { min: 12.0, max: 20.0 },
        // Large dogs
        'golden retriever': { min: 25.0, max: 36.0 },
        'golden':          { min: 25.0, max: 36.0 },
        'labrador':        { min: 25.0, max: 36.0 },
        'german shepherd': { min: 22.0, max: 40.0 },
        'becgie':          { min: 22.0, max: 40.0 },
        'husky':           { min: 16.0, max: 27.0 },
        'samoyed':         { min: 16.0, max: 30.0 },
        'alaskan':         { min: 25.0, max: 40.0 },
        'rottweiler':      { min: 35.0, max: 55.0 },
        'doberman':        { min: 27.0, max: 45.0 },
        'great dane':      { min: 45.0, max: 80.0 },
        'alaska':          { min: 25.0, max: 40.0 },
        // Mixed / Vietnamese
        'ta':              { min: 5.0, max: 20.0 },
        'chó ta':          { min: 5.0, max: 20.0 },
        'chó lai':         { min: 5.0, max: 25.0 },
      };
      for (const [key, range] of Object.entries(dogBreeds)) {
        if (br.includes(key) || key.includes(br)) return range;
      }
      // Default dog range (adaptive based on current weight if available)
      const currentWeight = selectedPet?.weight;
      if (currentWeight) {
        // Auto-generate a ±30% range around current weight
        return { min: Math.max(1, currentWeight * 0.7), max: currentWeight * 1.3 };
      }
      return { min: 3.0, max: 35.0 };
    }

    // Default for OTHER species
    return { min: 1.0, max: 20.0 };
  };

  // reference ranges based on species AND breed
  const getRanges = (species: string = '', breed: string = '') => {
    const sp = species?.toUpperCase();
    const isCat = sp === 'CAT' || sp === 'MÈO';
    const weightRange = getBreedWeightRange(species, breed);
    return {
      WEIGHT: { ...weightRange, unit: 'kg' },
      TEMPERATURE: isCat ? { min: 38.0, max: 39.2, unit: '°C' } : { min: 37.5, max: 39.2, unit: '°C' },
      HEART_RATE: isCat ? { min: 120, max: 200, unit: 'bpm' } : { min: 70, max: 120, unit: 'bpm' },
      HEIGHT: isCat ? { min: 20, max: 30, unit: 'cm' } : { min: 20, max: 70, unit: 'cm' }
    };
  };

  // Compute health status from weight using breed-aware ranges
  /*
  const getLogComputedStatus = (log: any, species: string = '', breed: string = '') => {
    const range = getBreedWeightRange(species, breed);

    if (log.weight !== null && log.weight !== undefined && log.weight !== 0) {
      const w = Number(log.weight);
      if (w < range.min) return 'UNDERWEIGHT';
      if (w > range.max) return 'OVERWEIGHT';
    }

    return 'NORMAL';
  };
  */

  // Auto-suggest status when user changes weight in inline form
  /*
  const getAutoSuggestedStatus = (weightStr: string) => {
    if (!weightStr || !selectedPet) return null;
    const w = parseFloat(weightStr);
    if (isNaN(w) || w <= 0) return null;
    const range = getBreedWeightRange(selectedPet.species, selectedPet.breed);
    if (w < range.min) return 'UNDERWEIGHT';
    if (w > range.max) return 'OVERWEIGHT';
    return 'NORMAL';
  };
  */

  // Calculate vaccine alerts
  const vaccineRecords = records.filter(r => r.isVaccine);
  /*
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
  */

  // const vacAlerts = getVaccineAlerts();

  // Generate organic combined biological chart data
  const generateChartData = () => {
    if (rawLogs.length === 0) return [];

    const sortedLogs = [...rawLogs].sort(
      (a, b) => new Date(a.measured_at || a.created_at).getTime() - new Date(b.measured_at || b.created_at).getTime()
    );

    const firstLog = sortedLogs[0];
    const firstLogDateObj = new Date(firstLog.measured_at || firstLog.created_at);
    const firstLogStart = new Date(firstLogDateObj.getFullYear(), firstLogDateObj.getMonth(), firstLogDateObj.getDate());

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    let startChartDate = firstLogStart;
    if (timeFilter === '7DAYS') {
      const sevenDaysAgo = new Date(todayStart.getTime() - 6 * 24 * 60 * 60 * 1000);
      if (sevenDaysAgo > firstLogStart) {
        startChartDate = sevenDaysAgo;
      }
    } else if (timeFilter === '30DAYS') {
      const thirtyDaysAgo = new Date(todayStart.getTime() - 29 * 24 * 60 * 60 * 1000);
      if (thirtyDaysAgo > firstLogStart) {
        startChartDate = thirtyDaysAgo;
      }
    }

    const dates: Date[] = [];
    const diffTime = todayStart.getTime() - startChartDate.getTime();
    const diffDays = Math.floor(diffTime / (24 * 60 * 60 * 1000));
    for (let i = 0; i <= diffDays; i++) {
      const d = new Date(startChartDate.getTime() + i * 24 * 60 * 60 * 1000);
      dates.push(d);
    }

    const isCat = selectedPet?.species?.toLowerCase() === 'cat' || selectedPet?.species?.toLowerCase() === 'mèo';
    
    const baseWeight = selectedPet?.weight || (isCat ? 4.2 : 12.0);
    const baseFood = isCat ? 80 : 220;
    const baseWater = isCat ? 200 : 550;
    const baseSleep = isCat ? 13 : 9;
    const baseActivity = isCat ? 35 : 55;
    const baseTemp = isCat ? 38.6 : 38.4;
    const baseHR = isCat ? 140 : 90;
    const baseHeight = selectedPet?.height || (isCat ? 25 : 45);

    return dates.map((date) => {
      const dateString = date.toISOString().split('T')[0];
      const matches = rawLogs.filter(l => {
        const lDateStr = new Date(l.measured_at || l.created_at).toISOString().split('T')[0];
        return lDateStr === dateString;
      });

      const log = matches.length > 0 ? matches[matches.length - 1] : null;

      // Helper to find the most recent log that has a valid value for a specific field
      const getFieldFromPast = (field: string, fallback: any) => {
        if (log && log[field] !== undefined && log[field] !== null && log[field] !== '') {
          return log[field];
        }
        
        for (let i = sortedLogs.length - 1; i >= 0; i--) {
          const l = sortedLogs[i];
          const lDate = new Date(l.measured_at || l.created_at);
          const lDateStart = new Date(lDate.getFullYear(), lDate.getMonth(), lDate.getDate());
          if (lDateStart <= date) {
            if (l[field] !== undefined && l[field] !== null && l[field] !== '') {
              return l[field];
            }
          }
        }
        return fallback;
      };

      return {
        date,
        weight: getFieldFromPast('weight', baseWeight),
        height: getFieldFromPast('height', baseHeight),
        heart_rate: getFieldFromPast('heart_rate', baseHR),
        temperature: getFieldFromPast('temperature', baseTemp),
        food_intake: getFieldFromPast('food_intake', baseFood),
        water_intake: getFieldFromPast('water_intake', baseWater),
        sleep_duration: getFieldFromPast('sleep_duration', baseSleep),
        activity_minutes: getFieldFromPast('activity_minutes', baseActivity),
        health_status: log?.health_status || getFieldFromPast('health_status', 'NORMAL'),
        note: log?.note || '',
        isReal: !!log
      };
    });
  };

  const getTimelineItems = () => {
    const items: any[] = [];
    
    rawLogs.forEach(log => {
      items.push({
        id: `log-${log._id}`,
        type: 'LOG',
        title: 'Cập nhật sức khỏe',
        date: new Date(log.measured_at || log.created_at),
        weight: log.weight,
        status: log.health_status || 'NORMAL',
        note: log.note || '',
        icon: 'LOG'
      });
    });

    vaccineRecords.forEach(vac => {
      items.push({
        id: `vac-${vac._id}`,
        type: 'VACCINE',
        title: `Tiêm vaccine: ${vac.value}`,
        date: new Date(vac.date),
        next_due_date: vac.next_due_date ? new Date(vac.next_due_date) : null,
        note: vac.note || '',
        icon: 'VACCINE'
      });
    });

    return items.sort((a, b) => b.date.getTime() - a.date.getTime());
  };

  return (
    <div style={{ paddingBottom: 40 }}>
      {/* Page Header - Match screenshot */}
      <div className="page-header" style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800 }}>Sức khỏe thú cưng</h1>
          <p style={{ fontSize: 13, color: 'var(--text-3)' }}>Theo dõi sức khỏe và lịch sử khám bệnh</p>
        </div>
        <button className="btn btn-primary" onClick={() => {
          setEditingVaccineId(null);
          setVaccineForm({
            vaccineName: '',
            administeredDate: new Date().toISOString().split('T')[0],
            nextDueDate: '',
            notes: '',
            healthStatus: selectedPet?.health_status || 'NORMAL'
          });
          setShowModal(true);
          setLogForm(f => ({
            ...f,
            weight: '',
            height: '',
            heartRate: '',
            temperature: '',
            foodIntake: '',
            waterIntake: '',
            sleepDuration: '',
            activityMinutes: '',
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
          
          {/* Quick Status Cards (Grid layout) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            {/* Card 1: Cân nặng */}
            <div className="card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px', transition: 'all 0.2s', cursor: 'default' }}>
              <div style={{ width: 44, height: 44, borderRadius: '12px', background: '#E1F0FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2D9CDB' }}>
                <Scale size={20} />
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase' }}>Cân nặng</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)', margin: '2px 0' }}>
                  {selectedPet.weight ? `${selectedPet.weight} kg` : '—'}
                </div>
                {(() => {
                  const wLogs = [...rawLogs].sort((a,b) => new Date(b.measured_at || b.created_at).getTime() - new Date(a.measured_at || a.created_at).getTime());
                  if (wLogs.length >= 2) {
                    const diff = wLogs[0].weight - wLogs[1].weight;
                    if (diff > 0) return <div style={{ fontSize: 11, color: '#10B981', fontWeight: 700 }}>▲ +{diff.toFixed(1)} kg <span style={{ color: 'var(--text-3)', fontWeight: 500 }}>so với trước</span></div>;
                    if (diff < 0) return <div style={{ fontSize: 11, color: '#2D9CDB', fontWeight: 700 }}>▼ -{Math.abs(diff).toFixed(1)} kg <span style={{ color: 'var(--text-3)', fontWeight: 500 }}>so với trước</span></div>;
                    return <div style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 600 }}>Ổn định</div>;
                  }
                  return <div style={{ fontSize: 11, color: 'var(--text-3)' }}>Mốc ban đầu</div>;
                })()}
              </div>
            </div>

            {/* Card 2: Thể trạng */}
            <div className="card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: 44, height: 44, borderRadius: '12px', background: `${getHealthStatusColor(selectedPet.health_status)}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: getHealthStatusColor(selectedPet.health_status) }}>
                <Smile size={20} />
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase' }}>Thể trạng</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)', margin: '2px 0' }}>
                  {translateHealthStatus(selectedPet.health_status)}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-3)' }}>Tình trạng hiện tại</div>
              </div>
            </div>

            {/* Card 3: Vaccine nhắc nhở */}
            <div className="card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              {(() => {
                const now = new Date();
                const upcoming = vaccineRecords
                  .filter(v => v.next_due_date && new Date(v.next_due_date).getTime() > now.getTime())
                  .sort((a, b) => new Date(a.next_due_date).getTime() - new Date(b.next_due_date).getTime());
                
                if (upcoming.length > 0) {
                  const nextVac = upcoming[0];
                  const diffTime = new Date(nextVac.next_due_date).getTime() - now.getTime();
                  const daysDiff = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
                  const color = daysDiff <= 3 ? '#EF4444' : daysDiff <= 15 ? '#F59E0B' : '#3B82F6';
                  const bg = daysDiff <= 3 ? '#FFF0F0' : daysDiff <= 15 ? '#FFF9E6' : '#EFF6FF';
                  return (
                    <>
                      <div style={{ width: 44, height: 44, borderRadius: '12px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color }}>
                        <Syringe size={20} style={{ transform: 'rotate(-45deg)' }} />
                      </div>
                      <div>
                        <div style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase' }}>Lịch tiêm nhắc</div>
                        <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', maxWidth: '170px' }}>
                          {nextVac.value}
                        </div>
                        <div style={{ fontSize: 11, color, fontWeight: 700 }}>
                          Còn {daysDiff} ngày nữa
                        </div>
                      </div>
                    </>
                  );
                }
                return (
                  <>
                    <div style={{ width: 44, height: 44, borderRadius: '12px', background: '#E8F8EF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10B981' }}>
                      <CheckCircle2 size={20} />
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase' }}>Vaccine</div>
                      <div style={{ fontSize: 15, fontWeight: 800, color: '#10B981', margin: '2px 0' }}>Đầy đủ</div>
                      <div style={{ fontSize: 11, color: 'var(--text-3)' }}>Không có lịch hẹn gần</div>
                    </div>
                  </>
                );
              })()}
            </div>

            {/* Card 4: Tâm trạng & Năng lượng */}
            <div className="card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: 44, height: 44, borderRadius: '12px', background: '#FFF3E0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FF9800' }}>
                <Activity size={20} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase' }}>Chỉ số sinh lý</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 6 }}>
                  {/* Mood progress bar */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 10, fontWeight: 600, color: 'var(--text-2)' }}>
                    <span>Vui vẻ (Mood)</span>
                    <span>{selectedPet.stats?.mood ?? 100}%</span>
                  </div>
                  <div style={{ width: '100%', height: 4, background: 'var(--border)', borderRadius: 2 }}>
                    <div style={{ width: `${selectedPet.stats?.mood ?? 100}%`, height: '100%', background: 'linear-gradient(90deg, #FFB74D, #FFA726)', borderRadius: 2 }} />
                  </div>
                  {/* Energy progress bar */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 10, fontWeight: 600, color: 'var(--text-2)' }}>
                    <span>Năng lượng</span>
                    <span>{selectedPet.stats?.energy ?? 100}%</span>
                  </div>
                  <div style={{ width: '100%', height: 4, background: 'var(--border)', borderRadius: 2 }}>
                    <div style={{ width: `${selectedPet.stats?.energy ?? 100}%`, height: '100%', background: 'linear-gradient(90deg, #81C784, #4CAF50)', borderRadius: 2 }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick status collapsible button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '-10px' }}>
            <button 
              className={`btn ${showInlineUpdate ? 'btn-secondary' : 'btn-primary'}`} 
              onClick={handleToggleInlineUpdate}
              style={{ padding: '8px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <Settings size={15} /> Cập nhật nhanh sức khỏe
            </button>
          </div>

          {/* Inline updates collapsible panel */}
          {showInlineUpdate && (
            <div className="card" style={{ 
              background: 'var(--surface2)', 
              borderRadius: '16px', 
              padding: '20px', 
              border: '1px solid var(--border)',
              boxShadow: 'var(--shadow-sm)',
              animation: 'slideDown 0.2s ease-out' 
            }}>
              <h4 style={{ margin: '0 0 16px 0', fontSize: 15, fontWeight: 700, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <FileText size={16} color="var(--primary)" /> Cập nhật hồ sơ sức khỏe nhanh
              </h4>

              {/* Sub-tab selection bar */}
              <div style={{ display: 'flex', gap: 6, background: 'var(--surface3)', padding: 4, borderRadius: 10, marginBottom: 20 }}>
                {[
                  { id: 'BASIC', label: 'Cơ bản (Hằng ngày)', icon: <Scale size={14} /> },
                  { id: 'ACTIVITY', label: 'Hoạt động', icon: <Zap size={14} /> },
                  { id: 'MEDICAL', label: 'Y tế (Khi cần)', icon: <Heart size={14} /> }
                ].map(subTab => (
                  <button
                    key={subTab.id}
                    type="button"
                    onClick={() => setInlineActiveSubTab(subTab.id as any)}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      padding: '8px 12px',
                      fontSize: '12.5px',
                      fontWeight: 600,
                      borderRadius: 8,
                      background: inlineActiveSubTab === subTab.id ? 'var(--surface)' : 'transparent',
                      color: inlineActiveSubTab === subTab.id ? 'var(--primary)' : 'var(--text-3)',
                      border: 'none',
                      cursor: 'pointer',
                      boxShadow: inlineActiveSubTab === subTab.id ? 'var(--shadow-xs)' : 'none',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {subTab.icon}
                    {subTab.label}
                  </button>
                ))}
              </div>

              {/* Tab 1: Basic Health */}
              {inlineActiveSubTab === 'BASIC' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                    {/* Weight Input with Adjusters */}
                    <div>
                      <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: 'var(--text-2)', marginBottom: 6 }}>
                        Cân nặng (kg) <span style={{ color: 'red' }}>*</span>
                      </label>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <button
                          type="button"
                          onClick={() => {
                            const current = parseFloat(inlineWeight) || 0;
                            setInlineWeight(Math.max(0, current - 0.1).toFixed(1));
                          }}
                          style={{
                            width: 36,
                            height: 36,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'var(--surface)',
                            border: '1px solid var(--border)',
                            borderRadius: '10px 0 0 10px',
                            color: 'var(--text-2)',
                            fontWeight: 700,
                            cursor: 'pointer',
                            fontSize: '16px'
                          }}
                        >
                          -
                        </button>
                        <input 
                          type="number" 
                          step="0.1" 
                          className="form-control" 
                          placeholder="Ví dụ: 5.2" 
                          value={inlineWeight} 
                          onChange={e => setInlineWeight(e.target.value)}
                          style={{ 
                            height: '36px', 
                            minHeight: 'auto', 
                            borderRadius: 0, 
                            textAlign: 'center',
                            flex: 1,
                            borderLeft: 'none',
                            borderRight: 'none',
                            background: 'var(--surface)'
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const current = parseFloat(inlineWeight) || 0;
                            setInlineWeight((current + 0.1).toFixed(1));
                          }}
                          style={{
                            width: 36,
                            height: 36,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'var(--surface)',
                            border: '1px solid var(--border)',
                            borderRadius: '0 10px 10px 0',
                            color: 'var(--text-2)',
                            fontWeight: 700,
                            cursor: 'pointer',
                            fontSize: '16px'
                          }}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Food Intake with Presets */}
                    <div>
                      <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: 'var(--text-2)', marginBottom: 6 }}>
                        Thức ăn hạt (g)
                      </label>
                      <input 
                        type="number" 
                        className="form-control" 
                        placeholder="Ví dụ: 80" 
                        value={inlineFood} 
                        onChange={e => setInlineFood(e.target.value)}
                        style={{ height: '36px', minHeight: 'auto' }}
                      />
                      <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                        {[50, 80, 120].map(g => (
                          <button
                            key={g}
                            type="button"
                            onClick={() => setInlineFood(g.toString())}
                            style={{
                              padding: '4px 10px',
                              fontSize: '11px',
                              fontWeight: 600,
                              borderRadius: '6px',
                              background: inlineFood === g.toString() ? 'var(--primary-bg)' : 'var(--surface)',
                              color: inlineFood === g.toString() ? 'var(--primary)' : 'var(--text-3)',
                              border: `1px solid ${inlineFood === g.toString() ? 'var(--primary)' : 'var(--border)'}`,
                              cursor: 'pointer',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            {g}g
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Water Intake with Presets */}
                    <div>
                      <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: 'var(--text-2)', marginBottom: 6 }}>
                        Nước uống (ml)
                      </label>
                      <input 
                        type="number" 
                        className="form-control" 
                        placeholder="Ví dụ: 200" 
                        value={inlineWater} 
                        onChange={e => setInlineWater(e.target.value)}
                        style={{ height: '36px', minHeight: 'auto' }}
                      />
                      <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                        {[100, 200, 300].map(ml => (
                          <button
                            key={ml}
                            type="button"
                            onClick={() => setInlineWater(ml.toString())}
                            style={{
                              padding: '4px 10px',
                              fontSize: '11px',
                              fontWeight: 600,
                              borderRadius: '6px',
                              background: inlineWater === ml.toString() ? 'var(--primary-bg)' : 'var(--surface)',
                              color: inlineWater === ml.toString() ? 'var(--primary)' : 'var(--text-3)',
                              border: `1px solid ${inlineWater === ml.toString() ? 'var(--primary)' : 'var(--border)'}`,
                              cursor: 'pointer',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            {ml}ml
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Health Status Capsules */}
                  <div style={{ marginTop: 8 }}>
                    <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: 'var(--text-2)', marginBottom: 8 }}>
                      Tình trạng sức khỏe
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '8px' }}>
                      {[
                        { id: 'NORMAL', label: 'Khỏe mạnh', icon: <Smile size={15} />, color: '#10B981', bg: '#DCFCE7' },
                        { id: 'OVERWEIGHT', label: 'Thừa cân', icon: <Scale size={15} />, color: '#3B82F6', bg: '#EFF6FF' },
                        { id: 'UNDERWEIGHT', label: 'Thiếu cân', icon: <Scale size={15} />, color: '#F59E0B', bg: '#FFFBEB' },
                        { id: 'SICK', label: 'Đang bệnh', icon: <Thermometer size={15} />, color: '#EF4444', bg: '#FFF0F0' },
                        { id: 'POST_SURGERY', label: 'Sau phẫu thuật', icon: <Syringe size={15} />, color: '#8B5CF6', bg: '#F3E8FF' }
                      ].map(opt => {
                        const isSelected = inlineStatus === opt.id;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => setInlineStatus(opt.id)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: 8,
                              padding: '10px 12px',
                              borderRadius: 10,
                              border: `2px solid ${isSelected ? opt.color : 'var(--border)'}`,
                              background: isSelected ? opt.bg : 'var(--surface)',
                              color: isSelected ? opt.color : 'var(--text-2)',
                              fontWeight: 600,
                              fontSize: '12px',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            {opt.icon}
                            <span>{opt.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Activity Logs */}
              {inlineActiveSubTab === 'ACTIVITY' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '20px', padding: '4px 0' }}>
                  {/* Sleep Duration Range Slider */}
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <label style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-2)' }}>
                        Thời gian ngủ (giờ)
                      </label>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <span style={{
                          fontSize: '12px',
                          fontWeight: 700,
                          color: 'var(--primary)',
                          background: 'var(--primary-bg)',
                          padding: '2px 8px',
                          borderRadius: 6
                        }}>
                          {inlineSleep ? `${inlineSleep} giờ` : 'Chưa nhập'}
                        </span>
                        {inlineSleep && (
                          <button 
                            type="button" 
                            onClick={() => setInlineSleep('')} 
                            style={{ fontSize: 10, color: 'var(--text-4)', cursor: 'pointer', fontWeight: 600 }}
                          >
                            Xóa
                          </button>
                        )}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <input 
                        type="range" 
                        min="0" 
                        max="24" 
                        step="0.5" 
                        value={inlineSleep || '0'} 
                        onChange={e => setInlineSleep(e.target.value)}
                        style={{
                          flex: 1,
                          accentColor: 'var(--primary)',
                          height: '6px',
                          borderRadius: '3px',
                          cursor: 'pointer'
                        }}
                      />
                    </div>
                  </div>

                  {/* Activity Minutes Range Slider */}
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <label style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-2)' }}>
                        Vận động (phút)
                      </label>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <span style={{
                          fontSize: '12px',
                          fontWeight: 700,
                          color: 'var(--primary)',
                          background: 'var(--primary-bg)',
                          padding: '2px 8px',
                          borderRadius: 6
                        }}>
                          {inlineActivity ? `${inlineActivity} phút` : 'Chưa nhập'}
                        </span>
                        {inlineActivity && (
                          <button 
                            type="button" 
                            onClick={() => setInlineActivity('')} 
                            style={{ fontSize: 10, color: 'var(--text-4)', cursor: 'pointer', fontWeight: 600 }}
                          >
                            Xóa
                          </button>
                        )}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <input 
                        type="range" 
                        min="0" 
                        max="180" 
                        step="5" 
                        value={inlineActivity || '0'} 
                        onChange={e => setInlineActivity(e.target.value)}
                        style={{
                          flex: 1,
                          accentColor: 'var(--primary)',
                          height: '6px',
                          borderRadius: '3px',
                          cursor: 'pointer'
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: Medical / Specialized Health */}
              {inlineActiveSubTab === 'MEDICAL' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: 'var(--text-2)', marginBottom: 6 }}>
                        Chiều cao (cm)
                      </label>
                      <input 
                        type="number" 
                        step="0.5" 
                        className="form-control" 
                        placeholder="Ví dụ: 25" 
                        value={inlineHeight} 
                        onChange={e => setInlineHeight(e.target.value)}
                        style={{ height: '36px', minHeight: 'auto' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: 'var(--text-2)', marginBottom: 6 }}>
                        Thân nhiệt (°C)
                      </label>
                      <input 
                        type="number" 
                        step="0.1" 
                        className="form-control" 
                        placeholder="Ví dụ: 38.5" 
                        value={inlineTemp} 
                        onChange={e => setInlineTemp(e.target.value)}
                        style={{ height: '36px', minHeight: 'auto' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: 'var(--text-2)', marginBottom: 6 }}>
                        Nhịp tim (bpm)
                      </label>
                      <input 
                        type="number" 
                        className="form-control" 
                        placeholder="Ví dụ: 110" 
                        value={inlineHeartRate} 
                        onChange={e => setInlineHeartRate(e.target.value)}
                        style={{ height: '36px', minHeight: 'auto' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: 'var(--text-2)', marginBottom: 6 }}>
                      Ghi chú nhanh
                    </label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="Ghi chú thêm về sức khỏe hôm nay..." 
                      value={inlineNote} 
                      onChange={e => setInlineNote(e.target.value)}
                      style={{ height: '36px', minHeight: 'auto' }}
                    />
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                <button className="btn btn-outline" onClick={() => setShowInlineUpdate(false)} style={{ padding: '8px 16px', height: '36px', borderRadius: 10, fontSize: 13 }}>Hủy</button>
                <button className="btn btn-primary" onClick={handleInlineSave} disabled={saving} style={{ padding: '8px 16px', height: '36px', borderRadius: 10, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                  {saving ? 'Đang lưu...' : 'Lưu hồ sơ'}
                </button>
              </div>
            </div>
          )}

          {/* Main Dashboard Layout (Flex wrap for responsiveness) */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
            
            {/* Column 1 (Left): main charts container */}
            <div style={{ flex: '2 1 500px', minWidth: '320px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              <div className="card" style={{ padding: '20px' }}>
                {/* Header of Chart Card */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <h3 className="card-title" style={{ fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6, margin: 0 }}>
                      <LineChart size={16} /> Chỉ số & Đồ thị Sức khỏe
                    </h3>
                    <p className="card-sub" style={{ fontSize: 11, margin: '2px 0 0 0' }}>
                      {selectedTab === 'WEIGHT_ACTIVITY' && 'Theo dõi Cân nặng (kg) và thời gian Vận động (phút)'}
                      {selectedTab === 'NUTRITION_WATER' && 'Theo dõi Thức ăn tiêu thụ (g) và Lượng nước uống (ml)'}
                      {selectedTab === 'ACTIVITY_SLEEP' && 'Theo dõi Mức vận động (phút) và Giờ giấc ngủ (giờ)'}
                      {selectedTab === 'VITALS' && 'Theo dõi các chỉ số sinh tồn: Nhiệt độ (°C) và Nhịp tim (bpm)'}
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                    {/* Time Filter */}
                    <div style={{ display: 'flex', gap: 4, background: 'var(--surface2)', padding: 4, borderRadius: 10 }}>
                      {[
                        { id: '7DAYS', label: '7 ngày' },
                        { id: '30DAYS', label: '30 ngày' },
                        { id: 'ALL', label: 'Tất cả' }
                      ].map(tf => (
                        <button 
                          key={tf.id}
                          onClick={() => { setTimeFilter(tf.id as any); setHoveredPoint(null); }}
                          style={{
                            padding: '5px 12px', fontSize: 11, fontWeight: 600, borderRadius: 8,
                            background: timeFilter === tf.id ? 'var(--surface)' : 'transparent',
                            color: timeFilter === tf.id ? 'var(--primary)' : 'var(--text-3)',
                            boxShadow: timeFilter === tf.id ? 'var(--shadow-xs)' : 'none',
                            border: 'none',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          {tf.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Graph Tabs (Slide bar selector) */}
                <div style={{ display: 'flex', gap: 6, background: 'var(--surface2)', padding: 4, borderRadius: 10, marginBottom: 20, overflowX: 'auto' }}>
                  {[
                    { id: 'WEIGHT_ACTIVITY', label: 'Cân nặng & Vận động', icon: <Scale size={13} />, color: '#8B5CF6' },
                    { id: 'NUTRITION_WATER', label: 'Dinh dưỡng & Nước', icon: <Utensils size={13} />, color: '#3B82F6' },
                    { id: 'ACTIVITY_SLEEP', label: 'Hoạt động & Giấc ngủ', icon: <Moon size={13} />, color: '#10B981' },
                    { id: 'VITALS', label: 'Chỉ số sinh tồn', icon: <Heart size={13} />, color: '#EF4444' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => { setSelectedTab(tab.id as any); setHoveredPoint(null); }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', fontSize: 11.5, fontWeight: 600, borderRadius: 8,
                        background: selectedTab === tab.id ? 'var(--surface)' : 'transparent',
                        color: selectedTab === tab.id ? tab.color : 'var(--text-3)',
                        boxShadow: selectedTab === tab.id ? 'var(--shadow-xs)' : 'none',
                        border: 'none',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {tab.icon}
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Render active chart */}
                {loading ? (
                  <div className="page-loader" style={{ height: 180 }}><div className="spinner"/></div>
                ) : (
                  (() => {
                    if (rawLogs.length === 0) {
                      return (
                        <div style={{ 
                          height: '200px', 
                          display: 'flex', 
                          flexDirection: 'column', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          color: 'var(--text-3)',
                          border: '1px dashed var(--border)',
                          borderRadius: '12px',
                          background: 'var(--surface2)',
                          padding: '20px',
                          textAlign: 'center'
                        }}>
                          <LineChart size={40} opacity={0.3} style={{ marginBottom: 12 }} />
                          <p style={{ fontSize: 13, fontWeight: 600, margin: '0 0 6px 0', color: 'var(--text)' }}>
                            Chưa có dữ liệu đồ thị
                          </p>
                          <p style={{ fontSize: 11, margin: 0, maxWidth: '280px', lineHeight: 1.5 }}>
                            Vui lòng nhấn <strong>Cập nhật nhanh sức khỏe</strong> hoặc <strong>Thêm hồ sơ</strong> để ghi nhận chỉ số và bắt đầu theo dõi biểu đồ.
                          </p>
                        </div>
                      );
                    }
                    const points = generateChartData();
                    const padding = { top: 25, right: 45, bottom: 35, left: 45 };
                    const chartWidth = 500 - padding.left - padding.right;
                    const chartHeight = 200 - padding.top - padding.bottom;
                    const xMax = points.length - 1;
                    const getX = (idx: number) => padding.left + (xMax > 0 ? (idx / xMax) * chartWidth : chartWidth / 2);
                    const labelInterval = Math.ceil(points.length / 5);

                    if (selectedTab === 'WEIGHT_ACTIVITY') {
                      const ranges = getRanges(selectedPet?.species, selectedPet?.breed);
                      const idealWeight = (ranges.WEIGHT.min + ranges.WEIGHT.max) / 2;

                      const wValues = points.map(p => p.weight);
                      let minW = Math.min(...wValues, idealWeight);
                      let maxW = Math.max(...wValues, idealWeight);
                      const wDiff = maxW - minW || 1;
                      minW = Math.max(0, minW - wDiff * 0.15 - 0.5);
                      maxW = maxW + wDiff * 0.15 + 0.5;

                      const actValues = points.map(p => p.activity_minutes);
                      const maxAct = Math.max(60, ...actValues) * 1.15;

                      const getY1 = (val: number) => padding.top + chartHeight - ((val - minW) / (maxW - minW)) * chartHeight;
                      const getY2 = (val: number) => padding.top + chartHeight - (val / maxAct) * chartHeight;

                      const wPoints = points.map((p, idx) => ({ x: getX(idx), y: getY1(p.weight) }));
                      const actPoints = points.map((p, idx) => ({ x: getX(idx), y: getY2(p.activity_minutes) }));

                      const yMaxZone = Math.max(padding.top, Math.min(padding.top + chartHeight, getY1(ranges.WEIGHT.max)));
                      const yMinZone = Math.max(padding.top, Math.min(padding.top + chartHeight, getY1(ranges.WEIGHT.min)));

                      return (
                        <div style={{ position: 'relative', width: '100%', overflow: 'visible' }}>
                          <svg viewBox="0 0 500 200" width="100%" height="100%" style={{ overflow: 'visible' }}>
                            <defs>
                              <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.2"/>
                                <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.00"/>
                              </linearGradient>
                              <filter id="glowPurple" x="-10%" y="-10%" width="120%" height="120%">
                                <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#8B5CF6" floodOpacity="0.25" />
                              </filter>
                            </defs>

                            {/* Background safety grid zones */}
                            <rect x={padding.left} y={padding.top} width={chartWidth} height={Math.max(0, yMaxZone - padding.top)} fill="rgba(239, 68, 68, 0.03)" style={{ pointerEvents: 'none' }} />
                            <rect x={padding.left} y={yMaxZone} width={chartWidth} height={Math.max(0, yMinZone - yMaxZone)} fill="rgba(16, 185, 129, 0.05)" style={{ pointerEvents: 'none' }} />
                            <rect x={padding.left} y={yMinZone} width={chartWidth} height={Math.max(0, padding.top + chartHeight - yMinZone)} fill="rgba(245, 158, 11, 0.03)" style={{ pointerEvents: 'none' }} />

                            {/* Range threshold dashed lines */}
                            <line x1={padding.left} y1={yMaxZone} x2={padding.left + chartWidth} y2={yMaxZone} stroke="rgba(16, 185, 129, 0.2)" strokeDasharray="3 3" />
                            <line x1={padding.left} y1={yMinZone} x2={padding.left + chartWidth} y2={yMinZone} stroke="rgba(16, 185, 129, 0.2)" strokeDasharray="3 3" />

                            {/* Ideal weight reference line */}
                            <line x1={padding.left} y1={getY1(idealWeight)} x2={padding.left + chartWidth} y2={getY1(idealWeight)} stroke="#9CA3AF" strokeWidth="1.5" strokeDasharray="4 4" />
                            <text x={padding.left + chartWidth - 8} y={getY1(idealWeight) - 6} fill="#6B7280" fontSize="8" fontWeight="700" textAnchor="end">
                              CÂN NẶNG LÝ TƯỞNG ({idealWeight.toFixed(1)} kg)
                            </text>

                            {/* Y1 Grid Ticks (Left - Weight) */}
                            {[0, 0.5, 1].map((ratio, i) => {
                              const val = minW + (maxW - minW) * ratio;
                              const y = getY1(val);
                              return (
                                <g key={`y1-${i}`}>
                                  <line x1={padding.left} y1={y} x2={padding.left + chartWidth} y2={y} stroke="var(--border)" strokeWidth="0.5" strokeDasharray="3 3" />
                                  <text x={padding.left - 8} y={y + 3} fill="var(--text-3)" fontSize="8.5" fontWeight="600" textAnchor="end">
                                    {val.toFixed(1)} kg
                                  </text>
                                </g>
                              );
                            })}

                            {/* Y2 Grid Ticks (Right - Activity) */}
                            {[0, 0.5, 1].map((ratio, i) => {
                              const val = maxAct * ratio;
                              const y = getY2(val);
                              return (
                                <g key={`y2-${i}`}>
                                  <text x={padding.left + chartWidth + 8} y={y + 3} fill="var(--text-3)" fontSize="8.5" fontWeight="600" textAnchor="start">
                                    {Math.round(val)}m
                                  </text>
                                </g>
                              );
                            })}

                            {/* Draw curves */}
                            {points.length >= 2 && (
                              <>
                                {/* Weight Area & Line */}
                                <path d={getAreaPath(wPoints, padding.top + chartHeight)} fill="url(#weightGrad)" />
                                <path d={getBezierPath(wPoints)} fill="none" stroke="#8B5CF6" strokeWidth="3" filter="url(#glowPurple)" strokeLinecap="round" />
                                
                                {/* Activity dashed line */}
                                <path d={getBezierPath(actPoints)} fill="none" stroke="#10B981" strokeWidth="1.5" strokeDasharray="4 3" strokeLinecap="round" />
                              </>
                            )}

                            {/* Interactivity dots and overlays */}
                            {points.map((p, i) => (
                              <g key={i}>
                                {/* Weight circle */}
                                <circle 
                                  cx={getX(i)} 
                                  cy={getY1(p.weight)} 
                                  r={hoveredPoint === i ? 6 : 4} 
                                  fill="#8B5CF6" 
                                  stroke="#fff" 
                                  strokeWidth={hoveredPoint === i ? 2.5 : 1.5} 
                                  style={{ pointerEvents: 'none', transition: 'all 0.15s ease' }} 
                                />

                                {/* Real log outer ring indicator */}
                                {p.isReal && (
                                  <circle 
                                    cx={getX(i)} 
                                    cy={getY1(p.weight)} 
                                    r={hoveredPoint === i ? 10 : 8} 
                                    fill="none" 
                                    stroke="#FFD54F" 
                                    strokeWidth="1.5" 
                                    style={{ pointerEvents: 'none' }}
                                  />
                                )}

                                {/* Activity circle */}
                                <circle 
                                  cx={getX(i)} 
                                  cy={getY2(p.activity_minutes)} 
                                  r={hoveredPoint === i ? 5 : 3.5} 
                                  fill="#10B981" 
                                  stroke="#fff" 
                                  strokeWidth={1.5} 
                                  style={{ pointerEvents: 'none', transition: 'all 0.15s ease' }} 
                                />

                                {/* Hover Overlay */}
                                <rect
                                  x={getX(i) - (chartWidth / points.length) / 2}
                                  y={padding.top}
                                  width={chartWidth / points.length}
                                  height={chartHeight}
                                  fill="transparent"
                                  style={{ cursor: 'pointer' }}
                                  onMouseEnter={() => setHoveredPoint(i)}
                                  onMouseLeave={() => setHoveredPoint(null)}
                                />
                              </g>
                            ))}

                            {/* X Axis dates */}
                            {points.map((p, i) => {
                              if (i % labelInterval === 0 || i === points.length - 1) {
                                return (
                                  <text key={i} x={getX(i)} y={padding.top + chartHeight + 18} fill="var(--text-3)" fontSize="8.5" textAnchor="middle" fontWeight="600">
                                    {p.date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                                  </text>
                                );
                              }
                              return null;
                            })}
                          </svg>

                          {/* HTML floating tooltip */}
                          {hoveredPoint !== null && points[hoveredPoint] && (() => {
                            const p = points[hoveredPoint];
                            return (
                              <div style={{
                                position: 'absolute',
                                left: `${(getX(hoveredPoint) / 500) * 100}%`,
                                top: `${(getY1(p.weight) / 200) * 100}%`,
                                transform: 'translate(-50%, -105%)',
                                background: 'rgba(30, 41, 59, 0.95)',
                                backdropFilter: 'blur(6px)',
                                color: '#fff',
                                padding: '10px 14px',
                                borderRadius: '10px',
                                boxShadow: '0 10px 20px -3px rgba(0,0,0,0.3), 0 4px 8px -2px rgba(0,0,0,0.2)',
                                border: '1px solid rgba(255,255,255,0.15)',
                                zIndex: 10,
                                pointerEvents: 'none',
                                fontSize: '11.5px',
                                minWidth: '170px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '5px',
                                textAlign: 'left'
                              }}>
                                <div style={{ fontWeight: 700, borderBottom: '1px solid rgba(255,255,255,0.12)', paddingBottom: '5px', marginBottom: '3px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <span>Ngày {p.date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}</span>
                                  {p.isReal && <span style={{ background: '#FFF59D', color: '#5D4037', padding: '1px 5px', borderRadius: 4, fontSize: 9, fontWeight: 800 }}>NHẬT KÝ</span>}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Scale size={12} color="#D1C4E9" /><strong>Cân nặng:</strong> {p.weight} kg</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Zap size={12} color="#C8E6C9" /><strong>Vận động:</strong> {p.activity_minutes} phút</div>
                                {p.note && (
                                  <div style={{ borderTop: '1px dashed rgba(255,255,255,0.1)', paddingTop: 4, marginTop: 2, fontStyle: 'italic', color: '#E2E8F0', wordBreak: 'break-word', fontSize: '10.5px' }}>
                                    <strong>Ghi chú:</strong> {p.note}
                                  </div>
                                )}
                              </div>
                            );
                          })()}
                        </div>
                      );
                    }

                    if (selectedTab === 'NUTRITION_WATER') {
                      const fValues = points.map(p => p.food_intake);
                      const maxFood = Math.max(120, ...fValues) * 1.15;

                      const watValues = points.map(p => p.water_intake);
                      const maxWater = Math.max(250, ...watValues) * 1.15;

                      const getY1 = (val: number) => padding.top + chartHeight - (val / maxFood) * chartHeight;
                      const getY2 = (val: number) => padding.top + chartHeight - (val / maxWater) * chartHeight;

                      const stepWidth = chartWidth / points.length;
                      const barWidth = Math.max(5, Math.min(12, stepWidth * 0.28));

                      return (
                        <div style={{ position: 'relative', width: '100%', overflow: 'visible' }}>
                          <svg viewBox="0 0 500 200" width="100%" height="100%" style={{ overflow: 'visible' }}>
                            {/* Axis Ticks Left (Food) */}
                            {[0, 0.5, 1].map((ratio, i) => {
                              const val = maxFood * ratio;
                              const y = getY1(val);
                              return (
                                <g key={`f-${i}`}>
                                  <line x1={padding.left} y1={y} x2={padding.left + chartWidth} y2={y} stroke="var(--border)" strokeWidth="0.5" strokeDasharray="3 3" />
                                  <text x={padding.left - 8} y={y + 3} fill="var(--text-3)" fontSize="8.5" fontWeight="600" textAnchor="end">
                                    {Math.round(val)}g
                                  </text>
                                </g>
                              );
                            })}

                            {/* Axis Ticks Right (Water) */}
                            {[0, 0.5, 1].map((ratio, i) => {
                              const val = maxWater * ratio;
                              const y = getY2(val);
                              return (
                                <g key={`w-${i}`}>
                                  <text x={padding.left + chartWidth + 8} y={y + 3} fill="var(--text-3)" fontSize="8.5" fontWeight="600" textAnchor="start">
                                    {Math.round(val)}ml
                                  </text>
                                </g>
                              );
                            })}

                            {/* Bar columns */}
                            {points.map((p, i) => {
                              const xCenter = getX(i);
                              const y1 = getY1(p.food_intake);
                              const h1 = padding.top + chartHeight - y1;
                              
                              const y2 = getY2(p.water_intake);
                              const h2 = padding.top + chartHeight - y2;

                              return (
                                <g key={i}>
                                  {/* Food Bar (Purple) */}
                                  <rect
                                    x={xCenter - barWidth - 1.5}
                                    y={y1}
                                    width={barWidth}
                                    height={Math.max(1, h1)}
                                    fill="#8B5CF6"
                                    rx={2.5}
                                    opacity={hoveredPoint === null || hoveredPoint === i ? 0.85 : 0.4}
                                    style={{ transition: 'all 0.15s ease' }}
                                  />
                                  {/* Water Bar (Blue) */}
                                  <rect
                                    x={xCenter + 1.5}
                                    y={y2}
                                    width={barWidth}
                                    height={Math.max(1, h2)}
                                    fill="#2D9CDB"
                                    rx={2.5}
                                    opacity={hoveredPoint === null || hoveredPoint === i ? 0.85 : 0.4}
                                    style={{ transition: 'all 0.15s ease' }}
                                  />

                                  {/* Hover overlay */}
                                  <rect
                                    x={xCenter - stepWidth / 2}
                                    y={padding.top}
                                    width={stepWidth}
                                    height={chartHeight}
                                    fill="transparent"
                                    style={{ cursor: 'pointer' }}
                                    onMouseEnter={() => setHoveredPoint(i)}
                                    onMouseLeave={() => setHoveredPoint(null)}
                                  />
                                </g>
                              );
                            })}

                            {/* X axis dates */}
                            {points.map((p, i) => {
                              if (i % labelInterval === 0 || i === points.length - 1) {
                                return (
                                  <text key={i} x={getX(i)} y={padding.top + chartHeight + 18} fill="var(--text-3)" fontSize="8.5" textAnchor="middle" fontWeight="600">
                                    {p.date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                                  </text>
                                );
                              }
                              return null;
                            })}
                          </svg>

                          {/* Tooltip */}
                          {hoveredPoint !== null && points[hoveredPoint] && (() => {
                            const p = points[hoveredPoint];
                            return (
                              <div style={{
                                position: 'absolute',
                                left: `${(getX(hoveredPoint) / 500) * 100}%`,
                                top: `${(getY1(p.food_intake) / 200) * 100}%`,
                                transform: 'translate(-50%, -105%)',
                                background: 'rgba(30, 41, 59, 0.95)',
                                backdropFilter: 'blur(6px)',
                                color: '#fff',
                                padding: '10px 14px',
                                borderRadius: '10px',
                                boxShadow: '0 10px 20px -3px rgba(0,0,0,0.3)',
                                border: '1px solid rgba(255,255,255,0.15)',
                                zIndex: 10,
                                pointerEvents: 'none',
                                fontSize: '11.5px',
                                minWidth: '170px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '5px',
                                textAlign: 'left'
                              }}>
                                <div style={{ fontWeight: 700, borderBottom: '1px solid rgba(255,255,255,0.12)', paddingBottom: '5px', marginBottom: '3px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <span>Ngày {p.date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}</span>
                                  {p.isReal && <span style={{ background: '#FFF59D', color: '#5D4037', padding: '1px 5px', borderRadius: 4, fontSize: 9, fontWeight: 800 }}>NHẬT KÝ</span>}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Utensils size={12} color="#D1C4E9" /><strong>Thức ăn hạt:</strong> {p.food_intake} g</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Droplet size={12} color="#B3E5FC" /><strong>Lượng nước:</strong> {p.water_intake} ml</div>
                                {p.note && (
                                  <div style={{ borderTop: '1px dashed rgba(255,255,255,0.1)', paddingTop: 4, marginTop: 2, fontStyle: 'italic', color: '#E2E8F0', fontSize: '10.5px' }}>
                                    <strong>Ghi chú:</strong> {p.note}
                                  </div>
                                )}
                              </div>
                            );
                          })()}
                        </div>
                      );
                    }

                    if (selectedTab === 'ACTIVITY_SLEEP') {
                      const actValues = points.map(p => p.activity_minutes);
                      const maxAct = Math.max(60, ...actValues) * 1.15;

                      const slValues = points.map(p => p.sleep_duration);
                      const maxSleep = Math.max(12, ...slValues) * 1.15;

                      const getY1 = (val: number) => padding.top + chartHeight - (val / maxAct) * chartHeight;
                      const getY2 = (val: number) => padding.top + chartHeight - (val / maxSleep) * chartHeight;

                      const actPoints = points.map((p, idx) => ({ x: getX(idx), y: getY1(p.activity_minutes) }));
                      const slPoints = points.map((p, idx) => ({ x: getX(idx), y: getY2(p.sleep_duration) }));

                      return (
                        <div style={{ position: 'relative', width: '100%', overflow: 'visible' }}>
                          <svg viewBox="0 0 500 200" width="100%" height="100%" style={{ overflow: 'visible' }}>
                            <defs>
                              <filter id="glowGreen" x="-10%" y="-10%" width="120%" height="120%">
                                <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#10B981" floodOpacity="0.25" />
                              </filter>
                              <filter id="glowBlue" x="-10%" y="-10%" width="120%" height="120%">
                                <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#2F80ED" floodOpacity="0.25" />
                              </filter>
                            </defs>

                            {/* Left ticks (Activity) */}
                            {[0, 0.5, 1].map((ratio, i) => {
                              const val = maxAct * ratio;
                              const y = getY1(val);
                              return (
                                <g key={`act-${i}`}>
                                  <line x1={padding.left} y1={y} x2={padding.left + chartWidth} y2={y} stroke="var(--border)" strokeWidth="0.5" strokeDasharray="3 3" />
                                  <text x={padding.left - 8} y={y + 3} fill="var(--text-3)" fontSize="8.5" fontWeight="600" textAnchor="end">
                                    {Math.round(val)}m
                                  </text>
                                </g>
                              );
                            })}

                            {/* Right ticks (Sleep) */}
                            {[0, 0.5, 1].map((ratio, i) => {
                              const val = maxSleep * ratio;
                              const y = getY2(val);
                              return (
                                <g key={`sl-${i}`}>
                                  <text x={padding.left + chartWidth + 8} y={y + 3} fill="var(--text-3)" fontSize="8.5" fontWeight="600" textAnchor="start">
                                    {val.toFixed(1)}h
                                  </text>
                                </g>
                              );
                            })}

                            {/* Lines */}
                            {points.length >= 2 && (
                              <>
                                <path d={getBezierPath(actPoints)} fill="none" stroke="#10B981" strokeWidth="3" filter="url(#glowGreen)" strokeLinecap="round" />
                                <path d={getBezierPath(slPoints)} fill="none" stroke="#2F80ED" strokeWidth="3" filter="url(#glowBlue)" strokeLinecap="round" />
                              </>
                            )}

                            {/* Interactive dots */}
                            {points.map((p, i) => (
                              <g key={i}>
                                <circle cx={getX(i)} cy={getY1(p.activity_minutes)} r={hoveredPoint === i ? 5.5 : 3.5} fill="#10B981" stroke="#fff" strokeWidth={1.5} style={{ pointerEvents: 'none' }} />
                                <circle cx={getX(i)} cy={getY2(p.sleep_duration)} r={hoveredPoint === i ? 5.5 : 3.5} fill="#2F80ED" stroke="#fff" strokeWidth={1.5} style={{ pointerEvents: 'none' }} />
                                
                                <rect
                                  x={getX(i) - (chartWidth / points.length) / 2}
                                  y={padding.top}
                                  width={chartWidth / points.length}
                                  height={chartHeight}
                                  fill="transparent"
                                  style={{ cursor: 'pointer' }}
                                  onMouseEnter={() => setHoveredPoint(i)}
                                  onMouseLeave={() => setHoveredPoint(null)}
                                />
                              </g>
                            ))}

                            {/* Dates */}
                            {points.map((p, i) => {
                              if (i % labelInterval === 0 || i === points.length - 1) {
                                return (
                                  <text key={i} x={getX(i)} y={padding.top + chartHeight + 18} fill="var(--text-3)" fontSize="8.5" textAnchor="middle" fontWeight="600">
                                    {p.date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                                  </text>
                                );
                              }
                              return null;
                            })}
                          </svg>

                          {/* Tooltip */}
                          {hoveredPoint !== null && points[hoveredPoint] && (() => {
                            const p = points[hoveredPoint];
                            return (
                              <div style={{
                                position: 'absolute',
                                left: `${(getX(hoveredPoint) / 500) * 100}%`,
                                top: `${(getY1(p.activity_minutes) / 200) * 100}%`,
                                transform: 'translate(-50%, -105%)',
                                background: 'rgba(30, 41, 59, 0.95)',
                                backdropFilter: 'blur(6px)',
                                color: '#fff',
                                padding: '10px 14px',
                                borderRadius: '10px',
                                boxShadow: '0 10px 20px -3px rgba(0,0,0,0.3)',
                                border: '1px solid rgba(255,255,255,0.15)',
                                zIndex: 10,
                                pointerEvents: 'none',
                                fontSize: '11.5px',
                                minWidth: '170px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '5px',
                                textAlign: 'left'
                              }}>
                                <div style={{ fontWeight: 700, borderBottom: '1px solid rgba(255,255,255,0.12)', paddingBottom: '5px', marginBottom: '3px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <span>Ngày {p.date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}</span>
                                  {p.isReal && <span style={{ background: '#FFF59D', color: '#5D4037', padding: '1px 5px', borderRadius: 4, fontSize: 9, fontWeight: 800 }}>NHẬT KÝ</span>}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Zap size={12} color="#C8E6C9" /><strong>Vận động:</strong> {p.activity_minutes} phút</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Clock size={12} color="#BBDEFB" /><strong>Thời gian ngủ:</strong> {p.sleep_duration} giờ</div>
                                {p.note && (
                                  <div style={{ borderTop: '1px dashed rgba(255,255,255,0.1)', paddingTop: 4, marginTop: 2, fontStyle: 'italic', color: '#E2E8F0', fontSize: '10.5px' }}>
                                    <strong>Ghi chú:</strong> {p.note}
                                  </div>
                                )}
                              </div>
                            );
                          })()}
                        </div>
                      );
                    }

                    if (selectedTab === 'VITALS') {
                      const tValues = points.map(p => p.temperature);
                      let minT = Math.min(37.0, ...tValues) - 0.2;
                      let maxT = Math.max(40.2, ...tValues) + 0.2;

                      const hrValues = points.map(p => p.heart_rate);
                      let minHR = Math.max(40, Math.min(...hrValues) - 15);
                      let maxHR = Math.max(180, ...hrValues) + 15;

                      const getY1 = (val: number) => padding.top + chartHeight - ((val - minT) / (maxT - minT)) * chartHeight;
                      const getY2 = (val: number) => padding.top + chartHeight - ((val - minHR) / (maxHR - minHR)) * chartHeight;

                      const tPoints = points.map((p, idx) => ({ x: getX(idx), y: getY1(p.temperature) }));
                      const hrPoints = points.map((p, idx) => ({ x: getX(idx), y: getY2(p.heart_rate) }));

                      const yNormalTMax = Math.max(padding.top, Math.min(padding.top + chartHeight, getY1(39.2)));
                      const yNormalTMin = Math.max(padding.top, Math.min(padding.top + chartHeight, getY1(38.0)));

                      return (
                        <div style={{ position: 'relative', width: '100%', overflow: 'visible' }}>
                          <svg viewBox="0 0 500 200" width="100%" height="100%" style={{ overflow: 'visible' }}>
                            <defs>
                              <filter id="glowOrange" x="-10%" y="-10%" width="120%" height="120%">
                                <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#F59E0B" floodOpacity="0.25" />
                              </filter>
                              <filter id="glowRed" x="-10%" y="-10%" width="120%" height="120%">
                                <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#EF4444" floodOpacity="0.25" />
                              </filter>
                            </defs>

                            {/* Normal body temperature green background box */}
                            <rect x={padding.left} y={yNormalTMax} width={chartWidth} height={Math.max(0, yNormalTMin - yNormalTMax)} fill="rgba(16, 185, 129, 0.05)" style={{ pointerEvents: 'none' }} />
                            <line x1={padding.left} y1={yNormalTMax} x2={padding.left + chartWidth} y2={yNormalTMax} stroke="rgba(16, 185, 129, 0.15)" strokeDasharray="3 3" />
                            <line x1={padding.left} y1={yNormalTMin} x2={padding.left + chartWidth} y2={yNormalTMin} stroke="rgba(16, 185, 129, 0.15)" strokeDasharray="3 3" />
                            <text x={padding.left + 8} y={yNormalTMax + 12} fill="#10B981" fontSize="7.5" fontWeight="700" opacity="0.6">
                              THÂN NHIỆT LÝ TƯỞNG (38.0°C - 39.2°C)
                            </text>

                            {/* Left ticks (Temperature) */}
                            {[0, 0.5, 1].map((ratio, i) => {
                              const val = minT + (maxT - minT) * ratio;
                              const y = getY1(val);
                              return (
                                <g key={`temp-${i}`}>
                                  <line x1={padding.left} y1={y} x2={padding.left + chartWidth} y2={y} stroke="var(--border)" strokeWidth="0.5" strokeDasharray="3 3" />
                                  <text x={padding.left - 8} y={y + 3} fill="var(--text-3)" fontSize="8.5" fontWeight="600" textAnchor="end">
                                    {val.toFixed(1)}°C
                                  </text>
                                </g>
                              );
                            })}

                            {/* Right ticks (Heart rate) */}
                            {[0, 0.5, 1].map((ratio, i) => {
                              const val = minHR + (maxHR - minHR) * ratio;
                              const y = getY2(val);
                              return (
                                <g key={`hr-${i}`}>
                                  <text x={padding.left + chartWidth + 8} y={y + 3} fill="var(--text-3)" fontSize="8.5" fontWeight="600" textAnchor="start">
                                    {Math.round(val)} bpm
                                  </text>
                                </g>
                              );
                            })}

                            {/* Curves */}
                            {points.length >= 2 && (
                              <>
                                <path d={getBezierPath(tPoints)} fill="none" stroke="#F59E0B" strokeWidth="3" filter="url(#glowOrange)" strokeLinecap="round" />
                                <path d={getBezierPath(hrPoints)} fill="none" stroke="#EF4444" strokeWidth="3" filter="url(#glowRed)" strokeLinecap="round" />
                              </>
                            )}

                            {/* Interactive dots */}
                            {points.map((p, i) => (
                              <g key={i}>
                                <circle cx={getX(i)} cy={getY1(p.temperature)} r={hoveredPoint === i ? 5.5 : 3.5} fill="#F59E0B" stroke="#fff" strokeWidth={1.5} style={{ pointerEvents: 'none' }} />
                                <circle cx={getX(i)} cy={getY2(p.heart_rate)} r={hoveredPoint === i ? 5.5 : 3.5} fill="#EF4444" stroke="#fff" strokeWidth={1.5} style={{ pointerEvents: 'none' }} />
                                
                                <rect
                                  x={getX(i) - (chartWidth / points.length) / 2}
                                  y={padding.top}
                                  width={chartWidth / points.length}
                                  height={chartHeight}
                                  fill="transparent"
                                  style={{ cursor: 'pointer' }}
                                  onMouseEnter={() => setHoveredPoint(i)}
                                  onMouseLeave={() => setHoveredPoint(null)}
                                />
                              </g>
                            ))}

                            {/* Dates */}
                            {points.map((p, i) => {
                              if (i % labelInterval === 0 || i === points.length - 1) {
                                return (
                                  <text key={i} x={getX(i)} y={padding.top + chartHeight + 18} fill="var(--text-3)" fontSize="8.5" textAnchor="middle" fontWeight="600">
                                    {p.date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                                  </text>
                                );
                              }
                              return null;
                            })}
                          </svg>

                          {/* Tooltip */}
                          {hoveredPoint !== null && points[hoveredPoint] && (() => {
                            const p = points[hoveredPoint];
                            return (
                              <div style={{
                                position: 'absolute',
                                left: `${(getX(hoveredPoint) / 500) * 100}%`,
                                top: `${(getY1(p.temperature) / 200) * 100}%`,
                                transform: 'translate(-50%, -105%)',
                                background: 'rgba(30, 41, 59, 0.95)',
                                backdropFilter: 'blur(6px)',
                                color: '#fff',
                                padding: '10px 14px',
                                borderRadius: '10px',
                                boxShadow: '0 10px 20px -3px rgba(0,0,0,0.3)',
                                border: '1px solid rgba(255,255,255,0.15)',
                                zIndex: 10,
                                pointerEvents: 'none',
                                fontSize: '11.5px',
                                minWidth: '170px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '5px',
                                textAlign: 'left'
                              }}>
                                <div style={{ fontWeight: 700, borderBottom: '1px solid rgba(255,255,255,0.12)', paddingBottom: '5px', marginBottom: '3px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <span>Ngày {p.date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}</span>
                                  {p.isReal && <span style={{ background: '#FFF59D', color: '#5D4037', padding: '1px 5px', borderRadius: 4, fontSize: 9, fontWeight: 800 }}>NHẬT KÝ</span>}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Thermometer size={12} color="#FFE082" /><strong>Nhiệt độ:</strong> {p.temperature} °C</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Heart size={12} color="#FFCDD2" /><strong>Nhịp tim:</strong> {p.heart_rate} bpm</div>
                                {p.note && (
                                  <div style={{ borderTop: '1px dashed rgba(255,255,255,0.1)', paddingTop: 4, marginTop: 2, fontStyle: 'italic', color: '#E2E8F0', fontSize: '10.5px' }}>
                                    <strong>Ghi chú:</strong> {p.note}
                                  </div>
                                )}
                              </div>
                            );
                          })()}
                        </div>
                      );
                    }

                    return null;
                  })()
                )}
              </div>

              {/* Vaccine Card */}
              <div className="card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <h3 className="card-title" style={{ fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6, margin: 0 }}>
                    <Syringe size={16} /> Lịch tiêm phòng & Nhắc lịch
                  </h3>
                  <button 
                    className="btn btn-sm btn-outline" 
                    onClick={() => {
                      setEditingVaccineId(null);
                      setActiveTab('vaccine');
                      setVaccineForm({
                        vaccineName: '',
                        administeredDate: new Date().toISOString().split('T')[0],
                        nextDueDate: '',
                        notes: '',
                        healthStatus: selectedPet?.health_status || 'NORMAL'
                      });
                      setShowModal(true);
                    }}
                    style={{ padding: '4px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}
                  >
                    <Plus size={13} /> Thêm vaccine
                  </button>
                </div>
                
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
                              color: '#9B51E0'
                            }}>
                              <Syringe size={18} style={{ transform: 'rotate(-45deg)' }} />
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
                            
                            {hasDueDate && (
                              <button 
                                onClick={() => handleCompleteVaccine(vac)}
                                title="Đánh dấu đã hoàn thành"
                                style={{
                                  background: 'var(--primary-bg)',
                                  border: 'none',
                                  borderRadius: '8px',
                                  color: 'var(--primary)',
                                  cursor: 'pointer',
                                  width: 28,
                                  height: 28,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  transition: 'all 0.2s',
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.filter = 'brightness(0.95)'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.filter = 'none'; }}
                              >
                                <CheckCircle2 size={15} />
                              </button>
                            )}

                            {/* 3-dots Action Menu */}
                            <div style={{ position: 'relative' }}>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveMenuId(activeMenuId === vac._id ? null : vac._id);
                                }}
                                style={{
                                  background: 'transparent',
                                  border: 'none',
                                  borderRadius: '6px',
                                  color: 'var(--text-3)',
                                  cursor: 'pointer',
                                  width: 28,
                                  height: 28,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface3)'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                              >
                                <MoreVertical size={16} />
                              </button>

                              {activeMenuId === vac._id && (
                                <>
                                  <div 
                                    onClick={() => setActiveMenuId(null)}
                                    style={{
                                      position: 'fixed',
                                      top: 0,
                                      left: 0,
                                      right: 0,
                                      bottom: 0,
                                      zIndex: 99,
                                      background: 'transparent'
                                    }}
                                  />
                                  <div style={{
                                    position: 'absolute',
                                    right: 0,
                                    top: '100%',
                                    marginTop: 4,
                                    background: 'var(--surface)',
                                    border: '1px solid var(--border)',
                                    borderRadius: '8px',
                                    boxShadow: 'var(--shadow-md)',
                                    zIndex: 100,
                                    minWidth: '120px',
                                    overflow: 'hidden',
                                    display: 'flex',
                                    flexDirection: 'column',
                                  }}>
                                    <button 
                                      onClick={() => {
                                        setActiveMenuId(null);
                                        setEditingVaccineId(vac._id);
                                        setActiveTab('vaccine');
                                        setVaccineForm({
                                          vaccineName: vac.value,
                                          administeredDate: new Date(vac.date).toISOString().split('T')[0],
                                          nextDueDate: vac.next_due_date ? new Date(vac.next_due_date).toISOString().split('T')[0] : '',
                                          notes: vac.note || '',
                                          healthStatus: selectedPet?.health_status || 'NORMAL'
                                        });
                                        setShowModal(true);
                                      }}
                                      style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 8,
                                        padding: '8px 12px',
                                        background: 'transparent',
                                        border: 'none',
                                        color: 'var(--text-2)',
                                        fontSize: '12.5px',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        textAlign: 'left',
                                        width: '100%',
                                        transition: 'background 0.15s'
                                      }}
                                      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface2)'; }}
                                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                                    >
                                      <Edit2 size={13} color="var(--primary)" /> Cập nhật
                                    </button>

                                    <button 
                                      onClick={() => {
                                        setActiveMenuId(null);
                                        handleDeleteVaccine(vac._id);
                                      }}
                                      style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 8,
                                        padding: '8px 12px',
                                        background: 'transparent',
                                        border: 'none',
                                        color: '#EF4444',
                                        fontSize: '12.5px',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        textAlign: 'left',
                                        width: '100%',
                                        transition: 'background 0.15s'
                                      }}
                                      onMouseEnter={(e) => { e.currentTarget.style.background = '#FFF0F0'; }}
                                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                                    >
                                      <Trash2 size={13} /> Hủy
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>

            {/* Column 2 (Right): Pet Timeline Vertical */}
            <div style={{ flex: '1 1 300px', minWidth: '300px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="card" style={{ padding: '20px', minHeight: '400px' }}>
                <h3 className="card-title" style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
                  <Sparkles size={16} color="#FF9800" /> Dòng thời gian sức khỏe
                </h3>
                <p className="card-sub" style={{ fontSize: 11, marginBottom: 20 }}>
                  Lịch sử các cập nhật y khoa, đo lường sinh lý và tiêm vaccine của {selectedPet.name}
                </p>

                {(() => {
                  const timelineItems = getTimelineItems();
                  const totalTimelinePages = Math.ceil(timelineItems.length / timelineLimit);
                  
                  if (timelineItems.length === 0) {
                    return (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '250px', color: 'var(--text-4)' }}>
                        <Calendar size={40} opacity={0.3} style={{ marginBottom: 10 }} />
                        <p style={{ fontSize: 13, fontWeight: 500 }}>Chưa có sự kiện nào được ghi nhận.</p>
                      </div>
                    );
                  }

                  const paginatedTimelineItems = timelineItems.slice((timelinePage - 1) * timelineLimit, timelinePage * timelineLimit);

                  return (
                    <>
                      <div style={{ position: 'relative', paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        {/* Vertical track line */}
                        <div style={{
                          position: 'absolute',
                          left: '7px',
                          top: '8px',
                          bottom: '8px',
                          width: '2px',
                          background: 'var(--border)',
                          zIndex: 1
                        }} />

                        {paginatedTimelineItems.map((item) => {
                          const isLog = item.type === 'LOG';
                          const color = isLog ? getHealthStatusColor(item.status) : '#9B51E0';
                          const bg = isLog ? `${getHealthStatusColor(item.status)}15` : '#F3E5F5';
                          
                          return (
                            <div key={item.id} style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              {/* Circle Indicator */}
                              <div style={{
                                position: 'absolute',
                                left: '-20px',
                                top: '4px',
                                width: '16px',
                                height: '16px',
                                borderRadius: '50%',
                                background: color,
                                border: '3.5px solid var(--surface)',
                                zIndex: 2,
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                              }} />

                              {/* Event card details */}
                              <div style={{
                                background: 'var(--surface2)',
                                padding: '12px 14px',
                                borderRadius: '12px',
                                border: '1px solid var(--border)',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '4px'
                              }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase' }}>
                                    {item.date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                  </span>
                                  <span style={{
                                    fontSize: '9.5px',
                                    fontWeight: 800,
                                    padding: '2px 8px',
                                    borderRadius: '8px',
                                    background: bg,
                                    color: color
                                  }}>
                                    {isLog ? translateHealthStatus(item.status) : 'Vaccine'}
                                  </span>
                                </div>
                                <strong style={{ fontSize: '12.5px', color: 'var(--text)' }}>
                                  {item.title}
                                </strong>
                                {isLog ? (
                                  <div style={{ fontSize: '11px', color: 'var(--text-2)' }}>
                                    Cân nặng đo được: <strong>{item.weight} kg</strong>
                                  </div>
                                ) : item.next_due_date ? (
                                  <div style={{ fontSize: '11px', color: 'var(--text-2)' }}>
                                    Lịch nhắc lại: <strong>{item.next_due_date.toLocaleDateString('vi-VN')}</strong>
                                  </div>
                                ) : null}
                                {item.note && (
                                  <div style={{ fontSize: '10.5px', color: 'var(--text-3)', fontStyle: 'italic', borderTop: '1px dashed var(--border)', paddingTop: 4, marginTop: 4 }}>
                                    "{item.note}"
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {totalTimelinePages > 1 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                          <span style={{ fontSize: 12, color: 'var(--text-3)' }}>
                            Trang <strong>{timelinePage}</strong> / <strong>{totalTimelinePages}</strong>
                          </span>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button 
                              className="btn btn-outline btn-sm" 
                              onClick={() => setTimelinePage(prev => Math.max(1, prev - 1))} 
                              disabled={timelinePage <= 1}
                              style={{ padding: '4px 12px', fontSize: 12 }}
                            >
                              Trước
                            </button>
                            <button 
                              className="btn btn-outline btn-sm" 
                              onClick={() => setTimelinePage(prev => Math.min(totalTimelinePages, prev + 1))} 
                              disabled={timelinePage >= totalTimelinePages}
                              style={{ padding: '4px 12px', fontSize: 12 }}
                            >
                              Sau
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>

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
        <div className="modal-overlay" onClick={() => { setShowModal(false); setEditingVaccineId(null); }}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '520px', width: '100%', position: 'relative' }}>
            <button className="modal-close" onClick={() => { setShowModal(false); setEditingVaccineId(null); }}>×</button>
            <h2 className="modal-title">{editingVaccineId ? 'Cập nhật lịch tiêm phòng' : 'Thêm hồ sơ sức khỏe'}</h2>
            <p style={{ color:'var(--text-3)', fontSize:13, marginBottom:20 }}>Cho {selectedPet?.name}</p>

            {/* Tab Header */}
            {!editingVaccineId && (
              <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
              <button 
                className={`btn ${activeTab === 'log' ? 'btn-primary' : 'btn-outline'}`} 
                style={{ flex: 1, padding: '8px 16px', borderRadius: '12px', fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                onClick={() => setActiveTab('log')}
              >
                <Scale size={16} /> Chỉ số sức khỏe
              </button>
              <button 
                className={`btn ${activeTab === 'vaccine' ? 'btn-primary' : 'btn-outline'}`} 
                style={{ flex: 1, padding: '8px 16px', borderRadius: '12px', fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                onClick={() => setActiveTab('vaccine')}
              >
                <Syringe size={16} style={{ transform: 'rotate(-45deg)' }} /> Vaccine
              </button>
            </div>
            )}

            {activeTab === 'log' ? (
              <>
                {/* Group 1: Chỉ số cơ bản */}
                <div style={{ background: 'var(--surface2)', borderRadius: 12, padding: '14px', marginBottom: 14, border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12, fontSize: 12, fontWeight: 700, color: 'var(--text-2)' }}>
                    <Scale size={14} color="var(--primary)" /> Chỉ số cơ bản
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Cân nặng (kg) <span style={{ color: 'red' }}>*</span></label>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <button type="button" onClick={() => { const c = parseFloat(logForm.weight) || 0; setLogForm(f=>({...f,weight:Math.max(0, c - 0.1).toFixed(1)})); }} style={{ width: 34, height: 36, display:'flex',alignItems:'center',justifyContent:'center', background:'var(--surface)',border:'1px solid var(--border)',borderRadius:'10px 0 0 10px',color:'var(--text-2)',fontWeight:700,cursor:'pointer',fontSize:16 }}>-</button>
                        <input className="form-control" type="number" step="0.1" placeholder="5.2" value={logForm.weight} onChange={e => setLogForm(f=>({...f,weight:e.target.value}))} style={{ height: '36px', minHeight: 'auto', borderRadius: 0, textAlign:'center', flex:1, borderLeft:'none', borderRight:'none' }} />
                        <button type="button" onClick={() => { const c = parseFloat(logForm.weight) || 0; setLogForm(f=>({...f,weight:(c + 0.1).toFixed(1)})); }} style={{ width: 34, height: 36, display:'flex',alignItems:'center',justifyContent:'center', background:'var(--surface)',border:'1px solid var(--border)',borderRadius:'0 10px 10px 0',color:'var(--text-2)',fontWeight:700,cursor:'pointer',fontSize:16 }}>+</button>
                      </div>
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Chiều cao (cm)</label>
                      <input className="form-control" type="number" step="0.5" placeholder="25" value={logForm.height} onChange={e => setLogForm(f=>({...f,height:e.target.value}))} style={{ height: '36px', minHeight: 'auto' }} />
                    </div>
                  </div>
                </div>

                {/* Group 2: Dinh dưỡng & Hoạt động */}
                <div style={{ background: 'var(--surface2)', borderRadius: 12, padding: '14px', marginBottom: 14, border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12, fontSize: 12, fontWeight: 700, color: 'var(--text-2)' }}>
                    <Utensils size={14} color="#3B82F6" /> Dinh dưỡng & Hoạt động
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: 10 }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Thức ăn hạt (g)</label>
                      <input className="form-control" type="number" placeholder="80" value={logForm.foodIntake} onChange={e => setLogForm(f=>({...f,foodIntake:e.target.value}))} style={{ height: '36px', minHeight: 'auto' }} />
                      <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
                        {[50, 80, 120].map(g => (
                          <button key={g} type="button" onClick={() => setLogForm(f=>({...f,foodIntake:g.toString()}))} style={{ padding:'3px 8px',fontSize:10,fontWeight:600,borderRadius:5, background:logForm.foodIntake===g.toString()?'var(--primary-bg)':'var(--surface)', color:logForm.foodIntake===g.toString()?'var(--primary)':'var(--text-3)', border:`1px solid ${logForm.foodIntake===g.toString()?'var(--primary)':'var(--border)'}`, cursor:'pointer',transition:'all 0.15s' }}>{g}g</button>
                        ))}
                      </div>
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Nước uống (ml)</label>
                      <input className="form-control" type="number" placeholder="200" value={logForm.waterIntake} onChange={e => setLogForm(f=>({...f,waterIntake:e.target.value}))} style={{ height: '36px', minHeight: 'auto' }} />
                      <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
                        {[100, 200, 300].map(ml => (
                          <button key={ml} type="button" onClick={() => setLogForm(f=>({...f,waterIntake:ml.toString()}))} style={{ padding:'3px 8px',fontSize:10,fontWeight:600,borderRadius:5, background:logForm.waterIntake===ml.toString()?'var(--primary-bg)':'var(--surface)', color:logForm.waterIntake===ml.toString()?'var(--primary)':'var(--text-3)', border:`1px solid ${logForm.waterIntake===ml.toString()?'var(--primary)':'var(--border)'}`, cursor:'pointer',transition:'all 0.15s' }}>{ml}ml</button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Thời gian ngủ (giờ)</label>
                      <input className="form-control" type="number" step="0.5" placeholder="12" value={logForm.sleepDuration} onChange={e => setLogForm(f=>({...f,sleepDuration:e.target.value}))} style={{ height: '36px', minHeight: 'auto' }} />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Vận động (phút)</label>
                      <input className="form-control" type="number" placeholder="45" value={logForm.activityMinutes} onChange={e => setLogForm(f=>({...f,activityMinutes:e.target.value}))} style={{ height: '36px', minHeight: 'auto' }} />
                    </div>
                  </div>
                </div>

                {/* Group 3: Chỉ số y tế */}
                <div style={{ background: 'var(--surface2)', borderRadius: 12, padding: '14px', marginBottom: 14, border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12, fontSize: 12, fontWeight: 700, color: 'var(--text-2)' }}>
                    <Heart size={14} color="#EF4444" /> Chỉ số y tế
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Thân nhiệt (°C)</label>
                      <input className="form-control" type="number" step="0.1" placeholder="38.5" value={logForm.temperature} onChange={e => setLogForm(f=>({...f,temperature:e.target.value}))} style={{ height: '36px', minHeight: 'auto' }} />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Nhịp tim (bpm)</label>
                      <input className="form-control" type="number" placeholder="110" value={logForm.heartRate} onChange={e => setLogForm(f=>({...f,heartRate:e.target.value}))} style={{ height: '36px', minHeight: 'auto' }} />
                    </div>
                  </div>
                </div>

                {/* Group 4: Trạng thái & Ngày */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Tình trạng sức khỏe</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                      {[
                        { id: 'NORMAL', label: 'Khỏe mạnh', icon: <Smile size={13} />, color: '#10B981' },
                        { id: 'OVERWEIGHT', label: 'Thừa cân', icon: <Scale size={13} />, color: '#3B82F6' },
                        { id: 'UNDERWEIGHT', label: 'Thiếu cân', icon: <Scale size={13} />, color: '#F59E0B' },
                        { id: 'SICK', label: 'Đang bệnh', icon: <Thermometer size={13} />, color: '#EF4444' },
                        { id: 'POST_SURGERY', label: 'Sau mổ', icon: <Syringe size={13} />, color: '#8B5CF6' }
                      ].map(opt => {
                        const isSelected = logForm.healthStatus === opt.id;
                        return (
                          <button key={opt.id} type="button" onClick={() => setLogForm(f=>({...f,healthStatus:opt.id}))} style={{
                            display:'flex',alignItems:'center',justifyContent:'center',gap:5,padding:'7px 6px',borderRadius:8,
                            border:`2px solid ${isSelected ? opt.color : 'var(--border)'}`,
                            background: isSelected ? `${opt.color}12` : 'var(--surface)',
                            color: isSelected ? opt.color : 'var(--text-3)', fontWeight:600, fontSize:11, cursor:'pointer', transition:'all 0.15s ease'
                          }}>
                            {opt.icon}<span>{opt.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Ngày đo</label>
                    <input className="form-control" type="date" value={logForm.date} onChange={e => setLogForm(f=>({...f,date:e.target.value}))} style={{ height: '36px', minHeight: 'auto' }} />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '12px' }}>
                  <label className="form-label">Ghi chú nhật ký</label>
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
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                    {[
                      { id: 'NORMAL', label: 'Khỏe mạnh', icon: <Smile size={13} />, color: '#10B981' },
                      { id: 'OVERWEIGHT', label: 'Thừa cân', icon: <Scale size={13} />, color: '#3B82F6' },
                      { id: 'UNDERWEIGHT', label: 'Thiếu cân', icon: <Scale size={13} />, color: '#F59E0B' },
                      { id: 'SICK', label: 'Đang bệnh', icon: <Thermometer size={13} />, color: '#EF4444' },
                      { id: 'POST_SURGERY', label: 'Sau mổ', icon: <Syringe size={13} />, color: '#8B5CF6' }
                    ].map(opt => {
                      const isSelected = vaccineForm.healthStatus === opt.id;
                      return (
                        <button key={opt.id} type="button" onClick={() => setVaccineForm(f=>({...f,healthStatus:opt.id}))} style={{
                          display:'flex',alignItems:'center',justifyContent:'center',gap:5,padding:'7px 6px',borderRadius:8,
                          border:`2px solid ${isSelected ? opt.color : 'var(--border)'}`,
                          background: isSelected ? `${opt.color}12` : 'var(--surface)',
                          color: isSelected ? opt.color : 'var(--text-3)', fontWeight:600, fontSize:11, cursor:'pointer', transition:'all 0.15s ease'
                        }}>
                          {opt.icon}<span>{opt.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Ghi chú</label>
                  <textarea className="form-control" rows={2} placeholder="Ghi chú thêm..." value={vaccineForm.notes} onChange={e => setVaccineForm(f=>({...f,notes:e.target.value}))} style={{resize:'vertical'}} />
                </div>
              </>
            )}

            <div style={{ display:'flex', gap:12, marginTop: 20 }}>
              <button className="btn btn-outline" style={{ flex:1 }} onClick={() => { setShowModal(false); setEditingVaccineId(null); }}>Huỷ</button>
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
