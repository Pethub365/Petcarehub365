import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Crown, Star, Calendar, X, ShieldCheck, History } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import subscriptionApi from '../../api/subscriptionApi';

export default function SubscriptionPlansPage({ hideHeader = false }: { hideHeader?: boolean }) {
  const navigate = useNavigate();
  const { refreshUser, refreshPets } = useAuth();
  const [plans, setPlans] = useState<any[]>([]);
  const [currentSub, setCurrentSub] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Upgrade Form States
  const [billingCycle, setBillingCycle] = useState<'MONTHLY' | 'YEARLY'>('MONTHLY');
  const [checkoutPlan, setCheckoutPlan] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<'CARD' | 'MOMO' | 'ZALOPAY' | 'VIETQR'>('VIETQR');
  const [upgrading, setUpgrading] = useState(false);
  const [successData, setSuccessData] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [plansRes, subRes, txRes] = await Promise.all([
        subscriptionApi.getPlans(),
        subscriptionApi.getMySubscription(),
        subscriptionApi.getTransactions(),
      ]) as any[];

      if (plansRes?.success) setPlans(plansRes.data.plans || []);
      if (subRes?.success) setCurrentSub(subRes.data.subscription);
      if (txRes?.success) setTransactions(txRes.data.transactions || []);
    } catch (err) {
      console.error('Lỗi khi tải thông tin gói:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async () => {
    if (!checkoutPlan) return;
    setUpgrading(true);
    setErrorMsg('');
    try {
      const res = await subscriptionApi.upgradeSubscription(
        checkoutPlan.plan_type,
        billingCycle,
        paymentMethod
      ) as any;

      if (res?.success) {
        setSuccessData(res.data);
        await refreshUser(); // Update Auth state immediately
        await refreshPets(); // Refresh pets to sync subscription status
        await loadData(); // Reload page subscription status & transactions
      } else {
        setErrorMsg(res?.message || 'Có lỗi xảy ra khi nâng cấp gói.');
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error?.message || err.response?.data?.message || 'Giao dịch thất bại.');
    } finally {
      setUpgrading(false);
    }
  };

  const handleCancelAutoRenew = async () => {
    if (!confirm('Bạn có chắc chắn muốn tắt tự động gia hạn gói? Bạn vẫn sẽ sử dụng đầy đủ quyền lợi cho đến ngày hết hạn.')) return;
    try {
      const res = await subscriptionApi.cancelAutoRenew() as any;
      if (res?.success) {
        alert(res.message || 'Đã huỷ gia hạn tự động thành công.');
        loadData();
      }
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Không thể huỷ gia hạn tự động.');
    }
  };

  const handleOpenCheckout = (plan: any) => {
    if (!plan.can_upgrade) return;
    setCheckoutPlan(plan);
    setPaymentMethod('VIETQR');
    setSuccessData(null);
    setErrorMsg('');
  };

  const closeCheckout = () => {
    const wasSuccess = !!successData;
    setCheckoutPlan(null);
    setSuccessData(null);
    if (wasSuccess) {
      navigate('/', { replace: true });
    }
  };

  const planIcons: Record<string, any> = {
    FREE: () => <span style={{ fontSize: 24 }}>🆓</span>,
    PREMIUM: () => <Star size={24} className="text-secondary" color="var(--secondary)" fill="var(--secondary)" />,
    VIP: () => <Crown size={24} color="var(--gold)" fill="var(--gold)" />,
  };

  const planGradients: Record<string, string> = {
    FREE: 'var(--surface2)',
    PREMIUM: 'linear-gradient(135deg, #E1F0FF, #FFFFFF)',
    VIP: 'linear-gradient(135deg, #FFF8E1, #FFFFFF)',
  };

  const planBorder: Record<string, string> = {
    FREE: '1px solid var(--border)',
    PREMIUM: '2px solid var(--secondary)',
    VIP: '2px solid var(--gold)',
  };

  const renderPlanButton = (plan: any) => {
    const userPlan = currentSub?.plan_type || 'FREE';
    const isCurrent = plan.plan_type === userPlan;

    if (isCurrent) {
      return (
        <button className="btn btn-outline" style={{ width: '100%', cursor: 'default' }} disabled>
          Đang sử dụng
        </button>
      );
    }

    if (plan.plan_type === 'FREE') {
      return (
        <button className="btn btn-outline" style={{ width: '100%', cursor: 'default' }} disabled>
          Đã bao gồm
        </button>
      );
    }

    if (plan.plan_type === 'PREMIUM') {
      if (userPlan === 'VIP') {
        return (
          <button className="btn btn-outline" style={{ width: '100%', cursor: 'default' }} disabled>
            Đã bao gồm trong VIP 👑
          </button>
        );
      }
      return (
        <button
          className="btn btn-outline"
          style={{ width: '100%' }}
          onClick={() => handleOpenCheckout(plan)}
        >
          Nâng cấp lên Premium
        </button>
      );
    }

    if (plan.plan_type === 'VIP') {
      return (
        <button
          className="btn btn-primary"
          style={{
            width: '100%',
            background: 'linear-gradient(135deg,#FFD700,#FF8C00)',
            border: 'none',
            color: '#fff'
          }}
          onClick={() => handleOpenCheckout(plan)}
        >
          Nâng cấp lên VIP
        </button>
      );
    }

    return null;
  };

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', paddingBottom: 40 }}>
      {/* Back to settings navigation */}


      {!hideHeader && (
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1>👑 Gói đăng ký hội viên</h1>
            <p>Nâng cấp gói để trải nghiệm các đặc quyền chăm sóc thú cưng không giới hạn</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="page-loader"><div className="spinner spinner-lg" /></div>
      ) : (
        <div>
          {/* Current subscription banner */}
          {currentSub && (
            <div className="card" style={{
              marginBottom: 30,
              borderLeft: `5px solid ${currentSub.plan_type === 'VIP' ? 'var(--gold)' : currentSub.plan_type === 'PREMIUM' ? 'var(--secondary)' : 'var(--text-3)'}`,
              background: 'var(--surface)'
            }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-3)', letterSpacing: '.06em', marginBottom: 4 }}>Gói của bạn hiện tại</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontWeight: 800, fontSize: 22, color: 'var(--text)' }}>
                      {currentSub.plan_type === 'FREE' ? 'Gói Miễn Phí' : currentSub.plan_type === 'PREMIUM' ? 'Gói Premium ⭐' : 'Gói VIP 👑'}
                    </span>
                    <span className={`chip ${currentSub.status === 'ACTIVE' ? 'chip-green' : 'chip-gray'}`}>
                      {currentSub.status === 'ACTIVE' ? 'ĐANG KÍCH HOẠT' : 'HẾT HẠN'}
                    </span>
                  </div>
                  {currentSub.expires_at && (
                    <div style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Calendar size={14} style={{ color: 'var(--text-3)' }} />
                      Hạn dùng đến: <strong>{new Date(currentSub.expires_at).toLocaleDateString('vi-VN')}</strong>
                      {currentSub.days_remaining !== null && (
                        <span>(Còn {currentSub.days_remaining} ngày)</span>
                      )}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  {currentSub.plan_type !== 'FREE' && currentSub.auto_renew && (
                    <button className="btn btn-outline btn-sm" onClick={handleCancelAutoRenew}>
                      Hủy gia hạn tự động
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Billing Cycle Toggle */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, marginBottom: 30 }}>
            <span style={{ fontSize: 14, fontWeight: billingCycle === 'MONTHLY' ? 700 : 500, color: billingCycle === 'MONTHLY' ? 'var(--text)' : 'var(--text-3)' }}>Thanh toán theo Tháng</span>
            <button
              onClick={() => setBillingCycle(prev => prev === 'MONTHLY' ? 'YEARLY' : 'MONTHLY')}
              style={{
                width: 50, height: 26, borderRadius: 13, background: 'var(--primary)',
                position: 'relative', padding: 3, display: 'flex', alignItems: 'center',
                transition: 'background .3s'
              }}
            >
              <div style={{
                width: 20, height: 20, borderRadius: 10, background: '#fff',
                position: 'absolute', top: 3,
                left: billingCycle === 'MONTHLY' ? 3 : 27,
                transition: 'left .2s ease'
              }} />
            </button>
            <span style={{ fontSize: 14, fontWeight: billingCycle === 'YEARLY' ? 700 : 500, color: billingCycle === 'YEARLY' ? 'var(--text)' : 'var(--text-3)' }}>
              Thanh toán theo Năm <span style={{ background: '#FFF0F0', color: 'var(--primary)', fontWeight: 700, fontSize: 11, padding: '2px 6px', borderRadius: 4, marginLeft: 4 }}>Tiết kiệm 20%</span>
            </span>
          </div>

          {/* Plans Grid */}
          <div className="grid grid-3" style={{ marginBottom: 40 }}>
            {plans.map(plan => {
              const isCurrent = plan.plan_type === (currentSub?.plan_type || 'FREE');
              const price = billingCycle === 'MONTHLY' ? plan.price_monthly : plan.price_yearly;
              const cycleText = billingCycle === 'MONTHLY' ? '/ tháng' : '/ năm';

              return (
                <div key={plan.plan_type} className="card" style={{
                  display: 'flex', flexDirection: 'column', height: '100%',
                  background: isCurrent ? planGradients[plan.plan_type] : 'var(--surface)',
                  border: isCurrent ? planBorder[plan.plan_type] : '1px solid var(--border)',
                  boxShadow: isCurrent ? 'var(--shadow)' : 'var(--shadow-sm)',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  {isCurrent && (
                    <div style={{
                      position: 'absolute', top: 12, right: 12,
                      background: plan.plan_type === 'VIP' ? 'var(--gold)' : 'var(--secondary)',
                      color: '#fff', fontSize: 10, fontWeight: 800, padding: '3px 8px', borderRadius: 10
                    }}>
                      GÓI HIỆN TẠI
                    </div>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                    {planIcons[plan.plan_type] ? planIcons[plan.plan_type]() : null}
                    <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)' }}>{plan.name}</h3>
                  </div>

                  <div style={{ marginBottom: 20 }}>
                    {price === 0 ? (
                      <span style={{ fontSize: 32, fontWeight: 800, color: 'var(--text)' }}>Miễn phí</span>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'baseline' }}>
                        <span style={{ fontSize: 30, fontWeight: 800, color: 'var(--primary)' }}>
                          {price.toLocaleString('vi-VN')}₫
                        </span>
                        <span style={{ fontSize: 13, color: 'var(--text-3)', fontWeight: 600, marginLeft: 4 }}>{cycleText}</span>
                      </div>
                    )}
                  </div>

                  {/* Features List */}
                  <div style={{ flex: 1, marginBottom: 24 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-2)', textTransform: 'uppercase', marginBottom: 12, letterSpacing: '.04em' }}>Quyền lợi đặc quyền:</div>
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {plan.features.map((feat: string, idx: number) => (
                        <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: 'var(--text-2)' }}>
                          <Check size={16} style={{ color: 'var(--success)', flexShrink: 0, marginTop: 2 }} />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Actions */}
                  {renderPlanButton(plan)}
                </div>
              );
            })}
          </div>

          {/* Transactions Log Section */}
          {transactions.length > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <History size={18} style={{ color: 'var(--text-2)' }} />
                <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>Lịch sử giao dịch</h3>
              </div>
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Mã tham chiếu</th>
                        <th>Gói cước</th>
                        <th>Chu kỳ</th>
                        <th>Số tiền</th>
                        <th>Thanh toán</th>
                        <th>Ngày thanh toán</th>
                        <th>Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map(tx => (
                        <tr key={tx._id}>
                          <td style={{ fontWeight: 600 }}>{tx.transaction_ref}</td>
                          <td>
                            <span className={`chip ${tx.plan_type === 'VIP' ? 'chip-yellow' : 'chip-blue'}`}>
                              {tx.plan_type}
                            </span>
                          </td>
                          <td style={{ fontWeight: 500 }}>
                            {tx.package_duration === 'MONTHLY' ? 'Tháng' : 'Năm'}
                          </td>
                          <td style={{ color: 'var(--primary)', fontWeight: 700 }}>
                            {tx.amount.toLocaleString('vi-VN')}₫
                          </td>
                          <td>
                            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)' }}>{tx.payment_method}</span>
                          </td>
                          <td style={{ color: 'var(--text-3)', fontSize: 13 }}>
                            {new Date(tx.paid_at).toLocaleString('vi-VN')}
                          </td>
                          <td>
                            <span className="chip chip-green">Thành công</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Checkout Payment Modal */}
      {checkoutPlan && (
        <div className="modal-overlay" onClick={closeCheckout}>
          <div className="modal" style={{ position: 'relative', maxWidth: 480, width: '90%' }} onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeCheckout} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>
              <X size={16} />
            </button>

            {!successData ? (
              <div>
                <h3 className="modal-title" style={{ fontSize: 18, fontWeight: 800, marginBottom: 12 }}>
                  Nâng cấp {checkoutPlan.name}
                </h3>

                {/* Checkout Summary */}
                <div className="card" style={{ padding: 14, background: 'var(--surface2)', marginBottom: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 6 }}>
                    <span style={{ color: 'var(--text-2)' }}>Gói lựa chọn</span>
                    <strong style={{ color: 'var(--text)' }}>{checkoutPlan.name} ({billingCycle === 'MONTHLY' ? 'Tháng' : 'Năm'})</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 6 }}>
                    <span style={{ color: 'var(--text-2)' }}>Thời hạn kích hoạt</span>
                    <strong style={{ color: 'var(--text)' }}>{billingCycle === 'MONTHLY' ? '30 ngày' : '365 ngày'}</strong>
                  </div>
                  <div style={{ height: 1, background: 'var(--border)', margin: '10px 0' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16 }}>
                    <span style={{ fontWeight: 700, color: 'var(--text)' }}>Tổng thanh toán</span>
                    <strong style={{ color: 'var(--primary)', fontSize: 18 }}>
                      {(billingCycle === 'MONTHLY' ? checkoutPlan.price_monthly : checkoutPlan.price_yearly).toLocaleString('vi-VN')}₫
                    </strong>
                  </div>
                </div>

                {/* Payment Methods */}
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-2)', marginBottom: 10 }}>Phương thức thanh toán</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {[
                      { id: 'VIETQR', label: 'Cổng VietQR (Quét mã ngân hàng)', sub: 'Hỗ trợ tất cả ngân hàng nội địa Việt Nam' },
                      { id: 'MOMO', label: 'Ví MoMo', sub: 'Thanh toán trực tiếp qua ứng dụng MoMo' },
                      { id: 'ZALOPAY', label: 'Ví ZaloPay', sub: 'Thanh toán bảo mật qua ZaloPay' },
                      { id: 'CARD', label: 'Thẻ tín dụng (Visa/Mastercard)', sub: 'Thanh toán bằng thẻ quốc tế' },
                    ].map(method => (
                      <label key={method.id} style={{
                        display: 'flex', alignItems: 'center', gap: 12, padding: 12, borderRadius: 10,
                        border: `1.5px solid ${paymentMethod === method.id ? 'var(--primary)' : 'var(--border)'}`,
                        background: paymentMethod === method.id ? 'var(--primary-bg)' : 'var(--surface)',
                        cursor: 'pointer', transition: 'all .2s'
                      }}>
                        <input
                          type="radio"
                          name="payment_method"
                          value={method.id}
                          checked={paymentMethod === method.id}
                          onChange={() => setPaymentMethod(method.id as any)}
                          style={{ accentColor: 'var(--primary)' }}
                        />
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{method.label}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{method.sub}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {errorMsg && (
                  <div style={{ padding: 12, background: 'var(--primary-bg)', color: 'var(--primary)', borderRadius: 10, fontSize: 13, marginBottom: 16, fontWeight: 600 }}>
                    ⚠️ {errorMsg}
                  </div>
                )}

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                  <button className="btn btn-outline" style={{ flex: 1 }} onClick={closeCheckout}>
                    Hủy bỏ
                  </button>
                  <button
                    className="btn btn-primary"
                    style={{ flex: 2 }}
                    onClick={handleUpgrade}
                    disabled={upgrading}
                  >
                    {upgrading ? <div className="spinner" /> : 'Xác nhận thanh toán'}
                  </button>
                </div>
              </div>
            ) : (
              // Payment success screen
              <div style={{ textAlign: 'center', padding: '10px 0' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#E8F8EF', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: 'var(--success)' }}>
                  <ShieldCheck size={36} />
                </div>

                <h3 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)', marginBottom: 6 }}>Nâng cấp thành công! 🌟</h3>
                <p style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 20 }}>
                  Giao dịch của bạn đã được xử lý và kích hoạt thành công.
                </p>

                {/* Transaction details card */}
                <div className="card" style={{ padding: 14, background: 'var(--surface2)', textAlign: 'left', marginBottom: 24 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                    <span style={{ color: 'var(--text-3)' }}>Mã hóa đơn</span>
                    <strong style={{ color: 'var(--text)' }}>{successData.transaction?.ref}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                    <span style={{ color: 'var(--text-3)' }}>Gói dịch vụ</span>
                    <strong style={{ color: 'var(--text)' }}>{checkoutPlan.name}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                    <span style={{ color: 'var(--text-3)' }}>Chu kỳ thanh toán</span>
                    <strong style={{ color: 'var(--text)' }}>{billingCycle === 'MONTHLY' ? 'Tháng' : 'Năm'}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                    <span style={{ color: 'var(--text-3)' }}>Số tiền thanh toán</span>
                    <strong style={{ color: 'var(--primary)' }}>{successData.transaction?.amount.toLocaleString('vi-VN')}₫</strong>
                  </div>
                  <div style={{ height: 1, background: 'var(--border)', margin: '8px 0' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <span style={{ color: 'var(--text-3)' }}>Thời hạn đến</span>
                    <strong style={{ color: 'var(--text)' }}>{new Date(successData.vip_expires_at || successData.subscription?.expires_at).toLocaleDateString('vi-VN')}</strong>
                  </div>
                </div>

                <button className="btn btn-primary" style={{ width: '100%' }} onClick={closeCheckout}>
                  Hoàn tất
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
