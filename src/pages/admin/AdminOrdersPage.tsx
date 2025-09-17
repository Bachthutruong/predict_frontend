import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Eye, Package, Truck, CheckCircle, XCircle, Clock, Pencil, Trash2, Image as ImageIcon } from 'lucide-react';
import type { Order } from '../../types/shop';
import { adminApi } from '../../services/shopApi';
 

const AdminOrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0
  });
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    paymentStatus: '',
    sortBy: 'createdAt',
    sortOrder: 'desc' as 'asc' | 'desc'
  });
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [statistics, setStatistics] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<Order | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [pageSize, setPageSize] = useState<number>(10);

  useEffect(() => {
    fetchOrders();
    fetchStatistics();
  }, [filters, pageSize, pagination.current]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await adminApi.getSystemOrders(token, {
        page: pagination.current,
        limit: pageSize,
        ...filters
      });

      if (response.success) {
        const data = Array.isArray(response.data)
          ? response.data
          : Array.isArray(response.data?.orders)
            ? response.data.orders
            : [];
        setOrders(data);
        const p = response.pagination || response.data?.pagination || { current: 1, pages: 1, total: data.length };
        setPagination({
          current: Number(p.current || p.page || 1),
          pages: Number(p.pages || 1),
          total: Number(p.total || data.length)
        });
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await adminApi.getOrderStatistics(token, 30);
      if (response.success) {
        setStatistics(response.data);
      } else {
        setStatistics(null);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const handleStatusChange = async (orderId: string, status: string, adminNotes?: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      // When confirming payment for points top-up, directly complete to credit points
      if (status === 'processing') {
        await adminApi.updateSystemPaymentStatus(token, orderId, 'paid');
      }

      const response = await adminApi.updateSystemOrderStatus(token, orderId, status, adminNotes);
      if (response.success) {
        const updated = response.data || {};
        setOrders(orders.map(order => 
          order.id === orderId ? { ...order, ...updated } : order
        ));
        setSelectedOrder((prev) => prev && (prev as any).id === orderId ? { ...(prev as any), ...updated } as any : prev);
        setShowOrderModal(false);
        // Hard refresh list and stats to reflect counts and filters
        await fetchOrders();
        await fetchStatistics();
      }
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  // removed separate payment-status updater; handled by handleUpdateOrder

  // inline update operations are handled via dedicated edit page now


  const handleDelete = async (orderId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const response = await adminApi.deleteSystemOrder(token, orderId);
      if (response.success) {
        setOrders(orders.filter(o => o.id !== orderId));
        setShowDeleteConfirm(false);
        setDeleteTarget(null);
      }
    } catch (e) { console.error('deleteSystemOrder', e); }
  };

  

  

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, current: page }));
  };

  const formatPrice = (price: number) => new Intl.NumberFormat('zh-TW', { style: 'currency', currency: 'TWD' }).format(price);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      waiting_payment: { color: 'bg-orange-100 text-orange-800', icon: Clock },
      waiting_confirmation: { color: 'bg-blue-100 text-blue-800', icon: Clock },
      processing: { color: 'bg-purple-100 text-purple-800', icon: Package },
      shipped: { color: 'bg-indigo-100 text-indigo-800', icon: Truck },
      delivered: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      completed: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      cancelled: { color: 'bg-red-100 text-red-800', icon: XCircle }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    const statusMap: Record<string, string> = {
      pending: 'Chờ xử lý',
      waiting_payment: 'Chờ thanh toán',
      waiting_confirmation: 'Chờ xác nhận',
      processing: 'Đang xử lý',
      shipped: 'Đã gửi hàng',
      delivered: 'Đã giao hàng',
      completed: 'Hoàn thành',
      cancelled: 'Đã hủy'
    };
    const label = statusMap[status] ?? 'Chờ xử lý';
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {label}
      </span>
    );
  };

  const getPaymentStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800' },
      waiting_confirmation: { color: 'bg-blue-100 text-blue-800' },
      paid: { color: 'bg-green-100 text-green-800' },
      failed: { color: 'bg-red-100 text-red-800' },
      refunded: { color: 'bg-gray-100 text-gray-800' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

    const statusMap: Record<string, string> = {
      pending: 'Chưa thanh toán',
      waiting_confirmation: 'Chờ xác nhận',
      paid: 'Đã thanh toán',
      failed: 'Thất bại',
      refunded: 'Đã hoàn tiền'
    };
    const label = statusMap[status] ?? 'Chưa thanh toán';
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {label}
      </span>
    );
  };

  const viewOrder = async (order: Order) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const full = await adminApi.getSystemOrderById(token, order.id);
      if (full?.success && full.data) {
        setSelectedOrder(full.data as Order);
      } else {
        setSelectedOrder(order);
      }
    } catch {
      setSelectedOrder(order);
    }
    setShowOrderModal(true);
  };

  return (
    <div className="container mx-auto max-w-7xl p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Quản lý đơn hàng (Hệ thống)</h1>
          <button 
            onClick={() => navigate('/admin/system-orders/new')} 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Tạo đơn mới
          </button>
        </div>

        {/* Statistics Cards */}
        {statistics ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Package className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Tổng số đơn</p>
                  <p className="text-2xl font-semibold text-gray-900">{statistics.overview.totalOrders}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Đơn hoàn thành</p>
                  <p className="text-2xl font-semibold text-gray-900">{statistics.overview.completedOrders}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Clock className="h-8 w-8 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Đơn chờ xử lý</p>
                  <p className="text-2xl font-semibold text-gray-900">{statistics.overview.pendingOrders}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-2xl">💰</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Tổng doanh thu</p>
                  <p className="text-2xl font-semibold text-gray-900">{formatPrice(statistics.overview.totalRevenue)}</p>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tìm kiếm</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  placeholder="Tìm theo mã đơn, tên khách hàng, email..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái đơn</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Tất cả trạng thái</option>
                <option value="pending">Chờ xử lý</option>
                <option value="waiting_payment">Chờ thanh toán</option>
                <option value="waiting_confirmation">Chờ xác nhận</option>
                <option value="processing">Đang xử lý</option>
                <option value="shipped">Đã gửi hàng</option>
                <option value="delivered">Đã giao hàng</option>
                <option value="completed">Hoàn thành</option>
                <option value="cancelled">Đã hủy</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái thanh toán</label>
              <select
                value={filters.paymentStatus}
                onChange={(e) => handleFilterChange('paymentStatus', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Tất cả</option>
                <option value="pending">Chưa thanh toán</option>
                <option value="waiting_confirmation">Chờ xác nhận</option>
                <option value="paid">Đã thanh toán</option>
                <option value="failed">Thất bại</option>
                <option value="refunded">Đã hoàn tiền</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sắp xếp</label>
              <select
                value={`${filters.sortBy}-${filters.sortOrder}`}
                onChange={(e) => {
                  const [sortBy, sortOrder] = e.target.value.split('-');
                  setFilters(prev => ({ ...prev, sortBy, sortOrder: sortOrder as 'asc' | 'desc' }));
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="createdAt-desc">Mới nhất</option>
                <option value="createdAt-asc">Cũ nhất</option>
                <option value="totalAmount-desc">Tổng tiền cao nhất</option>
                <option value="totalAmount-asc">Tổng tiền thấp nhất</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Số bản ghi/trang</label>
              <select
                value={String(pageSize)}
                onChange={(e) => { setPageSize(Number(e.target.value)); setPagination(prev => ({ ...prev, current: 1 })); }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Orders Table - System Orders */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Đang tải...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã đơn</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Khách hàng</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tổng tiền</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thanh toán</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">TT Thanh toán</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày tạo</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tác vụ</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap max-w-[160px]">
                        <div className="text-sm font-medium text-gray-900 truncate" title={order.orderNumber}>
                          {order.orderNumber}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap max-w-[220px]">
                        <div className="text-sm text-gray-900 truncate" title={(order as any).user?.name || 'Không rõ'}>{(order as any).user?.name || 'Không rõ'}</div>
                        <div className="text-sm text-gray-500 truncate" title={(order as any).user?.email || ''}>{(order as any).user?.email || ''}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatPrice(order.totalAmount)}
                        </div>
                        {order.pointsUsed > 0 && (
                          <div className="text-sm text-gray-500">-{order.pointsUsed} điểm</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {order.paymentMethod === 'bank_transfer' ? 'Chuyển khoản' : order.paymentMethod === 'cod' ? 'COD' : 'Khác'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(order.status)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{getPaymentStatusBadge(order.paymentStatus)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => viewOrder(order)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => navigate(`/admin/system-orders/${order.id}/edit`)}
                          className="text-gray-600 hover:text-gray-900 ml-2"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => { setDeleteTarget(order); setShowDeleteConfirm(true); }}
                          className="text-red-600 hover:text-red-900 ml-2"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => handlePageChange(pagination.current - 1)}
                    disabled={pagination.current === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Trước
                  </button>
                  <button
                    onClick={() => handlePageChange(pagination.current + 1)}
                    disabled={pagination.current === pagination.pages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Tiếp
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">Hiển thị <span className="font-medium">{((pagination.current - 1) * pageSize) + 1}</span> đến <span className="font-medium">{Math.min(pagination.current * pageSize, pagination.total)}</span> trong tổng <span className="font-medium">{pagination.total}</span> kết quả</p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            page === pagination.current
                              ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* WooCommerce Orders preserved on page /admin/orders-woo (no changes here) */}

      {/* Order Detail Modal */}
      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 bg-gray-900/40 overflow-y-auto h-full w-full z-50">
          <div className="relative top-6 mx-auto w-11/12 md:w-3/4 lg:w-2/3 shadow-2xl rounded-2xl bg-white">
            <div className="px-6 py-4 border-b bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-between rounded-t-2xl">
              <h3 className="text-base md:text-lg font-semibold">Chi tiết đơn hàng - {(selectedOrder as any).orderNumber}</h3>
              <button onClick={() => setShowOrderModal(false)} className="text-white/80 hover:text-white text-lg leading-none">✕</button>
            </div>
            <div className="p-6 space-y-6">
              {/* Top info blocks */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100">
                  <h4 className="font-semibold text-gray-900 mb-2">Thông tin khách hàng</h4>
                  <div className="text-sm text-gray-700 space-y-1">
                    <div className="font-medium">{(selectedOrder as any).user?.name || 'Không rõ'}</div>
                    <div>{(selectedOrder as any).user?.email || ''}</div>
                    <div>{(selectedOrder as any).user?.phone || ''}</div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl border border-pink-100">
                  <h4 className="font-semibold text-gray-900 mb-2">Thông tin đơn</h4>
                  <div className="text-sm text-gray-700 space-y-2">
                    <div className="flex items-center justify-between">
                      <span>Tổng tiền</span>
                      <span className="font-semibold">{formatPrice((selectedOrder as any).totalAmount || 0)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Phương thức</span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {(selectedOrder as any).paymentMethod === 'bank_transfer' ? 'Chuyển khoản' : 'COD'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Trạng thái</span>
                      <span>{getStatusBadge((selectedOrder as any).status)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>TT Thanh toán</span>
                      <span>{getPaymentStatusBadge((selectedOrder as any).paymentStatus)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order details content would go here */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900">Thông tin khách hàng</h4>
                    <p className="text-sm text-gray-600">{(selectedOrder as any).user?.name || 'Không rõ'}</p>
                    <p className="text-sm text-gray-600">{(selectedOrder as any).user?.email || ''}</p>
                    <p className="text-sm text-gray-600">{(selectedOrder as any).user?.phone || ''}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Thông tin đơn</h4>
                    <p className="text-sm text-gray-600">Tổng tiền: {formatPrice((selectedOrder as any).totalAmount || 0)}</p>
                    <p className="text-sm text-gray-600">Phương thức: {selectedOrder.paymentMethod === 'bank_transfer' ? 'Chuyển khoản' : 'COD'}</p>
                    <p className="text-sm text-gray-600 flex items-center gap-2">Trạng thái: {getStatusBadge(selectedOrder.status)}</p>
                  </div>
                </div>

              {/* Payment proof */}
              {(selectedOrder as any).paymentMethod === 'bank_transfer' && (selectedOrder as any).paymentConfirmation?.image && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Biên lai chuyển khoản</h4>
                  <div className="flex flex-col md:flex-row items-start gap-4 bg-gradient-to-br from-slate-50 to-white p-4 rounded-xl border">
                    <img src={(selectedOrder as any).paymentConfirmation.image} alt="Biên lai" className="w-full md:w-48 h-48 object-cover rounded-lg border" />
                    <div className="text-sm text-gray-700 w-full">
                      <div className="font-medium mb-1">Ghi chú</div>
                      <div className="whitespace-pre-wrap bg-white border rounded-lg p-3 min-h-[64px]">{(selectedOrder as any).paymentConfirmation.note || '—'}</div>
                      <div className="text-xs text-gray-500 mt-2">Gửi lúc: {(selectedOrder as any).paymentConfirmation.submittedAt ? new Date((selectedOrder as any).paymentConfirmation.submittedAt as any).toLocaleString() : '—'}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Order items */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Sản phẩm</h4>
                  <div className="space-y-2">
                    {(selectedOrder as any).items.map((item: any, index: number) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <div className="flex items-center">
                          {item.product?.images?.length > 0 ? (
                            <img src={item.product.images[0]} alt={item.product.name} className="w-12 h-12 rounded object-cover mr-3" />
                          ) : (
                            <div className="w-12 h-12 rounded bg-gray-200 mr-3 flex items-center justify-center">
                              <ImageIcon className="w-5 h-5 text-gray-500" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium">{item.product?.name || 'Mục không phải sản phẩm'}</p>
                            <p className="text-sm text-gray-600">SL: {item.quantity}</p>
                          </div>
                        </div>
                        <p className="font-medium">{formatPrice(item.price * item.quantity)}</p>
                      </div>
                    ))}
                  </div>
                </div>

              {/* Action buttons */}
              <div className="flex flex-wrap justify-end gap-2 pt-4 border-t mt-4">
                  <button
                    onClick={() => setShowOrderModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                  >
                    Đóng
                  </button>
                  
                  {/* Check if this is a points top-up order */}
                  {(() => {
                    const isPointsOrder = (selectedOrder as any).items?.some((item: any) => 
                      item.name === 'Nạp điểm' && item.product === null
                    );
                    
                    if (isPointsOrder) {
                      // Points top-up order buttons
                      return (
                        <>
                          {(((selectedOrder as any).pointsEarned || 0) > 0 && !['completed','cancelled'].includes((selectedOrder as any).status)) && (
                            <button
                              onClick={async () => {
                                const token = localStorage.getItem('token');
                                if (!token) return;
                                await adminApi.updateSystemPaymentStatus(token, (selectedOrder as any).id, 'paid');
                                await handleStatusChange((selectedOrder as any).id, 'completed');
                                await fetchOrders();
                                await fetchStatistics();
                              }}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                              Xác nhận nạp điểm
                            </button>
                          )}
                        </>
                      );
                    } else {
                      // Regular product order buttons
                      return (
                        <>
                          {(selectedOrder as any).status === 'waiting_confirmation' && (
                            <button
                              onClick={async () => {
                                const token = localStorage.getItem('token');
                                if (!token) return;
                                await adminApi.updateSystemPaymentStatus(token, (selectedOrder as any).id, 'paid');
                                await handleStatusChange((selectedOrder as any).id, 'completed');
                              }}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                              Xác nhận thanh toán
                            </button>
                          )}
                          {(selectedOrder as any).status === 'processing' && (
                            <button
                              onClick={() => handleStatusChange((selectedOrder as any).id, 'shipped')}
                              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                            >
                              Đánh dấu đã gửi hàng
                            </button>
                          )}
                          {(selectedOrder as any).status === 'shipped' && (
                            <button
                              onClick={() => handleStatusChange((selectedOrder as any).id, 'delivered')}
                              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                            >
                              Đánh dấu đã giao hàng
                            </button>
                          )}
                        </>
                      );
                    }
                  })()}
                </div>
                {/* Close details container */}
                </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit System Order Modal removed - using dedicated page now */}


      {/* Delete confirm */}
      {showDeleteConfirm && deleteTarget && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-40 mx-auto p-5 border w-11/12 md:w-1/3 shadow-lg rounded-md bg-white">
            <div className="mb-2 font-medium">Xóa đơn hàng</div>
            <div className="text-sm text-gray-600">Bạn có chắc muốn xóa đơn {deleteTarget.orderNumber}? Hành động này không thể hoàn tác.</div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setShowDeleteConfirm(false)} className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400">Hủy</button>
              <button onClick={() => handleDelete(deleteTarget.id)} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Xóa</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrdersPage;
