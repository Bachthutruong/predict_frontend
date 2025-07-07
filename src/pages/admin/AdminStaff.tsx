import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
// import { Alert, AlertDescription } from '../../components/ui/alert';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { 
  Users, 
  Plus, 
  Edit2, 
  Trash2, 
  Mail, 
  Eye, 
  EyeOff,
  UserCheck,
  Shield,
  RefreshCw,
} from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import apiService from '../../services/api';
import { ImageUpload } from '../../components/ui/image-upload';
import type { User } from '../../types';

interface StaffFormData {
  name: string;
  email: string;
  password: string;
  avatarUrl: string;
}

const AdminStaff: React.FC = () => {
  const { toast } = useToast();
  const [staff, setStaff] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const [newStaff, setNewStaff] = useState<StaffFormData>({
    name: '',
    email: '',
    password: '',
    avatarUrl: '',
  });

  const [editStaff, setEditStaff] = useState<StaffFormData>({
    name: '',
    email: '',
    password: '',
    avatarUrl: '',
  });

  useEffect(() => {
    loadStaff();
  }, []);

  const loadStaff = async () => {
    setIsLoading(true);
    try {
      const response = await apiService.get('/admin/staff');
      // Handle API response structure: { success: true, data: [...] }
      const staffData = response.data?.data || response.data || [];
      setStaff(Array.isArray(staffData) ? staffData : []);
    } catch (error) {
      console.error('Failed to load staff:', error);
      setStaff([]); // Set empty array on error
      toast({
        title: "Error",
        description: "Failed to load staff members. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadStaff();
    setRefreshing(false);
    toast({
      title: "Staff Updated",
      description: "Staff list has been refreshed successfully.",
      variant: "default"
    });
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await apiService.post('/admin/staff', newStaff);
      toast({
        title: "Staff Created",
        description: "Staff account created successfully!",
        variant: "default"
      });
      setNewStaff({
        name: '',
        email: '',
        password: '',
        avatarUrl: '',
      });
      setIsCreateDialogOpen(false);
      loadStaff();
    } catch (error: any) {
      console.error('Create staff error:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || 'Failed to create staff account. Please try again.',
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStaff) return;

    setIsSubmitting(true);

    try {
      const updateData = {
        name: editStaff.name,
        email: editStaff.email,
        avatarUrl: editStaff.avatarUrl,
        ...(editStaff.password && { password: editStaff.password }),
      };

      await apiService.put(`/admin/staff/${editingStaff.id}`, updateData);
      toast({
        title: "Staff Updated",
        description: "Staff account updated successfully!",
        variant: "default"
      });
      setEditingStaff(null);
      loadStaff();
    } catch (error: any) {
      console.error('Update staff error:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || 'Failed to update staff account. Please try again.',
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (staffId: string, staffName: string) => {
    if (!window.confirm(`Are you sure you want to delete ${staffName}? This action cannot be undone.`)) {
      return;
    }

    try {
      await apiService.delete(`/admin/staff/${staffId}`);
      toast({
        title: "Staff Deleted",
        description: `${staffName} has been deleted successfully!`,
        variant: "default"
      });
      loadStaff();
    } catch (error: any) {
      console.error('Delete staff error:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || 'Failed to delete staff account. Please try again.',
        variant: "destructive"
      });
    }
  };

  const openEditDialog = (staffMember: User) => {
    setEditingStaff(staffMember);
    setEditStaff({
      name: staffMember.name,
      email: staffMember.email,
      password: '',
      avatarUrl: staffMember.avatarUrl || '',
    });
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(part => part[0]).join('').toUpperCase().slice(0, 2);
  };

  // Pagination calculations
  const totalPages = Math.ceil(staff.length / itemsPerPage);
  const paginatedStaff = staff.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Pagination component
  const PaginationControls: React.FC<{
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  }> = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages < 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <div className="flex items-center justify-center gap-2 mt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
        >
          Previous
        </Button>
        
        {startPage > 1 && (
          <>
            <Button variant="outline" size="sm" onClick={() => onPageChange(1)}>1</Button>
            {startPage > 2 && <span className="px-2">...</span>}
          </>
        )}
        
        {pages.map((page) => (
          <Button
            key={page}
            variant={currentPage === page ? "default" : "outline"}
            size="sm"
            onClick={() => onPageChange(page)}
          >
            {page}
          </Button>
        ))}
        
        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className="px-2">...</span>}
            <Button variant="outline" size="sm" onClick={() => onPageChange(totalPages)}>
              {totalPages}
            </Button>
          </>
        )}
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
        >
          Next
        </Button>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/3 animate-pulse"></div>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
        <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
            Staff Management
          </h1>
          <p className="text-gray-600 mt-2">
            Create and manage staff accounts
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button onClick={handleRefresh} variant="outline" size="sm" disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''} sm:mr-2`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Add Staff</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md sm:max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Staff Account</DialogTitle>
                <DialogDescription>
                  Create a new staff account with admin privileges.
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleCreateSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={newStaff.name}
                    onChange={(e) => setNewStaff(prev => ({...prev, name: e.target.value}))}
                    placeholder="Enter full name..."
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newStaff.email}
                    onChange={(e) => setNewStaff(prev => ({...prev, email: e.target.value}))}
                    placeholder="Enter email address..."
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={newStaff.password}
                      onChange={(e) => setNewStaff(prev => ({...prev, password: e.target.value}))}
                      placeholder="Enter password..."
                      required
                      disabled={isSubmitting}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Avatar Image</Label>
                  <ImageUpload
                    value={newStaff.avatarUrl}
                    onChange={(url) => setNewStaff(prev => ({...prev, avatarUrl: url}))}
                    disabled={isSubmitting}
                    placeholder="Upload avatar image"
                  />
                </div>

                <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsCreateDialogOpen(false)}
                    disabled={isSubmitting}
                    className="w-full sm:w-auto"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
                    {isSubmitting ? 'Creating...' : 'Create Staff Account'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="flex flex-wrap gap-3">
        <Badge variant="outline" className="h-8 px-3 flex items-center gap-2 bg-white border-gray-200">
          <Users className="h-3 w-3 text-gray-500" />
          <span className="text-sm font-medium">{staff.length} Total Staff</span>
        </Badge>

        <Badge variant="outline" className="h-8 px-3 flex items-center gap-2 bg-green-50 border-green-200 text-green-700">
          <UserCheck className="h-3 w-3" />
          <span className="text-sm font-medium">{staff.filter(s => s.isEmailVerified).length} Verified</span>
        </Badge>

        <Badge variant="outline" className="h-8 px-3 flex items-center gap-2 bg-blue-50 border-blue-200 text-blue-700">
          <Plus className="h-3 w-3" />
          <span className="text-sm font-medium">
            {staff.filter(s => {
              const created = new Date(s.createdAt);
              const now = new Date();
              return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
            }).length} This Month
          </span>
        </Badge>
      </div>

      {/* Staff List */}
      <Card className=" max-w-[350px] md:max-w-full">
        <CardHeader>
          <CardTitle>Staff Members ({staff.length})</CardTitle>
          <CardDescription>
            Manage all staff accounts and their permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {staff.length > 0 ? (
            <>
              <div className="w-full overflow-x-auto -mx-4 sm:mx-0">
                <div className="min-w-full inline-block align-middle">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]">Staff Member</th>
                        <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                        <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                        <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {paginatedStaff.map((member) => (
                        <tr key={member.id} className="hover:bg-gray-50">
                          <td className="px-2 sm:px-4 py-3">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0">
                                <AvatarImage src={member.avatarUrl} />
                                <AvatarFallback className="text-xs sm:text-sm">{getInitials(member.name)}</AvatarFallback>
                              </Avatar>
                              <div className="min-w-0 flex-1">
                                <p className="font-medium truncate text-xs sm:text-sm">{member.name}</p>
                                <div className="flex items-center gap-1 text-xs text-gray-500 hidden sm:flex">
                                  <Mail className="h-3 w-3" />
                                  <span className="truncate">{member.email}</span>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-2 sm:px-4 py-3 whitespace-nowrap">
                            <Badge variant="secondary" className="text-xs">
                              Staff
                            </Badge>
                          </td>
                          <td className="px-2 sm:px-4 py-3 whitespace-nowrap">
                            {member.isEmailVerified ? (
                              <Badge variant="default" className="text-xs">
                                <UserCheck className="h-3 w-3 mr-1" />
                                <span className="hidden sm:inline">Verified</span>
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs">
                                <span className="hidden sm:inline">Unverified</span>
                              </Badge>
                            )}
                          </td>
                          <td className="px-2 sm:px-4 py-3 whitespace-nowrap">
                            <span className="text-xs sm:text-sm">{new Date(member.createdAt).toLocaleDateString()}</span>
                          </td>
                          <td className="px-2 sm:px-4 py-3 whitespace-nowrap">
                            <div className="flex gap-1">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openEditDialog(member)}
                                className="text-xs p-2"
                              >
                                <Edit2 className="h-3 w-3 sm:h-4 sm:w-4" />
                              </Button>
                              
                              <Button 
                                variant="destructive" 
                                size="sm"
                                onClick={() => handleDelete(member.id, member.name)}
                                className="text-xs p-2"
                              >
                                <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </>
          ) : (
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto text-gray-400 mb-3" />
              <p className="text-gray-500">No staff members found</p>
              <Button onClick={() => setIsCreateDialogOpen(true)} className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Add First Staff Member
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingStaff} onOpenChange={(open) => !open && setEditingStaff(null)}>
        <DialogContent className="max-w-md sm:max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Staff Account</DialogTitle>
            <DialogDescription>
              Update staff account information.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Full Name *</Label>
              <Input
                id="edit-name"
                value={editStaff.name}
                onChange={(e) => setEditStaff(prev => ({...prev, name: e.target.value}))}
                placeholder="Enter full name..."
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-email">Email *</Label>
              <Input
                id="edit-email"
                type="email"
                value={editStaff.email}
                onChange={(e) => setEditStaff(prev => ({...prev, email: e.target.value}))}
                placeholder="Enter email address..."
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-password">New Password (leave empty to keep current)</Label>
              <div className="relative">
                <Input
                  id="edit-password"
                  type={showPassword ? "text" : "password"}
                  value={editStaff.password}
                  onChange={(e) => setEditStaff(prev => ({...prev, password: e.target.value}))}
                  placeholder="Enter new password..."
                  disabled={isSubmitting}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Avatar Image</Label>
              <ImageUpload
                value={editStaff.avatarUrl}
                onChange={(url) => setEditStaff(prev => ({...prev, avatarUrl: url}))}
                disabled={isSubmitting}
                placeholder="Upload avatar image"
              />
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setEditingStaff(null)}
                disabled={isSubmitting}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
                {isSubmitting ? 'Updating...' : 'Update Staff Account'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminStaff; 