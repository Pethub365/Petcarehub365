import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, PawPrint, Heart, Star } from 'lucide-react';
import petApi from '../../api/petApi';

import { useAuth } from '../../contexts/AuthContext';

export default function PetsPage() {
  const navigate = useNavigate();
  const { pets, loadingPets: loading, refreshPets } = useAuth();
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa thú cưng này không?')) return;
    setDeleting(id);
    await petApi.deletePet(id);
    await refreshPets();
    setDeleting(null);
  };

  const SPECIES_EMOJI: Record<string, string> = { dog:'🐕', cat:'🐈' };

  return (
    <div>
      <div className="page-header" style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
        <div>
          <h1>Thú cưng của tôi</h1>
          <p>Quản lý và chăm sóc tất cả thú cưng của bạn</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/pets/setup')}>
          <Plus size={16} /> Thêm thú cưng
        </button>
      </div>

      {loading ? (
        <div className="grid grid-3">
          {[1,2,3].map(i => (
            <div key={i} className="card" style={{ height: 266, display:'flex', flexDirection:'column', justifyContent:'space-between' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16 }}>
                <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                  <div className="skeleton" style={{ width:64, height:64, borderRadius:'50%' }} />
                  <div>
                    <div className="skeleton" style={{ width:100, height:16, marginBottom:6 }} />
                    <div className="skeleton" style={{ width:80, height:12 }} />
                  </div>
                </div>
              </div>
              <div style={{ display:'flex', gap:12, marginBottom:16 }}>
                {[1,2,3].map(j => (
                  <div key={j} className="skeleton" style={{ flex:1, height:58, borderRadius:10 }} />
                ))}
              </div>
              <div style={{ marginBottom:14 }}>
                <div className="skeleton" style={{ width:'100%', height:14 }} />
              </div>
              <div style={{ display:'flex', gap:8, marginTop:14 }}>
                <div className="skeleton" style={{ flex:1, height:34 }} />
                <div className="skeleton" style={{ flex:1, height:34 }} />
              </div>
            </div>
          ))}
          <div
            className="card"
            style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:12, minHeight:200, border:'2px dashed var(--border)', background:'transparent' }}
          >
            <div className="skeleton" style={{ width:56, height:56, borderRadius:16 }} />
            <div className="skeleton" style={{ width:120, height:16 }} />
          </div>
        </div>
      ) : pets.length === 0 ? (
        <div className="empty-state" style={{ marginTop: 60 }}>
          <PawPrint size={64} />
          <h3>Chưa có thú cưng nào</h3>
          <p style={{ marginBottom: 24 }}>Hãy thêm thú cưng đầu tiên của bạn!</p>
          <button className="btn btn-primary" onClick={() => navigate('/pets/setup')}>
            <Plus size={16} /> Thêm ngay
          </button>
        </div>
      ) : (
        <div className="grid grid-3">
          {pets.map(pet => {
            const level = pet.stats?.level ?? 1;
            const xp = pet.stats?.xp ?? 0;
            const xpNeeded = level * 100 + 800;
            const xpPercent = Math.min(100, Math.round((xp / xpNeeded) * 100));
            const emoji = SPECIES_EMOJI[pet.species?.toLowerCase()] || '🐾';

            return (
              <div key={pet._id} className="card" style={{ cursor:'pointer' }} onClick={() => navigate(`/pets/${pet._id}`)}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                    <div className="avatar avatar-lg" style={{ fontSize:32, background:'var(--primary-bg)' }}>
                      {pet.avatar_url
                        ? <img src={pet.avatar_url} alt={pet.name} style={{ width:'100%', height:'100%', objectFit:'cover', borderRadius:'50%' }} />
                        : emoji}
                    </div>
                    <div>
                      <div style={{ fontWeight:700, fontSize:16 }}>{pet.name}</div>
                      <div style={{ fontSize:12, color:'var(--text-3)', textTransform:'capitalize' }}>{pet.species} • {pet.breed || 'Không rõ giống'}</div>
                    </div>
                  </div>
                  <div style={{ display:'flex', gap:6 }} onClick={e => e.stopPropagation()}>
                    <button className="icon-btn" onClick={() => navigate(`/pets/${pet._id}`)}><Edit2 size={15} /></button>
                    <button className="icon-btn" onClick={() => handleDelete(pet._id)} disabled={deleting === pet._id}>
                      {deleting === pet._id ? <div className="spinner" /> : <Trash2 size={15} />}
                    </button>
                  </div>
                </div>

                <div style={{ display:'flex', gap:12, marginBottom:16 }}>
                  <div style={{ flex:1, background:'var(--surface2)', borderRadius:10, padding:'10px 14px', textAlign:'center' }}>
                    <div style={{ fontSize:18, fontWeight:800 }}>{level}</div>
                    <div style={{ fontSize:11, color:'var(--text-3)', fontWeight:600 }}>CẤP ĐỘ</div>
                  </div>
                  <div style={{ flex:1, background:'#E8F8EF', borderRadius:10, padding:'10px 14px', textAlign:'center' }}>
                    <div style={{ fontSize:18, fontWeight:800, color:'var(--success)' }}>{xp}</div>
                    <div style={{ fontSize:11, color:'var(--success)', fontWeight:600 }}>XP</div>
                  </div>
                  <div style={{ flex:1, background:'var(--primary-bg)', borderRadius:10, padding:'10px 14px', textAlign:'center' }}>
                    <div style={{ fontSize:18, fontWeight:800, color:'var(--primary)' }}>{pet.stats?.coins ?? 0}</div>
                    <div style={{ fontSize:11, color:'var(--primary)', fontWeight:600 }}>COINS</div>
                  </div>
                </div>

                <div>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:'var(--text-3)', marginBottom:6 }}>
                    <span>Tiến trình XP</span><span>{xpPercent}%</span>
                  </div>
                  <div className="progress"><div className="progress-fill" style={{ width:`${xpPercent}%` }} /></div>
                </div>

                <div style={{ display:'flex', gap:8, marginTop:14 }}>
                  <button className="btn btn-outline btn-sm" style={{ flex:1 }} onClick={e => { e.stopPropagation(); navigate('/health'); }}>
                    <Heart size={13} /> Sức khỏe
                  </button>
                  <button className="btn btn-primary btn-sm" style={{ flex:1 }} onClick={e => { e.stopPropagation(); navigate('/missions'); }}>
                    <Star size={13} /> Nhiệm vụ
                  </button>
                </div>
              </div>
            );
          })}

          {/* Add new card */}
          <div
            className="card"
            style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:12, minHeight:200, border:'2px dashed var(--border)', cursor:'pointer', background:'transparent' }}
            onClick={() => navigate('/pets/setup')}
          >
            <div style={{ width:56, height:56, borderRadius:16, background:'var(--surface2)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Plus size={24} style={{ color:'var(--text-3)' }} />
            </div>
            <div style={{ fontWeight:600, color:'var(--text-3)' }}>Thêm thú cưng mới</div>
          </div>
        </div>
      )}
    </div>
  );
}
