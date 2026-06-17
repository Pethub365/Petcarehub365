import { useState, useEffect } from 'react';
import { Trophy, Crown, Medal } from 'lucide-react';
import petApi from '../../api/petApi';

const FILTERS = [
  { value:'weekly', label:'Tuần này' },
  { value:'monthly', label:'Tháng này' },
  { value:'all', label:'Tất cả' },
];
const SPECIES_FILTERS = ['all','dog','cat','bird','rabbit','hamster','other'];

export default function RanksPage() {
  const [board, setBoard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [time, setTime] = useState('weekly');
  const [species, setSpecies] = useState('all');

  const load = async () => {
    setLoading(true);
    try {
      const currentPetId = localStorage.getItem('selectedPetId') || undefined;
      const res = await petApi.getLeaderboard(species === 'all' ? undefined : species, currentPetId, time) as any;
      if (res?.success) setBoard(res.data.leaderboard || []);
    } catch { setBoard([]); }
    setLoading(false);
  };

  useEffect(() => { load(); }, [time, species]);

  const rankIcon = (idx: number) => {
    if (idx === 0) return <Crown size={20} color="#FFD700" />;
    if (idx === 1) return <Medal size={20} color="#C0C0C0" />;
    if (idx === 2) return <Medal size={20} color="#CD7F32" />;
    return <span style={{ fontWeight:800, color:'var(--text-3)', fontSize:14 }}>#{idx+1}</span>;
  };

  return (
    <div>
      <div className="page-header">
        <h1>🏆 Bảng xếp hạng</h1>
        <p>Top thú cưng chăm chỉ nhất</p>
      </div>

      {/* Top 3 podium */}
      {!loading && board.length >= 3 && (
        <div style={{ display:'flex', justifyContent:'center', alignItems:'flex-end', gap:16, marginBottom:32, padding:'20px 0' }}>
          {[1, 0, 2].map(rank => {
            const pet = board[rank];
            const heights = [160, 200, 140];
            const h = heights[rank === 0 ? 1 : rank === 1 ? 0 : 2];
            return (
              <div key={rank} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8 }}>
                <div className="avatar avatar-lg" style={{ fontSize:28, background:'var(--primary-bg)', border:`3px solid ${rank===0?'#FFD700':rank===1?'#C0C0C0':'#CD7F32'}` }}>
                  {pet?.avatar_url ? <img src={pet.avatar_url} alt={pet.name} style={{width:'100%',height:'100%',objectFit:'cover',borderRadius:'50%'}}/> : '🐾'}
                </div>
                <div style={{ fontWeight:700, fontSize:13 }}>{pet?.name}</div>
                <div style={{ fontSize:12, color:'var(--text-3)' }}>{pet?.stats?.xp || 0} XP</div>
                <div style={{
                  width:80, height:h, borderRadius:'8px 8px 0 0',
                  background: rank===0?'linear-gradient(180deg,#FFD700,#FFA000)':rank===1?'linear-gradient(180deg,#E0E0E0,#9E9E9E)':'linear-gradient(180deg,#CD7F32,#8D4E0A)',
                  display:'flex', alignItems:'flex-start', justifyContent:'center', paddingTop:12
                }}>
                  {rankIcon(rank)}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Filters */}
      <div style={{ display:'flex', gap:10, marginBottom:16, flexWrap:'wrap' }}>
        {FILTERS.map(f => (
          <button key={f.value} className={`btn btn-sm ${time===f.value?'btn-primary':'btn-outline'}`} onClick={() => setTime(f.value)}>
            {f.label}
          </button>
        ))}
        <div style={{ width:1, background:'var(--border)', margin:'0 4px' }}/>
        {SPECIES_FILTERS.map(s => (
          <button key={s} className={`btn btn-sm ${species===s?'btn-primary':'btn-outline'}`} onClick={() => setSpecies(s)} style={{ textTransform:'capitalize' }}>
            {s === 'all' ? 'Tất cả' : s}
          </button>
        ))}
      </div>

      <div className="card">
        {loading ? (
          <div className="page-loader"><div className="spinner spinner-lg"/></div>
        ) : board.length === 0 ? (
          <div className="empty-state"><Trophy size={48}/><h3>Chưa có dữ liệu xếp hạng</h3></div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:2 }}>
            {board.map((pet, idx) => {
              const isTop3 = idx < 3;
              return (
                <div key={pet._id || idx} style={{
                  display:'flex', alignItems:'center', gap:14,
                  padding:'14px 16px', borderRadius:12,
                  background: isTop3 ? (idx===0?'linear-gradient(90deg,#FFF8E1,transparent)':idx===1?'linear-gradient(90deg,#F5F5F5,transparent)':'linear-gradient(90deg,#FFF3E0,transparent)') : 'transparent',
                  transition:'background .15s'
                }}>
                  <div style={{ width:32, display:'flex', justifyContent:'center' }}>{rankIcon(idx)}</div>
                  <div className="avatar avatar-md" style={{ fontSize:20, background:'var(--primary-bg)', flexShrink:0 }}>
                    {pet.avatar_url ? <img src={pet.avatar_url} alt={pet.name} style={{width:'100%',height:'100%',objectFit:'cover',borderRadius:'50%'}}/> : '🐾'}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:700, fontSize:15 }}>{pet.name}</div>
                    <div style={{ fontSize:12, color:'var(--text-3)', textTransform:'capitalize' }}>{pet.species} • {pet.breed || 'Mixed'}</div>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <div style={{ fontWeight:800, fontSize:16, color: isTop3?'var(--primary)':'var(--text)' }}>{pet.stats?.xp || 0} XP</div>
                    <div style={{ fontSize:12, color:'var(--text-3)' }}>Cấp {pet.stats?.level || 1}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
