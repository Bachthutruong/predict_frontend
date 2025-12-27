import React, { useState, useEffect } from 'react';
import { adminBranchAPI } from '../../../services/adminShopServices';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { Badge } from '../../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../../components/ui/dialog';
import { Switch } from '../../../components/ui/switch';
import { Edit, Trash2, Plus, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import toast from 'react-hot-toast';
import { useLanguage } from '../../../hooks/useLanguage';

export default function AdminBranches() {
    const { t } = useLanguage();
    const [branches, setBranches] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isOpen, setIsOpen] = useState(false);
    const [editingBranch, setEditingBranch] = useState<any>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [limit, setLimit] = useState(10);

    const [formData, setFormData] = useState({
        name: '',
        address: '',
        phone: '',
        isActive: true
    });

    useEffect(() => {
        fetchBranches();
    }, []);

    const fetchBranches = async () => {
        try {
            const res = await adminBranchAPI.getAll();
            if (res.data.success) {
                setBranches(res.data.data);
            }
        } catch (error) {
            toast.error(t('admin.shop.branches.toast.loadFailed'));
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingBranch) {
                await adminBranchAPI.update(editingBranch.id, formData);
                toast.success(t('admin.shop.branches.toast.updated'));
            } else {
                await adminBranchAPI.create(formData);
                toast.success(t('admin.shop.branches.toast.created'));
            }
            setIsOpen(false);
            setEditingBranch(null);
            setFormData({ name: '', address: '', phone: '', isActive: true });
            fetchBranches();
        } catch (error) {
            toast.error(t('admin.shop.branches.toast.opFailed'));
        }
    };

    const handleEdit = (branch: any) => {
        setEditingBranch(branch);
        setFormData({
            name: branch.name,
            address: branch.address,
            phone: branch.phone,
            isActive: branch.isActive
        });
        setIsOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm(t('admin.shop.branches.toast.confirmDelete'))) return;
        try {
            await adminBranchAPI.delete(id);
            toast.success(t('admin.shop.branches.toast.deleted'));
            fetchBranches();
        } catch (e) { toast.error(t('admin.shop.branches.toast.deleteFailed')); }
    };

    // Client-side pagination logic
    const totalPages = Math.ceil(branches.length / limit);
    const displayedBranches = branches.slice((currentPage - 1) * limit, currentPage * limit);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">{t('admin.shop.branches.title')}</h1>
                <Dialog open={isOpen} onOpenChange={(open) => {
                    setIsOpen(open);
                    if (!open) {
                        setEditingBranch(null);
                        setFormData({ name: '', address: '', phone: '', isActive: true });
                    }
                }}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> {t('admin.shop.branches.add')}
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingBranch ? t('admin.shop.branches.editTitle') : t('admin.shop.branches.newTitle')}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label>{t('admin.shop.branches.form.name')}</Label>
                                <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                            </div>
                            <div className="space-y-2">
                                <Label>{t('admin.shop.branches.form.address')}</Label>
                                <Input value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} required />
                            </div>
                            <div className="space-y-2">
                                <Label>{t('admin.shop.branches.form.phone')}</Label>
                                <Input value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} required />
                            </div>
                            <div className="flex items-center gap-2">
                                <Switch
                                    checked={formData.isActive}
                                    onCheckedChange={c => setFormData({ ...formData, isActive: c })}
                                />
                                <Label>{t('admin.shop.branches.form.active')}</Label>
                            </div>
                            <Button type="submit" className="w-full">
                                {editingBranch ? t('admin.shop.branches.form.update') : t('admin.shop.branches.form.create')}
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="border rounded-lg bg-white shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{t('admin.shop.branches.table.name')}</TableHead>
                            <TableHead>{t('admin.shop.branches.table.address')}</TableHead>
                            <TableHead>{t('admin.shop.branches.table.phone')}</TableHead>
                            <TableHead>{t('admin.shop.branches.table.status')}</TableHead>
                            <TableHead>{t('admin.shop.branches.table.actions')}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {branches.length === 0 && !loading && (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-gray-500">{t('admin.shop.branches.table.noBranches')}</TableCell>
                            </TableRow>
                        )}
                        {displayedBranches.map(b => (
                            <TableRow key={b.id}>
                                <TableCell className="font-medium flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-gray-400" />
                                    {b.name}
                                </TableCell>
                                <TableCell>{b.address}</TableCell>
                                <TableCell>{b.phone}</TableCell>
                                <TableCell>
                                    <Badge variant={b.isActive ? 'default' : 'outline'}>
                                        {b.isActive ? t('admin.shop.categories.form.active') : t('admin.shop.products.table.statusInactive')}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <div className="flex gap-2">
                                        <Button size="sm" variant="ghost" onClick={() => handleEdit(b)}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button size="sm" variant="ghost" className="text-red-500" onClick={() => handleDelete(b.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination Controls */}
            {branches.length > 0 && (
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
                            {t('admin.shop.orders.table.total')}: {branches.length}
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
