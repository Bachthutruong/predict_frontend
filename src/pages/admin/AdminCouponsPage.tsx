import React, { useEffect, useMemo, useState } from 'react';
import { adminApi } from '../../services/shopApi';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../components/ui/select';
import { Switch } from '../../components/ui/switch';
import { Label } from '../../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../components/ui/alert-dialog';

type DiscountType = 'percentage' | 'fixed_amount' | 'free_shipping';

const AdminCouponsPage: React.FC = () => {
  const token = localStorage.getItem('token') || '';

  const [loading, setLoading] = useState(true);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [filters, setFilters] = useState({ search: '', discountType: 'all', isActive: 'all' });
  const [pagination, setPagination] = useState({ current: 1, pages: 1, total: 0 });
  const [pageSize, setPageSize] = useState(10);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [form, setForm] = useState<any>({
    code: '',
    name: '',
    description: '',
    discountType: 'percentage' as DiscountType,
    discountValue: 0,
    usageLimit: 0,
    usageLimitPerUser: 1,
    minimumOrderAmount: 0,
    isActive: true,
  });

  const canSubmit = useMemo(() => Boolean(form.code && form.name), [form]);

  const fetchCoupons = async () => {
    setLoading(true);
    const res = await adminApi.getCoupons(token, {
      page: pagination.current,
      limit: pageSize,
      search: filters.search || undefined,
      discountType: filters.discountType === 'all' ? undefined : filters.discountType,
      isActive: filters.isActive === 'all' ? undefined : (filters.isActive === 'true')
    });
    if (res.success) {
      setCoupons(res.data);
      setPagination(res.pagination || { current: 1, pages: 1, total: res.data?.length || 0 });
    } else {
      setCoupons([]);
    }
    setLoading(false);
  };

  useEffect(() => { fetchCoupons(); }, [filters, pagination.current, pageSize]);

  const openNew = () => {
    setEditing(null);
    setForm({ code: '', name: '', description: '', discountType: 'percentage', discountValue: 0, usageLimit: 0, usageLimitPerUser: 1, minimumOrderAmount: 0, isActive: true });
    setShowForm(true);
  };

  const openEdit = (c: any) => {
    setEditing(c);
    setForm({
      code: c.code,
      name: c.name,
      description: c.description || '',
      discountType: c.discountType,
      discountValue: c.discountValue,
      
      usageLimit: c.usageLimit || 0,
      usageLimitPerUser: c.usageLimitPerUser || 1,
      minimumOrderAmount: c.minimumOrderAmount || 0,
      isActive: c.isActive,
    });
    setShowForm(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    if (editing) await adminApi.updateCoupon(token, editing.id, form);
    else await adminApi.createCoupon(token, form);
    setShowForm(false);
    fetchCoupons();
  };

  const toggleStatus = async (c: any) => {
    await adminApi.toggleCouponStatus(token, c.id);
    fetchCoupons();
  };

  const remove = async (c: any) => {
    await adminApi.deleteCoupon(token, c.id);
    setIsDeleteOpen(false);
    setDeleteTarget(null);
    fetchCoupons();
  };

  const formatPrice = (price: number) => new Intl.NumberFormat('zh-TW', { style: 'currency', currency: 'TWD' }).format(price);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Mã giảm giá</h1>
        <Button onClick={openNew}>Thêm</Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Bộ lọc</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Input placeholder="Tìm theo mã/tên..." value={filters.search} onChange={(e) => { setFilters({ ...filters, search: e.target.value }); setPagination(prev => ({ ...prev, current: 1 })); }} />
            <div>
              <Label className="mb-1 block">Loại</Label>
              <Select value={filters.discountType} onValueChange={(v) => { setFilters({ ...filters, discountType: v }); setPagination(prev => ({ ...prev, current: 1 })); }}>
                <SelectTrigger><SelectValue placeholder="Tất cả" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="percentage">Phần trăm</SelectItem>
                  <SelectItem value="fixed_amount">Số tiền cố định</SelectItem>
                  <SelectItem value="free_shipping">Miễn phí vận chuyển</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-1 block">Trạng thái</Label>
              <Select value={filters.isActive} onValueChange={(v) => { setFilters({ ...filters, isActive: v }); setPagination(prev => ({ ...prev, current: 1 })); }}>
                <SelectTrigger><SelectValue placeholder="Tất cả" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="true">Hiển thị</SelectItem>
                  <SelectItem value="false">Ẩn</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-1 block">Kích thước trang</Label>
              <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPagination(prev => ({ ...prev, current: 1 })); }} className="w-full px-3 py-2 border rounded-lg">
                {[10,20,50,100].map(sz => (<option key={sz} value={sz}>{sz}</option>))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>
      {/* Lưới thẻ mã giảm giá đẹp, cân chuẩn */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách mã giảm giá</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center text-gray-500">Đang tải...</div>
          ) : coupons.length === 0 ? (
            <div className="py-8 text-center text-gray-500">Không có mã giảm giá</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {coupons.map((c) => (
                <div key={c.id} className="group rounded-2xl border shadow-sm hover:shadow-lg transition-all overflow-hidden bg-gradient-to-br from-blue-50/50 to-purple-50/50">
                  {/* Header ribbon */}
                  <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white p-4 flex items-center justify-between">
                    <span className={`text-xs px-2 py-1 rounded-full ${c.isActive ? 'bg-white/20' : 'bg-white/10'}`}>{c.isActive ? 'Hiển thị' : 'Ẩn'}</span>
                    <span className="text-xs opacity-90">{c.discountType === 'percentage' ? 'Phần trăm' : c.discountType === 'fixed_amount' ? 'Tiền cố định' : 'Miễn phí vận chuyển'}</span>
                  </div>

                  <div className="p-5 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div className="font-mono text-xl tracking-widest font-extrabold text-gray-900">{c.code}</div>
                      <span className="text-sm px-3 py-1 rounded-full bg-blue-100 text-blue-700">{c.discountType === 'percentage' ? `-${c.discountValue}%` : c.discountType === 'fixed_amount' ? `-${formatPrice(c.discountValue)}` : 'Miễn phí VC'}</span>
                    </div>
                    <div className="text-gray-900 font-semibold">{c.name}</div>
                    {c.description && <div className="text-gray-600 text-sm line-clamp-2">{c.description}</div>}

                    <div className="mt-1 grid grid-cols-2 gap-3 text-sm">
                      <div className="bg-white/70 rounded-lg p-2 border"><span className="text-gray-500">Giới hạn:</span> <span className="font-medium text-gray-900">{c.usageLimit || 'Không'}</span></div>
                      <div className="bg-white/70 rounded-lg p-2 border"><span className="text-gray-500">Mỗi người:</span> <span className="font-medium text-gray-900">{c.usageLimitPerUser || 1}</span></div>
                      <div className="bg-white/70 rounded-lg p-2 border"><span className="text-gray-500">Đơn tối thiểu:</span> <span className="font-medium text-gray-900">{formatPrice(c.minimumOrderAmount || 0)}</span></div>
                      <div className="bg-white/70 rounded-lg p-2 border"><span className="text-gray-500">Đã dùng:</span> <span className="font-medium text-gray-900">{c.usedCount || 0}</span></div>
                    </div>

                    <div className="pt-2 flex items-center justify-between">
                      <Button variant="outline" className="border-blue-600 text-blue-700 hover:bg-blue-50" onClick={() => openEdit(c)}>Sửa</Button>
                      <div className="space-x-2">
                        <Button variant="outline" className={`${c.isActive ? 'border-amber-500 text-amber-600 hover:bg-amber-50' : 'border-green-600 text-green-700 hover:bg-green-50'}`} onClick={() => toggleStatus(c)}>{c.isActive ? 'Ẩn' : 'Hiển thị'}</Button>
                        <Button variant="outline" className="border-red-500 text-red-600 hover:bg-red-50" onClick={() => { setDeleteTarget(c); setIsDeleteOpen(true); }}>Xóa</Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {pagination.pages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-600">
                Hiển thị {((pagination.current - 1) * pageSize) + 1} - {Math.min(pagination.current * pageSize, pagination.total)} / {pagination.total}
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setPagination(prev => ({ ...prev, current: Math.max(1, prev.current - 1) }))} disabled={pagination.current === 1} className="px-3 py-2 border rounded-md disabled:opacity-50">Trước</button>
                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
                  <button key={p} onClick={() => setPagination(prev => ({ ...prev, current: p }))} className={`px-3 py-2 rounded-md ${p === pagination.current ? 'bg-blue-600 text-white' : 'border'}`}>{p}</button>
                ))}
                <button onClick={() => setPagination(prev => ({ ...prev, current: Math.min(prev.pages, prev.current + 1) }))} disabled={pagination.current === pagination.pages} className="px-3 py-2 border rounded-md disabled:opacity-50">Sau</button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? 'Sửa mã giảm giá' : 'Thêm mã giảm giá'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Mã</Label>
                <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required />
              </div>
              <div>
                <Label>Tên</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="md:col-span-2">
                <Label>Mô tả</Label>
                <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div>
                <Label>Loại</Label>
                <Select value={form.discountType} onValueChange={(v) => setForm({ ...form, discountType: v as DiscountType })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Phần trăm</SelectItem>
                    <SelectItem value="fixed_amount">Số tiền cố định</SelectItem>
                    <SelectItem value="free_shipping">Miễn phí vận chuyển</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {form.discountType !== 'free_shipping' && (
                <div>
                  <Label>Giá trị</Label>
                  <Input type="number" min={0} value={form.discountValue} onChange={(e) => setForm({ ...form, discountValue: Number(e.target.value) })} />
                </div>
              )}
              
              <div>
                <Label>Giới hạn lượt dùng</Label>
                <Input type="number" min={0} value={form.usageLimit} onChange={(e) => setForm({ ...form, usageLimit: Number(e.target.value) })} />
              </div>
              <div>
                <Label>Giới hạn mỗi người</Label>
                <Input type="number" min={1} value={form.usageLimitPerUser} onChange={(e) => setForm({ ...form, usageLimitPerUser: Number(e.target.value) })} />
              </div>
              <div>
                <Label>Đơn tối thiểu</Label>
                <Input type="number" min={0} value={form.minimumOrderAmount} onChange={(e) => setForm({ ...form, minimumOrderAmount: Number(e.target.value) })} />
              </div>
              <div className="flex items-center justify-between md:col-span-2">
                <Label>Hiển thị</Label>
                <Switch checked={form.isActive} onCheckedChange={(v) => setForm({ ...form, isActive: v })} />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Hủy</Button>
              <Button type="submit" disabled={!canSubmit}>Lưu</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa mã giảm giá</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc muốn xóa mã {deleteTarget?.code}? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (deleteTarget) remove(deleteTarget); }}>Xóa</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminCouponsPage;


