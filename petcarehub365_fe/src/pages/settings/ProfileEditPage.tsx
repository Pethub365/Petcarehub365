import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, User, Mail, Phone, MapPin } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function ProfileEditPage() {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    full_name: user?.profile?.full_name || '',
    phone: user?.profile?.phone || '',
    bio: user?.profile?.bio || '',
    address: user?.profile?.address || '',
  });
  const [avatar, setAvatar] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatar(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setMsg('');
    setLoading(true);

    try {
      const fd = new FormData();
      fd.append('full_name', form.full_name);
      fd.append('phone', form.phone);
      fd.append('bio', form.bio);
      fd.append('address', form.address);
      if (avatar) {
        fd.append('avatar', avatar);
      }

      const res = await updateProfile(fd) as any;
      setLoading(false);
      if (res?.success) {
        setMsg('Hồ sơ đã được cập nhật thành công!');
        setAvatar(null);
        setPreview('');
        setTimeout(() => setMsg(''), 3000);
      } else {
        setError(res?.message || 'Cập nhật thất bại');
      }
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Có lỗi xảy ra khi lưu thông tin');
    }
  };

  const displayName = user?.profile?.full_name || user?.email?.split('@')[0] || 'User';
  const avatarUrl = user?.profile?.avatar_url;

  return (
    <div style={{ maxWidth:540, margin:'0 auto' }}>
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:28 }}>
        <button className="icon-btn" onClick={() => navigate('/settings')}><ArrowLeft size={18}/></button>
        <h1 style={{ fontSize:22, fontWeight:800 }}>Chỉnh sửa hồ sơ</h1>
      </div>

      {msg && <div style={{ background:'#E8F8EF', border:'1px solid #B2DFDB', borderRadius:10, padding:'12px 16px', marginBottom:16, fontSize:14, color:'var(--success)' }}>{msg}</div>}
      {error && <div style={{ background:'var(--primary-bg)', border:'1px solid var(--primary-border)', borderRadius:10, padding:'12px 16px', marginBottom:16, fontSize:14, color:'var(--primary)' }}>{error}</div>}

      {/* Avatar */}
      <div className="card" style={{ textAlign:'center', marginBottom:20 }}>
        <div className="avatar avatar-xl" style={{ margin:'0 auto 16px', fontSize:36, background:'var(--primary-bg)', overflow:'hidden' }}>
          {preview ? (
            <img src={preview} alt="preview" style={{width:'100%',height:'100%',objectFit:'cover',borderRadius:'50%'}}/>
          ) : avatarUrl ? (
            <img src={avatarUrl} alt={displayName} style={{width:'100%',height:'100%',objectFit:'cover',borderRadius:'50%'}}/>
          ) : (
            displayName.charAt(0).toUpperCase()
          )}
        </div>
        <div style={{ fontWeight:700, fontSize:18 }}>{displayName}</div>
        <div style={{ fontSize:13, color:'var(--text-3)', marginBottom:16 }}>{user?.email}</div>
        <label className="btn btn-outline btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer', margin: '0 auto' }}>
          <Upload size={14}/> Thay đổi ảnh đại diện
          <input type="file" accept="image/*" onChange={handleImage} style={{ display: 'none' }} />
        </label>
      </div>

      <form className="card" onSubmit={handleSubmit}>
        <div className="section-title" style={{ marginBottom:20 }}>Thông tin cá nhân</div>

        <div className="form-group">
          <label className="form-label">Họ và tên</label>
          <div className="input-group">
            <User size={16} className="input-icon"/>
            <input className="form-control" placeholder="Nguyễn Văn A" value={form.full_name} onChange={e => setForm(f=>({...f,full_name:e.target.value}))} />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Email</label>
          <div className="input-group">
            <Mail size={16} className="input-icon"/>
            <input className="form-control" value={user?.email || ''} disabled style={{ opacity:.6 }} />
          </div>
          <div className="form-error" style={{ color:'var(--text-3)' }}>Email không thể thay đổi</div>
        </div>

        <div className="form-group">
          <label className="form-label">Số điện thoại</label>
          <div className="input-group">
            <Phone size={16} className="input-icon"/>
            <input className="form-control" placeholder="0909..." value={form.phone} onChange={e => setForm(f=>({...f,phone:e.target.value}))} />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Địa chỉ</label>
          <div className="input-group">
            <MapPin size={16} className="input-icon"/>
            <input className="form-control" placeholder="Địa chỉ của bạn..." value={form.address} onChange={e => setForm(f=>({...f,address:e.target.value}))} />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Giới thiệu bản thân</label>
          <textarea className="form-control" rows={3} placeholder="Vài dòng giới thiệu về bạn..." value={form.bio} onChange={e => setForm(f=>({...f,bio:e.target.value}))} style={{ resize:'vertical' }} />
        </div>

        <div style={{ display:'flex', gap:12, marginTop:8 }}>
          <button type="button" className="btn btn-outline" style={{ flex:1 }} onClick={() => navigate('/settings')}>Huỷ</button>
          <button type="submit" className="btn btn-primary" style={{ flex:2 }} disabled={loading}>
            {loading ? <><div className="spinner"/>Đang lưu...</> : 'Lưu hồ sơ'}
          </button>
        </div>
      </form>
    </div>
  );
}
