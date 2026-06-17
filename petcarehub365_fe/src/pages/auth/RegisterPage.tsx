import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username:'', email:'', password:'', confirmPassword:'' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) { setError('Mật khẩu xác nhận không khớp'); return; }
    setLoading(true);
    const res = await register({ username: form.username, email: form.email, password: form.password }) as any;
    setLoading(false);
    if (res?.success) {
      setSuccess('Đăng ký thành công! Vui lòng kiểm tra email để xác thực.');
      setTimeout(() => navigate('/login'), 2500);
    } else {
      setError(res?.message || 'Đăng ký thất bại');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div style={{ textAlign:'center', maxWidth:340 }}>
          <div style={{ fontSize:64, marginBottom:24 }}>🐾</div>
          <div className="auth-logo">PetCare Hub</div>
          <p className="auth-tagline">Tham gia cộng đồng chủ pet yêu thương, cùng chăm sóc và theo dõi sức khỏe thú cưng mỗi ngày!</p>
        </div>
      </div>
      <div className="auth-right">
        <div className="auth-form-wrap">
          <h1 style={{ fontSize:28, fontWeight:800, marginBottom:6 }}>Tạo tài khoản</h1>
          <p style={{ color:'var(--text-3)', marginBottom:32, fontSize:14 }}>Bắt đầu hành trình chăm sóc thú cưng của bạn</p>

          {error && <div style={{ background:'var(--primary-bg)', border:'1px solid var(--primary-border)', borderRadius:'var(--radius-sm)', padding:'12px 16px', marginBottom:16, fontSize:14, color:'var(--primary)' }}>{error}</div>}
          {success && <div style={{ background:'#E8F8EF', border:'1px solid #B2DFDB', borderRadius:'var(--radius-sm)', padding:'12px 16px', marginBottom:16, fontSize:14, color:'var(--success)' }}>{success}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Tên đăng nhập</label>
              <div className="input-group">
                <User size={16} className="input-icon" />
                <input className="form-control" type="text" placeholder="username..." value={form.username} onChange={e => setForm(f=>({...f,username:e.target.value}))} required />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <div className="input-group">
                <Mail size={16} className="input-icon" />
                <input className="form-control" type="email" placeholder="email@example.com" value={form.email} onChange={e => setForm(f=>({...f,email:e.target.value}))} required />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Mật khẩu</label>
              <div className="input-group">
                <Lock size={16} className="input-icon" />
                <input className="form-control" type={showPwd?'text':'password'} placeholder="Ít nhất 8 ký tự..." value={form.password} onChange={e => setForm(f=>({...f,password:e.target.value}))} style={{paddingRight:40}} required minLength={8} />
                <button type="button" onClick={()=>setShowPwd(!showPwd)} style={{position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',color:'var(--text-3)'}}>
                  {showPwd ? <EyeOff size={16}/> : <Eye size={16}/>}
                </button>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Xác nhận mật khẩu</label>
              <div className="input-group">
                <Lock size={16} className="input-icon" />
                <input className="form-control" type={showPwd?'text':'password'} placeholder="Nhập lại mật khẩu..." value={form.confirmPassword} onChange={e => setForm(f=>({...f,confirmPassword:e.target.value}))} required />
              </div>
            </div>
            <button type="submit" className="btn btn-primary btn-lg" style={{width:'100%',marginTop:8}} disabled={loading}>
              {loading ? <><div className="spinner"/>Đang tạo tài khoản...</> : 'Đăng ký'}
            </button>
          </form>

          <p style={{textAlign:'center',marginTop:24,fontSize:14,color:'var(--text-3)'}}>
            Đã có tài khoản?{' '}<Link to="/login" style={{fontWeight:700,color:'var(--primary)'}}>Đăng nhập</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
