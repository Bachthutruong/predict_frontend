import React, { useState, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../hooks/useLanguage';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '../ui/dropdown-menu';
import { 
  Trophy, 
  Home, 
  Target, 
  User, 
  Calendar, 
  MessageSquare, 
  Settings, 
  LogOut,
  Coins,
  Gift,
  Shield,
  Users,
  HelpCircle,
  Menu,
  X,
  Package,
  ListChecks,
  Vote,
  Award
} from 'lucide-react';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const { t } = useLanguage();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false);

  const guestNavigation = useMemo(() => [
    { name: t('navigation.predictions'), href: '/predictions', icon: Target },
    { name: t('navigation.contests'), href: '/contests', icon: Award },
    { name: t('navigation.voting'), href: '/voting', icon: Vote },
    { name: t('navigation.surveys'), href: '/surveys', icon: ListChecks },
    { name: t('navigation.feedback'), href: '/feedback', icon: MessageSquare },
  ], [t]);

  const userNavigation = useMemo(() => [
    { name: t('navigation.dashboard'), href: '/dashboard', icon: Home },
    { name: t('navigation.predictions'), href: '/predictions', icon: Target },
    { name: t('navigation.contests'), href: '/contests', icon: Award },
    { name: t('navigation.voting'), href: '/voting', icon: Vote },
    { name: t('navigation.checkIn'), href: '/check-in', icon: Calendar },
    { name: t('navigation.surveys'), href: '/surveys', icon: ListChecks },
    { name: t('navigation.profile'), href: '/profile', icon: User },
    { name: t('navigation.referrals'), href: '/referrals', icon: Gift },
    { name: t('navigation.feedback'), href: '/feedback', icon: MessageSquare },
  ], [t]);

  const navigation = useMemo(() => user ? userNavigation : guestNavigation, [user, userNavigation, guestNavigation]);

  // Tách menu chính và menu more
  const mainMenu = navigation.slice(0, 6);
  const moreMenu = navigation.slice(6);

  const adminNavigation = useMemo(() => [
    { name: t('admin.managePredictions'), href: '/admin/predictions', icon: Trophy },
    { name: t('admin.manageContests'), href: '/admin/contests', icon: Award },
    { name: t('admin.manageVoting'), href: '/admin/voting/campaigns', icon: Vote },
    { name: t('navigation.orders'), href: '/admin/orders', icon: Package },
    { name: t('admin.manageSurveys'), href: '/admin/surveys', icon: ListChecks },
    { name: t('navigation.questions'), href: '/admin/questions', icon: HelpCircle },
    { name: t('admin.manageStaff'), href: '/admin/staff', icon: Shield },
    { name: t('admin.manageUsers'), href: '/admin/users', icon: User },
    { name: t('admin.grantPoints'), href: '/admin/grant-points', icon: Coins },
    { name: t('navigation.feedback'), href: '/admin/feedback', icon: MessageSquare },
  ], [t]);

  const staffNavigation = useMemo(() => [
    { name: t('staff.title'), href: '/staff', icon: Settings },
    { name: t('staff.managePredictions'), href: '/staff/predictions', icon: Trophy },
    { name: t('staff.manageUsers'), href: '/staff/users', icon: Users },
    { name: t('staff.manageQuestions'), href: '/staff/questions', icon: HelpCircle },
  ], [t]);

  const isActive = (href: string) => location.pathname === href;
  const isAdminOrStaff = user?.role === 'admin' || user?.role === 'staff';

  const getInitials = (name: string) => {
    return name.split(' ').map(part => part[0]).join('').toUpperCase().slice(0, 2);
  };

  const closeAllMenus = () => {
    setIsMobileMenuOpen(false);
    setIsAdminMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Top Navigation */}
      <nav className="bg-white shadow-sm border-b relative z-40">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Left side - Logo and Navigation */}
            <div className="flex items-center">
              <Link to="/predictions" className="flex items-center space-x-2 mr-8">
                <Trophy className="h-8 w-8 text-blue-600" />
                <span className="text-xl sm:text-2xl font-bold text-blue-600">PredictWin</span>
              </Link>
              
              {/* Desktop Navigation */}
              <div className="hidden md:flex space-x-1 items-center">
                {mainMenu.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                        isActive(item.href)
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {item.name}
                    </Link>
                  );
                })}
                {moreMenu.length > 0 && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="flex items-center px-3 py-2 text-sm font-medium">
                        {t('navigation.more')}
                        <span className="ml-1">▼</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      {moreMenu.map((item) => {
                        const Icon = item.icon;
                        return (
                          <DropdownMenuItem asChild key={item.href}>
                            <Link
                              to={item.href}
                              className="flex items-center gap-2 px-2 py-1 text-sm"
                            >
                              <Icon className="h-4 w-4" />
                              {item.name}
                            </Link>
                          </DropdownMenuItem>
                        );
                      })}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
            
            {/* Right side - User info and actions */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {user ? (
                <>
                  {/* Points Display */}
                  <div className="hidden sm:flex items-center space-x-2 bg-blue-100 px-3 py-1 rounded-full">
                    <Coins className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-blue-600">{user?.points || 0}</span>
                  </div>

                  {/* User Info */}
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    {user?.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt={user.name}
                        className="h-8 w-8 rounded-full"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-medium">
                        {user ? getInitials(user.name) : 'U'}
                      </div>
                    )}
                    <div className="hidden lg:flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-900 whitespace-nowrap">{user?.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {user?.role?.toUpperCase()}
                      </Badge>
                    </div>
                  </div>

                  {/* Admin/Staff Menu Toggle (Mobile) */}
                  {isAdminOrStaff && (
                    <button
                      onClick={() => setIsAdminMenuOpen(!isAdminMenuOpen)}
                      className="lg:hidden p-2 text-gray-600 hover:text-gray-900 border rounded-md"
                    >
                      <Settings className="h-5 w-5" />
                    </button>
                  )}

                  {/* Mobile menu button */}
                  <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="md:hidden p-2 text-gray-600 hover:text-gray-900"
                  >
                    {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                  </button>

                  {/* Logout Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={logout}
                    className="hidden md:flex text-gray-500 hover:text-gray-700"
                    title={t('auth.logout')}
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <div className="flex items-center space-x-2">
                  <Button asChild variant="ghost">
                    <Link to="/login">{t('auth.login')}</Link>
                  </Button>
                  <Button asChild>
                    <Link to="/register">{t('auth.signUp')}</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t shadow-lg relative z-50">
            <div className="px-2 pt-2 pb-3 space-y-1 max-h-96 overflow-y-auto">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={closeAllMenus}
                    className={`flex items-center px-3 py-2 rounded-md text-base font-medium ${
                      isActive(item.href)
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="h-5 w-5 mr-3" />
                    {item.name}
                  </Link>
                );
              })}
              
              {user && (
                <>
                  {/* Mobile Points Display */}
                  <div className="flex items-center px-3 py-2 space-x-2 bg-blue-50 rounded-md">
                    <Coins className="h-5 w-5 text-blue-600" />
                    <span className="font-medium text-blue-600">{user?.points || 0} Points</span>
                  </div>
                  
                  {/* Mobile Logout */}
                  <button
                    onClick={() => {
                      logout();
                      closeAllMenus();
                    }}
                    className="flex items-center w-full px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md"
                  >
                    <LogOut className="h-5 w-5 mr-3" />
                    {t('auth.logout')}
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      <div className="flex">
        {/* Admin/Staff Sidebar (Desktop) */}
        {isAdminOrStaff && (
          <div className="hidden lg:block w-64 bg-white shadow-sm min-h-screen">
            <div className="p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                {user?.role?.toUpperCase()} MANAGEMENT
              </h2>
              <nav className="space-y-1">
                {user?.role === 'admin' && adminNavigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        isActive(item.href)
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="h-4 w-4 mr-3" />
                      {item.name}
                    </Link>
                  );
                })}
                
                {user?.role === 'staff' && staffNavigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        isActive(item.href)
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="h-4 w-4 mr-3" />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className={`flex-1 ${isAdminOrStaff ? 'lg:ml-0' : ''}`}>
          <div className="p-4 lg:p-8">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Admin/Staff Menu Overlay */}
      {isAdminOrStaff && isAdminMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50" onClick={closeAllMenus}>
          <div className="absolute right-0 top-0 h-full w-80 max-w-full bg-white shadow-xl overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-4">
              <div className="flex justify-between items-center mb-4 pb-2 border-b">
                <h2 className="text-lg font-semibold text-gray-900">
                  {user?.role?.toUpperCase()} MANAGEMENT
                </h2>
                <button 
                  onClick={closeAllMenus}
                  className="p-2 hover:bg-gray-100 rounded-md"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="space-y-1">
                {user?.role === 'admin' && adminNavigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={closeAllMenus}
                      className={`flex items-center px-3 py-3 text-base font-medium rounded-md transition-colors ${
                        isActive(item.href)
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="h-5 w-5 mr-3" />
                      {item.name}
                    </Link>
                  );
                })}
                
                {user?.role === 'staff' && staffNavigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={closeAllMenus}
                      className={`flex items-center px-3 py-3 text-base font-medium rounded-md transition-colors ${
                        isActive(item.href)
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="h-5 w-5 mr-3" />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MainLayout; 