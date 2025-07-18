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
      return `${t('admin.lastLogin')} ${new Date((user as any).lastLoginAt).toLocaleDateString()}`;
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
            {t('admin.userManagement')}
          </h1>
          <p className="text-gray-600 mt-2">
            {t('admin.manageAllUsers')}
          </p>
        </div>
        <Button onClick={handleRefresh} variant="outline" size="sm" disabled={refreshing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          {t('common.refresh')}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('admin.totalUsers')}</CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-xs text-gray-500">{t('admin.allUsers')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('admin.activeUsers')}</CardTitle>
            <UserCheck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {users.filter(u => u.status === 'active').length}
            </div>
            <p className="text-xs text-gray-500">{t('admin.activeStatus')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('admin.staffMembers')}</CardTitle>
            <Shield className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {users.filter(u => u.role === 'staff' || u.role === 'admin').length}
            </div>
            <p className="text-xs text-gray-500">{t('admin.staffAndAdmin')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('admin.suspendedUsers')}</CardTitle>
            <UserX className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {users.filter(u => u.status === 'suspended' || u.status === 'banned').length}
            </div>
            <p className="text-xs text-gray-500">{t('admin.suspendedOrBanned')}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>{t('admin.filters')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder={t('admin.searchUsers')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder={t('admin.selectRole')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('admin.allRoles')}</SelectItem>
                <SelectItem value="user">{t('admin.user')}</SelectItem>
                <SelectItem value="staff">{t('admin.staff')}</SelectItem>
                <SelectItem value="admin">{t('admin.admin')}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder={t('admin.selectStatus')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('admin.allStatuses')}</SelectItem>
                <SelectItem value="active">{t('admin.active')}</SelectItem>
                <SelectItem value="suspended">{t('admin.suspended')}</SelectItem>
                <SelectItem value="banned">{t('admin.banned')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle>{t('admin.usersList')}</CardTitle>
          <CardDescription>
            {t('admin.showingResults', { count: filteredUsers.length, total: users.length })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback>{getInitials(user.name || '')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-medium">{user.name}</h4>
                    <p className="text-sm text-gray-500">{user.email}</p>
                    <p className="text-xs text-gray-400">{user.recentActivity}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={getRoleVariant(user.role)}>
                    {t(`admin.${user.role}`)}
                  </Badge>
                                     <Badge variant={getStatusVariant(user.status || 'active')}>
                     {t(`admin.${user.status || 'active'}`)}
                   </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openUserModal(user)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {filteredUsers.length > itemsPerPage && (
            <div className="flex justify-center mt-6">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  {t('common.previous')}
                </Button>
                <span className="flex items-center px-3 text-sm">
                  {t('admin.page')} {currentPage} {t('admin.of')} {Math.ceil(filteredUsers.length / itemsPerPage)}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(Math.ceil(filteredUsers.length / itemsPerPage), prev + 1))}
                  disabled={currentPage === Math.ceil(filteredUsers.length / itemsPerPage)}
                >
                  {t('common.next')}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Details Modal */}
      <Dialog open={showUserModal} onOpenChange={setShowUserModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('admin.userDetails')}</DialogTitle>
            <DialogDescription>
              {t('admin.userDetailsDescription')}
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-6">
              {/* User Info */}
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedUser.avatar} />
                  <AvatarFallback>{getInitials(selectedUser.name || '')}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">{selectedUser.name}</h3>
                  <p className="text-gray-500">{selectedUser.email}</p>
                  <div className="flex gap-2 mt-2">
                    <Badge variant={getRoleVariant(selectedUser.role)}>
                      {t(`admin.${selectedUser.role}`)}
                    </Badge>
                                         <Badge variant={getStatusVariant(selectedUser.status || 'active')}>
                       {t(`admin.${selectedUser.status || 'active'}`)}
                     </Badge>
                  </div>
                </div>
              </div>

              {/* User Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <Coins className="h-5 w-5 text-yellow-500" />
                    <span className="font-medium">{t('admin.totalPoints')}</span>
                  </div>
                  <p className="text-2xl font-bold">{selectedUser.points || 0}</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-blue-500" />
                    <span className="font-medium">{t('admin.memberSince')}</span>
                  </div>
                  <p className="text-sm">{new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Role and Status Management */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">{t('admin.changeRole')}</label>
                  <Select
                    value={selectedUser.role}
                    onValueChange={(value) => handleRoleChange(selectedUser.id, value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">{t('admin.user')}</SelectItem>
                      <SelectItem value="staff">{t('admin.staff')}</SelectItem>
                      <SelectItem value="admin">{t('admin.admin')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">{t('admin.changeStatus')}</label>
                  <Select
                    value={selectedUser.status}
                    onValueChange={(value) => handleStatusChange(selectedUser.id, value)}
                  >
                    <SelectTrigger>
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

              {/* Recent Transactions */}
              <div>
                <h4 className="font-medium mb-3">{t('admin.recentTransactions')}</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {userTransactions.length > 0 ? (
                    userTransactions.slice(0, 5).map((transaction) => (
                      <div key={transaction.id} className="flex justify-between items-center p-2 border rounded">
                        <div>
                          <p className="text-sm font-medium">{transaction.reason}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(transaction.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <span className={`font-medium ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">{t('admin.noTransactions')}</p>
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