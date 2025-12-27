import React, { useState, useEffect } from 'react';
import { adminCategoryAPI } from '../../../services/adminShopServices';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../../components/ui/dialog';
import { Switch } from '../../../components/ui/switch';
import { Edit, Trash2, Plus, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import toast from 'react-hot-toast';
import { useLanguage } from '../../../hooks/useLanguage';

export default function AdminCategories() {
    const { t } = useLanguage();
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<any>(null);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);


    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        description: '',
        isActive: true,
        sortOrder: 0
    });

    useEffect(() => {
        fetchCategories();
    }, [search, currentPage, limit]);

    const fetchCategories = async () => {
        try {
            const res = await adminCategoryAPI.getAll({ page: currentPage, limit, search });
            if (res.data.success) {
                setCategories(res.data.data);
                if (res.data.pagination) {
                    setTotalPages(res.data.pagination.pages);
                    setTotalItems(res.data.pagination.total);
                }
            }
        } catch (error) {
            console.error('Failed to fetch categories');
            toast.error(t('admin.shop.categories.toast.loadFailed'));
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingCategory) {
                await adminCategoryAPI.update(editingCategory._id, formData);
                toast.success(t('admin.shop.categories.toast.updated'));
            } else {
                await adminCategoryAPI.create(formData);
                toast.success(t('admin.shop.categories.toast.created'));
            }
            setIsDialogOpen(false);
            resetForm();
            fetchCategories();
        } catch (error: any) {
            toast.error(error.response?.data?.message || t('admin.shop.categories.toast.failed'));
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm(t('admin.shop.categories.toast.deleteConfirm'))) return;
        try {
            await adminCategoryAPI.delete(id);
            toast.success(t('admin.shop.categories.toast.deleted'));
            fetchCategories();
        } catch (error) {
            toast.error(t('admin.shop.categories.toast.failed'));
        }
    };

    const handleToggleStatus = async (id: string) => {
        try {
            await adminCategoryAPI.toggleStatus(id);
            fetchCategories();
            toast.success(t('admin.shop.categories.toast.statusUpdated'));
        } catch (error) {
            toast.error(t('admin.shop.categories.toast.failed'));
        }
    };

    const resetForm = () => {
        setEditingCategory(null);
        setFormData({ name: '', slug: '', description: '', isActive: true, sortOrder: 0 });
    };

    const openEdit = (cat: any) => {
        setEditingCategory(cat);
        setFormData({
            name: cat.name,
            slug: cat.slug,
            description: cat.description,
            isActive: cat.isActive,
            sortOrder: cat.sortOrder
        });
        setIsDialogOpen(true);
    };

    const generateSlug = (name: string) => {
        return name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">{t('admin.shop.categories.title')}</h1>
                <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
                    <DialogTrigger asChild>
                        <Button><Plus className="mr-2 h-4 w-4" /> {t('admin.shop.categories.add')}</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingCategory ? t('admin.shop.categories.edit') : t('admin.shop.categories.new')}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label>{t('admin.shop.categories.form.name')}</Label>
                                <Input
                                    value={formData.name}
                                    onChange={(e) => {
                                        const name = e.target.value;
                                        setFormData(prev => ({ ...prev, name, slug: !editingCategory ? generateSlug(name) : prev.slug }));
                                    }}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>{t('admin.shop.categories.form.slug')}</Label>
                                <Input value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} required />
                            </div>
                            <div className="space-y-2">
                                <Label>{t('admin.shop.categories.form.description')}</Label>
                                <Input value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label>{t('admin.shop.categories.form.sortOrder')}</Label>
                                <Input type="number" value={formData.sortOrder} onChange={(e) => setFormData({ ...formData, sortOrder: Number(e.target.value) })} />
                            </div>
                            <div className="flex items-center space-x-2">
                                <Switch
                                    checked={formData.isActive}
                                    onCheckedChange={(c) => setFormData({ ...formData, isActive: c })}
                                />
                                <Label>{t('admin.shop.categories.form.active')}</Label>
                            </div>
                            <Button type="submit" className="w-full">{editingCategory ? t('admin.shop.categories.form.update') : t('admin.shop.categories.form.create')}</Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="flex items-center space-x-2 bg-white p-2 rounded-lg border">
                <Search className="h-5 w-5 text-gray-400" />
                <input
                    className="flex-1 outline-none"
                    placeholder={t('admin.shop.categories.searchPlaceholder')}
                    value={search}
                    onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
                />
            </div>

            <div className="border rounded-lg bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{t('admin.shop.categories.table.name')}</TableHead>
                            <TableHead>{t('admin.shop.categories.table.slug')}</TableHead>
                            <TableHead>{t('admin.shop.categories.table.order')}</TableHead>
                            <TableHead>{t('admin.shop.categories.table.status')}</TableHead>
                            <TableHead className="text-right">{t('admin.shop.categories.table.actions')}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow><TableCell colSpan={5} className="text-center">{t('common.loading')}</TableCell></TableRow>
                        ) : categories.length === 0 ? (
                            <TableRow><TableCell colSpan={5} className="text-center">{t('admin.shop.categories.table.noCategories')}</TableCell></TableRow>
                        ) : (
                            categories.map((cat) => (
                                <TableRow key={cat._id}>
                                    <TableCell className="font-medium">
                                        <div>{cat.name}</div>
                                        <div className="text-xs text-gray-500">{cat.description}</div>
                                    </TableCell>
                                    <TableCell>{cat.slug}</TableCell>
                                    <TableCell>{cat.sortOrder}</TableCell>
                                    <TableCell>
                                        <Switch checked={cat.isActive} onCheckedChange={() => handleToggleStatus(cat._id)} />
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" onClick={() => openEdit(cat)}><Edit className="h-4 w-4" /></Button>
                                        <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDelete(cat._id)}><Trash2 className="h-4 w-4" /></Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination Controls */}
            {categories.length > 0 && (
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-4">
                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">{t('common.pageSize')}:</span>
                        <Select value={String(limit)} onValueChange={(v) => { setLimit(Number(v)); setCurrentPage(1); }}>
                            <SelectTrigger className="w-[70px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="10">10</SelectItem>
                                <SelectItem value="20">20</SelectItem>
                                <SelectItem value="50">50</SelectItem>
                                <SelectItem value="100">100</SelectItem>
                            </SelectContent>
                        </Select>
                        <span className="text-sm text-gray-500">
                            {t('admin.shop.orders.table.total')}: {totalItems}
                        </span>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                        >
                            <ChevronLeft className="h-4 w-4 mr-1" /> {t('common.previous')}
                        </Button>
                        <span className="text-sm font-medium">
                            {t('common.pageOf', { current: currentPage, total: totalPages })}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                        >
                            {t('common.next')} <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
