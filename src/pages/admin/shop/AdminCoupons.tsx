import { useState, useEffect } from 'react';
import { adminCouponAPI } from '../../../services/adminShopServices';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { Badge } from '../../../components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from '../../../components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '../../../components/ui/select';
import { Label } from '../../../components/ui/label';
import { Search, Plus, Edit2, Trash2, Power, Tag, Calendar, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { formatDate as formatDateDisplay } from '../../../lib/utils';
import { useLanguage } from '../../../hooks/useLanguage';

interface Coupon {
    id: string;
    code: string;
    name: string;
    description?: string;
    discountType: 'percentage' | 'fixed_amount' | 'free_shipping';
    discountValue: number;
    usageLimit?: number;
    usedCount: number;
    usageLimitPerUser?: number;
    minimumOrderAmount?: number;
    validFrom?: string;
    validUntil?: string;
    isActive: boolean;
}

export default function AdminCoupons() {
    const { t } = useLanguage();
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    // Dialog state
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
    const [formData, setFormData] = useState({
        code: '',
        name: '',
        description: '',
        discountType: 'percentage',
        discountValue: 0,
        minimumOrderAmount: 0,
        usageLimit: '', // string for input handling
        usageLimitPerUser: 1,
        validFrom: '',
        validUntil: ''
    });

    const fetchCoupons = async () => {
        try {
            setLoading(true);
            const res = await adminCouponAPI.getAll({
                page: currentPage,
                limit,
                search
            });
            if (res.data.success) {
                setCoupons(res.data.data);
                if (res.data.pagination) {
                    setTotalPages(res.data.pagination.pages);
                    setTotalItems(res.data.pagination.total);
                }
            }
        } catch (error) {
            console.error(error);
            toast.error(t('admin.shop.coupons.toast.loadFailed'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchCoupons();
        }, 500);
        return () => clearTimeout(timer);
    }, [search, currentPage, limit]);

    const handleCreate = () => {
        setEditingCoupon(null);
        setFormData({
            code: '',
            name: '',
            description: '',
            discountType: 'percentage',
            discountValue: 0,
            minimumOrderAmount: 0,
            usageLimit: '',
            usageLimitPerUser: 1,
            validFrom: format(new Date(), 'yyyy-MM-dd'),
            validUntil: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd')
        });
        setIsDialogOpen(true);
    };

    const handleEdit = (coupon: Coupon) => {
        setEditingCoupon(coupon);
        setFormData({
            code: coupon.code,
            name: coupon.name,
            description: coupon.description || '',
            discountType: coupon.discountType as any,
            discountValue: coupon.discountValue,
            minimumOrderAmount: coupon.minimumOrderAmount || 0,
            usageLimit: coupon.usageLimit ? String(coupon.usageLimit) : '',
            usageLimitPerUser: coupon.usageLimitPerUser || 1,
            validFrom: coupon.validFrom ? format(new Date(coupon.validFrom), 'yyyy-MM-dd') : '',
            validUntil: coupon.validUntil ? format(new Date(coupon.validUntil), 'yyyy-MM-dd') : ''
        });
        setIsDialogOpen(true);
    };

    const handleSubmit = async () => {
        try {
            if (!formData.code || !formData.name) {
                toast.error(t('admin.shop.coupons.toast.required'));
                return;
            }

            const payload = {
                ...formData,
                code: formData.code.toUpperCase(),
                usageLimit: formData.usageLimit ? Number(formData.usageLimit) : null,
                usageLimitPerUser: Number(formData.usageLimitPerUser),
                minimumOrderAmount: Number(formData.minimumOrderAmount),
                discountValue: Number(formData.discountValue),
                validFrom: formData.validFrom ? new Date(formData.validFrom) : null,
                validUntil: formData.validUntil ? new Date(formData.validUntil) : null
            };

            if (editingCoupon) {
                await adminCouponAPI.update(editingCoupon.id, payload);
                toast.success(t('admin.shop.coupons.toast.updated'));
            } else {
                await adminCouponAPI.create(payload);
                toast.success(t('admin.shop.coupons.toast.created'));
            }
            setIsDialogOpen(false);
            fetchCoupons();
        } catch (error: any) {
            console.error(error);
            toast.error(error.response?.data?.message || t('admin.shop.coupons.toast.failed'));
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm(t('admin.shop.coupons.toast.deleteConfirm'))) return;
        try {
            await adminCouponAPI.delete(id);
            toast.success(t('admin.shop.coupons.toast.deleted'));
            fetchCoupons();
        } catch (error) {
            toast.error(t('admin.shop.coupons.toast.failed'));
        }
    };

    const handleToggleStatus = async (id: string) => {
        try {
            await adminCouponAPI.toggleStatus(id);
            toast.success(t('admin.shop.coupons.toast.statusUpdated'));
            fetchCoupons();
        } catch (error) {
            toast.error(t('admin.shop.coupons.toast.failed'));
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">{t('admin.shop.coupons.title')}</h1>
                    <p className="text-sm text-gray-500 mt-1">{t('admin.shop.coupons.subtitle')}</p>
                </div>
                <Button onClick={handleCreate} className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
                    <Plus className="h-4 w-4 mr-2" />
                    {t('admin.shop.coupons.new')}
                </Button>
            </div>

            <div className="flex items-center space-x-2 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <Search className="h-4 w-4 text-gray-400" />
                <Input
                    placeholder={t('admin.shop.coupons.searchPlaceholder')}
                    className="border-none shadow-none focus-visible:ring-0"
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                />
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-gray-50/50">
                            <TableHead className="w-[100px]">{t('admin.shop.coupons.table.code')}</TableHead>
                            <TableHead>{t('admin.shop.coupons.table.discount')}</TableHead>
                            <TableHead>{t('admin.shop.coupons.table.usage')}</TableHead>
                            <TableHead>{t('admin.shop.coupons.table.validity')}</TableHead>
                            <TableHead>{t('admin.shop.coupons.table.status')}</TableHead>
                            <TableHead className="text-right">{t('admin.shop.coupons.table.actions')}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                                    {t('admin.shop.coupons.table.loading')}
                                </TableCell>
                            </TableRow>
                        ) : coupons.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 flex flex-col items-center justify-center text-gray-400">
                                    <Tag className="h-12 w-12 mb-2 opacity-50" />
                                    {t('admin.shop.coupons.table.noCoupons')}
                                </TableCell>
                            </TableRow>
                        ) : (
                            coupons.map((coupon) => (
                                <TableRow key={coupon.id} className="hover:bg-gray-50/50 transition-colors">
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded inline-block w-fit text-xs font-mono border border-gray-200">
                                                {coupon.code}
                                            </span>
                                            <span className="text-xs text-gray-500 mt-1 line-clamp-1">{coupon.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-medium text-blue-600">
                                            {coupon.discountType === 'percentage'
                                                ? `${coupon.discountValue}%`
                                                : coupon.discountType === 'free_shipping'
                                                    ? t('admin.shop.coupons.discountTypes.free_shipping')
                                                    : `- ${formatCurrency(coupon.discountValue)}`}
                                        </div>
                                        {coupon.minimumOrderAmount && coupon.minimumOrderAmount > 0 ? (
                                            <div className="text-xs text-gray-500">
                                                Min: {formatCurrency(coupon.minimumOrderAmount)}
                                            </div>
                                        ) : null}
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-sm">
                                            {coupon.usedCount} / {coupon.usageLimit ? coupon.usageLimit : '∞'}
                                        </div>
                                        <div className="w-24 h-1.5 bg-gray-100 rounded-full mt-1 overflow-hidden">
                                            <div
                                                className="h-full bg-blue-500"
                                                style={{ width: `${Math.min(((coupon.usedCount || 0) / (coupon.usageLimit || 1)) * 100, 100)}%` }}
                                            />
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-xs text-gray-500 space-y-1">
                                            {coupon.validFrom && (
                                                <div className="flex items-center">
                                                    <Calendar className="h-3 w-3 mr-1" />
                                                    {formatDateDisplay(coupon.validFrom)}
                                                </div>
                                            )}
                                            {coupon.validUntil && (
                                                <div className="flex items-center text-red-500">
                                                    <AlertCircle className="h-3 w-3 mr-1" />
                                                    {formatDateDisplay(coupon.validUntil)}
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={coupon.isActive ? 'default' : 'secondary'}
                                            className={coupon.isActive ? 'bg-green-100 text-green-700 hover:bg-green-200 border-green-200' : 'bg-gray-100 text-gray-600'}
                                        >
                                            {coupon.isActive ? t('admin.shop.categories.form.active') : 'Inactive'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-blue-600" onClick={() => handleEdit(coupon)}>
                                                <Edit2 className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className={`h-8 w-8 ${coupon.isActive ? 'text-green-500 hover:text-red-500' : 'text-gray-400 hover:text-green-500'}`} onClick={() => handleToggleStatus(coupon.id)}>
                                                <Power className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-red-600" onClick={() => handleDelete(coupon.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination Controls */}
            {coupons.length > 0 && (
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

            {/* Create/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[600px] overflow-y-auto max-h-[90vh]">
                    <DialogHeader>
                        <DialogTitle>{editingCoupon ? t('admin.shop.coupons.edit') : t('admin.shop.coupons.new')}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="code">{t('admin.shop.coupons.form.code')} <span className="text-red-500">*</span></Label>
                                <Input
                                    id="code"
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                    placeholder="e.g. WELCOME10"
                                    className="font-mono uppercase"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="name">{t('admin.shop.coupons.form.name')} <span className="text-red-500">*</span></Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g. Welcome Discount"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">{t('admin.shop.coupons.form.description')}</Label>
                            <Input
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Internal note or customer facing description"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>{t('admin.shop.coupons.form.discountType')}</Label>
                                <Select
                                    value={formData.discountType}
                                    onValueChange={(val: any) => setFormData({ ...formData, discountType: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="percentage">{t('admin.shop.coupons.discountTypes.percentage')}</SelectItem>
                                        <SelectItem value="fixed_amount">{t('admin.shop.coupons.discountTypes.fixed_amount')}</SelectItem>
                                        <SelectItem value="free_shipping">{t('admin.shop.coupons.discountTypes.free_shipping')}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            {formData.discountType !== 'free_shipping' && (
                                <div className="space-y-2">
                                    <Label>{t('admin.shop.coupons.form.discountValue')} <span className="text-red-500">*</span></Label>
                                    <Input
                                        type="number"
                                        min="0"
                                        value={formData.discountValue}
                                        onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })}
                                    />
                                    <p className="text-xs text-gray-500">
                                        {formData.discountType === 'percentage' ? '% (e.g. 10)' : 'VND (e.g. 50000)'}
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label>{t('admin.shop.coupons.form.minOrder')}</Label>
                            <Input
                                type="number"
                                min="0"
                                value={formData.minimumOrderAmount}
                                onChange={(e) => setFormData({ ...formData, minimumOrderAmount: Number(e.target.value) })}
                                placeholder="0 for no minimum"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>{t('admin.shop.coupons.form.usageLimit')}</Label>
                                <Input
                                    type="number"
                                    min="0"
                                    value={formData.usageLimit}
                                    onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                                    placeholder="Leave empty for unlimited"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>{t('admin.shop.coupons.form.usageLimitPerUser')}</Label>
                                <Input
                                    type="number"
                                    min="1"
                                    value={formData.usageLimitPerUser}
                                    onChange={(e) => setFormData({ ...formData, usageLimitPerUser: Number(e.target.value) })}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>{t('admin.shop.coupons.form.validFrom')}</Label>
                                <Input
                                    type="date"
                                    value={formData.validFrom}
                                    onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>{t('admin.shop.coupons.form.validUntil')}</Label>
                                <Input
                                    type="date"
                                    value={formData.validUntil}
                                    onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>{t('admin.shop.coupons.form.cancel')}</Button>
                        <Button onClick={handleSubmit} className="bg-blue-600 text-white">
                            {editingCoupon ? t('admin.shop.coupons.form.save') : t('admin.shop.coupons.form.create')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
