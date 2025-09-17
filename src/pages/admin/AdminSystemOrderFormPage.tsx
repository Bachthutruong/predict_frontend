import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Package, User, ShoppingCart, Plus, Minus, Trash2, Search } from 'lucide-react';
import { adminApi, shopApi } from '../../services/shopApi';
import { toast } from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Button } from '../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Textarea } from '../../components/ui/textarea';

interface OrderItem {
  product: any;
  quantity: number;
  price: number;
}

const AdminSystemOrderFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Form state
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer');
  const [status, setStatus] = useState('pending');
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const [shippingAddress, setShippingAddress] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    district: '',
    ward: '',
    notes: ''
  });
  const [couponCode, setCouponCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [shippingCost, setShippingCost] = useState(0);
  const [pointsUsed, setPointsUsed] = useState(0);
  const [adminNotes, setAdminNotes] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  
  // Search states
  const [userSearch, setUserSearch] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  
  // Load order data if editing
  useEffect(() => {
    if (isEdit && id) {
      loadOrder();
    } else {
      // Load initial users and products for new orders
      loadInitialData();
    }
  }, [id]);
  
  // Search users
  useEffect(() => {
    const timer = setTimeout(() => {
      if (userSearch) {
        searchUsers();
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [userSearch]);
  
  // Search products
  useEffect(() => {
    const timer = setTimeout(() => {
      if (productSearch) {
        searchProducts();
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [productSearch]);
  
  const loadInitialData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      // Load initial users
      const usersResponse = await adminApi.getUsers(token, { limit: 20 });
      if (usersResponse.success) {
        setUsers(usersResponse.data?.users || usersResponse.data || []);
      }
      
      // Load initial products
      const productsResponse = await adminApi.getProducts(token, { limit: 20, isActive: true });
      if (productsResponse.success) {
        setProducts(productsResponse.data?.products || productsResponse.data || []);
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  };
  
  const loadOrder = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const response = await adminApi.getSystemOrderById(token, id!);
      if (response.success && response.data) {
        const order = response.data;
        setSelectedUser(order.user);
        setItems(order.items || []);
        setPaymentMethod(order.paymentMethod);
        setStatus(order.status);
        setPaymentStatus(order.paymentStatus);
        setShippingAddress(order.shippingAddress || {
          name: '',
          phone: '',
          address: '',
          city: '',
          district: '',
          ward: '',
          notes: ''
        });
        setCouponCode(order.couponCode || '');
        setDiscountAmount(order.discountAmount || 0);
        setShippingCost(order.shippingCost || 0);
        setPointsUsed(order.pointsUsed || 0);
        setAdminNotes(order.adminNotes || '');
        setTrackingNumber(order.trackingNumber || '');
      }
    } catch (error) {
      console.error('Error loading order:', error);
      toast.error('Không thể tải thông tin đơn hàng');
    } finally {
      setLoading(false);
    }
  };
  
  const searchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const response = await adminApi.getUsers(token, { search: userSearch, limit: 10 });
      if (response.success) {
        setUsers(response.data?.users || response.data || []);
      }
    } catch (error) {
      console.error('Error searching users:', error);
    }
  };
  
  const searchProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const response = await adminApi.getProducts(token, { search: productSearch, limit: 10, isActive: true });
      if (response.success) {
        setProducts(response.data?.products || response.data || []);
      }
    } catch (error) {
      console.error('Error searching products:', error);
    }
  };
  
  const selectUser = (user: any) => {
    setSelectedUser(user);
    setUserSearch(user.name);
    setShowUserDropdown(false);
    // Auto-fill shipping info if available
    if (user.phone || user.address) {
      // Normalize address: API may return a string or an object
      let addressText = '';
      let city = '';
      let district = '';
      let ward = '';
      const uAddr = user.address;
      if (typeof uAddr === 'string') {
        addressText = uAddr;
      } else if (uAddr && typeof uAddr === 'object') {
        addressText = uAddr.street || uAddr.address || '';
        city = uAddr.city || '';
        district = uAddr.state || uAddr.district || '';
        ward = uAddr.ward || '';
      }
      setShippingAddress(prev => ({
        ...prev,
        name: user.name || prev.name,
        phone: user.phone || prev.phone,
        address: addressText || prev.address,
        city: city || prev.city,
        district: district || prev.district,
        ward: ward || prev.ward
      }));
    }
  };
  
  const addProduct = (product: any) => {
    const productId = product?._id || product?.id;
    const existingIndex = items.findIndex(item => (item.product?._id || item.product?.id) === productId);
    if (existingIndex >= 0) {
      // Increase quantity if product already exists
      const newItems = [...items];
      newItems[existingIndex].quantity += 1;
      setItems(newItems);
    } else {
      // Add new product
      const normalized = { ...product };
      if (!normalized._id && productId) normalized._id = productId;
      setItems([...items, {
        product: normalized,
        quantity: 1,
        price: Number(product.price || 0)
      }]);
    }
    // close dropdown after selection and clear search
    setProductSearch('');
    setShowProductDropdown(false);
  };
  
  const updateItemQuantity = (index: number, quantity: number) => {
    if (quantity <= 0) {
      removeItem(index);
    } else {
      const newItems = [...items];
      newItems[index].quantity = quantity;
      setItems(newItems);
    }
  };
  
  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };
  
  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };
  
  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    return subtotal - discountAmount + shippingCost - pointsUsed;
  };

  const applyCoupon = async () => {
    try {
      if (!couponCode) {
        setDiscountAmount(0);
        return;
      }
      const orderItems = items.map(i => ({ productId: (i.product?._id || i.product?.id), quantity: i.quantity, price: i.price }));
      const subtotal = calculateSubtotal();
      const res = await shopApi.validateCoupon(couponCode, subtotal, orderItems);
      if (res.success && res.data) {
        // New API shape: { coupon: { ... }, discountAmount: number, isFreeShipping: boolean }
        // Backward-compatible handling with fallback computation.
        const payload = res.data;
        const couponInfo = payload.coupon || payload; // fallback if server returns flat coupon fields

        // Prefer server-calculated discount amount when provided
        let computed = Number(payload.discountAmount ?? 0);

        if (!computed || Number.isNaN(computed)) {
          // Fallback: compute on client based on coupon info
          let eligibleAmount = subtotal;
          const minimumOrderAmount = couponInfo?.minimumOrderAmount;
          if (minimumOrderAmount && subtotal < minimumOrderAmount) {
            toast.error('Đơn hàng chưa đạt mức tối thiểu để áp dụng mã');
            setDiscountAmount(0);
            return;
          }
          const discountType = couponInfo?.discountType;
          const discountValue = Number(couponInfo?.discountValue || 0);
          if (discountType === 'percentage') {
            computed = Math.round((eligibleAmount * discountValue) / 100);
          } else {
            computed = discountValue;
          }
          // Cap at subtotal
          computed = Math.max(0, Math.min(eligibleAmount, computed));
        }

        setDiscountAmount(computed || 0);

        // Handle free shipping flag from server if any
        if (payload.isFreeShipping === true) {
          setShippingCost(0);
        }

        toast.success('Áp dụng mã giảm giá thành công');
      } else {
        toast.error(res.message || 'Mã giảm giá không hợp lệ');
        setDiscountAmount(0);
      }
    } catch (e) {
      console.error('applyCoupon', e);
      toast.error('Không thể áp dụng mã giảm giá');
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedUser) {
      toast.error('Vui lòng chọn khách hàng');
      return;
    }
    
    if (items.length === 0) {
      toast.error('Vui lòng thêm sản phẩm');
      return;
    }
    
    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const subtotal = calculateSubtotal();
      const orderData = {
        user: selectedUser._id,
        items: items.map(item => ({
          product: (item.product?._id || item.product?.id),
          quantity: item.quantity,
          price: item.price
        })),
        // Map UI shipping fields to backend schema fields
        shippingAddress: {
          name: shippingAddress.name,
          phone: shippingAddress.phone,
          street: shippingAddress.address || '',
          city: shippingAddress.city || '',
          state: shippingAddress.district || '',
          postalCode: shippingAddress as any && (shippingAddress as any).postalCode ? (shippingAddress as any).postalCode : '00000',
          country: shippingAddress as any && (shippingAddress as any).country ? (shippingAddress as any).country : 'TW',
          notes: shippingAddress.notes || ''
        },
        paymentMethod,
        status,
        paymentStatus,
        couponCode: couponCode || undefined,
        discountAmount,
        shippingCost,
        pointsUsed,
        subtotal,
        totalAmount: calculateTotal(),
        adminNotes,
        trackingNumber: trackingNumber || undefined
      };
      
      const response = isEdit
        ? await adminApi.updateSystemOrder(token, id!, orderData)
        : await adminApi.createSystemOrder(token, orderData);
      
      if (response.success) {
        toast.success(isEdit ? 'Cập nhật đơn hàng thành công' : 'Tạo đơn hàng thành công');
        navigate('/admin/orders');
      } else {
        toast.error(response.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('Error submitting order:', error);
      toast.error('Không thể lưu đơn hàng');
    } finally {
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/admin/orders')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại
        </Button>
        
        <h1 className="text-2xl font-bold text-gray-900">
          {isEdit ? 'Chỉnh sửa đơn hàng' : 'Tạo đơn hàng mới'}
        </h1>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - Main info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Thông tin khách hàng
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="relative">
                    <Label>Tìm kiếm khách hàng</Label>
                    <div className="relative mt-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        type="text"
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                        onFocus={() => setShowUserDropdown(true)}
                        placeholder="Nhập tên, email hoặc số điện thoại..."
                        className="pl-10"
                      />
                    </div>
                    {showUserDropdown && users.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                        {users.map((user) => (
                          <button
                            key={user._id}
                            type="button"
                            onMouseDown={() => selectUser(user)}
                            className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center justify-between"
                          >
                            <div>
                              <div className="font-medium">{user.name}</div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                            </div>
                            <div className="text-sm text-gray-500">{user.points || 0} điểm</div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {selectedUser && (
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="font-medium">{selectedUser.name}</div>
                      <div className="text-sm text-gray-600">{selectedUser.email}</div>
                      <div className="text-sm text-gray-600">Điểm hiện có: {selectedUser.points || 0}</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Products */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Sản phẩm
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="relative">
                    <Label>Thêm sản phẩm</Label>
                    <div className="relative mt-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        type="text"
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        onFocus={() => setShowProductDropdown(true)}
                        placeholder="Tìm kiếm sản phẩm..."
                        className="pl-10"
                      />
                    </div>
                    {showProductDropdown && products.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                        {products.map((product) => (
                          <button
                            key={product._id}
                            type="button"
                            onMouseDown={() => addProduct(product)}
                            className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3"
                          >
                            {product.images?.length > 0 && (
                              <img src={product.images[0]} alt={product.name} className="w-10 h-10 object-cover rounded" />
                            )}
                            <div className="flex-1">
                              <div className="font-medium">{product.name}</div>
                              <div className="text-sm text-gray-500">TWD {product.price.toLocaleString()}</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Items list */}
                  {items.length > 0 ? (
                    <div className="space-y-2">
                      {items.map((item, index) => (
                        <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                          {item?.product?.images?.length > 0 ? (
                            <img src={item.product.images[0]} alt={item.product.name} className="w-16 h-16 object-cover rounded" />
                          ) : (
                            <div className="w-16 h-16 rounded bg-white border flex items-center justify-center text-xs text-gray-500">Nạp điểm</div>
                          )}
                          <div className="flex-1">
                            <div className="font-medium">{item?.product?.name || 'Nạp điểm'}</div>
                            <div className="text-sm text-gray-500">TWD {Number(item.price || 0).toLocaleString()}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => updateItemQuantity(index, item.quantity - 1)}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <Input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => updateItemQuantity(index, parseInt(e.target.value) || 0)}
                              className="w-16 text-center"
                            />
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => updateItemQuantity(index, item.quantity + 1)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="destructive"
                              onClick={() => removeItem(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">TWD {Number((item.price || 0) * (item.quantity || 0)).toLocaleString()}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      Chưa có sản phẩm nào
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Shipping Address */}
            <Card>
              <CardHeader>
                <CardTitle>Địa chỉ giao hàng</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Họ tên người nhận</Label>
                    <Input
                      value={shippingAddress.name}
                      onChange={(e) => setShippingAddress({...shippingAddress, name: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label>Số điện thoại</Label>
                    <Input
                      value={shippingAddress.phone}
                      onChange={(e) => setShippingAddress({...shippingAddress, phone: e.target.value})}
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Địa chỉ</Label>
                    <Input
                      value={shippingAddress.address}
                      onChange={(e) => setShippingAddress({...shippingAddress, address: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label>Thành phố/Tỉnh</Label>
                    <Input
                      value={shippingAddress.city}
                      onChange={(e) => setShippingAddress({...shippingAddress, city: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Quận/Huyện</Label>
                    <Input
                      value={shippingAddress.district}
                      onChange={(e) => setShippingAddress({...shippingAddress, district: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Phường/Xã</Label>
                    <Input
                      value={shippingAddress.ward}
                      onChange={(e) => setShippingAddress({...shippingAddress, ward: e.target.value})}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Ghi chú</Label>
                    <Textarea
                      value={shippingAddress.notes}
                      onChange={(e) => setShippingAddress({...shippingAddress, notes: e.target.value})}
                      rows={2}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Right column - Order summary */}
          <div className="space-y-6">
            {/* Payment & Status */}
            <Card>
              <CardHeader>
                <CardTitle>Thanh toán & Trạng thái</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Phương thức thanh toán</Label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bank_transfer">Chuyển khoản</SelectItem>
                      <SelectItem value="cod">Thanh toán khi nhận hàng</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Trạng thái đơn hàng</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Chờ xử lý</SelectItem>
                      <SelectItem value="waiting_payment">Chờ thanh toán</SelectItem>
                      <SelectItem value="waiting_confirmation">Chờ xác nhận</SelectItem>
                      <SelectItem value="processing">Đang xử lý</SelectItem>
                      <SelectItem value="shipped">Đã gửi hàng</SelectItem>
                      <SelectItem value="delivered">Đã giao hàng</SelectItem>
                      <SelectItem value="completed">Hoàn thành</SelectItem>
                      <SelectItem value="cancelled">Đã hủy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Trạng thái thanh toán</Label>
                  <Select value={paymentStatus} onValueChange={setPaymentStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Chưa thanh toán</SelectItem>
                      <SelectItem value="waiting_confirmation">Chờ xác nhận</SelectItem>
                      <SelectItem value="paid">Đã thanh toán</SelectItem>
                      <SelectItem value="failed">Thất bại</SelectItem>
                      <SelectItem value="refunded">Đã hoàn tiền</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Mã vận đơn</Label>
                  <Input
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="Nhập mã vận đơn..."
                  />
                </div>
              </CardContent>
            </Card>
            
            {/* Order summary */}
            <Card>
              <CardHeader>
                <CardTitle>Tổng quan đơn hàng</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Mã giảm giá</Label>
                  <div className="flex gap-2">
                    <Input
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Nhập mã giảm giá..."
                    />
                    <Button type="button" onClick={applyCoupon}>Áp dụng</Button>
                  </div>
                  {discountAmount > 0 && (
                    <p className="text-xs text-green-600 mt-1">Đã áp dụng mã, giảm TWD {discountAmount.toLocaleString()}</p>
                  )}
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Tạm tính:</span>
                    <span className="font-medium">TWD {calculateSubtotal().toLocaleString()}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Đã giảm:</span>
                      <span>- TWD {discountAmount.toLocaleString()}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center">
                    <span>Giảm giá:</span>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={discountAmount}
                        readOnly
                        className="w-24 text-right bg-gray-50"
                      />
                      {discountAmount > 0 && (
                        <span className="text-xs text-green-600">Đã áp dụng</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span>Phí vận chuyển:</span>
                    <Input
                      type="number"
                      value={shippingCost}
                      onChange={(e) => setShippingCost(parseFloat(e.target.value) || 0)}
                      className="w-24 text-right"
                    />
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span>Điểm sử dụng:</span>
                    <Input
                      type="number"
                      value={pointsUsed}
                      onChange={(e) => setPointsUsed(parseInt(e.target.value) || 0)}
                      className="w-24 text-right"
                      max={selectedUser?.points || 0}
                    />
                  </div>
                  
                  <div className="pt-2 border-t">
                    <div className="flex justify-between font-medium text-base">
                      <span>Tổng cộng:</span>
                      <span className="text-blue-600">TWD {calculateTotal().toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Admin notes */}
            <Card>
              <CardHeader>
                <CardTitle>Ghi chú quản trị</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Ghi chú nội bộ..."
                  rows={4}
                />
              </CardContent>
            </Card>
            
            {/* Submit buttons */}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/admin/orders')}
                className="flex-1"
              >
                Hủy
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={submitting}
              >
                <Package className="h-4 w-4 mr-2" />
                {submitting ? 'Đang xử lý...' : (isEdit ? 'Cập nhật' : 'Tạo đơn hàng')}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AdminSystemOrderFormPage;
