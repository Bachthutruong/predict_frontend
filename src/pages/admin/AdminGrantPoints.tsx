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
  Plus,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import { useLanguage } from '../../hooks/useLanguage';
import apiService from '../../services/api';
import type { User as UserType, PointTransaction } from '../../types';
import { formatDate } from '../../lib/utils';

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
        <div className="text-lg text-gray-600">{t('admin.loading')}</div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Coins className="h-8 w-8 text-blue-600" />
            {t('admin.grantPoints')}
          </h1>
          <p className="text-gray-500 text-lg max-w-2xl">
            {t('admin.grantPointsDescription')}
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 shadow-md bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6">
              <Plus className="h-5 w-5" />
              <span className="hidden sm:inline font-medium">{t('admin.grantPoints')}</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md sm:max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t('admin.grantPointsToUser')}</DialogTitle>
              <DialogDescription>
                {t('admin.grantPointsDescription')}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-6 py-4">
              <div className="space-y-2">
                <Label htmlFor="user" className="text-sm font-medium text-gray-700">{t('admin.selectUser')}</Label>
                <select
                  value={grantData.userId}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setGrantData(prev => ({ ...prev, userId: e.target.value }))}
                  required
                  disabled={isSubmitting}
                  className="w-full h-11 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="">{t('admin.chooseUser')}</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} - {user.points} {t('admin.points')}
                    </option>
                  ))}
                </select>
                {selectedUser && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-2 rounded-md">
                    <User className="h-4 w-4" />
                    <span>{t('admin.currentBalance')}:</span>
                    <span className="font-semibold text-blue-600">{selectedUser.points} {t('admin.points')}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount" className="text-sm font-medium text-gray-700">{t('admin.amount')}</Label>
                <div className="relative">
                  <Coins className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="amount"
                    type="number"
                    min="-10000"
                    max="10000"
                    value={grantData.amount}
                    onChange={(e) => setGrantData(prev => ({ ...prev, amount: parseInt(e.target.value) || 0 }))}
                    required
                    disabled={isSubmitting}
                    placeholder={t('admin.enterPointsAmount')}
                    className="pl-10 h-11"
                  />
                </div>
                <div className="text-xs text-gray-500 pl-1">
                  {t('admin.positiveNegativeHint')}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes" className="text-sm font-medium text-gray-700">{t('admin.notes')}</Label>
                <Textarea
                  id="notes"
                  value={grantData.notes}
                  onChange={(e) => setGrantData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder={t('admin.optionalReason')}
                  disabled={isSubmitting}
                  rows={3}
                  className="resize-none"
                />
              </div>

              {selectedUser && grantData.amount !== 0 && (
                <Alert className={`${grantData.amount > 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                  <Gift className={`h-4 w-4 ${grantData.amount > 0 ? 'text-green-600' : 'text-red-600'}`} />
                  <AlertDescription className={`${grantData.amount > 0 ? 'text-green-800' : 'text-red-800'}`}>
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

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  disabled={isSubmitting}
                >
                  {t('common.cancel')}
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || !grantData.userId || grantData.amount === 0}
                  className={`${grantData.amount >= 0 ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'} text-white shadow-md`}
                >
                  {isSubmitting ? t('admin.processing') : grantData.amount > 0 ? t('admin.grantPoints') : t('admin.deductPoints')}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-google bg-white">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <div className="h-10 w-10 bg-gray-50 text-gray-600 rounded-full flex items-center justify-center mb-2">
              <Coins className="h-5 w-5" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{transactions.length}</div>
            <div className="text-xs text-gray-500 font-medium uppercase tracking-wider mt-1">{t('admin.totalTransactions')}</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-google bg-white">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <div className="h-10 w-10 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-2">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div className="text-2xl font-bold text-gray-900">+{totalPointsGranted}</div>
            <div className="text-xs text-gray-500 font-medium uppercase tracking-wider mt-1">{t('admin.pointsGranted')}</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-google bg-white">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <div className="h-10 w-10 bg-red-50 text-red-600 rounded-full flex items-center justify-center mb-2">
              <TrendingDown className="h-5 w-5" />
            </div>
            <div className="text-2xl font-bold text-gray-900">-{totalPointsDeducted}</div>
            <div className="text-xs text-gray-500 font-medium uppercase tracking-wider mt-1">{t('admin.pointsDeducted')}</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-google bg-white">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <div className={`h-10 w-10 rounded-full flex items-center justify-center mb-2 ${totalPointsGranted - totalPointsDeducted >= 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
              <Gift className="h-5 w-5" />
            </div>
            <div className={`text-2xl font-bold ${totalPointsGranted - totalPointsDeducted >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {totalPointsGranted - totalPointsDeducted >= 0 ? '+' : ''}{totalPointsGranted - totalPointsDeducted}
            </div>
            <div className="text-xs text-gray-500 font-medium uppercase tracking-wider mt-1">{t('admin.netImpact')}</div>
          </CardContent>
        </Card>
      </div>

      {/* Users & Transactions */}
      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="bg-gray-100/50 p-1 border border-gray-100 rounded-full w-full sm:w-auto inline-flex h-auto">
          <TabsTrigger value="users" className="rounded-full px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm transition-all h-auto">
            {t('admin.users')} <span className="ml-2 py-0.5 px-2 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold group-data-[state=active]:bg-blue-50 group-data-[state=active]:text-blue-600">{users.length}</span>
          </TabsTrigger>
          <TabsTrigger value="transactions" className="rounded-full px-6 py-2.5 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm transition-all h-auto">
            {t('admin.transactions')} <span className="ml-2 py-0.5 px-2 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold group-data-[state=active]:bg-blue-50 group-data-[state=active]:text-blue-600">{transactions.length}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-0">
          <Card className="border-0 shadow-google bg-white overflow-hidden rounded-xl">
            <CardHeader className="border-b border-gray-100 bg-white pb-6 pt-6 px-6">
              <CardTitle className="text-xl text-gray-800">{t('admin.allUsers')}</CardTitle>
              <CardDescription className="text-gray-500 mt-1">
                {t('admin.selectUsersToGrant')}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {users.length > 0 ? (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50/50 border-b border-gray-100">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('admin.user')}</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('admin.role')}</th>
                          <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('admin.points')}</th>
                          <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('admin.joined')}</th>
                          <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('admin.actions')}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 bg-white">
                        {paginatedUsers.map((user) => (
                          <tr key={user.id} className="hover:bg-gray-50/80 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10 border border-gray-100">
                                  <AvatarFallback className="bg-blue-50 text-blue-600 font-medium text-xs">{getInitials(user.name)}</AvatarFallback>
                                </Avatar>
                                <div className="min-w-0">
                                  <p className="font-medium text-gray-900 truncate">{user.name}</p>
                                  <p className="text-sm text-gray-500 truncate">{user.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge variant={user.role === 'staff' ? 'secondary' : 'outline'} className="font-normal capitalize border-gray-200">
                                {user.role}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <span className="font-semibold text-gray-900 bg-gray-50 px-2 py-1 rounded-md border border-gray-100 inline-block min-w-[3rem]">
                                {user.points}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                              {formatDate(user.createdAt)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setGrantData(prev => ({ ...prev, userId: user.id }));
                                  setIsDialogOpen(true);
                                }}
                                className="bg-white hover:bg-blue-50 text-gray-700 hover:text-blue-600 border-gray-200"
                              >
                                <Coins className="h-4 w-4 mr-2 text-blue-500" />
                                {t('admin.grant')}
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="p-4 border-t border-gray-100 bg-gray-50/50">
                    <PaginationControls
                      currentPage={usersCurrentPage}
                      totalPages={usersTotalPages}
                      onPageChange={setUsersCurrentPage}
                    />
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <User className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500 font-medium">{t('admin.noUsersFound')}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="mt-0">
          <Card className="border-0 shadow-google bg-white overflow-hidden rounded-xl">
            <CardHeader className="border-b border-gray-100 bg-white pb-6 pt-6 px-6">
              <CardTitle className="text-xl text-gray-800">{t('admin.recentPointTransactions')}</CardTitle>
              <CardDescription className="text-gray-500 mt-1">
                {t('admin.historyOfManuallyGranted')}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {transactions.length > 0 ? (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50/50 border-b border-gray-100">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('admin.type')}</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('admin.user')}</th>
                          <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('admin.amount')}</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('admin.notes')}</th>
                          <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('common.date')}</th>
                          <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('admin.admin')}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 bg-white">
                        {paginatedTransactions.map((transaction) => (
                          <tr key={transaction.id} className="hover:bg-gray-50/80 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <div className={`p-1.5 rounded-full flex-shrink-0 ${transaction.amount > 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                  {transaction.amount > 0 ? (
                                    <TrendingUp className="h-4 w-4" />
                                  ) : (
                                    <TrendingDown className="h-4 w-4" />
                                  )}
                                </div>
                                <span className={`text-sm font-medium ${transaction.amount > 0 ? 'text-green-700' : 'text-red-700'}`}>
                                  {transaction.amount > 0 ? t('admin.granted') : t('admin.deducted')}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="font-medium text-gray-900">{transaction.user?.name || t('admin.unknownUser')}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <span className={`font-bold inline-block px-2 py-1 rounded-md text-sm ${transaction.amount > 0 ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                                {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm text-gray-600 block max-w-xs truncate" title={transaction.notes || ''}>
                                {transaction.notes || <span className="text-gray-400 italic">{t('admin.noNotes')}</span>}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                              {formatDate(transaction.createdAt)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                              {transaction.admin?.name || <span className="text-gray-400">{t('admin.unknownAdmin')}</span>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="p-4 border-t border-gray-100 bg-gray-50/50">
                    <PaginationControls
                      currentPage={transactionsCurrentPage}
                      totalPages={transactionsTotalPages}
                      onPageChange={setTransactionsCurrentPage}
                    />
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <Coins className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500 font-medium">{t('admin.noTransactionsYet')}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <Card className="border-0 shadow-google bg-white overflow-hidden rounded-xl">
        <CardHeader className="border-b border-gray-100 bg-white pb-6 pt-6 px-6">
          <CardTitle className="text-xl text-gray-800 flex items-center gap-2">
            <Gift className="h-5 w-5 text-purple-600" />
            {t('admin.quickActions')}
          </CardTitle>
          <CardDescription className="text-gray-500 mt-1">
            {t('admin.commonPointGrantingScenarios')}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
            <Button
              variant="outline"
              className="h-auto flex-col p-6 text-center hover:border-blue-200 hover:bg-blue-50/50 hover:shadow-sm transition-all border-gray-200 bg-white group"
              onClick={() => {
                setGrantData(prev => ({ ...prev, amount: 50, notes: t('admin.bonusForExcellentParticipation') }));
                setIsDialogOpen(true);
              }}
            >
              <div className="h-10 w-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Gift className="h-5 w-5" />
              </div>
              <span className="font-semibold text-gray-900 mb-1">{t('admin.participationBonus')}</span>
              <span className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded-full">+50 {t('admin.points')}</span>
            </Button>

            <Button
              variant="outline"
              className="h-auto flex-col p-6 text-center hover:border-purple-200 hover:bg-purple-50/50 hover:shadow-sm transition-all border-gray-200 bg-white group"
              onClick={() => {
                setGrantData(prev => ({ ...prev, amount: 100, notes: t('admin.specialEventReward') }));
                setIsDialogOpen(true);
              }}
            >
              <div className="h-10 w-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <TrendingUp className="h-5 w-5" />
              </div>
              <span className="font-semibold text-gray-900 mb-1">{t('admin.eventReward')}</span>
              <span className="text-xs text-purple-600 font-medium bg-purple-50 px-2 py-0.5 rounded-full">+100 {t('admin.points')}</span>
            </Button>

            <Button
              variant="outline"
              className="h-auto flex-col p-6 text-center hover:border-red-200 hover:bg-red-50/50 hover:shadow-sm transition-all border-gray-200 bg-white group"
              onClick={() => {
                setGrantData(prev => ({ ...prev, amount: -25, notes: t('admin.penaltyForInappropriateBehavior') }));
                setIsDialogOpen(true);
              }}
            >
              <div className="h-10 w-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <TrendingDown className="h-5 w-5" />
              </div>
              <span className="font-semibold text-gray-900 mb-1">{t('admin.minorPenalty')}</span>
              <span className="text-xs text-red-600 font-medium bg-red-50 px-2 py-0.5 rounded-full">-25 {t('admin.points')}</span>
            </Button>

            <Button
              variant="outline"
              className="h-auto flex-col p-6 text-center hover:border-gray-300 hover:bg-gray-50 hover:shadow-sm transition-all border-gray-200 border-dashed bg-white group"
              onClick={() => {
                setGrantData(prev => ({ ...prev, amount: 0, notes: '' }));
                setIsDialogOpen(true);
              }}
            >
              <div className="h-10 w-10 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Coins className="h-5 w-5" />
              </div>
              <span className="font-semibold text-gray-900 mb-1">{t('admin.customAmount')}</span>
              <span className="text-xs text-gray-500 font-medium bg-gray-100 px-2 py-0.5 rounded-full">{t('admin.setYourOwn')}</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminGrantPoints;