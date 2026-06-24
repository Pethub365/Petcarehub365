import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Users, PawPrint, DollarSign, RefreshCw, TrendingUp, ShieldAlert, Award, Star, MessageSquare } from 'lucide-react';
import adminApi from '../../api/adminApi';
import feedbackApi from '../../api/feedbackApi';

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Feedback States
  const [activeTab, setActiveTab] = useState<'STATS' | 'FEEDBACK'>('STATS');
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [feedbackStats, setFeedbackStats] = useState<any>(null);
  const [loadingFeedback, setLoadingFeedback] = useState(true);
  const [feedbackError, setFeedbackError] = useState('');

  // Transactions Pagination States
  const [txPage, setTxPage] = useState(1);
  const [loadingTx, setLoadingTx] = useState(false);

  const emailLower = user?.email?.toLowerCase() || '';
  const isAdmin = emailLower.includes('admin');

  const loadStats = async (page = txPage, showGlobalLoader = true) => {
    try {
      if (showGlobalLoader) {
        setLoading(true);
      } else {
        setLoadingTx(true);
      }
      setError('');
      const res = await adminApi.getStats({ page, limit: 5 }) as any;
      if (res?.success) {
        setStats(res.data);
      } else {
        setError('Không tải được số liệu thống kê');
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Có lỗi xảy ra khi kết nối server');
    } finally {
      setLoading(false);
      setLoadingTx(false);
    }
  };

  const handleTxPageChange = (newPage: number) => {
    setTxPage(newPage);
    loadStats(newPage, false);
  };

  const loadFeedback = async () => {
    try {
      setLoadingFeedback(true);
      setFeedbackError('');
      const [feedbacksRes, statsRes] = await Promise.all([
        feedbackApi.getFeedbacks(),
        feedbackApi.getFeedbackStats(),
      ]) as any[];
      if (feedbacksRes?.success) setFeedbacks(feedbacksRes.data.feedbacks || []);
      if (statsRes?.success) setFeedbackStats(statsRes.data);
    } catch (err: any) {
      setFeedbackError(err?.response?.data?.message || 'Không thể tải ý kiến phản hồi');
    } finally {
      setLoadingFeedback(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadStats(1, true);
      loadFeedback();
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

  const renderStars = (rating: number) => {
    return (
      <div style={{ display: 'inline-flex', gap: 2 }}>
        {[1, 2, 3, 4, 5].map(starIdx => (
          <Star
            key={starIdx}
            size={14}
            color={starIdx <= rating ? 'var(--gold)' : 'var(--border)'}
            fill={starIdx <= rating ? 'var(--gold)' : 'none'}
          />
        ))}
      </div>
    );
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
        <button className="btn btn-primary" onClick={() => loadStats(txPage, true)}>
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
          <p>Quản lý, theo dõi thông tin hệ thống và đánh giá của người dùng</p>
        </div>
        <button className="btn btn-outline" onClick={activeTab === 'STATS' ? () => loadStats(txPage, true) : loadFeedback}>
          <RefreshCw size={16} /> Làm mới
        </button>
      </div>

      {/* Tab selectors */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, borderBottom: '1px solid var(--border)', paddingBottom: 10 }}>
        <button 
          onClick={() => setActiveTab('STATS')}
          style={{
            background: 'none', border: 'none', padding: '8px 16px', fontWeight: 700, fontSize: 14,
            color: activeTab === 'STATS' ? 'var(--primary)' : 'var(--text-3)',
            borderBottom: activeTab === 'STATS' ? '3px solid var(--primary)' : 'none',
            cursor: 'pointer', marginBottom: -11, transition: 'all 0.2s'
          }}
        >
          📊 Số liệu Hệ thống
        </button>
        <button 
          onClick={() => setActiveTab('FEEDBACK')}
          style={{
            background: 'none', border: 'none', padding: '8px 16px', fontWeight: 700, fontSize: 14,
            color: activeTab === 'FEEDBACK' ? 'var(--primary)' : 'var(--text-3)',
            borderBottom: activeTab === 'FEEDBACK' ? '3px solid var(--primary)' : 'none',
            cursor: 'pointer', marginBottom: -11, transition: 'all 0.2s'
          }}
        >
          ⭐ Đánh giá & Phản hồi
        </button>
      </div>

      {activeTab === 'STATS' ? (
        <div>
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
              <div className="card-title" style={{ fontSize: 16, marginBottom: 16 }}>Phân bố gói dịch vụ</div>
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
            <div className="card" style={{ position: 'relative' }}>
              <div className="card-title" style={{ fontSize: 16, marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Lịch sử giao dịch thành công mới nhất</span>
                {loadingTx && <div className="spinner" style={{ width: 16, height: 16 }} />}
              </div>
              {revenue.transactions.length === 0 ? (
                <div className="empty-state" style={{ padding: '40px 0' }}>
                  <Award size={48} />
                  <h3>Chưa có giao dịch thành công nào</h3>
                  <p>Hệ thống chưa ghi nhận giao dịch nâng cấp gói thành công nào gần đây.</p>
                </div>
              ) : (
                <div style={{ opacity: loadingTx ? 0.6 : 1, transition: 'opacity 0.2s' }}>
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
                  {revenue.pagination && revenue.pagination.pages > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
                      <span style={{ fontSize: 13, color: 'var(--text-3)' }}>
                        Hiển thị trang <strong>{revenue.pagination.page}</strong> / <strong>{revenue.pagination.pages}</strong> (Tổng {revenue.pagination.total} giao dịch)
                      </span>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button 
                          className="btn btn-outline btn-sm" 
                          onClick={() => handleTxPageChange(revenue.pagination.page - 1)} 
                          disabled={revenue.pagination.page <= 1 || loadingTx}
                          style={{ padding: '4px 12px', fontSize: 12 }}
                        >
                          Trước
                        </button>
                        <button 
                          className="btn btn-outline btn-sm" 
                          onClick={() => handleTxPageChange(revenue.pagination.page + 1)} 
                          disabled={revenue.pagination.page >= revenue.pagination.pages || loadingTx}
                          style={{ padding: '4px 12px', fontSize: 12 }}
                        >
                          Sau
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div>
          {loadingFeedback ? (
            <div style={{ padding: 24, textAlign: 'center' }}>
              <div className="spinner spinner-lg" style={{ margin: '0 auto 16px' }} />
              <p>Tải ý kiến phản hồi của người dùng...</p>
            </div>
          ) : feedbackError ? (
            <div className="empty-state" style={{ marginTop: 40 }}>
              <ShieldAlert size={64} style={{ color: 'var(--primary)', opacity: 0.8 }} />
              <h3>Lỗi tải dữ liệu</h3>
              <p style={{ marginBottom: 24 }}>{feedbackError}</p>
              <button className="btn btn-primary" onClick={loadFeedback}>
                <RefreshCw size={16} /> Thử lại
              </button>
            </div>
          ) : (
            <div>
              {/* Feedback Summary Cards */}
              <div className="grid grid-3" style={{ marginBottom: 24 }}>
                <div className="stat-card" style={{ borderLeft: '4px solid var(--gold)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: '#FFF8E1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: 'var(--gold)' }}><Star size={20} fill="var(--gold)" /></div>
                    <span className="stat-label">Đánh giá trung bình</span>
                  </div>
                  <div className="stat-value" style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                    {feedbackStats?.averageRating || 0}
                    <span style={{ fontSize: 14, color: 'var(--text-3)', fontWeight: 500 }}>/ 5.0</span>
                  </div>
                  <div style={{ marginTop: 4 }}>
                    {renderStars(Math.round(feedbackStats?.averageRating || 0))}
                  </div>
                </div>

                <div className="stat-card" style={{ borderLeft: '4px solid var(--primary)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--primary-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: 'var(--primary)' }}><MessageSquare size={20} /></div>
                    <span className="stat-label">Tổng số phản hồi</span>
                  </div>
                  <div className="stat-value">{feedbackStats?.total || 0}</div>
                  <span className="stat-change" style={{ color: 'var(--text-3)' }}>
                    Từ người dùng hệ thống
                  </span>
                </div>

                <div className="stat-card" style={{ borderLeft: '4px solid var(--secondary)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: '#E1F0FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: 'var(--secondary)' }}><MessageSquare size={20} /></div>
                    <span className="stat-label">Tỷ lệ có bình luận</span>
                  </div>
                  <div className="stat-value">
                    {feedbacks.length > 0 ? Math.round((feedbacks.filter(f => f.comment && f.comment.trim()).length / feedbacks.length) * 100) : 0}%
                  </div>
                  <span className="stat-change" style={{ color: 'var(--text-3)' }}>
                    {feedbacks.filter(f => f.comment && f.comment.trim()).length} ý kiến đóng góp chi tiết
                  </span>
                </div>
              </div>

              {/* Two columns: Star distribution & Feedbacks List */}
              <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: 24, alignItems: 'start' }}>
                {/* Star Distribution Column */}
                <div className="card">
                  <div className="card-title" style={{ fontSize: 16, marginBottom: 16 }}>Phân bố sao đánh giá</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {[5, 4, 3, 2, 1].map(star => {
                      const count = feedbackStats?.distribution[star] || 0;
                      const percent = feedbackStats?.total > 0 ? Math.round((count / feedbackStats.total) * 100) : 0;
                      return (
                        <div key={star}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6, alignItems: 'center' }}>
                            <span style={{ fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                              {star} <Star size={13} fill="var(--gold)" color="var(--gold)" />
                            </span>
                            <span style={{ color: 'var(--text-3)', fontSize: 12 }}>{count} lượt ({percent}%)</span>
                          </div>
                          <div className="progress" style={{ height: 8 }}>
                            <div className="progress-fill" style={{ width: `${percent}%`, background: 'var(--gold)' }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Feedbacks List Column */}
                <div className="card">
                  <div className="card-title" style={{ fontSize: 16, marginBottom: 16 }}>Ý kiến và bình luận mới nhất</div>
                  {feedbacks.length === 0 ? (
                    <div className="empty-state" style={{ padding: '40px 0' }}>
                      <MessageSquare size={48} style={{ color: 'var(--text-3)', opacity: 0.6 }} />
                      <h3>Chưa có phản hồi nào</h3>
                      <p>Hệ thống chưa nhận được ý kiến đánh giá nào từ người dùng.</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                      {feedbacks.map((fb: any) => {
                        const fbUser = fb.user_id;
                        const fbName = fbUser?.profile?.full_name || fbUser?.username || 'Ẩn danh';
                        const fbEmail = fbUser?.email || '';
                        return (
                          <div key={fb._id} style={{ borderBottom: '1px solid var(--border)', paddingBottom: 14 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 6 }}>
                              <div>
                                <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>{fbName}</span>
                                {fbEmail && (
                                  <span style={{ fontSize: 12, color: 'var(--text-3)', marginLeft: 6 }}>({fbEmail})</span>
                                )}
                              </div>
                              <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{formatDate(fb.created_at)}</span>
                            </div>

                            <div style={{ marginBottom: 6 }}>
                              {renderStars(fb.rating)}
                            </div>

                            <div style={{ fontSize: 13.5, color: 'var(--text-2)', background: 'var(--surface2)', padding: '10px 14px', borderRadius: 8, fontStyle: fb.comment ? 'normal' : 'italic' }}>
                              {fb.comment || 'Không có bình luận kèm theo.'}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
