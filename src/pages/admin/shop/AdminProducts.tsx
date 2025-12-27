import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminProductAPI } from '../../../services/adminShopServices';
import { Button } from '../../../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { Badge } from '../../../components/ui/badge';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { Input } from '../../../components/ui/input';
import toast from 'react-hot-toast';

export default function AdminProducts() {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchProducts();
    }, [search]);

    const fetchProducts = async () => {
        try {
            const res = await adminProductAPI.getAll({ limit: 100, search });
            if (res.data.success) {
                setProducts(res.data.data);
            }
        } catch (error) {
            toast.error('Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this product?')) return;
        try {
            await adminProductAPI.delete(id);
            toast.success('Product deleted');
            fetchProducts();
        } catch (e) { toast.error('Failed to delete'); }
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Products</h1>
                    <p className="text-gray-500">Manage your product catalog</p>
                </div>
                <Button onClick={() => navigate('/admin/shop/products/new')} className="bg-[#ee4d2d] hover:bg-[#d04327]">
                    <Plus className="mr-2 h-4 w-4" /> Add Product
                </Button>
            </div>

            <div className="flex gap-4 items-center bg-white p-4 rounded-lg border shadow-sm">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Search products..."
                        className="pl-9"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                {/* <Button variant="outline"><Filter className="mr-2 h-4 w-4" /> Filter</Button> */}
            </div>

            <div className="border rounded-lg bg-white shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-gray-50/50">
                            <TableHead className="w-[80px]">Image</TableHead>
                            <TableHead>Product Name</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Stock</TableHead>
                            <TableHead>Points</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {products.length === 0 && !loading && (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center py-12 text-gray-500">
                                    No products found
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
                                        {p.isActive ? 'Active' : 'Inactive'}
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
        </div>
    );
}
