import React, { useEffect, useState } from 'react';
import { orderApi, shopApi } from '../../services/shopApi';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { useAuth } from '../../context/AuthContext';

const UserSuggestionPackagesPage: React.FC = () => {
  const token = localStorage.getItem('token') || '';
  const { refreshUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [packages, setPackages] = useState<any[]>([]); // user's purchased packages
  const [available, setAvailable] = useState<any[]>([]); // available packages to buy
  const [buying, setBuying] = useState<string>('');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [confirming, setConfirming] = useState<any | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await orderApi.getUserSuggestionPackages(token);
      setPackages(res?.data || res || []);
      const pub = await shopApi.getSuggestionPackages();
      setAvailable(pub?.data || pub || []);
    } catch (e) {
      setPackages([]);
      setAvailable([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-8">
      <div className="mb-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-emerald-100 to-sky-100 text-emerald-700 border border-emerald-200">💡 Gợi ý thông minh</div>
        <h1 className="mt-2 text-3xl font-extrabold bg-gradient-to-r from-emerald-600 via-sky-600 to-indigo-600 bg-clip-text text-transparent">Gói gợi ý của bạn</h1>
        <p className="text-sm text-gray-600 mt-1">Theo dõi số lần gợi ý đã dùng và còn lại để dự đoán hiệu quả hơn.</p>
      </div>

      {/* Available packages to purchase */}
      <Card className="rounded-2xl overflow-hidden shadow-md border bg-white">
        <CardHeader className="bg-gradient-to-r from-emerald-50 via-sky-50 to-indigo-50 border-b">
          <CardTitle className="text-gray-800">Các gói có thể mua</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {loading ? (
            <div className="py-10 text-gray-500 text-sm">Đang tải...</div>
          ) : available.length === 0 ? (
            <div className="py-10 text-gray-600 text-sm flex items-center gap-2">🛍️ Chưa có gói gợi ý nào được mở bán.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {available.map((p: any) => (
                <div key={p.id} className="rounded-2xl border shadow-sm hover:shadow-lg transition-all overflow-hidden bg-gradient-to-br from-emerald-50/60 to-teal-50/60">
                  <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-4 flex items-center justify-between">
                    <div className="font-semibold">{p.name}</div>
                    <span className="text-xs px-2 py-1 rounded-full bg-white/20">{p.validityDays || 30} ngày</span>
                  </div>
                  <div className="p-5 space-y-3">
                    <div className="text-gray-700 text-sm min-h-[32px]">{p.description || 'Gói gợi ý giúp bạn có thêm thông tin khi dự đoán.'}</div>
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div className="bg-white/70 rounded-lg p-2 border"><span className="text-gray-500">Gợi ý:</span> <span className="font-medium text-gray-900">{p.suggestionCount}</span></div>
                      <div className="bg-white/70 rounded-lg p-2 border"><span className="text-gray-500">Hiệu lực:</span> <span className="font-medium text-gray-900">{p.validityDays || 30} ngày</span></div>
                      <div className="bg-white/70 rounded-lg p-2 border"><span className="text-gray-500">Giá:</span> <span className="font-semibold text-amber-700">{p.price || 0}</span></div>
                    </div>
                    <div className="pt-1">
                      <Button
                        className="rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-md hover:shadow-lg"
                        disabled={!token || buying === p.id}
                        onClick={() => {
                          if (!token) return;
                          setConfirming(p);
                        }}
                      >{buying === p.id ? 'Đang tạo đơn...' : 'Mua gói'}</Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-2xl overflow-hidden shadow-md border bg-white">
        <CardHeader className="bg-gradient-to-r from-indigo-50 to-fuchsia-50 border-b">
          <CardTitle className="text-gray-800">Danh sách gói đã mua</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {loading ? (
            <div className="py-10 text-gray-500 text-sm">Đang tải...</div>
          ) : packages.length === 0 ? (
            <div className="py-10 text-gray-600 text-sm flex items-center gap-2">🗂️ Bạn chưa có gói gợi ý nào. Hãy mua gói ở phần trên.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {packages.map((p: any) => (
                <div key={p.id} className="rounded-2xl border shadow-sm hover:shadow-lg transition-all overflow-hidden bg-white">
                  <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="text-lg font-bold text-gray-900">{p.package?.name || 'Gói gợi ý'}</div>
                      <span className="text-xs px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">Đang hoạt động</span>
                    </div>
                    <div className="text-gray-600 text-sm">{p.package?.description || ''}</div>
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div className="bg-emerald-50 rounded-lg p-2 border border-emerald-200 text-emerald-700">Tổng: <span className="font-semibold text-emerald-800">{p.totalSuggestions}</span></div>
                      <div className="bg-amber-50 rounded-lg p-2 border border-amber-200 text-amber-700">Đã dùng: <span className="font-semibold text-amber-800">{p.usedSuggestions}</span></div>
                      <div className="bg-indigo-50 rounded-lg p-2 border border-indigo-200 text-inderald-700">Còn: <span className="font-semibold text-indigo-800">{p.remainingSuggestions}</span></div>
                    </div>
                    <div className="mt-1 text-xs text-gray-500">Hết hạn: {p.validUntil ? new Date(p.validUntil).toLocaleDateString() : '—'}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg border ${toast.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'}`}
             onAnimationEnd={() => { /* keep simple */ }}>
          {toast.message}
        </div>
      )}

      {/* Confirm dialog */}
      {confirming && (
        <div className="fixed inset-0 bg-gray-900/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl border w-11/12 max-w-md">
            <div className="px-5 py-4 border-b rounded-t-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white flex items-center justify-between">
              <div className="font-semibold">Xác nhận mua gói</div>
              <button onClick={() => setConfirming(null)} className="text-white/80 hover:text-white">✕</button>
            </div>
            <div className="p-5 space-y-3">
              <div className="text-gray-800 font-medium">{confirming.name}</div>
              <div className="text-sm text-gray-600">{confirming.description || 'Gói gợi ý giúp bạn có thêm thông tin khi dự đoán.'}</div>
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div className="bg-gray-50 rounded-lg p-2 border"><span className="text-gray-500">Gợi ý:</span> <span className="font-medium text-gray-900">{confirming.suggestionCount}</span></div>
                <div className="bg-gray-50 rounded-lg p-2 border"><span className="text-gray-500">Hiệu lực:</span> <span className="font-medium text-gray-900">{confirming.validityDays || 30} ngày</span></div>
                <div className="bg-gray-50 rounded-lg p-2 border"><span className="text-gray-500">Giá:</span> <span className="font-semibold text-amber-700">{confirming.price || 0}</span></div>
              </div>
              <div className="text-xs text-gray-500">Sau khi xác nhận, điểm tương ứng sẽ bị trừ khỏi tài khoản của bạn. Nếu điểm không đủ, hệ thống sẽ báo lỗi và không trừ điểm.</div>
            </div>
            <div className="px-5 py-4 border-t flex justify-end gap-2">
              <button onClick={() => setConfirming(null)} className="px-4 py-2 rounded-lg border">Hủy</button>
              <button
                onClick={async () => {
                  if (!token || !confirming) return;
                  setBuying(confirming.id);
                  try {
                    await orderApi.purchaseSuggestionPackage(token, confirming.id);
                    setToast({ type: 'success', message: 'Mua gói thành công. Điểm đã được trừ.' });
                    setConfirming(null);
                    await refreshUser();
                    await load();
                  } catch (e: any) {
                    setToast({ type: 'error', message: e?.message || 'Mua gói thất bại' });
                  } finally {
                    setBuying('');
                  }
                }}
                className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60"
                disabled={buying === (confirming?.id || '')}
              >{buying === (confirming?.id || '') ? 'Đang xử lý...' : 'Xác nhận mua'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserSuggestionPackagesPage;


