import React, { useEffect, useMemo, useState } from 'react';
// import { useTranslation } from 'react-i18next';
import { orderApi, settingsApi } from '../../services/shopApi';
import { useNavigate } from 'react-router-dom';
import { ImageUpload } from '../../components/ui/image-upload';
import { useAuth } from '../../context/AuthContext';

const BuyPointsPage: React.FC = () => {
  // const { t } = useTranslation();
  const [amount, setAmount] = useState(100);
  const [pointPrice, setPointPrice] = useState<number | null>(null);
  const token = localStorage.getItem('token') || '';
  const navigate = useNavigate();
  const [step, setStep] = useState<'form' | 'upload' | 'waiting'>('form');
  const [createdOrderId, setCreatedOrderId] = useState<string>('');
  const [paymentProofUrl, setPaymentProofUrl] = useState<string>('');
  const [paymentNote, setPaymentNote] = useState<string>('');
  const { refreshUser } = useAuth();
  const [history, setHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const purchase = async () => {
    try {
      console.log('Creating points purchase order for amount:', amount);
      const data = await orderApi.purchasePoints(token, amount);
      console.log('Purchase points response:', data);
      if (data.success) {
        const id = data?.data?.id || data?.data?._id;
        setCreatedOrderId(String(id || ''));
        setStep('upload');
        // Refresh history after creating order
        setTimeout(() => {
          orderApi.getUserPointTopups(token, { limit: 5, sortBy: 'createdAt', sortOrder: 'desc' } as any)
            .then(res => {
              const list = res?.data || res?.orders || [];
              setHistory(Array.isArray(list) ? list : []);
            })
            .catch(err => console.error('Error refreshing history:', err));
        }, 1000);
      }
    } catch (error) {
      console.error('Error purchasing points:', error);
    }
  };

  const submitReceipt = async () => {
    if (!createdOrderId || !paymentProofUrl) return;
    try {
      await orderApi.submitPaymentConfirmation(token, createdOrderId, paymentProofUrl, paymentNote);
      setStep('waiting');
    } catch {
      // noop
    }
  };

  const resetFlow = () => {
    setAmount(100);
    setPaymentProofUrl('');
    setPaymentNote('');
    setCreatedOrderId('');
    setStep('form');
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await settingsApi.getPointPrice();
        const price = res?.data?.pointPrice ?? res?.pointPrice ?? null;
        setPointPrice(typeof price === 'number' ? price : null);
      } catch {
        setPointPrice(null);
      }
    })();
  }, []);

  // Load point top-up history
  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        setLoadingHistory(true);
        // First try to get all orders to see what we have
        const allOrdersRes = await orderApi.getUserOrders(token, { limit: 10, sortBy: 'createdAt', sortOrder: 'desc' } as any);
        console.log('All orders response:', allOrdersRes);
        
        // Then try to get point topups specifically
        const res = await orderApi.getUserPointTopups(token, { limit: 5, sortBy: 'createdAt', sortOrder: 'desc' } as any);
        console.log('Point topup history response:', res);
        const list = res?.data || res?.orders || [];
        console.log('Point topup history list:', list);
        setHistory(Array.isArray(list) ? list : []);
      } catch (error) {
        console.error('Error loading point topup history:', error);
        setHistory([]);
      } finally {
        setLoadingHistory(false);
      }
    })();
  }, [token, step]);

  // Poll order status when waiting for admin confirmation
  useEffect(() => {
    if (step !== 'waiting' || !createdOrderId || !token) return;
    const interval = setInterval(async () => {
      try {
        const res = await orderApi.getOrderById(token, createdOrderId);
        const order = res?.data || res;
        const status = order?.status;
        if (status === 'completed') {
          clearInterval(interval);
          await refreshUser();
          setStep('form');
          setCreatedOrderId('');
        }
      } catch {}
    }, 4000);
    return () => clearInterval(interval);
  }, [step, createdOrderId, token, refreshUser]);

  const points = useMemo(() => {
    if (!pointPrice || pointPrice <= 0) return 0;
    return Math.floor((Number(amount) || 0) / pointPrice);
  }, [amount, pointPrice]);

  return (
    <div className="relative">
      <div className="pointer-events-none absolute -top-24 -left-16 h-56 w-56 bg-gradient-to-br from-indigo-400/20 to-fuchsia-400/20 blur-3xl rounded-full" />
      <div className="pointer-events-none absolute top-24 -right-10 h-56 w-56 bg-gradient-to-br from-emerald-400/20 to-sky-400/20 blur-3xl rounded-full" />

      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-indigo-100 to-fuchsia-100 text-indigo-700 border border-indigo-200">✨ Tích điểm nhanh</div>
          <h1 className="mt-2 text-3xl font-extrabold bg-gradient-to-r from-indigo-600 via-fuchsia-600 to-rose-600 bg-clip-text text-transparent">Mua điểm</h1>
          <p className="text-sm text-gray-600 mt-1">Nạp tiền để nhận điểm và sử dụng cho các tính năng yêu thích</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {step === 'form' && (
              <div className="bg-white p-6 rounded-2xl shadow-sm border space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Số tiền muốn nạp</label>
                  <div className="relative">
                    <input
                      type="number"
                      min={0}
                      value={amount}
                      onChange={(e)=>setAmount(parseInt(e.target.value) || 0)}
                      className="w-full border rounded-xl px-4 py-3 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 border-indigo-200"
                      placeholder="Nhập số tiền..."
                    />
                    <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-indigo-500">💳</div>
                  </div>
                </div>

                {pointPrice !== null && (
                  <div className="rounded-xl border p-4 bg-indigo-50 border-indigo-200">
                    <div className="text-sm text-indigo-700">Tỷ lệ quy đổi hiện tại</div>
                    <div className="mt-1 text-indigo-700 text-lg font-semibold">1 điểm = {new Intl.NumberFormat('zh-TW', { style: 'currency', currency: 'TWD' }).format(pointPrice)}</div>
                  </div>
                )}

                {pointPrice !== null && (
                  <div className="rounded-xl border p-4 bg-emerald-50 border-emerald-200">
                    <div className="text-sm text-emerald-700">Bạn sẽ nhận được</div>
                    <div className="mt-1 text-3xl font-extrabold text-emerald-700">{points} điểm</div>
                  </div>
                )}

                <button
                  onClick={purchase}
                  className="w-full bg-gradient-to-r from-indigo-600 to-fuchsia-600 hover:from-indigo-700 hover:to-fuchsia-700 text-white py-3 rounded-xl font-semibold shadow-md hover:shadow-lg transition"
                >Mua điểm ngay</button>
              </div>
            )}

            {step === 'upload' && (
              <div className="bg-white p-6 rounded-2xl shadow-sm border space-y-5">
                <div className="text-lg font-semibold">Bước 2: Tải lên biên lai chuyển khoản</div>
                <div>
                  <div className="text-sm text-gray-700 mb-2">Ảnh biên lai</div>
                  <ImageUpload value={paymentProofUrl} onChange={setPaymentProofUrl} placeholder="Chọn ảnh chuyển khoản" />
                </div>
                <div>
                  <div className="text-sm text-gray-700 mb-2">Ghi chú (mã giao dịch, thời gian...)</div>
                  <textarea value={paymentNote} onChange={(e)=>setPaymentNote(e.target.value)} className="w-full border rounded-xl px-3 py-2 min-h-[80px]" placeholder="Ví dụ: Mã giao dịch 123ABC, 14:32 17/09" />
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={()=>setStep('form')} className="px-4 py-2 rounded-xl border">Quay lại</button>
                  <button onClick={submitReceipt} disabled={!paymentProofUrl} className="px-4 py-2 rounded-xl bg-indigo-600 text-white disabled:opacity-60">Gửi xác nhận</button>
                </div>
              </div>
            )}

            {step === 'waiting' && (
              <div className="bg-white p-6 rounded-2xl shadow-sm border space-y-5">
                <div className="text-lg font-semibold text-emerald-700">Bước 3: Chờ admin xác nhận</div>
                <div className="text-sm text-gray-700">Chúng tôi đã nhận được biên lai. Điểm sẽ tự động cộng vào tài khoản khi admin duyệt.</div>
                <div className="flex items-center gap-2">
                  <button onClick={resetFlow} className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 text-white">Mua thêm</button>
                  <button onClick={()=>navigate('/dashboard')} className="px-4 py-2 rounded-xl border">Về trang chính</button>
                </div>
              </div>
            )}
          </div>

          <div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-400 to-sky-400 text-white flex items-center justify-center">🏆</div>
                <div>
                  <div className="font-semibold">Quyền lợi khi có điểm</div>
                  <div className="text-sm text-gray-600">Tham gia dự đoán, bình chọn, nhận quà hấp dẫn</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-fuchsia-400 to-rose-400 text-white flex items-center justify-center">⚡</div>
                <div>
                  <div className="font-semibold">Nạp nhanh chóng</div>
                  <div className="text-sm text-gray-600">Chuyển khoản và gửi biên lai, admin duyệt cực nhanh</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-400 text-white flex items-center justify-center">🔒</div>
                <div>
                  <div className="font-semibold">An toàn & minh bạch</div>
                  <div className="text-sm text-gray-600">Đơn nạp điểm được quản lý trong hệ thống</div>
                </div>
              </div>
            </div>

            <div className="mt-6 bg-white p-6 rounded-2xl shadow-sm border">
              <div className="flex items-center justify-between mb-3">
                <div className="font-semibold">Lịch sử nạp điểm gần đây</div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      setLoadingHistory(true);
                      orderApi.getUserPointTopups(token, { limit: 5, sortBy: 'createdAt', sortOrder: 'desc' } as any)
                        .then(res => {
                          console.log('Refresh point topup history response:', res);
                          const list = res?.data || res?.orders || [];
                          setHistory(Array.isArray(list) ? list : []);
                        })
                        .catch(err => console.error('Refresh error:', err))
                        .finally(() => setLoadingHistory(false));
                    }}
                    className="text-sm text-gray-600 hover:text-indigo-600"
                  >
                    🔄
                  </button>
                  <button onClick={()=>navigate('/orders') } className="text-sm text-indigo-600">Xem tất cả</button>
                </div>
              </div>
              {loadingHistory ? (
                <div className="text-sm text-gray-500">Đang tải...</div>
              ) : history.length === 0 ? (
                <div className="text-sm text-gray-500">
                  Chưa có giao dịch nạp điểm
                  <br />
                  <button 
                    onClick={() => {
                      console.log('Testing API...');
                      orderApi.getUserOrders(token, { limit: 5 } as any)
                        .then(res => console.log('Test API response:', res))
                        .catch(err => console.error('Test API error:', err));
                    }}
                    className="text-xs text-indigo-600 hover:underline mt-1"
                  >
                    Test API
                  </button>
                </div>
              ) : (
                <div className="divide-y">
                  {history.map((o:any)=>{
                    console.log('Rendering order:', o);
                    const created = o?.createdAt ? new Date(o.createdAt) : null;
                    const dateStr = created ? created.toLocaleString() : '';
                    const amount = o?.totalAmount ?? o?.subtotal ?? 0;
                    const points = o?.pointsEarned ?? 0;
                    const status = o?.status;
                    const badgeClass = status === 'completed' ? 'bg-emerald-100 text-emerald-700' : status === 'waiting_payment' || status === 'processing' || status === 'waiting_confirmation' ? 'bg-amber-100 text-amber-700' : status === 'cancelled' ? 'bg-rose-100 text-rose-700' : 'bg-gray-100 text-gray-700';
                    return (
                      <div key={o.id || o._id} className="py-3 flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium">{o.orderNumber || '—'}</div>
                          <div className="text-xs text-gray-500">{dateStr}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold">+{points} điểm</div>
                          <div className="text-xs text-gray-500">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)}</div>
                        </div>
                        <div className={`ml-3 px-2 py-1 rounded-full text-xs ${badgeClass}`}>{status}</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyPointsPage;


