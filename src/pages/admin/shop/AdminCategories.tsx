import React, { useState, useEffect } from 'react';
import { adminCategoryAPI } from '../../../services/adminShopServices';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../../components/ui/dialog';
import { Switch } from '../../../components/ui/switch';
import { Edit, Trash2, Plus, Search } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminCategories() {
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<any>(null);
    const [search, setSearch] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        description: '',
        isActive: true,
        sortOrder: 0
    });

    useEffect(() => {
        fetchCategories();
    }, [search]);

    const fetchCategories = async () => {
        try {
            const res = await adminCategoryAPI.getAll({ search });
            if (res.data.success) {
                setCategories(res.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch categories');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingCategory) {
                await adminCategoryAPI.update(editingCategory._id, formData);
                toast.success('Category updated successfully');
            } else {
                await adminCategoryAPI.create(formData);
                toast.success('Category created successfully');
            }
            setIsDialogOpen(false);
            resetForm();
            fetchCategories();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Operation failed');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this category?')) return;
        try {
            await adminCategoryAPI.delete(id);
            toast.success('Category deleted');
            fetchCategories();
        } catch (error) {
            toast.error('Failed to delete category');
        }
    };

    const handleToggleStatus = async (id: string) => {
        try {
            await adminCategoryAPI.toggleStatus(id);
            fetchCategories();
            toast.success('Status updated');
        } catch (error) {
            toast.error('Failed to update status');
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
                <h1 className="text-3xl font-bold">Categories</h1>
                <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
                    <DialogTrigger asChild>
                        <Button><Plus className="mr-2 h-4 w-4" /> Add Category</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingCategory ? 'Edit Category' : 'New Category'}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label>Name</Label>
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
                                <Label>Slug</Label>
                                <Input value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} required />
                            </div>
                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Input value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label>Sort Order</Label>
                                <Input type="number" value={formData.sortOrder} onChange={(e) => setFormData({ ...formData, sortOrder: Number(e.target.value) })} />
                            </div>
                            <div className="flex items-center space-x-2">
                                <Switch
                                    checked={formData.isActive}
                                    onCheckedChange={(c) => setFormData({ ...formData, isActive: c })}
                                />
                                <Label>Active</Label>
                            </div>
                            <Button type="submit" className="w-full">{editingCategory ? 'Update' : 'Create'}</Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="flex items-center space-x-2 bg-white p-2 rounded-lg border">
                <Search className="h-5 w-5 text-gray-400" />
                <input
                    className="flex-1 outline-none"
                    placeholder="Search categories..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>

            <div className="border rounded-lg bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Slug</TableHead>
                            <TableHead>Order</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow><TableCell colSpan={5} className="text-center">Loading...</TableCell></TableRow>
                        ) : categories.length === 0 ? (
                            <TableRow><TableCell colSpan={5} className="text-center">No categories found</TableCell></TableRow>
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
        </div>
    );
}
