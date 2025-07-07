import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
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
  Package
} from 'lucide-react';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Predictions', href: '/predictions', icon: Target },
    { name: 'Check In', href: '/check-in', icon: Calendar },
    { name: 'Profile', href: '/profile', icon: User },
    { name: 'Referrals', href: '/referrals', icon: Gift },
    { name: 'Feedback', href: '/feedback', icon: MessageSquare },
  ];

  const adminNavigation = [
    { name: 'Admin Predictions', href: '/admin/predictions', icon: Trophy },
    { name: 'Order Management', href: '/admin/orders', icon: Package },
    { name: 'Questions Management', href: '/admin/questions', icon: HelpCircle },
    { name: 'Staff Management', href: '/admin/staff', icon: Shield },
    { name: 'User Management', href: '/admin/users', icon: User },
    { name: 'Grant Points', href: '/admin/grant-points', icon: Coins },
    { name: 'Admin Feedback', href: '/admin/feedback', icon: MessageSquare },
  ];

  const staffNavigation = [
    { name: 'Staff Dashboard', href: '/staff', icon: Settings },
    { name: 'View Predictions', href: '/staff/predictions', icon: Trophy },
    { name: 'Manage Users', href: '/staff/users', icon: Users },
    { name: 'Manage Questions', href: '/staff/questions', icon: HelpCircle },
  ];

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Left side - Logo and Navigation */}
            <div className="flex items-center">
              <Link to="/dashboard" className="flex items-center space-x-2 mr-8">
                <Trophy className="h-8 w-8 text-blue-600" />
                <span className="text-xl sm:text-2xl font-bold text-blue-600">PredictWin</span>
              </Link>
              
              {/* Desktop Navigation */}
              <div className="hidden md:flex space-x-1">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
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
              </div>
            </div>
            
            {/* Right side - User info and actions */}
            <div className="flex items-center space-x-2 sm:space-x-4">
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
                <div className="hidden lg:block">
                  <p className="text-sm font-medium text-gray-900">{user?.name}</p>
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
              >
                <LogOut className="h-4 w-4" />
              </Button>
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
                    key={item.name}
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
                Logout
              </button>
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
                      key={item.name}
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
                      key={item.name}
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
                      key={item.name}
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
                      key={item.name}
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