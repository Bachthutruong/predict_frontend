import React, { useEffect, useMemo, useState } from 'react';
// Removed i18n – use Vietnamese literals directly
import { cartApi, shopApi } from '../../services/shopApi';
import type { Cart, CartItem } from '../../types/shop';
import { toast } from 'react-hot-toast';
import { Trash2, Minus, Plus, ShoppingBag, Tag, BadgePercent } from 'lucide-react';
import { Link } from 'react-router-dom';

const CartPage: React.FC = () => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token') || '';
  const [couponInput, setCouponInput] = useState('');
  const [couponApplied, setCouponApplied] = useState<string>(localStorage.getItem('cart_coupon') || '');
  const [couponDiscount, setCouponDiscount] = useState<number>(0);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const res = await cartApi.getCart(token);
      if (res.success) setCart(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  // remove unused helpers

  const formatPrice = (price: number) => new Intl.NumberFormat('zh-TW', { style: 'currency', currency: 'TWD' }).format(price);

  // Group same products (and same variant if any) like Shopee
  const grouped = useMemo(() => {
    if (!cart) return [] as Array<{ key: string; product: any; variant?: any; items: CartItem[]; quantity: number; unitPrice: number }>;
    const map = new Map<string, { key: string; product: any; variant?: any; items: CartItem[]; quantity: number; unitPrice: number }>();
    for (const it of cart.items) {
      const variantKey = it.variant ? `${it.variant.name}:${it.variant.value}` : '';
      const prodId = (it.product as any).id || (it.product as any)._id || 'unknown';
      const key = `${prodId}|${variantKey}`;
      const unitPrice = it.product.price; // using product price
      if (!map.has(key)) {
        map.set(key, { key, product: it.product, variant: it.variant, items: [it], quantity: it.quantity, unitPrice });
      } else {
        const g = map.get(key)!;
        g.items.push(it);
        g.quantity += it.quantity;
      }
    }
    return Array.from(map.values());
  }, [cart]);

  const derivedSubtotal = useMemo(() => grouped.reduce((sum, g) => sum + g.unitPrice * g.quantity, 0), [grouped]);
  const derivedDiscount = useMemo(() => (cart?.discount || 0) + (couponDiscount || 0), [cart, couponDiscount]);
  const derivedTotal = useMemo(() => Math.max(0, derivedSubtotal - (derivedDiscount || 0)), [derivedSubtotal, derivedDiscount]);

  // Update group quantity by adding/removing items to merge backend duplicates
  const updateGroupQty = async (groupKey: string, newQty: number) => {
    const g = grouped.find(x => x.key === groupKey);
    if (!g) return;
    const current = g.quantity;
    if (newQty === current) return;
    if (newQty > current) {
      const productId = (g.product as any).id || (g.product as any)._id;
      const variantParam = g.variant && g.variant.name && g.variant.value ? g.variant : undefined;
      await cartApi.addToCart(token, productId, newQty - current, variantParam);
      await fetchCart();
      window.dispatchEvent(new Event('cart-updated'));
      return;
    }
    // decrease: remove from items sequentially
    let delta = current - newQty;
    for (const it of g.items) {
      if (delta <= 0) break;
      if (it.quantity <= delta) {
        await cartApi.removeFromCart(token, (it as any)._id || (it as any).id);
        delta -= it.quantity;
        window.dispatchEvent(new Event('cart-updated'));
      } else {
        await cartApi.updateCartItem(token, (it as any)._id || (it as any).id, it.quantity - delta);
        delta = 0;
      }
    }
    await fetchCart();
  };

  const removeGroup = async (groupKey: string) => {
    const g = grouped.find(x => x.key === groupKey);
    if (!g) return;
    for (const it of g.items) {
      await cartApi.removeFromCart(token, (it as any)._id || (it as any).id);
    }
    await fetchCart();
  };

  const applyCoupon = async (e?: React.MouseEvent<HTMLButtonElement>) => {
    if (e) e.preventDefault();
    const code = couponInput.trim();
    if (!code) return;
    try {
      // Use public validator to avoid backend cart serialization bug
      const orderItems = grouped.map(g => ({ productId: (g.product as any).id || (g.product as any)._id, quantity: g.quantity, price: g.unitPrice }));
      const res = await shopApi.validateCoupon(code, derivedSubtotal, orderItems);
      if (res?.success) {
        // prefer discount from API if provided, else compute
        const discountRaw = (res.data?.discountAmount ?? res.data?.discount ?? res.discountAmount ?? res.discount) || 0;
        const discount = Number(discountRaw) || 0;
        // Persist coupon to backend cart, then clear localStorage and refresh
        const saveRes = await cartApi.applyCoupon(token, code);
        if (saveRes?.success) {
          setCouponDiscount(discount);
          setCouponApplied(code);
          localStorage.removeItem('cart_coupon');
          await fetchCart();
          toast.success('Áp dụng mã thành công');
        } else {
          toast.error(saveRes?.message || 'Không áp dụng được mã');
        }
      } else {
        setCouponDiscount(0);
        toast.error(res?.message || 'Mã không hợp lệ');
      }
    } catch {
      toast.error('Không áp dụng được mã');
    }
  };

  // Re-validate coupon from cart (not localStorage) when totals change
  useEffect(() => {
    const code = cart?.couponCode || couponApplied;
    if (!code) { setCouponDiscount(0); setCouponApplied(''); return; }
    (async () => {
      try {
        const orderItems = grouped.map(g => ({ productId: (g.product as any).id || (g.product as any)._id, quantity: g.quantity, price: g.unitPrice }));
        const res = await shopApi.validateCoupon(code, derivedSubtotal, orderItems);
        if (res?.success) {
          const discount = (res.data?.discountAmount ?? res.data?.discount ?? res.discountAmount ?? res.discount) || 0;
          setCouponDiscount(Number(discount) || 0);
          setCouponApplied(code);
        } else {
          setCouponDiscount(0);
          setCouponApplied('');
        }
      } catch {
        setCouponDiscount(0);
      }
    })();
  }, [cart?.couponCode, derivedSubtotal, grouped.length]);

  const removeCoupon = async () => {
    try {
      await cartApi.removeCoupon(token);
    } catch {}
    setCouponApplied('');
    setCouponDiscount(0);
    localStorage.removeItem('cart_coupon');
    await fetchCart();
    toast.success('Đã hủy mã giảm giá');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <ShoppingBag className="w-6 h-6 text-blue-600" />
        <h1 className="text-2xl font-bold">Giỏ hàng</h1>
      </div>

      {loading ? (
        <div className="text-gray-500">Đang tải...</div>
      ) : !cart || cart.items.length === 0 ? (
        <div className="bg-white p-10 rounded-2xl shadow-sm text-center text-gray-600">
          <div className="mb-3">Giỏ hàng của bạn đang trống</div>
          <Link to="/products" className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg">Mua sắm ngay</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-3">
            {grouped.map((g) => (
              <div key={g.key} className="bg-white p-4 rounded-2xl shadow-sm flex items-center gap-4 border hover:shadow-md transition">
                {g.product.images?.[0] ? (
                  <img src={g.product.images[0]} alt={g.product.name} className="w-24 h-24 object-cover rounded-xl" />
                ) : (
                  <div className="w-24 h-24 bg-gray-100 rounded-xl" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{g.product.name}</div>
                  <div className="text-gray-500 text-sm mt-1 flex items-center gap-2">
                    <Tag className="w-4 h-4" /> {formatPrice(g.unitPrice)}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => updateGroupQty(g.key, Math.max(1, g.quantity - 1))} className="p-2 rounded-lg border hover:bg-gray-50"><Minus className="w-4 h-4" /></button>
                  <span className="w-10 text-center font-medium">{g.quantity}</span>
                  <button onClick={() => updateGroupQty(g.key, g.quantity + 1)} className="p-2 rounded-lg border hover:bg-gray-50"><Plus className="w-4 h-4" /></button>
                </div>
                <div className="w-28 text-right font-semibold">{formatPrice(g.unitPrice * g.quantity)}</div>
                <button onClick={() => removeGroup(g.key)} className="p-2 rounded-lg border text-red-600 hover:bg-red-50"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}

            <div className="bg-white p-4 rounded-2xl shadow-sm flex items-center justify-between text-sm text-gray-600">
              {/* <div className="flex items-center gap-2"><Truck className="w-4 h-4" /> Miễn phí vận chuyển cho đơn từ 1.000.000đ</div> */}
              <Link to="/products" className="text-blue-600 hover:underline">Tiếp tục mua sắm</Link>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm h-fit border">
            <h2 className="text-lg font-semibold mb-4">Đơn hàng</h2>
            {/* Coupon input */}
            <div className="flex gap-2 mb-4">
              <input
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
                placeholder={couponApplied ? `Đã áp dụng: ${couponApplied}` : 'Nhập mã giảm giá'}
                className="flex-1 border rounded-lg px-3 py-2"
              />
              <button type="button" onClick={applyCoupon} className="px-4 py-2 rounded-lg border bg-gray-50 hover:bg-gray-100">Áp dụng</button>
              {(couponApplied || cart?.couponCode) && (
                <button onClick={removeCoupon} className="px-4 py-2 rounded-lg border text-red-600 hover:bg-red-50">Hủy mã</button>
              )}
            </div>
            {couponApplied && couponDiscount > 0 && (
              <div className="flex items-center gap-2 mb-4 bg-green-50 text-green-700 px-3 py-2 rounded-xl border border-green-200">
                <BadgePercent className="w-4 h-4" />
                <span className="text-sm font-medium">Mã {couponApplied}</span>
                <span className="ml-auto text-sm">Giảm {formatPrice(couponDiscount)}</span>
              </div>
            )}
            <div className="space-y-2">
              <div className="flex justify-between"><span className="text-gray-600">Tạm tính</span><span className="font-medium">{formatPrice(derivedSubtotal)}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Giảm giá</span><span className="font-medium">-{formatPrice(derivedDiscount)}</span></div>
            </div>
            <div className="border-t my-3"></div>
            <div className="flex justify-between mb-4"><span className="font-medium">Tổng</span><span className="font-bold text-xl">{formatPrice(derivedTotal)}</span></div>
            <Link to="/checkout" className="block text-center w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-medium">Thanh toán</Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;


