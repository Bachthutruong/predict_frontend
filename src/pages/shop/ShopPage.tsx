import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// Removed i18n on shop pages – use Vietnamese literals directly
import { Search, Filter, Star, ShoppingCart, Heart, Eye, Package, Truck, Shield, Award } from 'lucide-react';
import type { Product, SuggestionPackage } from '../../types/shop';
import { shopApi, cartApi, orderApi } from '../../services/shopApi';
import { toast } from 'react-hot-toast';
import { userAPI } from '../../services/api';
// import { useAuth } from '../../context/AuthContext';

const ShopPage: React.FC = () => {
  const navigate = useNavigate();
  // const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [suggestionPackages, setSuggestionPackages] = useState<SuggestionPackage[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0
  });

  useEffect(() => {
    fetchProducts();
    fetchSuggestionPackages();
    fetchCategories();
  }, [selectedCategory, sortBy, sortOrder, pagination.current]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await shopApi.getProducts({
        page: pagination.current,
        limit: 12,
        search: searchTerm,
        category: selectedCategory,
        sortBy,
        sortOrder
      });

      if (response.success) {
        setProducts(response.data);
        setPagination(response.pagination);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  

  const fetchSuggestionPackages = async () => {
    try {
      const response = await shopApi.getSuggestionPackages();
      if (response.success) {
        setSuggestionPackages(response.data);
      }
    } catch (error) {
      console.error('Error fetching suggestion packages:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await shopApi.getProductCategories();
      if (response.success) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, current: 1 }));
    fetchProducts();
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handleSortChange = (sortBy: string, sortOrder: 'asc' | 'desc') => {
    setSortBy(sortBy);
    setSortOrder(sortOrder);
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const formatPrice = (price: number) => new Intl.NumberFormat('zh-TW', { style: 'currency', currency: 'TWD' }).format(price);

  const getDiscountPercentage = (originalPrice: number, currentPrice: number) => {
    return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
  };

  const ProductCard: React.FC<{ product: Product }> = ({ product }) => (
    <div className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
      <div className="relative overflow-hidden">
        {product.images.length > 0 ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-64 bg-gray-100 flex items-center justify-center">
            <Package className="w-16 h-16 text-gray-400" />
          </div>
        )}
        
        {product.originalPrice && product.originalPrice > product.price && (
          <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-full text-sm font-medium">
            -{getDiscountPercentage(product.originalPrice, product.price)}%
          </div>
        )}
        
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button className="bg-white/90 hover:bg-white text-gray-600 hover:text-red-500 p-2 rounded-full shadow-lg transition-colors duration-200">
            <Heart className="w-4 h-4" />
          </button>
        </div>
        
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
          <button onClick={() => navigate(`/products/${product.id}`)} className="opacity-0 group-hover:opacity-100 bg-white text-gray-900 px-4 py-2 rounded-full font-medium transition-all duration-300 transform translate-y-4 group-hover:translate-y-0">
            <Eye className="w-4 h-4 mr-2 inline" />
            Xem nhanh
          </button>
        </div>
      </div>
      
      <div className="p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded-full font-medium">
            {product.category}
          </span>
            {product.pointsReward > 0 && (
            <span className="text-sm text-green-600 bg-green-50 px-2 py-1 rounded-full font-medium">
              +{product.pointsReward} điểm
            </span>
          )}
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors duration-200">
          {product.name}
        </h3>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {product.description}
        </p>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-gray-900">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-lg text-gray-500 line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'
                }`}
              />
            ))}
            <span className="text-sm text-gray-500 ml-1">(4.0)</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Truck className="w-4 h-4" />
            <span>{product.freeShipping ? 'Miễn phí vận chuyển' : 'Vận chuyển'}</span>
          </div>
          
          <div className="text-sm text-gray-500">
            {product.stock > 0 ? (
              <span className="text-green-600">Còn hàng</span>
            ) : (
              <span className="text-red-600">Hết hàng</span>
            )}
          </div>
        </div>
        
        <button onClick={async () => {
          const token = localStorage.getItem('token');
          if (!token) { window.location.href = '/login'; return; }
          try {
            const profileRes = await userAPI.getProfile();
            const p = profileRes.data;
            const missingPhone = !p?.phone || p.phone.trim() === '';
            const addr = p?.address || {};
            const missingAddress = !addr.street || !addr.city || !addr.state || !addr.postalCode || !addr.country;
            if (missingPhone || missingAddress) {
              alert('Vui lòng cập nhật số điện thoại và địa chỉ nhận hàng trước khi thêm vào giỏ.');
              window.location.href = '/profile';
              return;
            }
          } catch (e) {
            console.error('getProfile error', e);
          }
          const res = await cartApi.addToCart(token, product.id, 1, undefined);
          if (res?.success) {
            toast.success('Đã thêm vào giỏ hàng');
            window.dispatchEvent(new Event('cart-updated'));
          } else {
            toast.error(res?.message || 'Thêm vào giỏ hàng thất bại');
          }
        }} className="w-full mt-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2">
          <ShoppingCart className="w-4 h-4" />
          <span>Thêm vào giỏ</span>
        </button>
      </div>
    </div>
  );

  const SuggestionPackageCard: React.FC<{ package: SuggestionPackage }> = ({ package: pkg }) => (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-6 border border-purple-100 hover:shadow-lg transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Award className="w-6 h-6 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">{pkg.name}</h3>
        </div>
        <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">Gói gợi ý</span>
      </div>
      
      <p className="text-gray-600 mb-4">{pkg.description}</p>
      
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-2xl font-bold text-gray-900">
            {formatPrice(pkg.price)}
          </div>
          <div className="text-sm text-gray-500">{pkg.suggestionCount} gợi ý</div>
        </div>
        
        <div className="text-right">
          <div className="text-sm text-gray-500">Hiệu lực</div>
          <div className="font-medium text-gray-900">{pkg.validityDays} ngày</div>
        </div>
      </div>
      
      <button onClick={async () => {
        const token = localStorage.getItem('token');
        if (!token) { window.location.href = '/login'; return; }
        try {
          const profileRes = await userAPI.getProfile();
          const p = profileRes.data;
          const addr = p?.address || {};
          const shippingAddress = {
            name: p?.name || '',
            phone: p?.phone || '',
            street: addr.street || '',
            city: addr.city || '',
            state: addr.state || '',
            postalCode: addr.postalCode || '',
            country: addr.country || '',
          };
          const data = await orderApi.purchaseSuggestionPackage(token, pkg.id, shippingAddress);
          if (data.success) {
            window.location.href = `/orders/${data.data.order.id}`;
          } else {
            toast.error(data.message || 'Không thể mua gói.');
          }
        } catch (e) {
          toast.error('Không thể mua gói.');
        }
      }} className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-3 rounded-xl font-medium transition-all duration-300">
        Mua gói
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 max-w-full   ">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 text-white py-16">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Cửa hàng PredictWin</h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">Khám phá sản phẩm và ưu đãi hấp dẫn</p>
            
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Tìm sản phẩm..."
                  className="w-full pl-12 pr-4 py-4 rounded-2xl text-gray-900 text-lg focus:ring-4 focus:ring-blue-300 focus:outline-none"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-medium transition-colors duration-200"
                >
                  Tìm kiếm
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="bg-white py-12">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Miễn phí vận chuyển</h3>
              <p className="text-gray-600">Giao hàng nhanh chóng, miễn phí cho đơn đủ điều kiện</p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Thanh toán an toàn</h3>
              <p className="text-gray-600">Bảo mật thông tin và nhiều phương thức thanh toán</p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Đảm bảo chất lượng</h3>
              <p className="text-gray-600">Sản phẩm chính hãng, đổi trả theo quy định</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-xl transition-colors duration-200"
              >
                <Filter className="w-4 h-4" />
                <span>Bộ lọc</span>
              </button>
              
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Sắp xếp:</span>
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [sort, order] = e.target.value.split('-');
                    handleSortChange(sort, order as 'asc' | 'desc');
                  }}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="createdAt-desc">Mới nhất</option>
                  <option value="createdAt-asc">Cũ nhất</option>
                  <option value="price-asc">Giá: Thấp đến Cao</option>
                  <option value="price-desc">Giá: Cao đến Thấp</option>
                  <option value="name-asc">Tên: A → Z</option>
                  <option value="name-desc">Tên: Z → A</option>
                </select>
              </div>
            </div>
            
            <div className="text-sm text-gray-600">
              Hiển thị {((pagination.current - 1) * 12) + 1} - {Math.min(pagination.current * 12, pagination.total)} trên {pagination.total} sản phẩm
            </div>
          </div>
          
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Danh mục
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Tất cả danh mục</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
                <div className="w-full h-64 bg-gray-200"></div>
                <div className="p-6">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded mb-4 w-3/4"></div>
                  <div className="h-6 bg-gray-200 rounded mb-4"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex justify-center mt-12">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPagination(prev => ({ ...prev, current: prev.current - 1 }))}
                disabled={pagination.current === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
              Trước
              </button>
              
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setPagination(prev => ({ ...prev, current: page }))}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                    page === pagination.current
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {page}
                </button>
              ))}
              
              <button
                onClick={() => setPagination(prev => ({ ...prev, current: prev.current + 1 }))}
                disabled={pagination.current === pagination.pages}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
              Sau
              </button>
            </div>
          </div>
        )}

        {/* Suggestion Packages */}
        {suggestionPackages.length > 0 && (
          <div className="mt-16">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
              Gói gợi ý đề xuất
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {suggestionPackages.map((pkg) => (
                <SuggestionPackageCard key={pkg.id} package={pkg} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopPage;
