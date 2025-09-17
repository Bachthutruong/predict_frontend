import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../services/shopApi';

const AdminPointSettingsPage: React.FC = () => {
  const token = localStorage.getItem('token') || '';
  const [pointPrice, setPointPrice] = useState<number>(100);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [orders, setOrders] = useState<any[]>([]);
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [pages, setPages] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);
  const [statusFilter, setStatusFilter] = useState<string>('waiting_confirmation');
  const [loadingOrders, setLoadingOrders] = useState<boolean>(true);

  const load = async () => {
    try {
      const res = await adminApi.getPointPrice(token);
      const price = res?.data?.pointPrice ?? res?.pointPrice;
      if (typeof price === 'number' && price > 0) setPointPrice(price);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const fetchTopupOrders = async () => {
    try {
      setLoadingOrders(true);
      const res = await adminApi.getSystemOrders(token, {
        page,
        limit,
        status: statusFilter || undefined,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      } as any);
      const rows = (Array.isArray(res?.data) ? res.data : res?.data?.orders) || [];
      // Filter: points top-up orders (item name contains 'Nạp điểm' or product is null and pointsEarned>0)
      const filtered = rows.filter((o: any) => {
        const hasTopupItem = (o?.items || []).some((it: any) => (!it?.product && ((it?.name||'').toLowerCase().includes('nạp điểm') || (o?.pointsEarned||0) > 0)));
        return hasTopupItem;
      });
      setOrders(filtered);
      const p = res?.pagination || res?.data?.pagination || { current: 1, pages: 1, total: filtered.length };
      setPages(Number(p.pages || 1));
      setTotal(Number(p.total || filtered.length));
    } catch (e) {
      setOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => { fetchTopupOrders(); }, [page, limit, statusFilter]);

  const save = async () => {
    setSaving(true);
    setMessage('');
    try {
      const res = await adminApi.updatePointPrice(token, Number(pointPrice));
      if (res?.success) setMessage('Đã lưu cấu hình giá điểm.');
      else setMessage(res?.message || 'Không thể lưu.');
    } catch (e) {
      setMessage('Có lỗi xảy ra.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="p-6 min-h-[60vh] flex items-center justify-center bg-gradient-to-br from-emerald-50 via-sky-50 to-indigo-50">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-400 border-t-transparent"></div>
    </div>
  );

  return (
    <div className="container mx-auto max-w-3xl p-6">
      <div className="mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-emerald-100 to-sky-100 text-emerald-700 border border-emerald-200">⚙️ Cài đặt hệ thống</div>
        <h1 className="mt-2 text-3xl font-extrabold bg-gradient-to-r from-emerald-600 via-sky-600 to-indigo-600 bg-clip-text text-transparent">Cấu hình giá điểm</h1>
        <p className="text-sm text-gray-600 mt-1">Thiết lập quy đổi: 1 điểm tương ứng bao nhiêu tiền</p>
      </div>

      <div className="rounded-2xl overflow-hidden shadow-lg border bg-white">
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-50 via-sky-50 to-indigo-50 border-b">
          <div className="text-sm text-gray-700">Quy đổi điểm</div>
          <div className="text-emerald-700 text-xs mt-1">Mẹo: Chọn mức dễ nhớ (ví dụ: 100, 1,000)</div>
        </div>

        <div className="p-6 space-y-5">
          <label className="block text-sm font-medium text-gray-700">1 điểm = bao nhiêu tiền (đơn vị tiền tệ hệ thống)</label>
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <input
                type="number"
                min={1}
                value={pointPrice}
                onChange={(e)=>setPointPrice(Number(e.target.value)||0)}
                className="w-full rounded-xl border border-emerald-200 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 px-4 py-3 text-gray-800 shadow-sm"
                placeholder="Ví dụ: 100"
              />
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-emerald-600">💸</div>
            </div>
            <button
              onClick={save}
              disabled={saving || pointPrice<=0}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-medium shadow-md hover:shadow-lg transition disabled:opacity-60"
            >
              {saving ? 'Đang lưu...' : 'Lưu cấu hình'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border p-4 bg-emerald-50 border-emerald-200">
              <div className="text-sm text-emerald-700">Ví dụ quy đổi</div>
              <div className="mt-2 text-2xl font-bold text-emerald-700">{(pointPrice || 0).toLocaleString()}</div>
              <div className="text-xs text-emerald-700">tiền = 1 điểm</div>
            </div>
            <div className="rounded-xl border p-4 bg-indigo-50 border-indigo-200">
              <div className="text-sm text-indigo-700">Gợi ý</div>
              <div className="mt-2 text-sm text-indigo-700">Hãy thông báo mức quy đổi này ở trang “Mua điểm” để người dùng dễ hiểu.</div>
            </div>
          </div>

          {message && (
            <div className="mt-1 px-4 py-3 rounded-lg bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-800 border border-emerald-200 text-sm">{message}</div>
          )}
        </div>
      </div>

      {/* Top-up orders table */}
      <div className="mt-8 rounded-2xl overflow-hidden shadow-sm border bg-white">
        <div className="px-6 py-4 bg-gradient-to-r from-indigo-50 to-fuchsia-50 border-b flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-700">Danh sách đơn nạp điểm</div>
            <div className="text-xs text-gray-500">Các đơn cần duyệt/đã duyệt khi người dùng mua điểm</div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-xs text-gray-500 hidden md:block">Tổng: {total.toLocaleString()} đơn</div>
            <select value={statusFilter} onChange={(e)=>{ setStatusFilter(e.target.value); setPage(1); }} className="px-3 py-2 border rounded-md text-sm">
              <option value="">Tất cả trạng thái</option>
              <option value="waiting_payment">Chờ thanh toán</option>
              <option value="waiting_confirmation">Chờ xác nhận</option>
              <option value="processing">Đang xử lý</option>
              <option value="completed">Hoàn thành</option>
              <option value="cancelled">Đã hủy</option>
            </select>
            <select
              value={limit}
              onChange={(e)=>{ const v = parseInt(e.target.value, 10) || 10; setLimit(v); setPage(1); }}
              className="px-3 py-2 border rounded-md text-sm"
            >
              <option value={5}>5 / trang</option>
              <option value={10}>10 / trang</option>
              <option value={20}>20 / trang</option>
              <option value={50}>50 / trang</option>
            </select>
            <Link to="/admin/orders" className="px-3 py-2 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-700">Quản lý đơn</Link>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loadingOrders ? (
            <div className="p-6 text-sm text-gray-600">Đang tải...</div>
          ) : orders.length === 0 ? (
            <div className="p-6 text-sm text-gray-600">Chưa có đơn nạp điểm nào phù hợp.</div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã đơn</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Khách hàng</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số tiền</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Điểm</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">TT Thanh toán</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày tạo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tác vụ</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((o: any) => (
                  <tr key={o.id || o._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap font-medium">{o.orderNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{(o as any).user?.name || '—'}</div>
                      <div className="text-xs text-gray-500">{(o as any).user?.email || ''}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{new Intl.NumberFormat('zh-TW', { style: 'currency', currency: 'TWD' }).format(o.totalAmount || 0)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{o.pointsEarned || 0}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs">
                      {o.paymentStatus === 'pending' && <span className="px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800">Chưa thanh toán</span>}
                      {o.paymentStatus === 'waiting_confirmation' && <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">Chờ xác nhận</span>}
                      {o.paymentStatus === 'paid' && <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-800">Đã thanh toán</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs">
                      <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-800">{o.status}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{o.createdAt ? new Date(o.createdAt).toLocaleString() : ''}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Link to={`/admin/system-orders/${o.id || o._id}/edit`} className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 text-xs">Mở</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {pages > 1 && (
          <div className="px-6 py-3 flex items-center justify-between border-t bg-white">
            <div className="text-sm text-gray-600">Trang {page}/{pages}</div>
            <div className="flex items-center gap-2">
              <button onClick={()=>setPage(Math.max(1, page-1))} disabled={page===1} className="px-3 py-1.5 rounded-lg border text-sm disabled:opacity-50">Trước</button>
              {Array.from({ length: pages }, (_, i) => i+1).slice(Math.max(0, page-3), Math.min(pages, page+2)).map(p => (
                <button key={p} onClick={()=>setPage(p)} className={`px-3 py-1.5 rounded-lg text-sm ${p===page ? 'bg-indigo-600 text-white' : 'border'}`}>{p}</button>
              ))}
              <button onClick={()=>setPage(Math.min(pages, page+1))} disabled={page===pages} className="px-3 py-1.5 rounded-lg border text-sm disabled:opacity-50">Sau</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPointSettingsPage;


