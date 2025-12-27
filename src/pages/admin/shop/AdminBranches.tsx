import React, { useState, useEffect } from 'react';
import { adminBranchAPI } from '../../../services/adminShopServices';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { Badge } from '../../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../../components/ui/dialog';
import { Switch } from '../../../components/ui/switch';
import { Edit, Trash2, Plus, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminBranches() {
    const [branches, setBranches] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isOpen, setIsOpen] = useState(false);
    const [editingBranch, setEditingBranch] = useState<any>(null);

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
            toast.error('Failed to load branches');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingBranch) {
                await adminBranchAPI.update(editingBranch.id, formData);
                toast.success('Branch updated');
            } else {
                await adminBranchAPI.create(formData);
                toast.success('Branch created');
            }
            setIsOpen(false);
            setEditingBranch(null);
            setFormData({ name: '', address: '', phone: '', isActive: true });
            fetchBranches();
        } catch (error) {
            toast.error('Operation failed');
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
        if (!confirm('Delete this branch?')) return;
        try {
            await adminBranchAPI.delete(id);
            toast.success('Branch deleted');
            fetchBranches();
        } catch (e) { toast.error('Failed to delete'); }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Store Branches</h1>
                <Dialog open={isOpen} onOpenChange={(open) => {
                    setIsOpen(open);
                    if (!open) {
                        setEditingBranch(null);
                        setFormData({ name: '', address: '', phone: '', isActive: true });
                    }
                }}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Add Branch
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingBranch ? 'Edit Branch' : 'Add New Branch'}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label>Branch Name</Label>
                                <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                            </div>
                            <div className="space-y-2">
                                <Label>Address</Label>
                                <Input value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} required />
                            </div>
                            <div className="space-y-2">
                                <Label>Phone</Label>
                                <Input value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} required />
                            </div>
                            <div className="flex items-center gap-2">
                                <Switch
                                    checked={formData.isActive}
                                    onCheckedChange={c => setFormData({ ...formData, isActive: c })}
                                />
                                <Label>Active Status</Label>
                            </div>
                            <Button type="submit" className="w-full">
                                {editingBranch ? 'Update' : 'Create'} Branch
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="border rounded-lg bg-white shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Client Name</TableHead>
                            <TableHead>Address</TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {branches.length === 0 && !loading && (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-gray-500">No branches found</TableCell>
                            </TableRow>
                        )}
                        {branches.map(b => (
                            <TableRow key={b.id}>
                                <TableCell className="font-medium flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-gray-400" />
                                    {b.name}
                                </TableCell>
                                <TableCell>{b.address}</TableCell>
                                <TableCell>{b.phone}</TableCell>
                                <TableCell>
                                    <Badge variant={b.isActive ? 'default' : 'outline'}>
                                        {b.isActive ? 'Active' : 'Inactive'}
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
        </div>
    );
}
