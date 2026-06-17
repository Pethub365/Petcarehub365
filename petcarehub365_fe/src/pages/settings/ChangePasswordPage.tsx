import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function ChangePasswordPage() {
  const { changePassword } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ oldPassword:'', newPassword:'', confirmPassword:'' });
  const [show, setShow] = useState({ old:false, new_:false, confirm:false });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setMsg('');
    if (form.newPassword !== form.confirmPassword) { setError('Mật khẩu xác nhận không khớp'); return; }
    if (form.newPassword.length < 8) { setError('Mật khẩu mới phải ít nhất 8 ký tự'); return; }
    setLoading(true);
    const res = await changePassword({ oldPassword: form.oldPassword, newPassword: form.newPassword }) as any;
    setLoading(false);
    if (res?.success) {
      setMsg('Đổi mật khẩu thành công!');
      setForm({ oldPassword:'', newPassword:'', confirmPassword:'' });
      setTimeout(() => navigate('/settings'), 2000);
    } else {
      setError(res?.message || 'Đổi mật khẩu thất bại');
    }
  };

  const PwdField = ({ label, key_, value, placeholder }: { label:string; key_:'old'|'new_'|'confirm'; value:string; placeholder:string }) => (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <div className="input-group">
        <Lock size={16} className="input-icon"/>
        <input className="form-control" type={show[key_]?'text':'password'} placeholder={placeholder} value={value}
          onChange={e => setForm(f => ({ ...f, [key_==='old'?'oldPassword':key_==='new_'?'newPassword':'confirmPassword']: e.target.value }))}
          style={{ paddingRight:40 }} required />
        <button type="button" onClick={() => setShow(s => ({...s,[key_]:!s[key_]}))} style={{ position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',color:'var(--text-3)' }}>
          {show[key_] ? <EyeOff size={16}/> : <Eye size={16}/>}
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth:480, margin:'0 auto' }}>
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:28 }}>
        <button className="icon-btn" onClick={() => navigate('/settings')}><ArrowLeft size={18}/></button>
        <h1 style={{ fontSize:22, fontWeight:800 }}>Đổi mật khẩu</h1>
      </div>

      {msg && <div style={{ background:'#E8F8EF', border:'1px solid #B2DFDB', borderRadius:10, padding:'12px 16px', marginBottom:16, fontSize:14, color:'var(--success)' }}>{msg}</div>}
      {error && <div style={{ background:'var(--primary-bg)', border:'1px solid var(--primary-border)', borderRadius:10, padding:'12px 16px', marginBottom:16, fontSize:14, color:'var(--primary)' }}>{error}</div>}

      <form className="card" onSubmit={handleSubmit}>
        <div className="section-title" style={{ marginBottom:20 }}>Thay đổi mật khẩu</div>
        <PwdField label="Mật khẩu hiện tại" key_="old" value={form.oldPassword} placeholder="Nhập mật khẩu hiện tại..." />
        <PwdField label="Mật khẩu mới" key_="new_" value={form.newPassword} placeholder="Ít nhất 8 ký tự..." />
        <PwdField label="Xác nhận mật khẩu mới" key_="confirm" value={form.confirmPassword} placeholder="Nhập lại mật khẩu mới..." />

        <div style={{ background:'var(--surface2)', borderRadius:10, padding:'12px 14px', marginBottom:16, fontSize:13, color:'var(--text-3)' }}>
          💡 Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số.
        </div>

        <div style={{ display:'flex', gap:12 }}>
          <button type="button" className="btn btn-outline" style={{ flex:1 }} onClick={() => navigate('/settings')}>Huỷ</button>
          <button type="submit" className="btn btn-primary" style={{ flex:2 }} disabled={loading}>
            {loading ? <><div className="spinner"/>Đang cập nhật...</> : '🔐 Đổi mật khẩu'}
          </button>
        </div>
      </form>
    </div>
  );
}
