import React, { useState, useMemo, useEffect } from 'react';
import { Link, useLocation, Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../hooks/useLanguage';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '../ui/dropdown-menu';
import { cartAPI } from '../../services/shopServices';
import {
  Trophy,
  Home,
  Target,
  User,
  Calendar,
  MessageSquare,
  MessageCircle,
  Settings,
  LogOut,
  Coins,
  Gift,
  Shield,
  Users,
  HelpCircle,
  Menu,
  X,
  // Package,
  ListChecks,
  List,
  Vote,
  Award,
  MapPin,
  CreditCard,
  ShoppingBag,
  Store,
  Star,
  Ticket
} from 'lucide-react';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { user, logout, refreshUser } = useAuth();
  const location = useLocation();
  const { t } = useLanguage();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  // Guest accounts (auto-created from order) must change password before using the app
  if (user?.isAutoCreated && location.pathname !== '/change-password') {
    return <Navigate to="/change-password" replace />;
  }

  // Fetch cart count only when needed (no polling)
  // Cart count will update when:
  // - Component mounts
  // - Route changes (user navigates, e.g., after adding to cart)
  // - User ID changes (login/logout) - using user?.id to avoid infinite loop
  // This avoids unnecessary API calls while keeping cart count accurate
  useEffect(() => {
    const fetchCartCount = async () => {
      try {
        const res = await cartAPI.get();
        if (res.data.success) {
          const count = res.data.data?.items?.length || 0;
          setCartCount(count);
        }
      } catch (error) {
        console.error('Failed to fetch cart count', error);
        setCartCount(0);
      }
    };

    // Only fetch when route or user ID changes (using user?.id to prevent infinite loop)
    fetchCartCount();
  }, [location.pathname, user?.id]);

  // Refresh user points only when needed (no polling)
  // Points will update when:
  // - Component mounts (if user is logged in)
  // - Route changes (user navigates, e.g., after completing actions that award points)
  // - User ID changes (login/logout) - using user?.id to avoid infinite loop
  // Note: Points will also be refreshed in specific pages after actions (e.g., OrderDetailPage when order completes)
  useEffect(() => {
    if (!user) return;
    
    const refreshUserPoints = async () => {
      try {
        await refreshUser();
      } catch (error) {
        console.error('Failed to refresh user points', error);
      }
    };

    // Only refresh when route or user ID changes (using user?.id to prevent infinite loop)
    // We use user?.id instead of user object to prevent infinite loop when refreshUser updates user
    refreshUserPoints();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, user?.id, refreshUser]);

  const guestNavigation = useMemo(() => [
    { name: t('navigation.shop'), href: '/shop', icon: Store },
    { name: t('navigation.predictions'), href: '/predictions', icon: Target },
    { name: t('navigation.contests'), href: '/contests', icon: Award },
    { name: t('navigation.voting'), href: '/voting', icon: Vote },
    { name: t('navigation.surveys'), href: '/surveys', icon: ListChecks },
    { name: t('navigation.feedback'), href: '/feedback', icon: MessageSquare },
  ], [t]);

  const userNavigation = useMemo(() => [
    { name: t('navigation.dashboard'), href: '/dashboard', icon: Home },
    { name: t('navigation.shop'), href: '/shop', icon: Store },
    { name: t('navigation.myOrders'), href: '/shop/orders', icon: ShoppingBag },
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
    // { name: t('navigation.orders'), href: '/admin/orders', icon: Package },
    { name: t('admin.manageSurveys'), href: '/admin/surveys', icon: ListChecks },
    { name: t('navigation.questions'), href: '/admin/questions', icon: HelpCircle },
    { name: t('admin.manageStaff'), href: '/admin/staff', icon: Shield },
    { name: t('admin.manageUsers'), href: '/admin/users', icon: User },
    { name: t('admin.grantPoints'), href: '/admin/grant-points', icon: Coins },
    // Shop Management
    { name: t('admin.products'), href: '/admin/shop/products', icon: Store },
    { name: t('admin.categories'), href: '/admin/shop/categories', icon: List },
    { name: t('admin.orders'), href: '/admin/shop/orders', icon: ShoppingBag },
    { name: t('admin.reviews'), href: '/admin/shop/reviews', icon: Star },
    { name: t('admin.coupons'), href: '/admin/shop/coupons', icon: Ticket },
    { name: t('admin.branches'), href: '/admin/shop/branches', icon: MapPin },
    { name: t('admin.paymentSettings'), href: '/admin/shop/settings', icon: CreditCard },
    { name: t('admin.chatSupport'), href: '/admin/shop/chat', icon: MessageCircle },
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
    if (!name) return 'U';
    return name.split(' ').map(part => part[0]).join('').toUpperCase().slice(0, 2);
  };

  const closeAllMenus = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col">
      {/* Top Navigation - Google style AppBar */}
      <nav className="bg-white border-b border-gray-200 fixed w-full z-50 h-16 flex items-center px-4 transition-all duration-200">
        <div className="flex items-center justify-between w-full max-w-[1920px] mx-auto">
          {/* Left: Logo & Menu Toggle */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
            <Link to="/predictions" className="flex items-center space-x-2">
              <div className="bg-blue-600 p-1.5 rounded-lg">
                <Trophy className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-normal text-gray-700 hidden sm:block" style={{ fontFamily: 'Product Sans, Roboto, sans-serif' }}>Predict<span className="font-bold text-blue-600">Win</span></span>
            </Link>
          </div>

          {/* Center: Desktop Navigation (Horizontal) */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-2 mx-4">
            {mainMenu.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${isActive(item.href)
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                >
                  <Icon className={`h-4 w-4 mr-2 ${isActive(item.href) ? 'text-blue-700' : 'text-gray-500'}`} />
                  {item.name}
                </Link>
              );
            })}
            {moreMenu.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-100 text-gray-600">
                    {t('navigation.more')}
                    <span className="ml-1 text-xs">▼</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 mt-2 p-2 shadow-google rounded-xl border-gray-100">
                  {moreMenu.map((item) => {
                    const Icon = item.icon;
                    return (
                      <DropdownMenuItem asChild key={item.href}>
                        <Link
                          to={item.href}
                          className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-50 cursor-pointer"
                        >
                          <Icon className="h-4 w-4 text-gray-500" />
                          {item.name}
                        </Link>
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Right: Cart & User Actions */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Shopping Cart - Always visible */}
            <Link to="/shop/cart" className="relative group p-2">
              <ShoppingBag className="h-6 w-6 text-gray-600 group-hover:text-primary transition-colors" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>

            {user ? (
              <>
                {/* Points Pill */}
                <div className="hidden sm:flex items-center space-x-2 bg-white border border-gray-200 px-3 py-1.5 rounded-full shadow-sm hover:shadow-md transition-shadow">
                  <Coins className="h-4 w-4 text-yellow-500" />
                  <span className="font-medium text-gray-700 text-sm">{user?.points || 0}</span>
                </div>

                {/* Profile Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center space-x-2 p-1 hover:bg-gray-100 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                      {user?.avatarUrl ? (
                        <img
                          src={user.avatarUrl}
                          alt={user.name}
                          className="h-9 w-9 rounded-full border border-gray-200 object-cover"
                        />
                      ) : (
                        <div className="h-9 w-9 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold shadow-sm">
                          {user ? getInitials(user.name) : 'U'}
                        </div>
                      )}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-72 mt-2 p-2 shadow-google-hover rounded-2xl border-gray-100">
                    <div className="px-4 py-3 border-b border-gray-50 mb-2">
                      <p className="text-sm font-semibold text-gray-800">{user?.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                      <Badge variant="secondary" className="mt-2 text-xs font-normal">
                        {user?.role?.toUpperCase()}
                      </Badge>
                    </div>

                    {/* Admin Links in Profile Menu for convenience on all screens */}
                    {(isAdminOrStaff) && (
                      <div className="mb-2 pb-2 border-b border-gray-50">
                        <p className="px-3 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">Management</p>
                        {user.role === 'admin' && (
                          <DropdownMenuItem asChild>
                            <Link to="/admin/dashboard" className="cursor-pointer rounded-lg mx-1">
                              <Settings className="h-4 w-4 mr-2" />
                              Admin Dashboard
                            </Link>
                          </DropdownMenuItem>
                        )}
                        {user.role === 'staff' && (
                          <DropdownMenuItem asChild>
                            <Link to="/staff" className="cursor-pointer rounded-lg mx-1">
                              <Settings className="h-4 w-4 mr-2" />
                              Staff Dashboard
                            </Link>
                          </DropdownMenuItem>
                        )}
                      </div>
                    )}

                    <DropdownMenuItem onClick={logout} className="text-red-600 focus:text-red-600 cursor-pointer rounded-lg mx-1 hover:bg-red-50">
                      <LogOut className="h-4 w-4 mr-2" />
                      {t('auth.logout')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Button asChild variant="ghost" className="text-gray-600 hover:text-gray-900 hover:bg-gray-100">
                  <Link to="/login">{t('auth.login')}</Link>
                </Button>
                <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm rounded-md px-6">
                  <Link to="/register">{t('auth.signUp')}</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Main Layout Area */}
      <div className="flex pt-16 min-h-screen">

        {/* Sidebar for Admin/Staff - Google Cloud Console style */}
        {isAdminOrStaff && (
          <aside className="hidden lg:block w-72 bg-white border-r border-gray-200 fixed h-full overflow-y-auto z-40 pb-20">
            <div className="p-4">
              <h2 className="px-4 text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 mt-2">
                {user?.role === 'admin' ? 'Admin Console' : 'Staff Workspace'}
              </h2>
              <nav className="space-y-1">
                {user?.role === 'admin' && adminNavigation.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      className={`flex items-center px-4 py-3 text-sm font-medium rounded-r-full mr-4 transition-colors ${active
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                    >
                      <Icon className={`h-5 w-5 mr-3 ${active ? 'text-blue-700' : 'text-gray-500'}`} />
                      {item.name}
                    </Link>
                  );
                })}

                {user?.role === 'staff' && staffNavigation.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      className={`flex items-center px-4 py-3 text-sm font-medium rounded-r-full mr-4 transition-colors ${active
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                    >
                      <Icon className={`h-5 w-5 mr-3 ${active ? 'text-blue-700' : 'text-gray-500'}`} />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </aside>
        )}

        {/* Content Area */}
        <main className={`flex-1 transition-all duration-300 ${isAdminOrStaff ? 'lg:ml-72' : ''} bg-[#f8f9fa] p-2 overflow-x-hidden w-full`}>
          <div className="max-w-[1600px] mx-auto animate-fade-in-up">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity" onClick={closeAllMenus} />
          <div className="fixed inset-y-0 left-0 w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out overflow-y-auto">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <span className="text-xl font-bold text-gray-800">Menu</span>
              <button onClick={closeAllMenus} className="p-2 hover:bg-gray-100 rounded-full">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="p-4 space-y-6">

              {/* Main Navigation */}
              <div className="space-y-1">
                <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Navigation</h3>
                {[...mainMenu, ...moreMenu].map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={closeAllMenus}
                      className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium ${isActive(item.href)
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                      <Icon className={`h-5 w-5 mr-3 ${isActive(item.href) ? 'text-blue-700' : 'text-gray-400'}`} />
                      {item.name}
                    </Link>
                  );
                })}
              </div>

              {/* Admin/Staff Mobile Links */}
              {isAdminOrStaff && (
                <div className="space-y-1 pt-4 border-t border-gray-100">
                  <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Management</h3>
                  {(user?.role === 'admin' ? adminNavigation : staffNavigation).map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);
                    return (
                      <Link
                        key={item.href}
                        to={item.href}
                        onClick={closeAllMenus}
                        className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium ${active
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-50'
                          }`}
                      >
                        <Icon className={`h-5 w-5 mr-3 ${active ? 'text-blue-700' : 'text-gray-400'}`} />
                        {item.name}
                      </Link>
                    );
                  })}
                </div>
              )}

              {user && (
                <div className="pt-4 border-t border-gray-100">
                  <button
                    onClick={() => {
                      logout();
                      closeAllMenus();
                    }}
                    className="flex items-center w-full px-3 py-2.5 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors"
                  >
                    <LogOut className="h-5 w-5 mr-3" />
                    {t('auth.logout')}
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MainLayout; 