import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Brain, CheckCircle2, Info } from 'lucide-react';

export default function AiAnalyzingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { petName, avatarUrl } = location.state || { petName: 'Mochi', avatarUrl: '' };
  
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          return 100;
        }
        return p + 1;
      });
    }, 28); // Chạy hết khoảng 2.8 giây để hoàn thành tiến trình

    const timeout = setTimeout(() => {
      navigate('/pets');
    }, 3500); // 3.5 giây chuyển hướng giống ứng dụng di động

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [navigate]);

  return (
    <div style={{ maxWidth: 600, margin: '60px auto 0', textAlign: 'center', padding: '0 20px' }}>
      {/* Vòng tròn ảnh đập nhịp với Glow */}
      <div className="avatar-ring-container">
        <div className="avatar-ring-pulse"></div>
        <div className="avatar-ring-inner">
          {avatarUrl ? (
            <img src={avatarUrl} alt={petName} className="avatar-ring-img" />
          ) : (
            <span style={{ fontSize: 48 }}>🐾</span>
          )}
          <div className="ai-badge-icon">
            <Brain size={16} color="#fff" />
          </div>
        </div>
      </div>

      <h1 style={{ fontSize: 28, fontWeight: 800, marginTop: 32, lineHeight: 1.3 }}>
        AI đang phân tích<br />dữ liệu thú cưng...
      </h1>
      
      <p style={{ color: 'var(--text-3)', fontSize: 14, marginTop: 12, lineHeight: 1.6, padding: '0 40px' }}>
        Chúng tôi đang kiến tạo lộ trình chăm sóc riêng biệt cho <strong style={{ color: 'var(--primary)' }}>{petName}</strong> dựa trên các thói quen sinh hoạt và chỉ số bạn cung cấp.
      </p>

      {/* Tiến trình */}
      <div style={{ background: '#FFF0F0', height: 8, borderRadius: 4, margin: '36px 0 16px', overflow: 'hidden' }}>
        <div style={{ height: '100%', background: 'var(--primary)', width: `${progress}%`, borderRadius: 4, transition: 'width 0.1s' }} />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: 'var(--primary)', fontWeight: 700, fontSize: 14 }}>
        <CheckCircle2 size={16} />
        <span>Đang tối ưu hóa chế độ dinh dưỡng...</span>
      </div>
      
      <div style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 750, marginTop: 8, letterSpacing: 0.5 }}>
        TIẾN ĐỘ: {progress}%
      </div>

      {/* Fact Card */}
      <div className="fact-card-web">
        <Info size={20} color="var(--primary)" style={{ flexShrink: 0, marginTop: 2 }} />
        <div style={{ textAlign: 'left', marginLeft: 12 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>Bạn có biết?</div>
          <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 4, lineHeight: 1.5 }}>
            Lộ trình cá nhân hóa giúp thú cưng sống khỏe mạnh hơn và kéo dài tuổi thọ trung bình thêm 15% nhờ việc kiểm soát dinh dưỡng chính xác.
          </div>
        </div>
      </div>
    </div>
  );
}
