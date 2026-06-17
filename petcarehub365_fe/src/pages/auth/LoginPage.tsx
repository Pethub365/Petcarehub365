import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ identifier: '', password: '', rememberMe: true });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await login(form.identifier, form.password, form.rememberMe) as any;
    setLoading(false);
    if (res?.success) {
      navigate('/');
    } else {
      setError(res?.message || 'Đăng nhập thất bại');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div style={{ textAlign: 'center', maxWidth: 340 }}>
          <div style={{ fontSize: 64, marginBottom: 24 }}>🐾</div>
          <div className="auth-logo">PetCare Hub</div>
          <p className="auth-tagline">Chăm sóc thú cưng của bạn mỗi ngày, theo dõi sức khỏe và hoàn thành nhiệm vụ cùng nhau!</p>
          <div style={{ display:'flex', gap: 16, marginTop: 40, justifyContent:'center', flexWrap:'wrap' }}>
            {['🐕 Nhiệm vụ hàng ngày','❤️ Sức khỏe thú cưng','🏆 Bảng xếp hạng','🛒 Cửa hàng thú cưng'].map(t => (
              <span key={t} style={{ background:'rgba(255,255,255,.2)', padding:'6px 14px', borderRadius:20, fontSize:13, fontWeight:600 }}>{t}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-form-wrap">
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 6 }}>Chào mừng trở lại!</h1>
          <p style={{ color: 'var(--text-3)', marginBottom: 32, fontSize: 14 }}>Đăng nhập để tiếp tục chăm sóc thú cưng</p>

          {error && (
            <div style={{ background:'var(--primary-bg)', border:'1px solid var(--primary-border)', borderRadius:'var(--radius-sm)', padding:'12px 16px', marginBottom:16, fontSize:14, color:'var(--primary)' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email hoặc tên đăng nhập</label>
              <div className="input-group">
                <Mail size={16} className="input-icon" />
                <input
                  className="form-control"
                  type="text"
                  placeholder="Nhập email..."
                  value={form.identifier}
                  onChange={e => setForm(f => ({...f, identifier: e.target.value}))}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Mật khẩu</label>
              <div className="input-group">
                <Lock size={16} className="input-icon" />
                <input
                  className="form-control"
                  type={showPwd ? 'text' : 'password'}
                  placeholder="Nhập mật khẩu..."
                  value={form.password}
                  onChange={e => setForm(f => ({...f, password: e.target.value}))}
                  style={{ paddingRight: 40 }}
                  required
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', color:'var(--text-3)' }}>
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
              <label style={{ display:'flex', gap:8, alignItems:'center', fontSize:13, color:'var(--text-2)', cursor:'pointer' }}>
                <input type="checkbox" checked={form.rememberMe} onChange={e => setForm(f => ({...f, rememberMe: e.target.checked}))} />
                Ghi nhớ đăng nhập
              </label>
              <Link to="/forgot-password" style={{ fontSize:13, fontWeight:600, color:'var(--primary)' }}>Quên mật khẩu?</Link>
            </div>

            <button type="submit" className="btn btn-primary btn-lg" style={{ width:'100%' }} disabled={loading}>
              {loading ? <><div className="spinner" /> Đang đăng nhập...</> : 'Đăng nhập'}
            </button>
          </form>

          <p style={{ textAlign:'center', marginTop:24, fontSize:14, color:'var(--text-3)' }}>
            Chưa có tài khoản?{' '}
            <Link to="/register" style={{ fontWeight:700, color:'var(--primary)' }}>Đăng ký ngay</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
