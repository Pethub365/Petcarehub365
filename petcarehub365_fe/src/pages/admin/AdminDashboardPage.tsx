import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Users, PawPrint, DollarSign, RefreshCw, TrendingUp, ShieldAlert, Award } from 'lucide-react';
import adminApi from '../../api/adminApi';

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const emailLower = user?.email?.toLowerCase() || '';
  const isAdmin = emailLower.includes('admin');

  const loadStats = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await adminApi.getStats() as any;
      if (res?.success) {
        setStats(res.data);
      } else {
        setError('Không tải được số liệu thống kê');
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Có lỗi xảy ra khi kết nối server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadStats();
    }
  }, [isAdmin]);

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div style={{ padding: 24 }}>
        <div className="page-header">
          <h1>📊 Thống kê Hệ thống</h1>
          <p>Tải dữ liệu phân tích hệ thống...</p>
        </div>
        <div className="grid grid-3" style={{ marginBottom: 24 }}>
          {[1, 2, 3].map(i => (
            <div key={i} className="stat-card" style={{ height: 114 }}>
              <div className="skeleton" style={{ width: 150, height: 20, marginBottom: 10 }} />
              <div className="skeleton" style={{ width: 80, height: 32 }} />
            </div>
          ))}
        </div>
        <div className="grid grid-2">
          <div className="card" style={{ height: 300 }}>
            <div className="skeleton" style={{ width: 200, height: 24, marginBottom: 20 }} />
            <div className="skeleton" style={{ width: '100%', height: 180 }} />
          </div>
          <div className="card" style={{ height: 300 }}>
            <div className="skeleton" style={{ width: 200, height: 24, marginBottom: 20 }} />
            <div className="skeleton" style={{ width: '100%', height: 180 }} />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="empty-state" style={{ marginTop: 80 }}>
        <ShieldAlert size={64} style={{ color: 'var(--primary)', opacity: 0.8 }} />
        <h3>Lỗi tải dữ liệu</h3>
        <p style={{ marginBottom: 24 }}>{error}</p>
        <button className="btn btn-primary" onClick={loadStats}>
          <RefreshCw size={16} /> Thử lại
        </button>
      </div>
    );
  }

  const { users, pets, revenue } = stats;

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>📊 Thống kê Hệ thống (Admin)</h1>
          <p>Quản lý và theo dõi thông tin người dùng, thú cưng & doanh thu</p>
        </div>
        <button className="btn btn-outline" onClick={loadStats}>
          <RefreshCw size={16} /> Làm mới
        </button>
      </div>

      {/* Overview stats cards */}
      <div className="grid grid-3" style={{ marginBottom: 24 }}>
        <div className="stat-card" style={{ borderLeft: '4px solid var(--primary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--primary-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: 'var(--primary)' }}><Users size={20} /></div>
            <span className="stat-label">Tổng người dùng</span>
          </div>
          <div className="stat-value">{users.total}</div>
          <span className="stat-change up" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <TrendingUp size={12} /> +{users.newLast7Days} người dùng mới (7 ngày qua)
          </span>
        </div>

        <div className="stat-card" style={{ borderLeft: '4px solid var(--secondary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: '#E1F0FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: 'var(--secondary)' }}><PawPrint size={20} /></div>
            <span className="stat-label">Tổng thú cưng</span>
          </div>
          <div className="stat-value">{pets.total}</div>
          <span className="stat-change up" style={{ color: 'var(--text-3)' }}>
            Trung bình {pets.averagePerUser} pet / người dùng
          </span>
        </div>

        <div className="stat-card" style={{ borderLeft: '4px solid var(--success)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: '#E8F8EF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: 'var(--success)' }}><DollarSign size={20} /></div>
            <span className="stat-label">Doanh thu hệ thống</span>
          </div>
          <div className="stat-value" style={{ fontSize: 24, color: 'var(--success)', marginTop: 4 }}>{formatVND(revenue.total)}</div>
          <span className="stat-change up" style={{ color: 'var(--success)' }}>
            Đã thanh toán thành công {revenue.statusCount.success} giao dịch
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
        {/* User plans chart mock/cards */}
        <div className="card">
          <div className="card-title" style={{ fontSize: 16, marginBottom: 16 }}>Phân bố gói gói dịch vụ</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { name: 'Gói FREE (Miễn phí)', count: users.plans.FREE, color: 'var(--text-3)', percent: Math.round((users.plans.FREE / users.total) * 100) || 0 },
              { name: 'Gói PREMIUM', count: users.plans.PREMIUM, color: 'var(--secondary)', percent: Math.round((users.plans.PREMIUM / users.total) * 100) || 0 },
              { name: 'Gói VIP', count: users.plans.VIP, color: 'var(--primary)', percent: Math.round((users.plans.VIP / users.total) * 100) || 0 },
            ].map(plan => (
              <div key={plan.name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                  <span style={{ fontWeight: 600 }}>{plan.name}</span>
                  <span style={{ color: 'var(--text-3)' }}>{plan.count} người ({plan.percent}%)</span>
                </div>
                <div className="progress" style={{ height: 8 }}>
                  <div className="progress-fill" style={{ width: `${plan.percent}%`, background: plan.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pet species breakdown */}
        <div className="card">
          <div className="card-title" style={{ fontSize: 16, marginBottom: 16 }}>Thống kê loài thú cưng</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {Object.keys(pets.species).length === 0 ? (
              <div style={{ color: 'var(--text-3)', fontSize: 14, textAlign: 'center', padding: '20px 0' }}>Chưa có dữ liệu phân loại loài</div>
            ) : (
              Object.entries(pets.species).map(([species, count]: any) => {
                const percent = Math.round((count / pets.total) * 100) || 0;
                let color = 'var(--primary)';
                if (species === 'CAT') color = 'var(--secondary)';
                if (species === 'OTHER') color = 'var(--text-3)';
                return (
                  <div key={species}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                      <span style={{ fontWeight: 600, textTransform: 'uppercase' }}>{species === 'DOG' ? '🐕 Chó' : species === 'CAT' ? '🐈 Mèo' : `🐾 ${species}`}</span>
                      <span style={{ color: 'var(--text-3)' }}>{count} hồ sơ ({percent}%)</span>
                    </div>
                    <div className="progress" style={{ height: 8 }}>
                      <div className="progress-fill" style={{ width: `${percent}%`, background: color }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 24, alignItems: 'start' }}>
        {/* Transaction Summary */}
        <div className="card">
          <div className="card-title" style={{ fontSize: 16, marginBottom: 16 }}>Doanh thu theo Gói</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: 'var(--surface2)', padding: 14, borderRadius: 12 }}>
              <div style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 600, marginBottom: 4 }}>GÓI PREMIUM</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--secondary)' }}>{formatVND(revenue.byPlan.PREMIUM)}</div>
            </div>
            <div style={{ background: 'var(--primary-bg)', padding: 14, borderRadius: 12 }}>
              <div style={{ fontSize: 12, color: 'var(--primary-light)', fontWeight: 600, marginBottom: 4 }}>GÓI VIP</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--primary)' }}>{formatVND(revenue.byPlan.VIP)}</div>
            </div>
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8 }}>
                <span style={{ color: 'var(--text-3)' }}>Tổng số giao dịch:</span>
                <span style={{ fontWeight: 700 }}>{revenue.statusCount.total}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8 }}>
                <span style={{ color: 'var(--text-3)' }}>Thành công:</span>
                <span style={{ color: 'var(--success)', fontWeight: 700 }}>{revenue.statusCount.success}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8 }}>
                <span style={{ color: 'var(--text-3)' }}>Chờ xử lý:</span>
                <span style={{ color: 'var(--gold)', fontWeight: 700 }}>{revenue.statusCount.pending}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span style={{ color: 'var(--text-3)' }}>Thất bại:</span>
                <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{revenue.statusCount.failed}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Transactions List */}
        <div className="card">
          <div className="card-title" style={{ fontSize: 16, marginBottom: 16 }}>Lịch sử giao dịch thành công mới nhất</div>
          {revenue.transactions.length === 0 ? (
            <div className="empty-state" style={{ padding: '40px 0' }}>
              <Award size={48} />
              <h3>Chưa có giao dịch thành công nào</h3>
              <p>Hệ thống chưa ghi nhận giao dịch nâng cấp gói thành công nào gần đây.</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Khách hàng</th>
                    <th>Email</th>
                    <th>Loại gói</th>
                    <th>Thời hạn</th>
                    <th>Số tiền</th>
                    <th>Ngày thanh toán</th>
                  </tr>
                </thead>
                <tbody>
                  {revenue.transactions.map((tx: any) => (
                    <tr key={tx._id}>
                      <td style={{ fontWeight: 600 }}>{tx.user.name}</td>
                      <td>{tx.user.email}</td>
                      <td>
                        <span className={`chip ${tx.plan_type === 'VIP' ? 'chip-red' : 'chip-blue'}`}>
                          {tx.plan_type}
                        </span>
                      </td>
                      <td>{tx.package_duration === 'YEARLY' ? 'Năm' : 'Tháng'}</td>
                      <td style={{ fontWeight: 700, color: 'var(--success)' }}>{formatVND(tx.amount)}</td>
                      <td style={{ fontSize: 12, color: 'var(--text-3)' }}>{formatDate(tx.paid_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
