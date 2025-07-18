import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Badge } from '../../components/ui/badge';
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
import { useLanguage } from '../../hooks/useLanguage';
import apiService from '../../services/api';
import type { User as UserType, PointTransaction } from '../../types';

interface GrantPointsData {
  userId: string;
  amount: number;
  notes: string;
}

const AdminGrantPoints: React.FC = () => {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [users, setUsers] = useState<UserType[]>([]);
  const [transactions, setTransactions] = useState<PointTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Pagination states  
  const [usersCurrentPage, setUsersCurrentPage] = useState(1);
  const [transactionsCurrentPage, setTransactionsCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
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
        title: t('common.error'),
        description: t('admin.failedToLoadUsers'),
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
        title: t('common.success'),
        description: `${grantData.amount > 0 ? t('admin.granted') : t('admin.deducted')} ${Math.abs(grantData.amount)} ${t('admin.points')} ${t('common.success')}`,
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
        title: t('common.error'),
        description: error.response?.data?.message || t('admin.failedToGrantPoints'),
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

  // Pagination calculations
  const usersTotalPages = Math.ceil(users.length / itemsPerPage);
  const transactionsTotalPages = Math.ceil(transactions.length / itemsPerPage);
  
  const paginatedUsers = users.slice(
    (usersCurrentPage - 1) * itemsPerPage,
    usersCurrentPage * itemsPerPage
  );
  const paginatedTransactions = transactions.slice(
    (transactionsCurrentPage - 1) * itemsPerPage,
    transactionsCurrentPage * itemsPerPage
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
          {t('admin.previous')}
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
          {t('admin.next')}
        </Button>
      </div>
    );
  };

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
            {t('admin.grantPoints')}
          </h1>
          <p className="text-gray-600 mt-2">
            {t('admin.grantPointsDescription')}
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">{t('admin.grantPoints')}</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md sm:max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t('admin.grantPointsToUser')}</DialogTitle>
              <DialogDescription>
                {t('admin.grantPointsDescription')}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="user">{t('admin.selectUser')}</Label>
                <select
                  value={grantData.userId} 
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setGrantData(prev => ({...prev, userId: e.target.value}))}
                  required
                  disabled={isSubmitting}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">{t('admin.chooseUser')}</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} - {user.points} {t('admin.points')}
                    </option>
                  ))}
                </select>
                {selectedUser && (
                  <div className="text-sm text-gray-500">
                    {t('admin.currentBalance')}: <span className="font-medium">{selectedUser.points} {t('admin.points')}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">{t('admin.amount')}</Label>
                <Input
                  id="amount"
                  type="number"
                  min="-10000"
                  max="10000"
                  value={grantData.amount}
                  onChange={(e) => setGrantData(prev => ({...prev, amount: parseInt(e.target.value) || 0}))}
                  required
                  disabled={isSubmitting}
                  placeholder={t('admin.enterPointsAmount')}
                />
                <div className="text-xs text-gray-500">
                  {t('admin.positiveNegativeHint')}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">{t('admin.notes')}</Label>
                <Textarea
                  id="notes"
                  value={grantData.notes}
                  onChange={(e) => setGrantData(prev => ({...prev, notes: e.target.value}))}
                  placeholder={t('admin.optionalReason')}
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
                        <strong>{selectedUser.name}</strong> {t('admin.willReceive')} <strong>+{grantData.amount} {t('admin.points')}</strong>
                        <br />
                        {t('admin.newBalance')}: <strong>{selectedUser.points + grantData.amount} {t('admin.points')}</strong>
                      </>
                    ) : (
                      <>
                        <strong>{selectedUser.name}</strong> {t('admin.willLose')} <strong>{Math.abs(grantData.amount)} {t('admin.points')}</strong>
                        <br />
                        {t('admin.newBalance')}: <strong>{selectedUser.points + grantData.amount} {t('admin.points')}</strong>
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
                  {t('common.cancel')}
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting || !grantData.userId || grantData.amount === 0}
                  className="w-full sm:w-auto"
                >
                  {isSubmitting ? t('admin.processing') : grantData.amount > 0 ? t('admin.grantPoints') : t('admin.deductPoints')}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="flex flex-wrap gap-3">
        <Badge variant="outline" className="h-8 px-3 flex items-center gap-2 bg-white border-gray-200">
          <Coins className="h-3 w-3 text-gray-500" />
          <span className="text-sm font-medium">{transactions.length} {t('admin.totalTransactions')}</span>
        </Badge>

        <Badge variant="outline" className="h-8 px-3 flex items-center gap-2 bg-green-50 border-green-200 text-green-700">
          <TrendingUp className="h-3 w-3" />
          <span className="text-sm font-medium">+{totalPointsGranted} {t('admin.pointsGranted')}</span>
        </Badge>

        <Badge variant="outline" className="h-8 px-3 flex items-center gap-2 bg-red-50 border-red-200 text-red-700">
          <TrendingDown className="h-3 w-3" />
          <span className="text-sm font-medium">-{totalPointsDeducted} {t('admin.pointsDeducted')}</span>
        </Badge>

        <Badge variant="outline" className={`h-8 px-3 flex items-center gap-2 ${totalPointsGranted - totalPointsDeducted >= 0 ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
          <Gift className="h-3 w-3" />
          <span className="text-sm font-medium">
            {totalPointsGranted - totalPointsDeducted >= 0 ? '+' : ''}{totalPointsGranted - totalPointsDeducted} {t('admin.netImpact')}
          </span>
        </Badge>
      </div>

      {/* Users & Transactions */}
      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="users" className="text-sm">
            {t('admin.users')} ({users.length})
          </TabsTrigger>
          <TabsTrigger value="transactions" className="text-sm">
            {t('admin.transactions')} ({transactions.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card className=" max-w-[350px] md:max-w-full">
            <CardHeader>
              <CardTitle>{t('admin.allUsers')}</CardTitle>
              <CardDescription>
                {t('admin.selectUsersToGrant')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {users.length > 0 ? (
                <>
                  <div className="w-full overflow-x-auto -mx-4 sm:mx-0">
                    <div className="min-w-full inline-block align-middle">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[180px]">{t('admin.user')}</th>
                            <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin.role')}</th>
                            <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin.points')}</th>
                            <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin.joined')}</th>
                            <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin.actions')}</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {paginatedUsers.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50">
                              <td className="px-2 sm:px-4 py-3">
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0">
                                    <AvatarFallback className="text-xs sm:text-sm">{getInitials(user.name)}</AvatarFallback>
                                  </Avatar>
                                  <div className="min-w-0 flex-1">
                                    <p className="font-medium truncate text-xs sm:text-sm">{user.name}</p>
                                    <p className="text-xs text-gray-500 truncate hidden sm:block">{user.email}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-2 sm:px-4 py-3 whitespace-nowrap">
                                <Badge variant={user.role === 'staff' ? 'secondary' : 'outline'} className="text-xs">
                                  {user.role}
                                </Badge>
                              </td>
                              <td className="px-2 sm:px-4 py-3 whitespace-nowrap">
                                <div className="text-center">
                                  <p className="font-bold text-sm sm:text-lg">{user.points}</p>
                                  <p className="text-xs text-gray-500 hidden sm:block">{t('admin.points')}</p>
                                </div>
                              </td>
                              <td className="px-2 sm:px-4 py-3 whitespace-nowrap">
                                <span className="text-xs sm:text-sm">{new Date(user.createdAt).toLocaleDateString()}</span>
                              </td>
                              <td className="px-2 sm:px-4 py-3 whitespace-nowrap">
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    setGrantData(prev => ({ ...prev, userId: user.id }));
                                    setIsDialogOpen(true);
                                  }}
                                  className="text-xs p-1 sm:p-2"
                                >
                                  <Coins className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                  <span className="hidden sm:inline">{t('admin.grant')}</span>
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <PaginationControls
                    currentPage={usersCurrentPage}
                    totalPages={usersTotalPages}
                    onPageChange={setUsersCurrentPage}
                  />
                </>
              ) : (
                <div className="text-center py-8">
                  <User className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                  <p className="text-gray-500">{t('admin.noUsersFound')}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions">
          <Card className=" max-w-[350px] md:max-w-full">
            <CardHeader>
              <CardTitle>{t('admin.recentPointTransactions')}</CardTitle>
              <CardDescription>
                {t('admin.historyOfManuallyGranted')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {transactions.length > 0 ? (
                <>
                  <div className="w-full overflow-x-auto -mx-4 sm:mx-0">
                    <div className="min-w-full inline-block align-middle">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">{t('admin.type')}</th>
                            <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">{t('admin.user')}</th>
                            <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin.amount')}</th>
                            <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">{t('admin.notes')}</th>
                            <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('common.date')}</th>
                            <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin.admin')}</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {paginatedTransactions.map((transaction) => (
                            <tr key={transaction.id} className="hover:bg-gray-50">
                              <td className="px-2 sm:px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <div className={`p-1 sm:p-2 rounded-full flex-shrink-0 ${transaction.amount > 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                                    {transaction.amount > 0 ? (
                                      <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                                    ) : (
                                      <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 text-red-600" />
                                    )}
                                  </div>
                                  <span className="font-medium text-xs sm:text-sm">
                                    {transaction.amount > 0 ? t('admin.granted') : t('admin.deducted')}
                                  </span>
                                </div>
                              </td>
                              <td className="px-2 sm:px-4 py-3">
                                <span className="font-medium text-xs sm:text-sm truncate block max-w-[100px]">{transaction.user?.name || t('admin.unknownUser')}</span>
                              </td>
                              <td className="px-2 sm:px-4 py-3 whitespace-nowrap">
                                <div className="text-center">
                                  <p className={`font-bold text-sm sm:text-lg ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                                  </p>
                                  <p className="text-xs text-gray-500 hidden sm:block">{t('admin.points')}</p>
                                </div>
                              </td>
                              <td className="px-2 sm:px-4 py-3">
                                <span className="text-xs sm:text-sm max-w-xs truncate block">
                                  {transaction.notes || t('admin.noNotes')}
                                </span>
                              </td>
                              <td className="px-2 sm:px-4 py-3 whitespace-nowrap">
                                <span className="text-xs sm:text-sm">{new Date(transaction.createdAt).toLocaleDateString()}</span>
                              </td>
                              <td className="px-2 sm:px-4 py-3">
                                <span className="text-xs sm:text-sm truncate block max-w-[100px]">{transaction.admin?.name || t('admin.unknownAdmin')}</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <PaginationControls
                    currentPage={transactionsCurrentPage}
                    totalPages={transactionsTotalPages}
                    onPageChange={setTransactionsCurrentPage}
                  />
                </>
              ) : (
                <div className="text-center py-8">
                  <Coins className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                  <p className="text-gray-500">{t('admin.noTransactionsYet')}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>{t('admin.quickActions')}</CardTitle>
          <CardDescription>
            {t('admin.commonPointGrantingScenarios')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
            <Button 
              variant="outline" 
              className="h-auto flex-col p-4 text-center"
              onClick={() => {
                setGrantData(prev => ({ ...prev, amount: 50, notes: t('admin.bonusForExcellentParticipation') }));
                setIsDialogOpen(true);
              }}
            >
              <Gift className="h-6 w-6 mb-2" />
              <span className="font-medium text-xs sm:text-sm">{t('admin.participationBonus')}</span>
              <span className="text-xs opacity-80">+50 {t('admin.points')}</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-auto flex-col p-4 text-center"
              onClick={() => {
                setGrantData(prev => ({ ...prev, amount: 100, notes: t('admin.specialEventReward') }));
                setIsDialogOpen(true);
              }}
            >
              <TrendingUp className="h-6 w-6 mb-2" />
              <span className="font-medium text-xs sm:text-sm">{t('admin.eventReward')}</span>
              <span className="text-xs opacity-80">+100 {t('admin.points')}</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-auto flex-col p-4 text-center"
              onClick={() => {
                setGrantData(prev => ({ ...prev, amount: -25, notes: t('admin.penaltyForInappropriateBehavior') }));
                setIsDialogOpen(true);
              }}
            >
              <TrendingDown className="h-6 w-6 mb-2" />
              <span className="font-medium text-xs sm:text-sm">{t('admin.minorPenalty')}</span>
              <span className="text-xs opacity-80">-25 {t('admin.points')}</span>
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
              <span className="font-medium text-xs sm:text-sm">{t('admin.customAmount')}</span>
              <span className="text-xs opacity-80">{t('admin.setYourOwn')}</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminGrantPoints; 