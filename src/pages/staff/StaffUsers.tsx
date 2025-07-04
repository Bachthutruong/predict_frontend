import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { 
  Users, 
  Search, 
  UserCheck,
  Calendar,
  TrendingUp,
  RefreshCw,
  Shield
} from 'lucide-react';
import apiService from '../../services/api';
import type { User } from '../../types';

const StaffUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    // Filter users based on search query
    if (searchQuery.trim() === '') {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user => 
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [users, searchQuery]);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const response = await apiService.get('/staff/users');
      // Handle API response structure and filter out admins and staff
      const usersData = response.data?.data?.users || response.data?.users || response.data?.data || response.data || [];
      const regularUsers = Array.isArray(usersData) ? usersData.filter((user: User) => user.role === 'user') : [];
      setUsers(regularUsers);
    } catch (error) {
      console.error('Failed to load users:', error);
      setUsers([]); // Set empty array on error
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserStatusUpdate = async (userId: string, isEmailVerified: boolean) => {
    try {
      await apiService.patch(`/staff/users/${userId}/status`, { isEmailVerified });
      loadUsers();
    } catch (error) {
      console.error('Failed to update user status:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid gap-4 md:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const verifiedUsers = users.filter(user => user.isEmailVerified);
  const totalPoints = users.reduce((sum, user) => sum + user.points, 0);
  const averagePoints = users.length > 0 ? Math.round(totalPoints / users.length) : 0;

  const getInitials = (name: string) => {
    return name.split(' ').map(part => part[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8 text-blue-600" />
            Staff: User Management
          </h1>
          <p className="text-gray-600 mt-2">
            Monitor and manage registered users
          </p>
        </div>
        <Button onClick={loadUsers} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-xs text-gray-500">Regular user accounts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified Users</CardTitle>
            <UserCheck className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{verifiedUsers.length}</div>
            <p className="text-xs text-gray-500">
              {users.length > 0 ? Math.round((verifiedUsers.length / users.length) * 100) : 0}% verification rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Points</CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totalPoints.toLocaleString()}</div>
            <p className="text-xs text-gray-500">
              {averagePoints} average per user
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(user => {
                const created = new Date(user.createdAt);
                const now = new Date();
                return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
              }).length}
            </div>
            <p className="text-xs text-gray-500">New registrations</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Search Users</CardTitle>
          <CardDescription>
            Find users by name or email address
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle>Users ({filteredUsers.length})</CardTitle>
          <CardDescription>
            {searchQuery ? `Search results for "${searchQuery}"` : 'All registered users'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredUsers.length > 0 ? (
            <div className="space-y-4">
              {filteredUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-medium">
                        {getInitials(user.name)}
                      </div>
                      {user.isEmailVerified && (
                        <div className="absolute -bottom-1 -right-1 bg-green-500 text-white rounded-full p-1">
                          <UserCheck className="h-3 w-3" />
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{user.name}</h3>
                        {!user.isEmailVerified && (
                          <Badge variant="secondary">Unverified</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">{user.email}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                        {user.lastCheckInDate && (
                          <span>Last check-in {new Date(user.lastCheckInDate).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-mono">
                          {user.points} pts
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        <div>{user.consecutiveCheckIns || 0} day streak</div>
                        {user.referralCode && (
                          <div>Ref: {user.referralCode}</div>
                        )}
                      </div>
                    </div>
                    
                    {/* Staff can toggle verification status */}
                    <Button
                      size="sm"
                      variant={user.isEmailVerified ? "destructive" : "default"}
                      onClick={() => handleUserStatusUpdate(user.id, !user.isEmailVerified)}
                    >
                      {user.isEmailVerified ? 'Unverify' : 'Verify'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto text-gray-400 mb-3" />
              <h3 className="text-lg font-medium mb-2">
                {searchQuery ? 'No users found' : 'No users yet'}
              </h3>
              <p className="text-gray-500">
                {searchQuery 
                  ? 'Try adjusting your search query'
                  : 'Users will appear here once they register'
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StaffUsers; 