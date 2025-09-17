import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
// Removed i18n – use Vietnamese literals directly
import { cartApi, orderApi } from '../../services/shopApi';
import type { Cart } from '../../types/shop';
import { userAPI } from '../../services/api';
import { CreditCard, User as UserIcon, ShoppingCart as CartIcon, BadgePercent } from 'lucide-react';
import { shopApi } from '../../services/shopApi';

const CheckoutPage: React.FC = () => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'bank_transfer' | 'cod'>('bank_transfer');
  const [shippingAddress, setShippingAddress] = useState({
    name: '', phone: '', street: '', city: '', state: '', postalCode: '', country: ''
  });
  const [couponCode, setCouponCode] = useState<string>(localStorage.getItem('cart_coupon') || '');
  const token = localStorage.getItem('token') || '';
  const navigate = useNavigate();
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchCart = async () => {
    const res = await cartApi.getCart(token);
    if (res.success) setCart(res.data);
  };

  useEffect(() => {
    fetchCart();  
    (async () => {
      try {
        const profile = await userAPI.getProfile();
        const p = profile.data;
        const addr = p?.address || {};
        setShippingAddress({
          name: p?.name || '',
          phone: p?.phone || '',
          street: addr.street || '',
          city: addr.city || '',
          state: addr.state || '',
          postalCode: addr.postalCode || '',
          country: addr.country || '',
        });
      } catch {}
    })();
    // reflect coupon discount only (no input here)
    (async () => {
      try {
        const code = (cart as any)?.couponCode || localStorage.getItem('cart_coupon') || '';
        setCouponCode(code);
        if (!code) { setCouponDiscount(0); return; }
        const items = (cart?.items || []).map((it: any) => ({ productId: (it.product as any).id || (it.product as any)._id, quantity: it.quantity, price: it.product.price }));
        const res = await shopApi.validateCoupon(code, subtotal, items);
        const d = (res?.data?.discountAmount ?? res?.data?.discount ?? res?.discountAmount ?? res?.discount) || 0;
        setCouponDiscount(Number(d) || 0);
      } catch { setCouponDiscount(0); }
    })();
  }, []);

  const placeOrder = async () => {
    if (!shippingAddress.phone || !shippingAddress.street) {
      alert('Vui lòng nhập SĐT và địa chỉ');
      return;
    }
    // Build items and amounts explicitly to satisfy backend validation
    const items = (cart?.items || []).map((it: any) => ({
      productId: (it.product as any).id || (it.product as any)._id,
      quantity: Number(it.quantity) || 0,
      price: Number(it.product.price) || 0,
    }));
    const subtotalAmount = items.reduce((s: number, it: any) => s + it.price * it.quantity, 0);
    const discountAmount = Number(cartDiscount + couponDiscount) || 0;
    const totalAmount = Math.max(0, subtotalAmount - discountAmount);
    const payload: any = {
      shippingAddress,
      paymentMethod,
      couponCode: couponCode || (cart as any)?.couponCode,
      items,
      subtotal: subtotalAmount,
      discountAmount,
      totalAmount,
    };
    const res = await orderApi.createOrder(token, payload as any);
    if (res.success) {
      // Clear coupon persistence on success
      localStorage.removeItem('cart_coupon');
      setToast({ type: 'success', message: 'Đặt hàng thành công' });
      await fetchCart();
      navigate('/products');
    }
  };

  const formatPrice = (price: number) => new Intl.NumberFormat('zh-TW', { style: 'currency', currency: 'TWD' }).format(price);
  const subtotal = useMemo(() => (cart?.items || []).reduce((s: number, it: any) => s + it.product.price * it.quantity, 0), [cart]);
  const cartDiscount = cart?.discount || 0;
  const [couponDiscount, setCouponDiscount] = useState<number>(0);
  const total = Math.max(0, subtotal - cartDiscount - couponDiscount);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><UserIcon className="w-5 h-5 text-blue-600" /> Thông tin nhận hàng</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input className="border rounded-lg p-3" placeholder="Họ tên" value={shippingAddress.name} onChange={e => setShippingAddress({ ...shippingAddress, name: e.target.value })} />
            <input className="border rounded-lg p-3" placeholder="Số điện thoại" value={shippingAddress.phone} onChange={e => setShippingAddress({ ...shippingAddress, phone: e.target.value })} />
            <input className="border rounded-lg p-3 md:col-span-2" placeholder="Địa chỉ" value={shippingAddress.street} onChange={e => setShippingAddress({ ...shippingAddress, street: e.target.value })} />
            <input className="border rounded-lg p-3" placeholder="Thành phố" value={shippingAddress.city} onChange={e => setShippingAddress({ ...shippingAddress, city: e.target.value })} />
            <input className="border rounded-lg p-3" placeholder="Tỉnh/Bang" value={shippingAddress.state} onChange={e => setShippingAddress({ ...shippingAddress, state: e.target.value })} />
            <input className="border rounded-lg p-3" placeholder="Mã bưu chính" value={shippingAddress.postalCode} onChange={e => setShippingAddress({ ...shippingAddress, postalCode: e.target.value })} />
            <input className="border rounded-lg p-3" placeholder="Quốc gia" value={shippingAddress.country} onChange={e => setShippingAddress({ ...shippingAddress, country: e.target.value })} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><CreditCard className="w-5 h-5 text-purple-600" /> Phương thức thanh toán</h2>
          <div className="space-y-3">
            <label className="flex items-center gap-3">
              <input type="radio" checked={paymentMethod === 'bank_transfer'} onChange={() => setPaymentMethod('bank_transfer')} />
              <span>Chuyển khoản (tặng 100 điểm)</span>
            </label>
            <label className="flex items-center gap-3">
              <input type="radio" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} />
              <span>Thanh toán khi nhận hàng</span>
            </label>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm h-fit border">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><CartIcon className="w-5 h-5 text-green-600" /> Tóm tắt đơn</h2>
        {localStorage.getItem('cart_coupon') && couponDiscount > 0 && (
          <div className="flex items-center gap-2 mb-2 bg-green-50 text-green-700 px-3 py-2 rounded-xl border border-green-200">
            <BadgePercent className="w-4 h-4" />
            <span className="text-sm font-medium">Mã {localStorage.getItem('cart_coupon')}</span>
            <span className="ml-auto text-sm">Giảm {formatPrice(couponDiscount)}</span>
          </div>
        )}
        <div className="space-y-2">
          <div className="flex justify-between"><span>Tạm tính</span><span className="font-medium">{formatPrice(subtotal)}</span></div>
          <div className="flex justify-between"><span>Giảm giá</span><span className="font-medium">-{formatPrice(cartDiscount + couponDiscount)}</span></div>
        </div>
        <div className="border-t my-3"></div>
        <div className="flex justify-between mb-4"><span className="font-medium">Tổng</span><span className="font-bold text-xl">{formatPrice(total)}</span></div>
        <button onClick={placeOrder} className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 rounded-xl font-medium">Đặt hàng</button>
      </div>
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg border ${toast.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'}`}
             onAnimationEnd={() => { /* keep simple */ }}>
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default CheckoutPage;


