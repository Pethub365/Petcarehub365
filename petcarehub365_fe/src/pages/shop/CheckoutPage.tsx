import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, MapPin, CreditCard } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, totalPrice, removeItem, updateQuantity, clearCart } = useCart();
  const [form, setForm] = useState({ name:'', phone:'', address:'', note:'' });
  const [payment, setPayment] = useState('COD');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleOrder = async () => {
    if (!form.name || !form.phone || !form.address) { alert('Vui lòng điền đầy đủ thông tin giao hàng'); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    setLoading(false);
    setSuccess(true);
    clearCart();
  };

  if (success) return (
    <div style={{ maxWidth:480, margin:'80px auto', textAlign:'center' }}>
      <div style={{ fontSize:80, marginBottom:24 }}>🎉</div>
      <h2 style={{ fontSize:24, fontWeight:800, marginBottom:8 }}>Đặt hàng thành công!</h2>
      <p style={{ color:'var(--text-3)', marginBottom:32 }}>Đơn hàng của bạn đã được tiếp nhận và sẽ được giao trong 2-3 ngày.</p>
      <button className="btn btn-primary btn-lg" onClick={() => navigate('/shop')}>← Tiếp tục mua sắm</button>
    </div>
  );

  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:28 }}>
        <button className="icon-btn" onClick={() => navigate('/shop')}><ArrowLeft size={18}/></button>
        <h1 style={{ fontSize:22, fontWeight:800 }}>Thanh toán</h1>
      </div>

      {items.length === 0 ? (
        <div className="empty-state" style={{ marginTop:60 }}>
          <div style={{ fontSize:64, marginBottom:16 }}>🛒</div>
          <h3>Giỏ hàng trống</h3>
          <p style={{ marginBottom:24 }}>Hãy thêm sản phẩm vào giỏ hàng</p>
          <button className="btn btn-primary" onClick={() => navigate('/shop')}>Đi mua sắm →</button>
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 360px', gap:24, alignItems:'start' }}>
          {/* Left: cart items + form */}
          <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
            <div className="card">
              <div className="section-title" style={{ marginBottom:16 }}>Sản phẩm ({items.length})</div>
              {items.map(item => (
                <div key={item._id} style={{ display:'flex', alignItems:'center', gap:14, padding:'12px 0', borderBottom:'1px solid var(--border)' }}>
                  <div style={{ width:56, height:56, borderRadius:12, background:'var(--primary-bg)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:28, flexShrink:0 }}>🛍️</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:600, fontSize:14 }}>{item.name}</div>
                    <div style={{ fontSize:13, color:'var(--primary)', fontWeight:700, marginTop:2 }}>{item.price.toLocaleString('vi-VN')}₫</div>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <button className="icon-btn" style={{ width:28, height:28 }} onClick={() => updateQuantity(item.productId, item.quantity-1)}>−</button>
                    <span style={{ fontWeight:700, minWidth:24, textAlign:'center' }}>{item.quantity}</span>
                    <button className="icon-btn" style={{ width:28, height:28 }} onClick={() => updateQuantity(item.productId, item.quantity+1)}>+</button>
                  </div>
                  <button className="icon-btn" onClick={() => removeItem(item.productId)}><Trash2 size={15} style={{ color:'var(--primary)' }}/></button>
                </div>
              ))}
            </div>

            <div className="card">
              <div className="section-title" style={{ marginBottom:16 }}><MapPin size={16} style={{ marginRight:6 }}/>Thông tin giao hàng</div>
              <div className="grid grid-2">
                <div className="form-group">
                  <label className="form-label">Họ tên *</label>
                  <input className="form-control" placeholder="Nguyễn Văn A" value={form.name} onChange={e => setForm(f=>({...f,name:e.target.value}))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Số điện thoại *</label>
                  <input className="form-control" placeholder="0909..." value={form.phone} onChange={e => setForm(f=>({...f,phone:e.target.value}))} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Địa chỉ *</label>
                <input className="form-control" placeholder="Số nhà, đường, phường, quận, TP..." value={form.address} onChange={e => setForm(f=>({...f,address:e.target.value}))} />
              </div>
              <div className="form-group">
                <label className="form-label">Ghi chú</label>
                <textarea className="form-control" rows={2} placeholder="Ghi chú thêm cho đơn hàng..." value={form.note} onChange={e => setForm(f=>({...f,note:e.target.value}))} style={{ resize:'vertical' }} />
              </div>
            </div>

            <div className="card">
              <div className="section-title" style={{ marginBottom:16 }}><CreditCard size={16} style={{ marginRight:6 }}/>Phương thức thanh toán</div>
              {[
                { value:'COD', label:'Thanh toán khi nhận hàng (COD)', icon:'💵' },
                { value:'BANK', label:'Chuyển khoản ngân hàng', icon:'🏦' },
                { value:'VNPAY', label:'VNPay / Ví điện tử', icon:'📱' },
              ].map(m => (
                <label key={m.value} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px', borderRadius:12, border:`2px solid ${payment===m.value?'var(--primary)':'var(--border)'}`, background:payment===m.value?'var(--primary-bg)':'transparent', cursor:'pointer', marginBottom:8 }}>
                  <input type="radio" name="payment" value={m.value} checked={payment===m.value} onChange={() => setPayment(m.value)} style={{ accentColor:'var(--primary)' }} />
                  <span style={{ fontSize:20 }}>{m.icon}</span>
                  <span style={{ fontWeight:600, fontSize:14 }}>{m.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Right: Summary */}
          <div className="card" style={{ position:'sticky', top:84 }}>
            <div className="section-title" style={{ marginBottom:16 }}>Tóm tắt đơn hàng</div>
            {items.map(item => (
              <div key={item._id} style={{ display:'flex', justifyContent:'space-between', fontSize:13, marginBottom:8 }}>
                <span style={{ color:'var(--text-2)' }}>{item.name} ×{item.quantity}</span>
                <span style={{ fontWeight:600 }}>{(item.price * item.quantity).toLocaleString('vi-VN')}₫</span>
              </div>
            ))}
            <div style={{ height:1, background:'var(--border)', margin:'16px 0' }} />
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
              <span style={{ color:'var(--text-3)' }}>Phí vận chuyển</span>
              <span style={{ color:'var(--success)', fontWeight:600 }}>Miễn phí</span>
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:20 }}>
              <span style={{ fontWeight:700, fontSize:15 }}>Tổng cộng</span>
              <span style={{ fontWeight:800, fontSize:20, color:'var(--primary)' }}>{totalPrice.toLocaleString('vi-VN')}₫</span>
            </div>
            <button className="btn btn-primary btn-lg" style={{ width:'100%' }} onClick={handleOrder} disabled={loading}>
              {loading ? <><div className="spinner"/>Đang xử lý...</> : '🎉 Đặt hàng ngay'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
