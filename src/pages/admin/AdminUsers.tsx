import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import {
  Users,
  Search,
  RefreshCw,
  Eye,
  Shield,
  UserCheck,
  UserX,
  // Ban,
  Calendar,
  Coins,
  // TrendingUp,
  // Activity
} from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import { useLanguage } from '../../hooks/useLanguage';
import apiService from '../../services/api';
import type { User, PointTransaction } from '../../types';
import { formatDate } from '../../lib/utils';

interface UserWithStats extends User {
  recentActivity: string;
  lastLoginAt?: string;
  status?: string;
  avatar?: string;
}

const AdminUsers: React.FC = () => {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [users, setUsers] = useState<UserWithStats[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserWithStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<UserWithStats | null>(null);
  const [userTransactions, setUserTransactions] = useState<PointTransaction[]>([]);
  const [showUserModal, setShowUserModal] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, roleFilter, statusFilter]);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const response = await apiService.get('/admin/users');
      const usersData = response.data?.data || response.data || [];
      const processedUsers = Array.isArray(usersData) ? usersData.map((user: User) => ({
        ...user,
        recentActivity: getRecentActivityText(user),
      })) : [];
      setUsers(processedUsers);
    } catch (error) {
      console.error('Failed to load users:', error);
      setUsers([]);
      toast({
        title: t('common.error'),
        description: t('admin.failedToLoadUsers'),
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadUsers();
    setRefreshing(false);
    toast({
      title: t('admin.usersUpdated'),
      description: t('admin.userListRefreshed'),
      variant: "default"
    });
  };

  const getRecentActivityText = (user: User): string => {
    if ((user as any).lastLoginAt) {
      return `${t('admin.lastLogin')} ${formatDate((user as any).lastLoginAt)}`;
    }
    return t('admin.noRecentActivity');
  };

  const filterUsers = () => {
    let filtered = users;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => user.status === statusFilter);
    }

    setFilteredUsers(filtered);
    setCurrentPage(1);
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await apiService.patch(`/admin/users/${userId}/role`, { role: newRole });
      await loadUsers();
      toast({
        title: t('admin.roleChanged'),
        description: t('admin.roleChangedSuccessfully'),
        variant: "default"
      });
    } catch (error) {
      console.error('Failed to change user role:', error);
      toast({
        title: t('common.error'),
        description: t('admin.failedToChangeRole'),
        variant: "destructive"
      });
    }
  };

  const handleStatusChange = async (userId: string, newStatus: string) => {
    try {
      await apiService.patch(`/admin/users/${userId}/status`, { status: newStatus });
      await loadUsers();
      toast({
        title: t('admin.statusChanged'),
        description: t('admin.statusChangedSuccessfully'),
        variant: "default"
      });
    } catch (error) {
      console.error('Failed to change user status:', error);
      toast({
        title: t('common.error'),
        description: t('admin.failedToChangeStatus'),
        variant: "destructive"
      });
    }
  };

  const loadUserTransactions = async (userId: string) => {
    try {
      const response = await apiService.get(`/admin/users/${userId}/transactions`);
      const transactionsData = response.data?.data || response.data || [];
      setUserTransactions(Array.isArray(transactionsData) ? transactionsData : []);
    } catch (error) {
      console.error('Failed to load user transactions:', error);
      setUserTransactions([]);
    }
  };

  const openUserModal = async (user: UserWithStats) => {
    setSelectedUser(user);
    setShowUserModal(true);
    await loadUserTransactions(user.id);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(part => part[0]).join('').toUpperCase().slice(0, 2);
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'suspended': return 'secondary';
      case 'banned': return 'destructive';
      default: return 'outline';
    }
  };

  const getRoleVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'staff': return 'default';
      case 'user': return 'secondary';
      default: return 'outline';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/3 animate-pulse"></div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
        <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3 text-gray-800">
            <Users className="h-8 w-8 text-blue-600" />
            {t('admin.userManagement')}
          </h1>
          <p className="text-gray-500 mt-2 text-lg">
            {t('admin.manageAllUsers')}
          </p>
        </div>
        <Button onClick={handleRefresh} variant="outline" size="sm" disabled={refreshing} className="bg-white hover:bg-gray-50 border-gray-200">
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          {t('common.refresh')}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border border-gray-100 shadow-google bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">{t('admin.totalUsers')}</CardTitle>
            <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center">
              <Users className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-800">{users.length}</div>
            <p className="text-xs text-blue-600 mt-1 font-medium bg-blue-50 inline-block px-2 py-0.5 rounded-full">
              {t('admin.allUsers')}
            </p>
          </CardContent>
        </Card>

        <Card className="border border-gray-100 shadow-google bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">{t('admin.activeUsers')}</CardTitle>
            <div className="h-8 w-8 rounded-full bg-green-50 flex items-center justify-center">
              <UserCheck className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-800">
              {users.filter(u => u.status === 'active').length}
            </div>
            <p className="text-xs text-green-600 mt-1 font-medium bg-green-50 inline-block px-2 py-0.5 rounded-full">
              {t('admin.activeStatus')}
            </p>
          </CardContent>
        </Card>

        <Card className="border border-gray-100 shadow-google bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">{t('admin.staffMembers')}</CardTitle>
            <div className="h-8 w-8 rounded-full bg-indigo-50 flex items-center justify-center">
              <Shield className="h-4 w-4 text-indigo-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-800">
              {users.filter(u => u.role === 'staff' || u.role === 'admin').length}
            </div>
            <p className="text-xs text-indigo-600 mt-1 font-medium bg-indigo-50 inline-block px-2 py-0.5 rounded-full">
              {t('admin.staffAndAdmin')}
            </p>
          </CardContent>
        </Card>

        <Card className="border border-gray-100 shadow-google bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">{t('admin.suspendedUsers')}</CardTitle>
            <div className="h-8 w-8 rounded-full bg-orange-50 flex items-center justify-center">
              <UserX className="h-4 w-4 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-800">
              {users.filter(u => u.status === 'suspended' || u.status === 'banned').length}
            </div>
            <p className="text-xs text-orange-600 mt-1 font-medium bg-orange-50 inline-block px-2 py-0.5 rounded-full">
              {t('admin.suspendedOrBanned')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Card */}
      <Card className="border-0 shadow-google bg-white overflow-hidden rounded-xl">
        <CardHeader className="border-b border-gray-100 bg-white pb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-xl text-gray-800">{t('admin.usersList')}</CardTitle>
              <CardDescription className="text-gray-500 mt-1">
                {t('admin.showingResults', { count: filteredUsers.length, total: users.length })}
              </CardDescription>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder={t('admin.searchUsers')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full sm:w-64 bg-gray-50 border-transparent focus:bg-white focus:border-blue-500 transition-all"
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full sm:w-32 bg-gray-50 border-transparent focus:bg-white transition-all">
                  <SelectValue placeholder={t('admin.role')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('admin.allRoles')}</SelectItem>
                  <SelectItem value="user">{t('admin.user')}</SelectItem>
                  <SelectItem value="staff">{t('admin.staff')}</SelectItem>
                  <SelectItem value="admin">{t('admin.admin')}</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-32 bg-gray-50 border-transparent focus:bg-white transition-all">
                  <SelectValue placeholder={t('admin.status')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('admin.allStatuses')}</SelectItem>
                  <SelectItem value="active">{t('admin.active')}</SelectItem>
                  <SelectItem value="suspended">{t('admin.suspended')}</SelectItem>
                  <SelectItem value="banned">{t('admin.banned')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 font-medium">{t('admin.user')}</th>
                  <th className="px-6 py-4 font-medium">{t('admin.role')}</th>
                  <th className="px-6 py-4 font-medium">{t('admin.status')}</th>
                  <th className="px-6 py-4 font-medium">{t('admin.activity')}</th>
                  <th className="px-6 py-4 font-medium text-right">{t('admin.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((user) => (
                  <tr key={user.id} className="bg-white hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-10 w-10 border border-gray-100">
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback className="bg-blue-50 text-blue-600 font-medium">{getInitials(user.name || '')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-gray-900">{user.name}</div>
                          <div className="text-xs text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={getRoleVariant(user.role)} className="capitalize">
                        {t(`admin.${user.role}`)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={getStatusVariant(user.status || 'active')} className="capitalize">
                        {t(`admin.${user.status || 'active'}`)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {user.recentActivity}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openUserModal(user)}
                        className="text-gray-500 hover:text-blue-600 hover:bg-blue-50"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredUsers.length > itemsPerPage && (
            <div className="flex justify-center py-6 border-t border-gray-100">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="h-8 w-8 p-0"
                >
                  <span className="sr-only">{t('common.previous')}</span>
                  &lt;
                </Button>
                <div className="flex items-center gap-1 mx-2">
                  <span className="text-sm font-medium text-gray-900">{currentPage}</span>
                  <span className="text-sm text-gray-500">/</span>
                  <span className="text-sm text-gray-500">{Math.ceil(filteredUsers.length / itemsPerPage)}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(Math.ceil(filteredUsers.length / itemsPerPage), prev + 1))}
                  disabled={currentPage === Math.ceil(filteredUsers.length / itemsPerPage)}
                  className="h-8 w-8 p-0"
                >
                  <span className="sr-only">{t('common.next')}</span>
                  &gt;
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Details Modal */}
      <Dialog open={showUserModal} onOpenChange={setShowUserModal}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto p-0 gap-0 rounded-2xl">
          <DialogHeader className="p-6 border-b border-gray-100">
            <DialogTitle className="text-2xl font-bold text-gray-800">{t('admin.userDetails')}</DialogTitle>
            <DialogDescription className="text-gray-500">
              {t('admin.userDetailsDescription')}
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="p-6 space-y-8">
              {/* User Info Header */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
                  <AvatarImage src={selectedUser.avatar} />
                  <AvatarFallback className="text-2xl bg-blue-50 text-blue-600 rounded-none">{getInitials(selectedUser.name || '')}</AvatarFallback>
                </Avatar>
                <div className="text-center sm:text-left flex-1">
                  <h3 className="text-2xl font-bold text-gray-900">{selectedUser.name}</h3>
                  <p className="text-gray-500">{selectedUser.email}</p>
                  <div className="flex flex-wrap justify-center sm:justify-start gap-3 mt-4">
                    <Badge variant={getRoleVariant(selectedUser.role)} className="px-3 py-1 rounded-full text-sm">
                      {t(`admin.${selectedUser.role}`)}
                    </Badge>
                    <Badge variant={getStatusVariant(selectedUser.status || 'active')} className="px-3 py-1 rounded-full text-sm">
                      {t(`admin.${selectedUser.status || 'active'}`)}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* User Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-5 bg-yellow-50 rounded-xl border border-yellow-100">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      <Coins className="h-5 w-5 text-yellow-600" />
                    </div>
                    <span className="font-medium text-gray-700">{t('admin.totalPoints')}</span>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{selectedUser.points || 0}</p>
                </div>
                <div className="p-5 bg-blue-50 rounded-xl border border-blue-100">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      <Calendar className="h-5 w-5 text-blue-600" />
                    </div>
                    <span className="font-medium text-gray-700">{t('admin.memberSince')}</span>
                  </div>
                  <p className="text-lg font-semibold text-gray-900 mt-1">{formatDate(selectedUser.createdAt)}</p>
                </div>
              </div>

              {/* Admin Actions */}
              <div className="space-y-4 pt-4 border-t border-gray-100">
                <h4 className="font-semibold text-gray-900 text-lg">{t('admin.accountManagement')}</h4>
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600">{t('admin.changeRole')}</label>
                    <Select
                      value={selectedUser.role}
                      onValueChange={(value) => handleRoleChange(selectedUser.id, value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">{t('admin.user')}</SelectItem>
                        <SelectItem value="staff">{t('admin.staff')}</SelectItem>
                        <SelectItem value="admin">{t('admin.admin')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600">{t('admin.changeStatus')}</label>
                    <Select
                      value={selectedUser.status}
                      onValueChange={(value) => handleStatusChange(selectedUser.id, value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">{t('admin.active')}</SelectItem>
                        <SelectItem value="suspended">{t('admin.suspended')}</SelectItem>
                        <SelectItem value="banned">{t('admin.banned')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Recent Transactions */}
              <div className="pt-4 border-t border-gray-100">
                <h4 className="font-semibold text-gray-900 text-lg mb-4">{t('admin.recentTransactions')}</h4>
                <div className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                  {userTransactions.length > 0 ? (
                    userTransactions.slice(0, 5).map((transaction) => (
                      <div key={transaction.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{transaction.reason}</p>
                          <p className="text-xs text-gray-500">
                            {formatDate(transaction.createdAt)}
                          </p>
                        </div>
                        <span className={`font-bold ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                      {t('admin.noTransactions')}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsers; 