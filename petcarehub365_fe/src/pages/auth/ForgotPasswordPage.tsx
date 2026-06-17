import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function ForgotPasswordPage() {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setMsg('');
    setLoading(true);
    const res = await forgotPassword(email) as any;
    setLoading(false);
    if (res?.success) setMsg('Email đặt lại mật khẩu đã được gửi. Vui lòng kiểm tra hộp thư!');
    else setError(res?.message || 'Gửi email thất bại');
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div style={{ textAlign:'center', maxWidth:340 }}>
          <div style={{ fontSize:64, marginBottom:24 }}>🔑</div>
          <div className="auth-logo">Quên mật khẩu?</div>
          <p className="auth-tagline">Nhập email của bạn, chúng tôi sẽ gửi hướng dẫn đặt lại mật khẩu.</p>
        </div>
      </div>
      <div className="auth-right">
        <div className="auth-form-wrap">
          <h1 style={{ fontSize:28, fontWeight:800, marginBottom:6 }}>Đặt lại mật khẩu</h1>
          <p style={{ color:'var(--text-3)', marginBottom:32, fontSize:14 }}>Nhập email tài khoản của bạn bên dưới</p>

          {error && <div style={{ background:'var(--primary-bg)', border:'1px solid var(--primary-border)', borderRadius:'var(--radius-sm)', padding:'12px 16px', marginBottom:16, fontSize:14, color:'var(--primary)' }}>{error}</div>}
          {msg && <div style={{ background:'#E8F8EF', border:'1px solid #B2DFDB', borderRadius:'var(--radius-sm)', padding:'12px 16px', marginBottom:16, fontSize:14, color:'var(--success)' }}>{msg}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <div className="input-group">
                <Mail size={16} className="input-icon" />
                <input className="form-control" type="email" placeholder="email@example.com" value={email} onChange={e=>setEmail(e.target.value)} required />
              </div>
            </div>
            <button type="submit" className="btn btn-primary btn-lg" style={{ width:'100%' }} disabled={loading}>
              {loading ? <><div className="spinner"/>Đang gửi...</> : 'Gửi email đặt lại mật khẩu'}
            </button>
          </form>
          <p style={{ textAlign:'center', marginTop:24, fontSize:14, color:'var(--text-3)' }}>
            <Link to="/login" style={{ fontWeight:700, color:'var(--primary)' }}>← Quay lại đăng nhập</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
