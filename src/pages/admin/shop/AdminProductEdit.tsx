import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminProductAPI, adminCategoryAPI } from '../../../services/adminShopServices';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { Label } from '../../../components/ui/label';
import { ImageUpload } from '../../../components/ui/image-upload';
import { Switch } from '../../../components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { ArrowLeft, Save, Plus, Trash2, Package, DollarSign, Layers, Gift } from 'lucide-react';
import toast from 'react-hot-toast';
import { useLanguage } from '../../../hooks/useLanguage';
import { formatDate } from '../../../lib/utils';

/** Format number with comma thousands (e.g. 20000000 -> "20,000,000") for display only. */
function formatPriceDisplay(value: number | string | undefined): string {
    if (value === '' || value === undefined || value === null) return '';
    const n = typeof value === 'string' ? parseInt(value.replace(/\D/g, ''), 10) : value;
    if (Number.isNaN(n)) return '';
    return n.toLocaleString('en-US');
}

/** Parse displayed price string back to number (strip commas). Value sent to API remains numeric. */
function parsePriceInput(input: string): number | '' {
    const digits = input.replace(/\D/g, '');
    if (digits === '') return '';
    const n = parseInt(digits, 10);
    return Number.isNaN(n) ? '' : n;
}

export default function AdminProductEdit() {
    const { t } = useLanguage();
    const { id } = useParams();
    const navigate = useNavigate();
    const isNew = !id || id === 'new';
    const [loading, setLoading] = useState(!isNew);
    const [categories, setCategories] = useState<any[]>([]);

    const [product, setProduct] = useState<any>({
        name: '',
        description: '',
        price: 0,
        originalPrice: 0,
        stock: 0,
        images: [],
        category: '',
        brand: '',
        isActive: true,
        pointsReward: 0,
        pointsRequired: 0,
        canPurchaseWithPoints: false
    });

    const [inventoryHistory, setInventoryHistory] = useState<any[]>([]);
    const [stockAdjustment, setStockAdjustment] = useState({ quantity: 0, reason: '' });

    useEffect(() => {
        fetchCategories();
        if (!isNew && id) {
            fetchProduct();
            fetchHistory();
        }
    }, [id]);

    const fetchCategories = async () => {
        try {
            const res = await adminCategoryAPI.getAll({ isActive: true });
            if (res.data.success) setCategories(res.data.data);
        } catch (e) { console.error('Failed to categories'); }
    };

    const fetchProduct = async () => {
        try {
            const res = await adminProductAPI.getById(id!);
            if (res.data.success) {
                setProduct({
                    ...res.data.data,
                    category: res.data.data.category || '' // Ensure category is string
                });
            }
        } catch (e) { toast.error(t('admin.shop.productEdit.toast.loadFailed')); navigate('/admin/shop/products'); }
        finally { setLoading(false); }
    };

    const fetchHistory = async () => {
        if (isNew) return;
        try {
            const res = await adminProductAPI.getInventoryHistory(id!, { limit: 10 });
            if (res.data.success) setInventoryHistory(res.data.data);
        } catch (e) { }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (!product.category) {
                toast.error(t('admin.shop.productEdit.toast.selectCategory'));
                return;
            }
            const payload = {
                ...product,
                price: Number(product.price) || 0,
                originalPrice: Number(product.originalPrice) || 0
            };
            if (isNew) {
                const res = await adminProductAPI.create(payload);
                toast.success(t('admin.shop.productEdit.toast.created'));
                navigate(`/admin/shop/products/${res.data.data.id}/edit`);
            } else {
                await adminProductAPI.update(id!, payload);
                toast.success(t('admin.shop.productEdit.toast.updated'));
            }
        } catch (e: any) {
            toast.error(e.response?.data?.message || t('admin.shop.productEdit.toast.opFailed'));
        }
    };

    const handleStockUpdate = async (type: 'add' | 'subtract' | 'set') => {
        if (!stockAdjustment.quantity) return;
        try {
            await adminProductAPI.updateStock(id!, {
                stock: stockAdjustment.quantity,
                operation: type,
                reason: stockAdjustment.reason
            });
            toast.success(t('admin.shop.productEdit.toast.stockUpdated'));
            fetchProduct();
            fetchHistory();
            setStockAdjustment({ quantity: 0, reason: '' });
        } catch (e) { toast.error(t('admin.shop.productEdit.toast.stockUpdateFailed')); }
    };

    if (loading) return <div>{t('common.loading')}</div>;

    return (
        <div className="space-y-6 max-w-6xl mx-auto pb-20">
            {/* Header */}
            <div className="flex items-center justify-between sticky top-0 bg-gray-50/95 backdrop-blur z-10 py-4 border-b">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" onClick={() => navigate('/admin/shop/products')}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> {t('admin.shop.productEdit.back')}
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">{isNew ? t('admin.shop.productEdit.newTitle') : t('admin.shop.productEdit.editTitle')}</h1>
                        <p className="text-sm text-gray-500">{isNew ? t('admin.shop.productEdit.newSub') : `${t('admin.shop.productEdit.editSub')} ${product.name}`}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => fetchProduct()}>{t('admin.shop.productEdit.discard')}</Button>
                    <Button onClick={handleSubmit} className="bg-[#ee4d2d] hover:bg-[#d04327]"><Save className="mr-2 h-4 w-4" /> {t('admin.shop.productEdit.save')}</Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Main Info */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Basic Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Package className="h-5 w-5 text-gray-500" /> {t('admin.shop.productEdit.basic')}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>{t('admin.shop.categories.form.name')}</Label>
                                <Input
                                    placeholder="e.g. Men's Cotton T-Shirt"
                                    value={product.name}
                                    onChange={e => setProduct({ ...product, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>{t('admin.shop.categories.form.description')}</Label>
                                <Textarea
                                    placeholder="Detailed product description..."
                                    value={product.description}
                                    onChange={e => setProduct({ ...product, description: e.target.value })}
                                    className="min-h-[150px]"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>{t('admin.shop.categories.form.brand') || 'Brand'}</Label>
                                <Input
                                    placeholder="e.g. Adidas, Nike, No Brand"
                                    value={product.brand}
                                    onChange={e => setProduct({ ...product, brand: e.target.value })}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Media */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Layers className="h-5 w-5 text-gray-500" /> {t('admin.shop.productEdit.media')}</CardTitle>
                            <CardDescription>{t('admin.shop.productEdit.mediaDesc')}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {product.images?.map((url: string, i: number) => (
                                    <div key={i} className="relative group aspect-square border rounded-lg overflow-hidden bg-gray-50">
                                        <img src={url} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <Button
                                                variant="destructive" size="icon" className="h-8 w-8"
                                                onClick={() => setProduct({ ...product, images: product.images.filter((_: any, idx: number) => idx !== i) })}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        {i === 0 && <div className="absolute top-2 left-2 bg-[#ee4d2d] text-white text-[10px] px-2 py-0.5 rounded-full">{t('admin.shop.productEdit.cover')}</div>}
                                    </div>
                                ))}
                                <div className="relative aspect-square flex items-center justify-center border-2 border-dashed rounded-lg hover:bg-gray-50 transition-colors">
                                    <ImageUpload
                                        value=""
                                        onChange={(url) => setProduct({ ...product, images: [...(product.images || []), url] })}
                                        placeholder="+"
                                        className="h-full w-full opacity-0 absolute inset-0 cursor-pointer"
                                    />
                                    <div className="text-center pointer-events-none">
                                        <Plus className="h-8 w-8 mx-auto text-gray-400" />
                                        <span className="text-xs text-gray-500">{t('admin.shop.productEdit.addImage')}</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Pricing & Stock */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><DollarSign className="h-5 w-5 text-gray-500" /> {t('admin.shop.productEdit.pricing')}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label>{t('admin.shop.productEdit.price')}</Label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-2.5 text-gray-500">₫</span>
                                        <Input
                                            type="text"
                                            inputMode="numeric"
                                            className="pl-8"
                                            placeholder="0"
                                            value={formatPriceDisplay(product.price)}
                                            onChange={e => {
                                                const parsed = parsePriceInput(e.target.value);
                                                setProduct({ ...product, price: parsed });
                                            }}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>{t('admin.shop.productEdit.originalPrice')}</Label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-2.5 text-gray-500">₫</span>
                                        <Input
                                            type="text"
                                            inputMode="numeric"
                                            className="pl-8"
                                            placeholder="0"
                                            value={formatPriceDisplay(product.originalPrice)}
                                            onChange={e => {
                                                const parsed = parsePriceInput(e.target.value);
                                                setProduct({ ...product, originalPrice: parsed });
                                            }}
                                        />
                                    </div>
                                    <p className="text-[10px] text-gray-500">{t('admin.shop.productEdit.originalPriceDesc')}</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>{t('admin.shop.productEdit.currentStock')}</Label>
                                <Input
                                    type="number"
                                    value={product.stock}
                                    onChange={e => setProduct({ ...product, stock: e.target.value === '' ? '' : Number(e.target.value) })}
                                    min={0}
                                    disabled={!isNew}
                                    className={!isNew ? "bg-gray-100" : ""}
                                />
                                {!isNew && <p className="text-xs text-blue-600">{t('admin.shop.productEdit.stockDesc')}</p>}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Inventory Management (Only for Edit) */}
                    {!isNew && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">{t('admin.shop.productEdit.stockAdj')}</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>{t('admin.shop.productEdit.amount')}</Label>
                                            <Input type="number" value={stockAdjustment.quantity} onChange={e => setStockAdjustment({ ...stockAdjustment, quantity: Number(e.target.value) })} min={1} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>{t('admin.shop.productEdit.reason')}</Label>
                                            <Input value={stockAdjustment.reason} onChange={e => setStockAdjustment({ ...stockAdjustment, reason: e.target.value })} placeholder="e.g. Restock" />
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button size="sm" onClick={() => handleStockUpdate('add')} className="flex-1 bg-green-600 hover:bg-green-700">{t('admin.shop.productEdit.add')}</Button>
                                        <Button size="sm" onClick={() => handleStockUpdate('subtract')} className="flex-1 bg-red-600 hover:bg-red-700">{t('admin.shop.productEdit.remove')}</Button>
                                        <Button size="sm" onClick={() => handleStockUpdate('set')} variant="outline" className="flex-1">{t('admin.shop.productEdit.set')}</Button>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">{t('admin.shop.productEdit.stockHist')}</CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="py-2">{t('admin.shop.reviews.table.date')}</TableHead>
                                                <TableHead className="py-2">Type</TableHead>
                                                <TableHead className="py-2">Qty</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {inventoryHistory.map((h: any) => (
                                                <TableRow key={h.id}>
                                                    <TableCell className="py-2 text-xs">{formatDate(h.createdAt)}</TableCell>
                                                    <TableCell className="py-2 text-xs capitalize">{h.type}</TableCell>
                                                    <TableCell className={`py-2 text-xs font-medium ${h.changeAmount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                        {h.changeAmount > 0 ? '+' : ''}{h.changeAmount}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>

                {/* Right Column - Organization */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('admin.shop.productEdit.org')}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                                <div className="space-y-0.5">
                                    <Label>{t('admin.shop.productEdit.status')}</Label>
                                    <div className="text-xs text-gray-500">{product.isActive ? t('admin.shop.productEdit.statusActive') : t('admin.shop.productEdit.statusInactive')}</div>
                                </div>
                                <Switch checked={product.isActive} onCheckedChange={c => setProduct({ ...product, isActive: c })} />
                            </div>

                            <div className="space-y-2">
                                <Label>{t('admin.shop.categories.title')}</Label>
                                <Select value={product.category} onValueChange={(val) => setProduct({ ...product, category: val })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder={t('admin.shop.productEdit.selectCategory')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((c) => (
                                            <SelectItem key={c._id} value={c.name}>{c.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Button variant="link" className="p-0 h-auto text-xs" onClick={() => navigate('/admin/shop/categories')}>
                                    {t('admin.shop.productEdit.manageCategories')}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Gift className="h-5 w-5 text-gray-500" /> {t('admin.shop.productEdit.points')}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>{t('admin.shop.productEdit.pointsEarned')}</Label>
                                <Input type="number" value={product.pointsReward} onChange={e => setProduct({ ...product, pointsReward: Number(e.target.value) })} />
                                <p className="text-[10px] text-gray-500">{t('admin.shop.productEdit.pointsEarnedDesc')}</p>
                            </div>

                            <div className="pt-4 border-t space-y-4">
                                <div className="flex items-center gap-2">
                                    <Switch checked={product.canPurchaseWithPoints} onCheckedChange={c => setProduct({ ...product, canPurchaseWithPoints: c })} />
                                    <Label className="text-sm">{t('admin.shop.productEdit.allowPoints')}</Label>
                                </div>

                                {product.canPurchaseWithPoints && (
                                    <div className="space-y-2">
                                        <Label>{t('admin.shop.productEdit.pointsPrice')}</Label>
                                        <Input type="number" value={product.pointsRequired} onChange={e => setProduct({ ...product, pointsRequired: Number(e.target.value) })} />
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
