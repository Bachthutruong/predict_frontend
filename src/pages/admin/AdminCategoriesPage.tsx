import React, { useEffect, useState } from 'react';
import { adminApi } from '../../services/shopApi';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Switch } from '../../components/ui/switch';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../components/ui/alert-dialog';

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
  sortOrder: number;
}

const AdminCategoriesPage: React.FC = () => {
  const token = localStorage.getItem('token') || '';
  const [categories, setCategories] = useState<Category[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({ current: 1, pages: 1, total: 0 });
  const [pageSize, setPageSize] = useState(10);

  const [form, setForm] = useState({ name: '', slug: '', description: '', isActive: true, sortOrder: 0 });
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const fetchData = async () => {
    const res = await adminApi.getCategories(token, { page: pagination.current, limit: pageSize, search: search || undefined });
    if (res.success) { setCategories(res.data); setPagination(res.pagination || { current: 1, pages: 1, total: res.data?.length || 0 }); }
  };

  useEffect(() => { fetchData(); }, [search, pagination.current, pageSize]);

  const openNew = () => { setEditing(null); setForm({ name: '', slug: '', description: '', isActive: true, sortOrder: 0 }); setShowForm(true); };
  const openEdit = (c: Category) => { setEditing(c); setForm({ name: c.name, slug: c.slug, description: c.description || '', isActive: c.isActive, sortOrder: c.sortOrder }); setShowForm(true); };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      await adminApi.updateCategory(token, editing.id, form);
    } else {
      await adminApi.createCategory(token, form);
    }
    setShowForm(false);
    fetchData();
  };

  const remove = async (c: Category) => {
    await adminApi.deleteCategory(token, c.id);
    setIsDeleteOpen(false);
    setDeleteTarget(null);
    fetchData();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Quản lý danh mục</h1>
        <Button onClick={openNew} className="inline-flex items-center gap-2"><Plus className="w-4 h-4" />Thêm danh mục</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tìm kiếm</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input placeholder="Tìm theo tên..." value={search} onChange={(e) => { setSearch(e.target.value); setPagination(prev => ({ ...prev, current: 1 })); }} />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Số dòng / trang</label>
              <select
                value={pageSize}
                onChange={(e) => { setPageSize(Number(e.target.value)); setPagination(prev => ({ ...prev, current: 1 })); }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {[10, 20, 50, 100].map(sz => (
                  <option key={sz} value={sz}>{sz}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Tên</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Slug</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Trạng thái</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Sắp xếp</th>
                  <th className="px-4 py-2 text-right text-sm font-medium text-gray-600">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {categories.map(c => (
                  <tr key={c.id}>
                    <td className="px-4 py-2">{c.name}</td>
                    <td className="px-4 py-2 text-gray-600">{c.slug}</td>
                    <td className="px-4 py-2">{c.isActive ? 'Hiển thị' : 'Ẩn'}</td>
                    <td className="px-4 py-2">{c.sortOrder}</td>
                    <td className="px-4 py-2 text-right space-x-2">
                      <Button variant="outline" onClick={() => openEdit(c)}><Edit className="w-4 h-4" /></Button>
                      <Button variant="outline" className="text-red-600" onClick={() => { setDeleteTarget(c); setIsDeleteOpen(true); }}><Trash2 className="w-4 h-4" /></Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-600">
                Hiển thị {((pagination.current - 1) * pageSize) + 1} - {Math.min(pagination.current * pageSize, pagination.total)} / {pagination.total}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, current: Math.max(1, prev.current - 1) }))}
                  disabled={pagination.current === 1}
                  className="px-3 py-2 border rounded-md disabled:opacity-50"
                >
                  Trước
                </button>
                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPagination(prev => ({ ...prev, current: p }))}
                    className={`px-3 py-2 rounded-md ${p === pagination.current ? 'bg-blue-600 text-white' : 'border'}`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => setPagination(prev => ({ ...prev, current: Math.min(prev.pages, prev.current + 1) }))}
                  disabled={pagination.current === pagination.pages}
                  className="px-3 py-2 border rounded-md disabled:opacity-50"
                >
                  Sau
                </button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-xl">
            <form onSubmit={submit} className="p-6 space-y-4">
              <h3 className="text-lg font-semibold">{editing ? 'Sửa danh mục' : 'Thêm danh mục'}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Tên</Label>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div>
                  <Label>Slug</Label>
                  <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required />
                </div>
              </div>
              <div>
                <Label>Mô tả</Label>
                <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="flex items-center justify-between">
                <Label>Hiển thị</Label>
                <Switch checked={form.isActive} onCheckedChange={(v) => setForm({ ...form, isActive: v })} />
              </div>
              <div>
                <Label>Sắp xếp</Label>
                <Input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Hủy</Button>
                <Button type="submit">Lưu</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa danh mục</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc muốn xóa danh mục {deleteTarget?.name}? Hành động này không thể hoàn tác.
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

export default AdminCategoriesPage;


