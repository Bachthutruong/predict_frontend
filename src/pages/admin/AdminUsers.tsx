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
  Eye, 
  CheckCircle, 
  XCircle, 
  Coins,
  Calendar,
  Shield,
  UserCheck,
  UserX,
  Activity,
  RefreshCw,
} from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import apiService from '../../services/api';
import type { User, PointTransaction } from '../../types';

interface UserWithStats extends User {
  totalTransactions?: number;
  recentActivity?: string;
}

const AdminUsers: React.FC = () => {
  const { toast } = useToast();
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
        title: "Error",
        description: "Failed to load users. Please try again.",
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
      title: "Users Updated",
      description: "User list has been refreshed successfully.",
      variant: "default"
    });
  };

  const getRecentActivityText = (user: User) => {
    if (user.lastCheckInDate) {
      const daysSince = Math.floor((Date.now() - new Date(user.lastCheckInDate).getTime()) / (1000 * 60 * 60 * 24));
      if (daysSince === 0) return 'Active today';
      if (daysSince === 1) return 'Active yesterday';
      if (daysSince <= 7) return `Active ${daysSince} days ago`;
      return 'Inactive';
    }
    return 'Never active';
  };

  const filterUsers = () => {
    let filtered = [...users];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      if (statusFilter === 'verified') {
        filtered = filtered.filter(user => user.isEmailVerified);
      } else if (statusFilter === 'unverified') {
        filtered = filtered.filter(user => !user.isEmailVerified);
      }
    }

    setFilteredUsers(filtered);
  };

  const openUserModal = async (user: UserWithStats) => {
    setSelectedUser(user);
    setShowUserModal(true);
    
    // Load user transactions
    try {
      const response = await apiService.get(`/admin/users/${user.id}/transactions`);
      const transactionsData = response.data?.data || response.data || [];
      setUserTransactions(Array.isArray(transactionsData) ? transactionsData : []);
    } catch (error) {
      console.log('Could not load user transactions');
      setUserTransactions([]);
    }
  };

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await apiService.patch(`/admin/users/${userId}/status`, { 
        isEmailVerified: !currentStatus 
      });
      toast({
        title: "User Updated",
        description: `User ${!currentStatus ? 'verified' : 'unverified'} successfully`,
        variant: "default"
      });
      loadUsers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || 'Failed to update user status',
        variant: "destructive"
      });
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(part => part[0]).join('').toUpperCase().slice(0, 2);
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'staff': return 'secondary';
      default: return 'outline';
    }
  };

  const stats = {
    total: users.length,
    verified: users.filter(u => u.isEmailVerified).length,
    admins: users.filter(u => u.role === 'admin').length,
    staff: users.filter(u => u.role === 'staff').length,
    users: users.filter(u => u.role === 'user').length,
    totalPoints: users.reduce((sum, u) => sum + u.points, 0),
  };

  // Pagination calculations
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, roleFilter, statusFilter]);

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
            User Management
          </h1>
          <p className="text-gray-600 mt-2">
            Manage all users, verify accounts, and monitor activity
          </p>
        </div>
        <Button onClick={handleRefresh} variant="outline" size="sm" disabled={refreshing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="space-y-3">
        {/* Main Stats Row - Badges */}
        <div className="flex flex-wrap gap-3">
          <Badge variant="outline" className="h-8 px-3 flex items-center gap-2 bg-white border-gray-200">
            <Users className="h-3 w-3 text-gray-500" />
            <span className="text-sm font-medium">{stats.total} Total Users</span>
          </Badge>

          <Badge variant="outline" className="h-8 px-3 flex items-center gap-2 bg-green-50 border-green-200 text-green-700">
            <CheckCircle className="h-3 w-3" />
            <span className="text-sm font-medium">{stats.verified} Verified</span>
          </Badge>

          <Badge variant="outline" className="h-8 px-3 flex items-center gap-2 bg-red-50 border-red-200 text-red-700">
            <Shield className="h-3 w-3" />
            <span className="text-sm font-medium">{stats.admins} Admins</span>
          </Badge>

          <Badge variant="outline" className="h-8 px-3 flex items-center gap-2 bg-blue-50 border-blue-200 text-blue-700">
            <UserCheck className="h-3 w-3" />
            <span className="text-sm font-medium">{stats.staff} Staff</span>
          </Badge>

          <Badge variant="outline" className="h-8 px-3 flex items-center gap-2 bg-purple-50 border-purple-200 text-purple-700">
            <Users className="h-3 w-3" />
            <span className="text-sm font-medium">{stats.users} Regular Users</span>
          </Badge>

          <Badge variant="outline" className="h-8 px-3 flex items-center gap-2 bg-yellow-50 border-yellow-200 text-yellow-700">
            <Coins className="h-3 w-3" />
            <span className="text-sm font-medium">{stats.totalPoints.toLocaleString()} Points</span>
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters & Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="user">Users</SelectItem>
                <SelectItem value="staff">Staff</SelectItem>
                <SelectItem value="admin">Admins</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="unverified">Unverified</SelectItem>
              </SelectContent>
            </Select>
            <div className="text-sm text-gray-500 self-center">
              Showing {filteredUsers.length} of {users.length} users
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <Card className=" max-w-[350px] md:max-w-full">
        <CardHeader>
          <CardTitle>All Users ({filteredUsers.length})</CardTitle>
          <CardDescription>
            Manage user accounts, verification status, and view details
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredUsers.length > 0 ? (
            <>
              <div className="relative w-full overflow-auto">
                <table className="w-full caption-bottom text-sm">
                  <thead className="[&_tr]:border-b">
                    <tr className="border-b transition-colors hover:bg-muted/50">
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">User</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Role</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Points</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Activity</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Joined</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="[&_tr:last-child]:border-0">
                    {paginatedUsers.map((user) => (
                      <tr key={user.id} className="border-b transition-colors hover:bg-muted/50">
                        <td className="p-4 align-middle">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 flex-shrink-0">
                              <AvatarImage src={user.avatarUrl} />
                              <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1">
                              <p className="font-medium truncate">{user.name}</p>
                              <p className="text-sm text-gray-500 truncate">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 align-middle">
                          <Badge variant={getRoleBadgeVariant(user.role)} className="text-xs">
                            {user.role}
                          </Badge>
                        </td>
                        <td className="p-4 align-middle">
                          {user.isEmailVerified ? (
                            <Badge variant="outline" className="text-green-600 text-xs">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Verified
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-red-600 text-xs">
                              <XCircle className="h-3 w-3 mr-1" />
                              Unverified
                            </Badge>
                          )}
                        </td>
                        <td className="p-4 align-middle">
                          <div className="flex items-center gap-1">
                            <Coins className="h-4 w-4 text-gray-500" />
                            <span className="font-medium">{user.points}</span>
                          </div>
                        </td>
                        <td className="p-4 align-middle">
                          <div className="space-y-1 text-xs">
                            <div className="flex items-center gap-1">
                              <Activity className="h-3 w-3" />
                              <span>{user.consecutiveCheckIns} day streak</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>{user.recentActivity}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 align-middle">
                          <span className="text-sm">{new Date(user.createdAt).toLocaleDateString()}</span>
                        </td>
                        <td className="p-4 align-middle">
                          <div className="flex gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openUserModal(user)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {user.role !== 'admin' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => toggleUserStatus(user.id, user.isEmailVerified)}
                              >
                                {user.isEmailVerified ? (
                                  <UserX className="h-4 w-4" />
                                ) : (
                                  <UserCheck className="h-4 w-4" />
                                )}
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
              <p className="text-gray-500">No users found matching your criteria</p>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  setRoleFilter('all');
                  setStatusFilter('all');
                }}
                className="mt-4"
              >
                Clear Filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Detail Modal */}
      <Dialog open={showUserModal} onOpenChange={setShowUserModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Details
            </DialogTitle>
            <DialogDescription>
              Complete information and activity history for this user
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-6">
              {/* User Info */}
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedUser.avatarUrl} />
                  <AvatarFallback className="text-lg">
                    {getInitials(selectedUser.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-xl font-bold">{selectedUser.name}</h3>
                  <p className="text-gray-600">{selectedUser.email}</p>
                  <div className="flex gap-2 mt-2">
                    <Badge variant={getRoleBadgeVariant(selectedUser.role)}>
                      {selectedUser.role}
                    </Badge>
                    <Badge variant={selectedUser.isEmailVerified ? 'default' : 'destructive'}>
                      {selectedUser.isEmailVerified ? 'Verified' : 'Unverified'}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <Coins className="h-6 w-6 mx-auto text-blue-600 mb-1" />
                  <div className="text-2xl font-bold text-blue-600">{selectedUser.points}</div>
                  <div className="text-xs text-blue-600">Total Points</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <Activity className="h-6 w-6 mx-auto text-green-600 mb-1" />
                  <div className="text-2xl font-bold text-green-600">{selectedUser.consecutiveCheckIns}</div>
                  <div className="text-xs text-green-600">Check-in Streak</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <Users className="h-6 w-6 mx-auto text-purple-600 mb-1" />
                  <div className="text-2xl font-bold text-purple-600">{selectedUser.totalSuccessfulReferrals}</div>
                  <div className="text-xs text-purple-600">Referrals</div>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <Calendar className="h-6 w-6 mx-auto text-orange-600 mb-1" />
                  <div className="text-lg font-bold text-orange-600">
                    {new Date(selectedUser.createdAt).toLocaleDateString()}
                  </div>
                  <div className="text-xs text-orange-600">Joined</div>
                </div>
              </div>

              {/* Recent Transactions */}
              <div>
                <h4 className="font-medium mb-3">Recent Point Transactions</h4>
                {userTransactions.length > 0 ? (
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {userTransactions.slice(0, 10).map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg text-sm">
                        <div>
                          <p className="font-medium capitalize">{transaction.reason.replace('-', ' ')}</p>
                          <p className="text-gray-500 text-xs">
                            {new Date(transaction.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className={`font-bold ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No transactions found</p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsers; 