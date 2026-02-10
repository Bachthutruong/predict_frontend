import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
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
  Lock,
  User as UserIcon,
  ImageIcon
} from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import { useLanguage } from '../../hooks/useLanguage';
import { formatDate } from '../../lib/utils';
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
  const { t } = useLanguage();
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
      const staffData = response.data?.data || response.data || [];
      setStaff(Array.isArray(staffData) ? staffData : []);
    } catch (error) {
      console.error('Failed to load staff:', error);
      setStaff([]);
      toast({
        title: t('common.error'),
        description: t('admin.failedToLoadData'),
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
      title: t('common.success'),
      description: t('admin.staffRefreshed'),
      variant: "default"
    });
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await apiService.post('/admin/staff', newStaff);
      toast({
        title: t('common.success'),
        description: t('adminStaff.staffCreated'),
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
        title: t('common.error'),
        description: error.response?.data?.message || t('adminStaff.failedCreate'),
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
        title: t('common.success'),
        description: t('adminStaff.staffUpdated'),
        variant: "default"
      });
      setEditingStaff(null);
      loadStaff();
    } catch (error: any) {
      console.error('Update staff error:', error);
      toast({
        title: t('common.error'),
        description: error.response?.data?.message || t('adminStaff.failedUpdate'),
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
        title: t('common.success'),
        description: `${staffName} ${t('adminStaff.deletedSuccessfully')}`,
        variant: "default"
      });
      loadStaff();
    } catch (error: any) {
      console.error('Delete staff error:', error);
      toast({
        title: t('common.error'),
        description: error.response?.data?.message || t('adminStaff.failedDelete'),
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
    if (totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t border-gray-100">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
        >
          {t('common.previous')}
        </Button>
        <span className="text-sm text-gray-600">
          {t('admin.page')} {currentPage} {t('admin.of')} {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
        >
          {t('common.next')}
        </Button>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 flex flex-col items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <div className="text-lg text-gray-600">{t('adminStaff.loadingStaff')}</div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Shield className="h-8 w-8 text-blue-600" />
            {t('adminUsers.staffMembers')}
          </h1>
          <p className="text-gray-500 text-lg max-w-2xl">
            {t('adminUsers.createAndManageStaff')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={handleRefresh} variant="outline" size="sm" disabled={refreshing} className="shadow-sm border-gray-200 bg-white hover:bg-gray-50 text-gray-700 rounded-full px-4">
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''} sm:mr-2`} />
            <span className="hidden sm:inline">{t('adminUsers.refresh')}</span>
          </Button>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 shadow-md bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6">
                <Plus className="h-5 w-5" />
                <span className="hidden sm:inline font-medium">{t('adminUsers.addStaff')}</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md sm:max-w-xl mx-4 max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{t('adminStaff.createNewStaff')}</DialogTitle>
                <DialogDescription>
                  {t('adminStaff.fillInStaffDetails')}
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleCreateSubmit} className="space-y-6 py-4">
                <div className="space-y-3">
                  <Label htmlFor="name" className="text-sm font-semibold text-gray-700">{t('formFields.staffName')} <span className="text-red-500">*</span></Label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="name"
                      value={newStaff.name}
                      onChange={(e) => setNewStaff(prev => ({ ...prev, name: e.target.value }))}
                      placeholder={t('formFields.staffName')}
                      required
                      disabled={isSubmitting}
                      className="pl-9 h-11"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="email" className="text-sm font-semibold text-gray-700">{t('formFields.staffEmail')} <span className="text-red-500">*</span></Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      value={newStaff.email}
                      onChange={(e) => setNewStaff(prev => ({ ...prev, email: e.target.value }))}
                      placeholder={t('formFields.staffEmail')}
                      required
                      disabled={isSubmitting}
                      className="pl-9 h-11"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="password" className="text-sm font-semibold text-gray-700">{t('formFields.password')} <span className="text-red-500">*</span></Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={newStaff.password}
                      onChange={(e) => setNewStaff(prev => ({ ...prev, password: e.target.value }))}
                      placeholder={t('formFields.password')}
                      required
                      disabled={isSubmitting}
                      className="pl-9 h-11"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1 h-9 px-3 hover:bg-transparent text-gray-400 hover:text-gray-600"
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

                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <ImageIcon className="h-4 w-4 text-gray-500" />
                    {t('formFields.avatarUrl')}
                  </Label>
                  <ImageUpload
                    value={newStaff.avatarUrl}
                    onChange={(url) => setNewStaff(prev => ({ ...prev, avatarUrl: url }))}
                    disabled={isSubmitting}
                    placeholder={t('formFields.avatarUrlPlaceholder')}
                    className="w-full"
                  />
                </div>

                <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-100 mt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                    disabled={isSubmitting}
                    className="w-full sm:w-auto"
                  >
                    {t('formFields.cancel')}
                  </Button>
                  <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white shadow-md">
                    {isSubmitting ? t('formFields.saving') : t('formFields.saveStaff')}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="border-0 shadow-google bg-white">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-2">
              <Users className="h-5 w-5" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{staff.length}</div>
            <div className="text-xs text-gray-500 font-medium uppercase tracking-wider mt-1">{t('formFields.totalStaffLabel')}</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-google bg-white">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <div className="h-10 w-10 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-2">
              <UserCheck className="h-5 w-5" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{staff.filter(s => s.isEmailVerified).length}</div>
            <div className="text-xs text-gray-500 font-medium uppercase tracking-wider mt-1">{t('formFields.verifiedLabel')}</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-google bg-white">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <div className="h-10 w-10 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mb-2">
              <Plus className="h-5 w-5" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {staff.filter(s => {
                const created = new Date(s.createdAt);
                const now = new Date();
                return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
              }).length}
            </div>
            <div className="text-xs text-gray-500 font-medium uppercase tracking-wider mt-1">{t('formFields.thisMonthLabel')}</div>
          </CardContent>
        </Card>
      </div>

      {/* Staff List */}
      <Card className="border-0 shadow-google bg-white overflow-hidden rounded-xl">
        <CardHeader className="border-b border-gray-100 bg-white pb-6 pt-6 px-6">
          <CardTitle className="text-xl text-gray-800">{t('formFields.staffMembersLabel')} ({staff.length})</CardTitle>
          <CardDescription className="text-gray-500 mt-1">
            {t('formFields.manageStaffAccountsLabel')}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {staff.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50/50 border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('formFields.staffMemberLabel')}</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('formFields.roleLabel')}</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('formFields.statusLabel')}</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('formFields.joinedLabel')}</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('formFields.actions')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {paginatedStaff.map((member) => (
                      <tr key={member.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 border border-gray-100">
                              <AvatarImage src={member.avatarUrl} />
                              <AvatarFallback className="bg-blue-50 text-blue-600 font-medium text-xs">{getInitials(member.name)}</AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="font-medium text-gray-900 truncate">{member.name}</p>
                              <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                                <Mail className="h-3 w-3" />
                                <span className="truncate">{member.email}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant="secondary" className="font-normal capitalize border-gray-200 bg-purple-50 text-purple-700 hover:bg-purple-100">
                            <Shield className="h-3 w-3 mr-1" />
                            {t('adminUsers.staff')}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {member.isEmailVerified ? (
                            <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200 hover:bg-green-100 gap-1 pl-1.5">
                              <UserCheck className="h-3 w-3" />
                              <span className="hidden sm:inline">{t('formFields.verifiedLabel')}</span>
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200 hover:bg-red-100">
                              <span className="hidden sm:inline">{t('adminUsers.suspended')}</span>
                            </Badge>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(member.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditDialog(member)}
                              className="h-8 w-8 p-0 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(member.id, member.name)}
                              className="h-8 w-8 p-0 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="p-4 border-t border-gray-100 bg-gray-50/50">
                <PaginationControls
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500 font-medium">{t('adminStaff.noStaffFound')}</p>
              <Button onClick={() => setIsCreateDialogOpen(true)} className="mt-4 shadow-md bg-blue-600 hover:bg-blue-700 text-white rounded-full">
                <Plus className="h-4 w-4 mr-2" />
                {t('adminStaff.createFirstStaff')}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingStaff} onOpenChange={(open) => !open && setEditingStaff(null)}>
        <DialogContent className="max-w-md sm:max-w-xl mx-4 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('formFields.editStaff')}</DialogTitle>
            <DialogDescription>
              {t('adminStaff.fillInStaffDetails')}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleEditSubmit} className="space-y-6 py-4">
            <div className="space-y-3">
              <Label htmlFor="edit-name" className="text-sm font-semibold text-gray-700">{t('formFields.staffName')} <span className="text-red-500">*</span></Label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="edit-name"
                  value={editStaff.name}
                  onChange={(e) => setEditStaff(prev => ({ ...prev, name: e.target.value }))}
                  placeholder={t('formFields.staffName')}
                  required
                  disabled={isSubmitting}
                  className="pl-9 h-11"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="edit-email" className="text-sm font-semibold text-gray-700">{t('formFields.staffEmail')} <span className="text-red-500">*</span></Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="edit-email"
                  type="email"
                  value={editStaff.email}
                  onChange={(e) => setEditStaff(prev => ({ ...prev, email: e.target.value }))}
                  placeholder={t('formFields.staffEmail')}
                  required
                  disabled={isSubmitting}
                  className="pl-9 h-11"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="edit-password" className="text-sm font-semibold text-gray-700">{t('formFields.password')} <span className="text-gray-400 font-normal ml-1">({t('admin.leaveEmptyToKeep')})</span></Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="edit-password"
                  type={showPassword ? "text" : "password"}
                  value={editStaff.password}
                  onChange={(e) => setEditStaff(prev => ({ ...prev, password: e.target.value }))}
                  placeholder={t('formFields.passwordPlaceholder')}
                  disabled={isSubmitting}
                  className="pl-9 h-11"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1 h-9 px-3 hover:bg-transparent text-gray-400 hover:text-gray-600"
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

            <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-gray-500" />
                {t('formFields.avatarUrl')}
              </Label>
              <ImageUpload
                value={editStaff.avatarUrl}
                onChange={(url) => setEditStaff(prev => ({ ...prev, avatarUrl: url }))}
                disabled={isSubmitting}
                placeholder={t('formFields.avatarUrlPlaceholder')}
                className="w-full"
              />
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-100 mt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingStaff(null)}
                disabled={isSubmitting}
                className="w-full sm:w-auto"
              >
                {t('formFields.cancel')}
              </Button>
              <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white shadow-md">
                {isSubmitting ? t('formFields.saving') : t('formFields.updateStaff')}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminStaff;