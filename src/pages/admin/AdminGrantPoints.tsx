import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { 
  Coins, 
  User, 
  Gift, 
  // DollarSign, 
  // Crown, 
  // Send,
  // Loader2,
  // Search,
  Plus,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import apiService from '../../services/api';
import type { User as UserType, PointTransaction } from '../../types';

interface GrantPointsData {
  userId: string;
  amount: number;
  notes: string;
}

const AdminGrantPoints: React.FC = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserType[]>([]);
  const [transactions, setTransactions] = useState<PointTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
    // const [result, setResult] = useState<{success: boolean, message?: string} | null>(null);
  
  const [grantData, setGrantData] = useState<GrantPointsData>({
    userId: '',
    amount: 10,
    notes: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Load users first
      const usersResponse = await apiService.get('/admin/users');
      const usersData = usersResponse.data?.data || usersResponse.data || [];
      const filteredUsers = Array.isArray(usersData) ? usersData.filter((u: UserType) => u.role !== 'admin') : [];
      setUsers(filteredUsers);

      // Try to load transactions, but don't fail if endpoint doesn't exist
      try {
        const transactionsResponse = await apiService.get('/admin/transactions');
        const transactionsData = transactionsResponse.data?.data || transactionsResponse.data || [];
        const filteredTransactions = Array.isArray(transactionsData) 
          ? transactionsData.filter((t: PointTransaction) => t.reason === 'admin-grant' && t.user) 
          : [];
        setTransactions(filteredTransactions);
      } catch (transactionError) {
        console.log('Transactions endpoint not available, using empty array');
        setTransactions([]);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      setUsers([]);
      setTransactions([]);
      toast({
        title: "Error",
        description: "Failed to load users data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await apiService.post('/admin/grant-points', grantData);
      toast({
        title: "Success!",
        description: `${grantData.amount > 0 ? 'Granted' : 'Deducted'} ${Math.abs(grantData.amount)} points successfully`,
        variant: "default"
      });
      setGrantData({
        userId: '',
        amount: 10,
        notes: '',
      });
      setIsDialogOpen(false);
      loadData(); // Refresh the data
    } catch (error: any) {
      console.error('Grant points error:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || 'Failed to grant points. Please try again.',
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedUser = users.find(u => u.id === grantData.userId);

  const getInitials = (name: string) => {
    return name.split(' ').map(part => part[0]).join('').toUpperCase().slice(0, 2);
  };

  const totalPointsGranted = transactions.reduce((sum, t) => sum + (t.amount > 0 ? t.amount : 0), 0);
  const totalPointsDeducted = transactions.reduce((sum, t) => sum + (t.amount < 0 ? Math.abs(t.amount) : 0), 0);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/3 animate-pulse"></div>
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
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
            <Coins className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
            Grant Points
          </h1>
          <p className="text-gray-600 mt-2">
            Manually grant or deduct points for users with detailed tracking
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Grant Points</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md sm:max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Grant Points to User</DialogTitle>
              <DialogDescription>
                Award or deduct points for a specific user with optional notes.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="user">Select User *</Label>
                <select
                  value={grantData.userId} 
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setGrantData(prev => ({...prev, userId: e.target.value}))}
                  required
                  disabled={isSubmitting}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Choose a user...</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} - {user.points} pts
                    </option>
                  ))}
                </select>
                {selectedUser && (
                  <div className="text-sm text-gray-500">
                    Current balance: <span className="font-medium">{selectedUser.points} points</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount *</Label>
                <Input
                  id="amount"
                  type="number"
                  min="-10000"
                  max="10000"
                  value={grantData.amount}
                  onChange={(e) => setGrantData(prev => ({...prev, amount: parseInt(e.target.value) || 0}))}
                  required
                  disabled={isSubmitting}
                  placeholder="Enter points amount (negative to deduct)"
                />
                <div className="text-xs text-gray-500">
                  Enter a positive number to add points, negative to deduct points
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={grantData.notes}
                  onChange={(e) => setGrantData(prev => ({...prev, notes: e.target.value}))}
                  placeholder="Optional reason for granting/deducting points..."
                  disabled={isSubmitting}
                  rows={3}
                />
              </div>

              {selectedUser && grantData.amount !== 0 && (
                <Alert>
                  <Gift className="h-4 w-4" />
                  <AlertDescription>
                    {grantData.amount > 0 ? (
                      <>
                        <strong>{selectedUser.name}</strong> will receive <strong>+{grantData.amount} points</strong>
                        <br />
                        New balance: <strong>{selectedUser.points + grantData.amount} points</strong>
                      </>
                    ) : (
                      <>
                        <strong>{selectedUser.name}</strong> will lose <strong>{Math.abs(grantData.amount)} points</strong>
                        <br />
                        New balance: <strong>{selectedUser.points + grantData.amount} points</strong>
                      </>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex flex-col sm:flex-row gap-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting || !grantData.userId || grantData.amount === 0}
                  className="w-full sm:w-auto"
                >
                  {isSubmitting ? 'Processing...' : grantData.amount > 0 ? 'Grant Points' : 'Deduct Points'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <Coins className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{transactions.length}</div>
            <p className="text-xs text-gray-500">Manual point operations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Points Granted</CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-green-600">+{totalPointsGranted}</div>
            <p className="text-xs text-gray-500">Total points added</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Points Deducted</CardTitle>
            <TrendingDown className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-red-600">-{totalPointsDeducted}</div>
            <p className="text-xs text-gray-500">Total points removed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Impact</CardTitle>
            <Gift className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className={`text-xl sm:text-2xl font-bold ${totalPointsGranted - totalPointsDeducted >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {totalPointsGranted - totalPointsDeducted >= 0 ? '+' : ''}{totalPointsGranted - totalPointsDeducted}
            </div>
            <p className="text-xs text-gray-500">Overall point change</p>
          </CardContent>
        </Card>
      </div>

      {/* Users & Transactions */}
      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="users" className="text-sm">
            Users ({users.length})
          </TabsTrigger>
          <TabsTrigger value="transactions" className="text-sm">
            Transactions ({transactions.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>All Users</CardTitle>
              <CardDescription>
                Select users to grant or deduct points
              </CardDescription>
            </CardHeader>
            <CardContent>
              {users.length > 0 ? (
                <div className="space-y-4">
                  {users.map((user) => (
                    <div key={user.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg gap-3">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <Avatar className="h-10 w-10 flex-shrink-0">
                          <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium truncate">{user.name}</p>
                          <p className="text-sm text-gray-500 truncate">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-3 flex-shrink-0">
                        <div className="text-center sm:text-right">
                          <p className="font-bold text-lg">{user.points}</p>
                          <p className="text-xs text-gray-500">points</p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => {
                            setGrantData(prev => ({ ...prev, userId: user.id }));
                            setIsDialogOpen(true);
                          }}
                          className="flex-shrink-0"
                        >
                          <Coins className="h-4 w-4 sm:mr-1" />
                          <span className="hidden sm:inline">Grant</span>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <User className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                  <p className="text-gray-500">No users found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Recent Point Transactions</CardTitle>
              <CardDescription>
                History of manually granted/deducted points
              </CardDescription>
            </CardHeader>
            <CardContent>
              {transactions.length > 0 ? (
                <div className="space-y-4">
                  {transactions.map((transaction) => (
                    <div key={transaction.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg gap-3">
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <div className={`p-2 rounded-full flex-shrink-0 ${transaction.amount > 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                          {transaction.amount > 0 ? (
                            <TrendingUp className="h-4 w-4 text-green-600" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-red-600" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium">
                            {transaction.amount > 0 ? 'Points Granted' : 'Points Deducted'}
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            To: <span className="font-medium">{transaction.user?.name || 'Unknown User'}</span>
                          </p>
                          {transaction.notes && (
                            <p className="text-xs text-gray-500 line-clamp-2">
                              "{transaction.notes}"
                            </p>
                          )}
                          <p className="text-xs text-gray-500">
                            {new Date(transaction.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-center sm:text-right flex-shrink-0">
                        <p className={`font-bold text-lg ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                        </p>
                        <p className="text-xs text-gray-500">points</p>
                        {transaction.admin && (
                          <p className="text-xs text-gray-500">
                            by {transaction.admin?.name || 'Unknown Admin'}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Coins className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                  <p className="text-gray-500">No transactions yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common point granting scenarios
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
            <Button 
              variant="outline" 
              className="h-auto flex-col p-4 text-center"
              onClick={() => {
                setGrantData(prev => ({ ...prev, amount: 50, notes: 'Bonus for excellent participation' }));
                setIsDialogOpen(true);
              }}
            >
              <Gift className="h-6 w-6 mb-2" />
              <span className="font-medium text-xs sm:text-sm">Participation Bonus</span>
              <span className="text-xs opacity-80">+50 points</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-auto flex-col p-4 text-center"
              onClick={() => {
                setGrantData(prev => ({ ...prev, amount: 100, notes: 'Special event reward' }));
                setIsDialogOpen(true);
              }}
            >
              <TrendingUp className="h-6 w-6 mb-2" />
              <span className="font-medium text-xs sm:text-sm">Event Reward</span>
              <span className="text-xs opacity-80">+100 points</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-auto flex-col p-4 text-center"
              onClick={() => {
                setGrantData(prev => ({ ...prev, amount: -25, notes: 'Penalty for inappropriate behavior' }));
                setIsDialogOpen(true);
              }}
            >
              <TrendingDown className="h-6 w-6 mb-2" />
              <span className="font-medium text-xs sm:text-sm">Minor Penalty</span>
              <span className="text-xs opacity-80">-25 points</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-auto flex-col p-4 text-center"
              onClick={() => {
                setGrantData(prev => ({ ...prev, amount: 0, notes: '' }));
                setIsDialogOpen(true);
              }}
            >
              <Coins className="h-6 w-6 mb-2" />
              <span className="font-medium text-xs sm:text-sm">Custom Amount</span>
              <span className="text-xs opacity-80">Set your own</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminGrantPoints; 