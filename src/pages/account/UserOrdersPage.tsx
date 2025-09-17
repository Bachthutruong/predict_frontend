import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { orderApi } from '../../services/shopApi';
import type { Order } from '../../types/shop';
import { ImageUpload } from '../../components/ui/image-upload';
import { BadgePercent, CheckCircle, Clock, CreditCard, Image as ImageIcon, Package, Truck, XCircle } from 'lucide-react';

const UserOrdersPage: React.FC = () => {
  const { t } = useTranslation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();
  const token = localStorage.getItem('token') || '';
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [showProofModal, setShowProofModal] = useState<boolean>(false);
  const [proofOrder, setProofOrder] = useState<Order | null>(null);
  const [paymentProofUrl, setPaymentProofUrl] = useState<string>('');
  const [paymentNote, setPaymentNote] = useState<string>('');
  const [showDetailModal, setShowDetailModal] = useState<boolean>(false);
  const [detailOrder, setDetailOrder] = useState<Order | null>(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await orderApi.getUserOrders(token, { page, limit: pageSize });
      if (res.success) {
        const data = Array.isArray(res.data) ? res.data : [];
        setOrders(data);
        const p = res.pagination || { current: 1, pages: 1, total: data.length };
        setPage(Number(p.current || 1));
        setTotalPages(Number(p.pages || 1));
        setTotalItems(Number(p.total || data.length));
      } else {
        setError(res.message || 'Failed to load orders');
      }
    } catch (e) {
      console.error('getUserOrders error', e);
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchOrders();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, page, pageSize]);

  const openPaymentProof = (order: Order) => {
    setProofOrder(order);
    setPaymentProofUrl('');
    setPaymentNote('');
    setShowProofModal(true);
  };

  const submitPaymentConfirm = async () => {
    if (!proofOrder || !paymentProofUrl) return;
    try {
      await orderApi.submitPaymentConfirmation(token, proofOrder.id, paymentProofUrl, paymentNote);
      setShowProofModal(false);
      setProofOrder(null);
      setPaymentProofUrl('');
      setPaymentNote('');
      fetchOrders();
    } catch (e) {
      console.error('submitPaymentConfirmation error', e);
      alert(t('common.error') || 'Có lỗi xảy ra');
    }
  };

  const confirmDelivery = async (orderId: string) => {
    try {
      await orderApi.confirmDelivery(token, orderId);
      fetchOrders();
    } catch (e) {
      console.error('confirmDelivery error', e);
      alert(t('common.error') || 'Có lỗi xảy ra');
    }
  };

  const markDelivered = async (orderId: string) => {
    try {
      await orderApi.markDelivered(token, orderId);
      fetchOrders();
    } catch (e) {
      console.error('markDelivered error', e);
      alert(t('common.error') || 'Có lỗi xảy ra');
    }
  };

  const cancelOrder = async (orderId: string) => {
    const reason = prompt(t('orders.cancelReason') || 'Lý do hủy:') || '';
    try {
      await orderApi.cancelOrder(token, orderId, reason);
      fetchOrders();
    } catch (e) {
      console.error('cancelOrder error', e);
      alert(t('common.error') || 'Có lỗi xảy ra');
    }
  };

  const formatPrice = (price?: number) => new Intl.NumberFormat('zh-TW', { style: 'currency', currency: 'TWD' }).format(price || 0);

  const StatusBadge: React.FC<{ status: Order['status'] }> = ({ status }) => {
    const map: Record<Order['status'], { label: string; cls: string; Icon: any }> = {
      pending: { label: 'Chờ xử lý', cls: 'bg-yellow-100 text-yellow-800', Icon: Clock },
      waiting_payment: { label: 'Chờ thanh toán', cls: 'bg-orange-100 text-orange-800', Icon: CreditCard },
      waiting_confirmation: { label: 'Chờ xác nhận', cls: 'bg-blue-100 text-blue-800', Icon: BadgePercent },
      processing: { label: 'Đang xử lý', cls: 'bg-purple-100 text-purple-800', Icon: Package },
      shipped: { label: 'Đã gửi hàng', cls: 'bg-indigo-100 text-indigo-800', Icon: Truck },
      delivered: { label: 'Đã giao hàng', cls: 'bg-green-100 text-green-800', Icon: CheckCircle },
      completed: { label: 'Hoàn thành', cls: 'bg-green-100 text-green-800', Icon: CheckCircle },
      cancelled: { label: 'Đã hủy', cls: 'bg-red-100 text-red-800', Icon: XCircle },
    };
    const { label, cls, Icon } = map[status];
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${cls}`}>
        <Icon className="w-3 h-3" /> {label}
      </span>
    );
  };

  const PaymentBadge: React.FC<{ status: Order['paymentStatus'] }> = ({ status }) => {
    const map: Record<Order['paymentStatus'], { label: string; cls: string }> = {
      pending: { label: 'Chưa thanh toán', cls: 'bg-yellow-100 text-yellow-800' },
      waiting_confirmation: { label: 'Chờ xác nhận', cls: 'bg-blue-100 text-blue-800' },
      paid: { label: 'Đã thanh toán', cls: 'bg-green-100 text-green-800' },
      failed: { label: 'Thất bại', cls: 'bg-red-100 text-red-800' },
      refunded: { label: 'Đã hoàn tiền', cls: 'bg-gray-100 text-gray-800' },
    };
    const { label, cls } = map[status];
    return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cls}`}>{label}</span>;
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-blue-50">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -top-10 -left-10 h-64 w-64 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 blur-3xl rounded-full" />
      <div className="pointer-events-none absolute bottom-10 -right-10 h-64 w-64 bg-gradient-to-br from-fuchsia-400/20 to-pink-400/20 blur-3xl rounded-full" />

      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">
              Đơn hàng của tôi
            </h1>
            <p className="text-sm text-gray-600 mt-1">Theo dõi tình trạng và thanh toán đơn hàng của bạn</p>
          </div>
        </div>
      {loading ? (
        <div className="text-gray-500">{t('common.loading') || 'Đang tải...'}</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : orders.length === 0 ? (
        <div className="bg-white p-6 rounded-xl shadow-sm text-gray-600">{t('orders.empty') || 'Chưa có đơn hàng.'}</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="px-4 py-3 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="text-sm text-gray-600">Tổng: <span className="font-medium">{totalItems}</span> đơn</div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Hiển thị</span>
              <select value={String(pageSize)} onChange={(e)=>{ setPageSize(Number(e.target.value)); setPage(1); }} className="px-2 py-1 border rounded-md text-sm">
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
              </select>
              <span className="text-sm text-gray-600">/ trang</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã đơn</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sản phẩm</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tổng</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thanh toán</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Tác vụ</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map(order => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap font-medium">#{order.orderNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">{new Date(order.createdAt).toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <div className="flex -space-x-2">
                        {order.items.slice(0,3).map((it, idx) => (
                          it.product?.images?.[0] ? (
                            <img key={idx} src={it.product.images[0]} alt={it.product.name} className="w-8 h-8 rounded-full border-2 border-white" />
                          ) : (
                            <div key={idx} className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center">
                              <ImageIcon className="w-4 h-4 text-gray-500" />
                            </div>
                          )
                        ))}
                        {order.items.length > 3 && (
                          <div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white text-xs flex items-center justify-center">+{order.items.length-3}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-semibold">{formatPrice(order.totalAmount)}</td>
                    <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={order.status} /></td>
                    <td className="px-6 py-4 whitespace-nowrap"><PaymentBadge status={order.paymentStatus} /></td>
                    <td className="px-6 py-4 whitespace-nowrap text-right flex items-center gap-2 justify-end">
                      <button onClick={() => { setDetailOrder(order); setShowDetailModal(true); }} className="px-3 py-1.5 rounded-lg border text-xs">Chi tiết</button>
                      {order.paymentMethod === 'bank_transfer' && order.paymentStatus === 'pending' && (
                        <button onClick={() => openPaymentProof(order)} className="px-3 py-1.5 rounded-lg text-white bg-blue-600 hover:bg-blue-700 text-xs">Gửi xác nhận</button>
                      )}
                      {order.status === 'shipped' && (
                        <button onClick={() => markDelivered(order.id)} className="px-3 py-1.5 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 text-xs">Đã nhận hàng</button>
                      )}
                      {order.status === 'delivered' && (
                        <button onClick={() => confirmDelivery(order.id)} className="px-3 py-1.5 rounded-lg text-white bg-green-600 hover:bg-green-700 text-xs">Xác nhận hoàn thành</button>
                      )}
                      {['pending','waiting_payment','waiting_confirmation'].includes(order.status) && (
                        <button onClick={() => cancelOrder(order.id)} className="px-3 py-1.5 rounded-lg text-white bg-red-600 hover:bg-red-700 text-xs">Hủy</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="px-4 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-t bg-white">
              <div className="text-sm text-gray-600">Trang {page}/{totalPages}</div>
              <div className="flex items-center gap-2">
                <button onClick={()=>setPage(Math.max(1, page-1))} disabled={page===1} className="px-3 py-1.5 rounded-lg border text-sm disabled:opacity-50">Trước</button>
                {Array.from({ length: totalPages }, (_, i) => i+1).slice(Math.max(0, page-3), Math.min(totalPages, page+2)).map(p => (
                  <button key={p} onClick={()=>setPage(p)} className={`px-3 py-1.5 rounded-lg text-sm ${p===page ? 'bg-blue-600 text-white' : 'border'}`}>{p}</button>
                ))}
                <button onClick={()=>setPage(Math.min(totalPages, page+1))} disabled={page===totalPages} className="px-3 py-1.5 rounded-lg border text-sm disabled:opacity-50">Sau</button>
              </div>
            </div>
          )}
        </div>
      )}

      {showProofModal && proofOrder && (
        <div className="fixed inset-0 bg-gray-900/40 z-50 flex items-center justify-center px-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
              <div className="font-semibold">Gửi xác nhận thanh toán</div>
              <div className="text-xs opacity-90">Đơn #{proofOrder.orderNumber}</div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <div className="text-sm font-medium mb-2">Tải ảnh chứng từ</div>
                <ImageUpload value={paymentProofUrl} onChange={setPaymentProofUrl} placeholder="Chọn ảnh chuyển khoản" />
              </div>
              <div>
                <div className="text-sm font-medium mb-2">Ghi chú (tuỳ chọn)</div>
                <textarea value={paymentNote} onChange={(e)=>setPaymentNote(e.target.value)} className="w-full border rounded-lg px-3 py-2 min-h-[80px]" placeholder="Mã giao dịch, thời gian chuyển khoản..." />
              </div>
            </div>
            <div className="px-6 py-4 border-t bg-gray-50 flex items-center justify-end gap-2">
              <button onClick={()=>setShowProofModal(false)} className="px-4 py-2 rounded-lg border">Hủy</button>
              <button onClick={submitPaymentConfirm} disabled={!paymentProofUrl} className="px-4 py-2 rounded-lg bg-blue-600 text-white disabled:opacity-60">Gửi xác nhận</button>
            </div>
          </div>
        </div>
      )}

      {showDetailModal && detailOrder && (
        <div className="fixed inset-0 bg-gray-900/40 z-50 flex items-center justify-center px-4">
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b bg-gradient-to-r from-slate-700 to-indigo-700 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold">Chi tiết đơn hàng #{detailOrder.orderNumber}</div>
                  <div className="text-xs opacity-90">{new Date(detailOrder.createdAt).toLocaleString()}</div>
                </div>
                <button onClick={()=>setShowDetailModal(false)} className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-sm">Đóng</button>
              </div>
            </div>
            <div className="p-6 space-y-6 max-h-[80vh] overflow-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="col-span-1 md:col-span-2 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={detailOrder.status} />
                    <PaymentBadge status={detailOrder.paymentStatus} />
                    <span className="text-xs px-2 py-1 rounded bg-gray-100">{detailOrder.paymentMethod === 'bank_transfer' ? 'Chuyển khoản' : 'Thanh toán khi nhận hàng'}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    Mã đơn: <span className="font-medium">#{detailOrder.orderNumber}</span>
                  </div>
                </div>
                <div className="col-span-1">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-sm font-semibold mb-1">Thông tin giao hàng</div>
                    <div className="text-sm text-gray-700">
                      <div>{detailOrder.shippingAddress?.name}</div>
                      <div>{detailOrder.shippingAddress?.phone}</div>
                      <div>{detailOrder.shippingAddress?.street}</div>
                      <div>{detailOrder.shippingAddress?.city}, {detailOrder.shippingAddress?.state} {detailOrder.shippingAddress?.postalCode}</div>
                      <div>{detailOrder.shippingAddress?.country}</div>
                      {detailOrder.shippingAddress?.notes && (
                        <div className="mt-1 text-gray-600">Ghi chú: {detailOrder.shippingAddress?.notes}</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div className="text-sm font-semibold mb-3">Sản phẩm</div>
                <div className="divide-y border rounded-lg overflow-hidden">
                  {detailOrder.items.map((it, idx) => {
                    const img = it.product?.images?.[0];
                    const name = it.product?.name || 'Sản phẩm';
                    const variantLabel = it.variant?.name && it.variant?.value ? `(${it.variant.name}: ${it.variant.value})` : '';
                    const itemTotal = (it.quantity || 0) * (it.price || 0);
                    return (
                      <div key={idx} className="flex items-center gap-3 p-3">
                        {img ? (
                          <img src={img} alt={name} className="w-14 h-14 rounded-md object-cover border" />
                        ) : (
                          <div className="w-14 h-14 rounded-md bg-gray-100 border flex items-center justify-center">
                            <ImageIcon className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{name} <span className="text-gray-500 font-normal">{variantLabel}</span></div>
                          <div className="text-xs text-gray-500">SL: {it.quantity} × {formatPrice(it.price)}</div>
                        </div>
                        <div className="font-semibold whitespace-nowrap">{formatPrice(itemTotal)}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  {detailOrder.trackingNumber && (
                    <div className="text-sm">Mã vận đơn: <span className="font-medium">{detailOrder.trackingNumber}</span></div>
                  )}
                  {detailOrder.paymentConfirmation?.image && (
                    <div className="text-sm">
                      Ảnh xác nhận thanh toán:
                      <div className="mt-2">
                        <img src={detailOrder.paymentConfirmation.image} alt="Payment confirmation" className="max-h-48 rounded border" />
                      </div>
                    </div>
                  )}
                </div>
                <div>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between text-sm"><span>Tạm tính</span><span>{formatPrice(detailOrder.subtotal)}</span></div>
                    <div className="flex items-center justify-between text-sm"><span>Giảm giá</span><span>-{formatPrice(detailOrder.discountAmount)}</span></div>
                    <div className="flex items-center justify-between text-sm"><span>Phí vận chuyển</span><span>{formatPrice(detailOrder.shippingCost)}</span></div>
                    <div className="border-t pt-2 flex items-center justify-between font-semibold"><span>Tổng cộng</span><span>{formatPrice(detailOrder.totalAmount)}</span></div>
                    {(detailOrder.pointsUsed || detailOrder.pointsEarned) && (
                      <div className="text-xs text-gray-600 pt-1">
                        {detailOrder.pointsUsed ? `Điểm đã dùng: ${detailOrder.pointsUsed}` : ''}
                        {detailOrder.pointsUsed && detailOrder.pointsEarned ? ' · ' : ''}
                        {detailOrder.pointsEarned ? `Điểm sẽ nhận: ${detailOrder.pointsEarned}` : ''}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default UserOrdersPage;


