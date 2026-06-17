import { useState, useEffect } from 'react';
import { Star, Lock } from 'lucide-react';
import achievementApi from '../../api/achievementApi';

const MOCK = [
  { _id:'a1', title:'Người mới bắt đầu', description:'Hoàn thành nhiệm vụ đầu tiên', icon:'🌱', unlocked:true, category:'QUEST', xp:50 },
  { _id:'a2', title:'Chuỗi 7 ngày', description:'Duy trì chuỗi nhiệm vụ 7 ngày liên tiếp', icon:'🔥', unlocked:true, category:'STREAK', xp:100 },
  { _id:'a3', title:'Nhà vô địch', description:'Đạt top 10 bảng xếp hạng', icon:'🏆', unlocked:false, category:'RANK', xp:200 },
  { _id:'a4', title:'Người chăm sóc', description:'Thêm 5 hồ sơ sức khỏe', icon:'❤️', unlocked:false, category:'HEALTH', xp:150 },
  { _id:'a5', title:'Siêu sao XP', description:'Tích lũy 1000 XP', icon:'⭐', unlocked:true, category:'LEVEL', xp:200 },
  { _id:'a6', title:'Gia đình hạnh phúc', description:'Mời 1 thành viên gia đình', icon:'👨‍👩‍👧', unlocked:false, category:'FAMILY', xp:100 },
];

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await achievementApi.getAchievements() as any;
        setAchievements(res?.success ? res.data.achievements || [] : MOCK);
      } catch { setAchievements(MOCK); }
      setLoading(false);
    };
    load();
  }, []);

  const filtered = filter === 'ALL' ? achievements : filter === 'UNLOCKED' ? achievements.filter(a => a.unlocked) : achievements.filter(a => !a.unlocked);
  const unlockedCount = achievements.filter(a => a.unlocked).length;

  return (
    <div>
      <div className="page-header">
        <h1>🏆 Thành tích</h1>
        <p>{unlockedCount}/{achievements.length} thành tích đã mở khóa</p>
      </div>

      {/* Summary */}
      <div className="card" style={{ background:'linear-gradient(135deg, #FFD700, #FF8C00)', border:'none', marginBottom:24, color:'#fff' }}>
        <div style={{ display:'flex', alignItems:'center', gap:20 }}>
          <div style={{ fontSize:60 }}>🏆</div>
          <div>
            <div style={{ fontSize:32, fontWeight:800 }}>{unlockedCount}</div>
            <div style={{ fontSize:14, opacity:.85 }}>/{achievements.length} thành tích đạt được</div>
            <div style={{ height:6, background:'rgba(255,255,255,.3)', borderRadius:3, marginTop:10, width:200 }}>
              <div style={{ height:'100%', background:'#fff', borderRadius:3, width:`${achievements.length?Math.round((unlockedCount/achievements.length)*100):0}%` }} />
            </div>
          </div>
        </div>
      </div>

      <div style={{ display:'flex', gap:10, marginBottom:20 }}>
        {['ALL','UNLOCKED','LOCKED'].map(f => (
          <button key={f} className={`btn btn-sm ${filter===f?'btn-primary':'btn-outline'}`} onClick={() => setFilter(f)}>
            {f==='ALL'?'Tất cả':f==='UNLOCKED'?'Đã mở khóa':'Chưa mở khóa'}
          </button>
        ))}
      </div>

      {loading ? <div className="page-loader"><div className="spinner spinner-lg"/></div> : (
        <div className="grid grid-3">
          {filtered.map(a => (
            <div key={a._id} className="card" style={{ opacity: a.unlocked ? 1 : 0.55, textAlign:'center', padding:'24px 16px', position:'relative' }}>
              {!a.unlocked && (
                <div style={{ position:'absolute', top:12, right:12 }}><Lock size={16} color="var(--text-3)"/></div>
              )}
              {a.unlocked && (
                <div style={{ position:'absolute', top:12, right:12 }}><Star size={16} fill="#FFD700" color="#FFD700"/></div>
              )}
              <div style={{ fontSize:48, marginBottom:12 }}>{a.icon}</div>
              <div style={{ fontWeight:700, fontSize:15, marginBottom:6 }}>{a.title}</div>
              <div style={{ fontSize:12, color:'var(--text-3)', marginBottom:12 }}>{a.description}</div>
              <span className={`chip ${a.unlocked ? 'chip-green' : 'chip-gray'}`}>
                {a.unlocked ? '✅ Đã đạt' : '🔒 Chưa đạt'}
              </span>
              <div style={{ marginTop:10 }}>
                <span className="chip chip-yellow">⭐ {a.xp} XP</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
