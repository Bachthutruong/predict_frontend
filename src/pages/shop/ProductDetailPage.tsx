import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// Removed i18n – use Vietnamese literals directly
import type { Product } from '../../types/shop';
import { shopApi, cartApi } from '../../services/shopApi';
import { Star, ShoppingCart, Package } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { userAPI } from '../../services/api';

const ProductDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const res = await shopApi.getProductById(id);
        if (res.success) setProduct(res.data);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const formatPrice = (price: number) => new Intl.NumberFormat('zh-TW', { style: 'currency', currency: 'TWD' }).format(price);
  const discountPercent = useMemo(() => {
    if (!product?.originalPrice || !product?.price) return 0;
    if (product.originalPrice <= product.price) return 0;
    return Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
  }, [product]);

  const addToCart = async () => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/login'); return; }
    try {
      const profileRes = await userAPI.getProfile();
      const p = profileRes.data;
      const missingPhone = !p?.phone || p.phone.trim() === '';
      const addr = p?.address || {};
      const missingAddress = !addr.street || !addr.city || !addr.state || !addr.postalCode || !addr.country;
      if (missingPhone || missingAddress) {
        alert('Vui lòng cập nhật số điện thoại và địa chỉ nhận hàng trước khi thêm vào giỏ.');
        navigate('/profile');
        return;
      }
    } catch (e) {
      // continue
    }
    const res = await cartApi.addToCart(token, product!.id, 1, undefined);
    if (res?.success) {
      toast.success('Đã thêm vào giỏ hàng');
      window.dispatchEvent(new Event('cart-updated'));
    } else {
      toast.error(res?.message || 'Thêm vào giỏ hàng thất bại');
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="h-64 bg-white rounded-2xl shadow-sm animate-pulse" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12 text-center text-gray-600">Không tìm thấy sản phẩm.</div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Gallery */}
        <div>
          <div className="relative overflow-hidden rounded-2xl bg-white border shadow-sm">
            {product.images?.[activeImage] ? (
              <img src={product.images[activeImage]} alt={product.name} className="w-full h-[420px] object-cover" />
            ) : (
              <div className="w-full h-[420px] bg-gray-100 flex items-center justify-center">
                <Package className="w-16 h-16 text-gray-400" />
              </div>
            )}
            {discountPercent > 0 && (
              <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                -{discountPercent}%
              </div>
            )}
          </div>
          {product.images?.length ? (
            <div className="grid grid-cols-5 gap-3 mt-3">
              {product.images.map((img, idx) => (
                <button key={idx} onClick={() => setActiveImage(idx)} className={`h-20 rounded-xl overflow-hidden border ${idx === activeImage ? 'ring-2 ring-blue-500' : ''}`}>
                  <img src={img} alt={product.name} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          ) : null}
        </div>

        {/* Info */}
        <div>
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{product.name}</h1>
            <div className="flex items-center gap-1 text-yellow-500">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`w-4 h-4 ${i < 4 ? 'fill-current' : 'text-gray-300'}`} />
              ))}
              <span className="text-sm text-gray-500 ml-1">(4.0)</span>
            </div>
          </div>
          <div className="mt-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">{product.category}</span>
          </div>
          <p className="text-gray-600 mt-4 leading-relaxed">{product.description}</p>

          <div className="mt-6 flex items-end gap-3">
            <div className="text-3xl font-bold text-gray-900">{formatPrice(product.price)}</div>
            {product.originalPrice && product.originalPrice > product.price && (
              <div className="text-xl text-gray-500 line-through">{formatPrice(product.originalPrice)}</div>
            )}
          </div>

          <div className="mt-6 flex items-center gap-3 text-sm text-gray-600">
            <div>{product.stock > 0 ? <span className="text-green-600">Còn hàng</span> : <span className="text-red-600">Hết hàng</span>}</div>
            <div>•</div>
            <div>{product.freeShipping ? 'Miễn phí vận chuyển' : 'Vận chuyển'}</div>
          </div>

          <div className="mt-8 flex gap-3">
            <button onClick={addToCart} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-medium inline-flex items-center justify-center gap-2">
              <ShoppingCart className="w-5 h-5" /> Thêm vào giỏ
            </button>
            <button onClick={() => navigate('/shop')} className="px-5 py-3 rounded-xl border font-medium">Quay lại</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;


