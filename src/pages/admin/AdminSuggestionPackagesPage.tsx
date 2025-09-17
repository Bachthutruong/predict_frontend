import React, { useEffect, useMemo, useState } from 'react';
import { adminApi } from '../../services/shopApi';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../components/ui/select';
import { Label } from '../../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../components/ui/alert-dialog';
import { Switch } from '../../components/ui/switch';

const AdminSuggestionPackagesPage: React.FC = () => {
  const token = localStorage.getItem('token') || '';

  const [loading, setLoading] = useState(true);
  const [packages, setPackages] = useState<any[]>([]);
  const [filters, setFilters] = useState({ search: '', isActive: 'all' });
  const [pagination, setPagination] = useState({ current: 1, pages: 1, total: 0 });
  const [pageSize, setPageSize] = useState(10);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [form, setForm] = useState<any>({
    name: '',
    description: '',
    price: 0,
    suggestionCount: 0,
    validityDays: 30,
    isActive: true,
    isFeatured: false,
    sortOrder: 0,
  });

  const canSubmit = useMemo(() => Boolean(form.name && form.price >= 0 && form.suggestionCount > 0), [form]);
  // const formatPrice = (price: number) => new Intl.NumberFormat('zh-TW', { style: 'currency', currency: 'TWD' }).format(price);

  const fetchPackages = async () => {
    setLoading(true);
    const res = await adminApi.getSuggestionPackages(token, {
      page: pagination.current,
      limit: pageSize,
      search: filters.search || undefined,
      isActive: filters.isActive === 'all' ? undefined : (filters.isActive === 'true')
    });
    if (res.success) {
      setPackages(res.data);
      setPagination(res.pagination || { current: 1, pages: 1, total: res.data?.length || 0 });
    } else {
      setPackages([]);
    }
    setLoading(false);
  };

  useEffect(() => { fetchPackages(); }, [filters, pagination.current, pageSize]);

  const openNew = () => { setEditing(null); setForm({ name: '', description: '', price: 0, suggestionCount: 1, validityDays: 30, isActive: true, isFeatured: false, sortOrder: 0 }); setShowForm(true); };
  const openEdit = (p: any) => { setEditing(p); setForm({ name: p.name, description: p.description || '', price: p.price, suggestionCount: p.suggestionCount, validityDays: p.validityDays || 30, isActive: p.isActive, isFeatured: p.isFeatured, sortOrder: p.sortOrder || 0 }); setShowForm(true); };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    if (editing) await adminApi.updateSuggestionPackage(token, editing.id, form);
    else await adminApi.createSuggestionPackage(token, form);
    setShowForm(false);
    fetchPackages();
  };

  const toggleStatus = async (p: any) => { await adminApi.toggleSuggestionPackageStatus(token, p.id); fetchPackages(); };
  const remove = async (p: any) => { await adminApi.deleteSuggestionPackage(token, p.id); setIsDeleteOpen(false); setDeleteTarget(null); fetchPackages(); };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Gói gợi ý</h1>
        <Button onClick={openNew}>Thêm</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bộ lọc</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input placeholder="Tìm theo tên..." value={filters.search} onChange={(e) => { setFilters({ ...filters, search: e.target.value }); setPagination(prev => ({ ...prev, current: 1 })); }} />
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

      <Card>
        <CardHeader>
          <CardTitle>Danh sách gói</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center text-gray-500">Đang tải...</div>
          ) : packages.length === 0 ? (
            <div className="py-8 text-center text-gray-500">Không có gói gợi ý</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {packages.map((p) => (
                <div key={p.id} className="rounded-2xl border shadow-sm hover:shadow-lg transition-all overflow-hidden bg-gradient-to-br from-emerald-50/60 to-teal-50/60">
                  <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-4 flex items-center justify-between">
                    <span className={`text-xs px-2 py-1 rounded-full ${p.isActive ? 'bg-white/20' : 'bg-white/10'}`}>{p.isActive ? 'Hiển thị' : 'Ẩn'}</span>
                    {p.isFeatured && <span className="text-xs px-2 py-1 rounded-full bg-yellow-300/90 text-emerald-900">Nổi bật</span>}
                  </div>
                  <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="text-lg font-bold text-gray-900">{p.name}</div>
                      <div className="text-sm px-3 py-1 rounded-full bg-emerald-100 text-emerald-700">{(p.price)}</div>
                    </div>
                    <div className="text-gray-600 text-sm">{p.description}</div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="bg-white/70 rounded-lg p-2 border"><span className="text-gray-500">Số gợi ý:</span> <span className="font-medium text-gray-900">{p.suggestionCount}</span></div>
                      <div className="bg-white/70 rounded-lg p-2 border"><span className="text-gray-500">Hiệu lực:</span> <span className="font-medium text-gray-900">{p.validityDays || 30} ngày</span></div>
                      <div className="bg-white/70 rounded-lg p-2 border"><span className="text-gray-500">Sắp xếp:</span> <span className="font-medium text-gray-900">{p.sortOrder || 0}</span></div>
                      <div className="bg-white/70 rounded-lg p-2 border"><span className="text-gray-500">Đã mua:</span> <span className="font-medium text-gray-900">{p.purchaseCount || 0}</span></div>
                    </div>
                    <div className="pt-2 flex items-center justify-between">
                      <Button variant="outline" className="border-emerald-600 text-emerald-700 hover:bg-emerald-50" onClick={() => openEdit(p)}>Sửa</Button>
                      <div className="space-x-2">
                        <Button variant="outline" className={`${p.isActive ? 'border-amber-500 text-amber-600 hover:bg-amber-50' : 'border-green-600 text-green-700 hover:bg-green-50'}`} onClick={() => toggleStatus(p)}>{p.isActive ? 'Ẩn' : 'Hiển thị'}</Button>
                        <Button variant="outline" className="border-red-500 text-red-600 hover:bg-red-50" onClick={() => { setDeleteTarget(p); setIsDeleteOpen(true); }}>Xóa</Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {pagination.pages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-600">Hiển thị {((pagination.current - 1) * pageSize) + 1} - {Math.min(pagination.current * pageSize, pagination.total)} / {pagination.total}</div>
              <div className="flex items-center gap-2">
                <button onClick={() => setPagination(prev => ({ ...prev, current: Math.max(1, prev.current - 1) }))} disabled={pagination.current === 1} className="px-3 py-2 border rounded-md disabled:opacity-50">Trước</button>
                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
                  <button key={p} onClick={() => setPagination(prev => ({ ...prev, current: p }))} className={`px-3 py-2 rounded-md ${p === pagination.current ? 'bg-emerald-600 text-white' : 'border'}`}>{p}</button>
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
            <DialogTitle>{editing ? 'Sửa gói gợi ý' : 'Thêm gói gợi ý'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Tên</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div>
                <Label>Giá</Label>
                <Input type="number" min={0} value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
              </div>
              <div className="md:col-span-2">
                <Label>Mô tả</Label>
                <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div>
                <Label>Số gợi ý</Label>
                <Input type="number" min={1} value={form.suggestionCount} onChange={(e) => setForm({ ...form, suggestionCount: Number(e.target.value) })} />
              </div>
              <div>
                <Label>Hiệu lực (ngày)</Label>
                <Input type="number" min={1} value={form.validityDays} onChange={(e) => setForm({ ...form, validityDays: Number(e.target.value) })} />
              </div>
              <div>
                <Label>Sắp xếp</Label>
                <Input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} />
              </div>
              <div className="flex items-center justify-between md:col-span-2">
                <div className="flex items-center gap-3">
                  <Label>Hiển thị</Label>
                  <Switch checked={form.isActive} onCheckedChange={(v) => setForm({ ...form, isActive: v })} />
                </div>
                <div className="flex items-center gap-3">
                  <Label>Nổi bật</Label>
                  <Switch checked={form.isFeatured} onCheckedChange={(v) => setForm({ ...form, isFeatured: v })} />
                </div>
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
            <AlertDialogTitle>Xóa gói gợi ý</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc muốn xóa gói {deleteTarget?.name}? Hành động này không thể hoàn tác.
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

export default AdminSuggestionPackagesPage;


