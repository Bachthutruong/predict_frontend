import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminProductAPI } from '../../../services/adminShopServices';
import { Button } from '../../../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { Badge } from '../../../components/ui/badge';
import { Plus, Edit, Trash2, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Input } from '../../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import toast from 'react-hot-toast';
import { useLanguage } from '../../../hooks/useLanguage';

export default function AdminProducts() {
    const { t } = useLanguage();
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    const navigate = useNavigate();

    useEffect(() => {
        fetchProducts();
    }, [search, currentPage, limit]);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const res = await adminProductAPI.getAll({ page: currentPage, limit, search });
            if (res.data.success) {
                setProducts(res.data.data);
                if (res.data.pagination) {
                    setTotalPages(res.data.pagination.pages);
                    setTotalItems(res.data.pagination.total);
                }
            }
        } catch (error) {
            toast.error(t('admin.shop.products.messages.loadFailed') || 'Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm(t('admin.shop.products.messages.confirmDelete'))) return;
        try {
            await adminProductAPI.delete(id);
            toast.success(t('admin.shop.products.messages.deleted'));
            fetchProducts();
        } catch (e) { toast.error(t('admin.shop.products.messages.deleteFailed')); }
    };

    return (
        <div className="space-y-6 max-w-full">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{t('admin.shop.products.title')}</h1>
                    <p className="text-gray-500">{t('admin.shop.products.manage')}</p>
                </div>
                <Button onClick={() => navigate('/admin/shop/products/new')} className="bg-[#ee4d2d] hover:bg-[#d04327]">
                    <Plus className="mr-2 h-4 w-4" /> {t('admin.shop.products.add')}
                </Button>
            </div>

            <div className="flex gap-4 items-center bg-white p-4 rounded-lg border shadow-sm">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder={t('admin.shop.products.search')}
                        className="pl-9"
                        value={search}
                        onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
                    />
                </div>
                {/* <Button variant="outline"><Filter className="mr-2 h-4 w-4" /> Filter</Button> */}
            </div>

            <div className="border rounded-lg bg-white shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-gray-50/50">
                            <TableHead className="w-[80px]">{t('admin.shop.products.table.image')}</TableHead>
                            <TableHead>{t('admin.shop.products.table.name')}</TableHead>
                            <TableHead>{t('admin.shop.products.table.category')}</TableHead>
                            <TableHead>{t('admin.shop.products.table.price')}</TableHead>
                            <TableHead>{t('admin.shop.products.table.stock')}</TableHead>
                            <TableHead>{t('admin.shop.products.table.points')}</TableHead>
                            <TableHead>{t('admin.shop.products.table.status')}</TableHead>
                            <TableHead className="text-right">{t('admin.shop.products.table.actions')}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {products.length === 0 && !loading && (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center py-12 text-gray-500">
                                    {t('admin.shop.products.messages.noProducts')}
                                </TableCell>
                            </TableRow>
                        )}
                        {products.map(p => (
                            <TableRow key={p.id} className="hover:bg-gray-50/50">
                                <TableCell>
                                    <div className="w-12 h-12 rounded-md overflow-hidden bg-gray-100 border">
                                        {p.images && p.images[0] ? (
                                            <img src={p.images[0]} className="w-full h-full object-cover" />
                                        ) : <div className="flex items-center justify-center h-full text-xs text-gray-400">No Img</div>}
                                    </div>
                                </TableCell>
                                <TableCell className="font-medium">
                                    <div>{p.name}</div>
                                    <div className="text-xs text-gray-500 truncate max-w-[200px]">{p.sku}</div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="secondary" className="font-normal">{p.category}</Badge>
                                </TableCell>
                                <TableCell className="font-medium">{p.price?.toLocaleString()} ₫</TableCell>
                                <TableCell>
                                    <span className={p.stock < 10 ? 'text-red-500 font-bold' : ''}>{p.stock}</span>
                                </TableCell>
                                <TableCell>
                                    <div className="text-xs">
                                        <div>Earn: {p.pointsReward}</div>
                                        {p.canPurchaseWithPoints && <div>Buy: {p.pointsRequired}</div>}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={p.isActive ? 'default' : 'secondary'} className={p.isActive ? 'bg-green-100 text-green-700 hover:bg-green-200 border-green-200' : 'bg-gray-100 text-gray-500'}>
                                        {p.isActive ? t('admin.shop.products.table.statusActive') : t('admin.shop.products.table.statusInactive')}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button size="icon" variant="ghost" onClick={() => navigate(`/admin/shop/products/${p.id}/edit`)}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button size="icon" variant="ghost" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(p.id)}>
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
            {products.length > 0 && (
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-2">
                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">Rows per page:</span>
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
                            Total: {totalItems}
                        </span>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                        >
                            <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                        </Button>
                        <span className="text-sm font-medium">
                            Page {currentPage} of {totalPages}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                        >
                            Next <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
