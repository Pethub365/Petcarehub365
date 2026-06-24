import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, Plus, Minus, Star, Bone, Gamepad2, Heart, Tag, Crown, ShoppingBag } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import SubscriptionPlansPage from '../settings/SubscriptionPlansPage';

const MOCK_PRODUCTS = [
  { _id:'p1', name:'Thức ăn Premium Pedigree', price:120000, category:'FOOD', rating:4.8, reviews:234, description:'Thức ăn dinh dưỡng cao cấp cho chó', image:'', badge:'Bán chạy' },
  { _id:'p2', name:'Đồ chơi chuột bông', price:45000, category:'TOY', rating:4.5, reviews:89, description:'Đồ chơi vải bông cho mèo', image:'', badge:'Mới' },
  { _id:'p3', name:'Vòng cổ GPS thông minh', price:850000, category:'ACCESSORY', rating:4.9, reviews:567, description:'Theo dõi vị trí thú cưng 24/7', image:'', badge:'Hot' },
  { _id:'p4', name:'Dầu gội chó Royal', price:95000, category:'CARE', rating:4.6, reviews:123, description:'Dầu gội dịu nhẹ, khử mùi hôi', image:'', badge:'' },
  { _id:'p5', name:'Lồng vận chuyển cao cấp', price:380000, category:'ACCESSORY', rating:4.7, reviews:201, description:'Lồng hàng không an toàn tiêu chuẩn', image:'', badge:'Sale' },
  { _id:'p6', name:'Bát ăn tự động', price:220000, category:'ACCESSORY', rating:4.4, reviews:78, description:'Định lượng khẩu phần ăn tự động', image:'', badge:'' },
];
const CATEGORIES = ['ALL','FOOD','TOY','CARE','ACCESSORY','VIP'];

const getCategoryIconDetails = (category: string) => {
  switch (category) {
    case 'FOOD':
      return { Icon: Bone, color: '#FFA94D', label: 'Thức ăn', bg: '#FFF3E0' };
    case 'TOY':
      return { Icon: Gamepad2, color: '#4F8EF7', label: 'Đồ chơi', bg: '#EFF6FF' };
    case 'CARE':
      return { Icon: Heart, color: '#FF6B6B', label: 'Chăm sóc', bg: '#FFF5F5' };
    case 'ACCESSORY':
      return { Icon: Tag, color: '#A855F7', label: 'Phụ kiện', bg: '#F3E8FF' };
    case 'VIP':
      return { Icon: Crown, color: '#F59E0B', label: 'Hội viên VIP', bg: '#FEF3C7' };
    case 'ALL':
    default:
      return { Icon: ShoppingBag, color: '#10B981', label: 'Tất cả', bg: '#E8F8EF' };
  }
};

export default function ShopPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { addItem, items, totalCount } = useCart();
  const [cat, setCat] = useState('ALL');
  const [qtys, setQtys] = useState<Record<string,number>>({});

  useEffect(() => {
    if (location.state && (location.state as any).category) {
      setCat((location.state as any).category);
    }
  }, [location.state]);

  const filtered = cat === 'ALL' ? MOCK_PRODUCTS : MOCK_PRODUCTS.filter(p => p.category === cat);

  const setQty = (id: string, delta: number) => {
    setQtys(prev => ({ ...prev, [id]: Math.max(1, (prev[id] || 1) + delta) }));
  };

  const handleAdd = (product: typeof MOCK_PRODUCTS[0]) => {
    addItem({ _id: product._id, productId: product._id, name: product.name, price: product.price, quantity: qtys[product._id] || 1 });
  };

  const inCart = (id: string) => items.some(i => i.productId === id);

  return (
    <div>
      <div className="page-header" style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: 10 }}><ShoppingCart size={24} color="var(--primary)" /> Cửa hàng thú cưng</h1>
          <p>Tất cả đồ dùng và thức ăn cho thú cưng của bạn</p>
        </div>
        <button className="btn btn-primary" style={{ position:'relative' }} onClick={() => navigate('/checkout')}>
          <ShoppingCart size={16}/> Giỏ hàng
          {totalCount > 0 && (
            <span style={{ position:'absolute', top:-8, right:-8, background:'#fff', color:'var(--primary)', fontSize:11, fontWeight:800, width:20, height:20, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', border:'2px solid var(--primary)' }}>
              {totalCount}
            </span>
          )}
        </button>
      </div>

      {/* Category tabs */}
      <div style={{ display:'flex', gap:10, marginBottom:24, overflowX:'auto', paddingBottom:4 }}>
        {CATEGORIES.map(c => {
          const { Icon, color, label } = getCategoryIconDetails(c);
          return (
            <button key={c} onClick={() => setCat(c)}
              style={{
                display:'flex', alignItems:'center', gap:6, padding:'8px 18px', borderRadius:20,
                border:`2px solid ${cat===c?'var(--primary)':'var(--border)'}`,
                background: cat===c?'var(--primary-bg)':'var(--surface)',
                color: cat===c?'var(--primary)':'var(--text-2)',
                fontWeight:600, fontSize:13, cursor:'pointer', whiteSpace:'nowrap', flexShrink:0
              }}>
              <Icon size={14} color={cat===c?'var(--primary)':color} /> {label}
            </button>
          );
        })}
      </div>

      {/* Products grid or Subscription plans */}
      {cat === 'VIP' ? (
        <SubscriptionPlansPage hideHeader={true} />
      ) : (
        <div className="grid grid-3">
          {filtered.map(p => {
            const { Icon, color, bg } = getCategoryIconDetails(p.category);
            return (
              <div key={p._id} className="card" style={{ overflow:'hidden', padding:0 }}>
                {/* Image placeholder */}
                <div style={{
                  height:160, background:`linear-gradient(135deg, ${bg}, #FFF)`,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  position:'relative'
                }}>
                  <Icon size={48} color={color} style={{ opacity: 0.8 }} />
                  {p.badge && (
                    <span style={{ position:'absolute', top:12, left:12, background:'var(--primary)', color:'#fff', fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:12 }}>
                      {p.badge}
                    </span>
                  )}
                </div>

              <div style={{ padding:'16px' }}>
                <div style={{ fontWeight:700, fontSize:15, marginBottom:4, color:'var(--text)' }}>{p.name}</div>
                <div style={{ fontSize:12, color:'var(--text-3)', marginBottom:10 }}>{p.description}</div>

                <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:12 }}>
                  <Star size={13} fill="#FFB000" color="#FFB000"/>
                  <span style={{ fontWeight:700, fontSize:13 }}>{p.rating}</span>
                  <span style={{ fontSize:12, color:'var(--text-3)' }}>({p.reviews} đánh giá)</span>
                </div>

                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
                  <span style={{ fontWeight:800, fontSize:18, color:'var(--primary)' }}>{p.price.toLocaleString('vi-VN')}₫</span>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <button className="icon-btn" style={{ width:28, height:28 }} onClick={() => setQty(p._id, -1)}><Minus size={13}/></button>
                    <span style={{ fontWeight:700, fontSize:14, minWidth:20, textAlign:'center' }}>{qtys[p._id] || 1}</span>
                    <button className="icon-btn" style={{ width:28, height:28 }} onClick={() => setQty(p._id, 1)}><Plus size={13}/></button>
                  </div>
                </div>

                <button
                  className={`btn btn-sm ${inCart(p._id)?'btn-outline':'btn-primary'}`}
                  style={{ width:'100%' }}
                  onClick={() => handleAdd(p)}>
                  <ShoppingCart size={14}/> {inCart(p._id)?'Thêm nữa':'Thêm vào giỏ'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
      )}
    </div>
  );
}
