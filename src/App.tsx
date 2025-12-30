import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';

// Layout components
import MainLayout from './components/layout/MainLayout';
import AuthLayout from './components/layout/AuthLayout';

// Auth pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Main pages
import DashboardPage from './pages/dashboard/DashboardPage';
import PredictionsPage from './pages/predictions/PredictionsPage';
import PredictionDetailPage from './pages/predictions/PredictionDetailPage';
import ProfilePage from './pages/profile/ProfilePage';
import ReferralsPage from './pages/profile/ReferralsPage';
import CheckInPage from './pages/dashboard/CheckInPage';
import FeedbackPage from './pages/dashboard/FeedbackPage';
import SurveysPage from './pages/surveys/SurveysPage';
import SurveyDetailPage from './pages/surveys/SurveyDetailPage';
import VotingCampaignsPage from './pages/voting/VotingCampaignsPage';
import VotingDetailPage from './pages/voting/VotingDetailPage';

// Contest pages
import ContestsPage from './pages/contests/ContestsPage';
import ContestDetailPage from './pages/contests/ContestDetailPage';
import ContestHistoryPage from './pages/contests/ContestHistoryPage';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminPredictions from './pages/admin/AdminPredictions';
import AdminPredictionDetail from './pages/admin/AdminPredictionDetail';
import AdminPredictionEdit from './pages/admin/AdminPredictionEdit';
import AdminPredictionCreate from './pages/admin/AdminPredictionCreate';
import AdminUsers from './pages/admin/AdminUsers';
import AdminFeedback from './pages/admin/AdminFeedback';
import AdminGrantPoints from './pages/admin/AdminGrantPoints';
import AdminStaff from './pages/admin/AdminStaff';
import AdminQuestions from './pages/admin/AdminQuestions';
import AdminOrders from './pages/admin/AdminOrders';
import AdminSurveys from './pages/admin/AdminSurveys';
import AdminSurveyForm from './pages/admin/AdminSurveyForm';
import AdminSurveyResults from './pages/admin/AdminSurveyResults';
import AdminVotingCampaigns from './pages/admin/AdminVotingCampaigns';
import AdminVotingForm from './pages/admin/AdminVotingForm';
import AdminVotingDetail from './pages/admin/AdminVotingDetail';
import AdminVotingStatistics from './pages/admin/AdminVotingStatistics';

// Admin Shop
import AdminReview from './pages/admin/shop/AdminReviews';
import AdminCoupons from './pages/admin/shop/AdminCoupons';
import AdminProducts from './pages/admin/shop/AdminProducts';
import AdminProductEdit from './pages/admin/shop/AdminProductEdit';
import AdminCategories from './pages/admin/shop/AdminCategories';
import AdminBranches from './pages/admin/shop/AdminBranches';
import AdminPaymentSettings from './pages/admin/shop/AdminPaymentSettings';
import AdminSystemOrders from './pages/admin/shop/AdminSystemOrders';

// Admin Contest pages
import AdminContests from './pages/admin/AdminContests';
import AdminContestDetail from './pages/admin/AdminContestDetail';
import AdminContestEdit from './pages/admin/AdminContestEdit';

// Staff pages
import StaffDashboard from './pages/staff/StaffDashboard';
import StaffQuestions from './pages/staff/StaffQuestions';
import StaffUsers from './pages/staff/StaffUsers';
import StaffPredictions from './pages/staff/StaffPredictions';

// Shop Pages
import ShopPage from './pages/shop/ShopPage';
import ProductDetailPage from './pages/shop/ProductDetailPage';
import CartPage from './pages/shop/CartPage';
import CheckoutPage from './pages/shop/CheckoutPage';
import OrderDetailPage from './pages/shop/OrderDetailPage';
import OrderHistoryPage from './pages/shop/OrderHistoryPage';

// Admin Chat
import AdminChat from './pages/admin/shop/AdminChat';

// Email verification
import EmailVerificationPage from './pages/auth/EmailVerificationPage';

// Protected Route component
function ProtectedRoute({ children, roles }: { children: React.ReactNode; roles?: string[] }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

// Public Route component (redirect to dashboard if logged in)
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <ErrorBoundary>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <AuthLayout>
                <LoginPage />
              </AuthLayout>
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <AuthLayout>
                <RegisterPage />
              </AuthLayout>
            </PublicRoute>
          }
        />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <MainLayout>
                <DashboardPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/predictions"
          element={
            <MainLayout>
              <PredictionsPage />
            </MainLayout>
          }
        />
        <Route
          path="/predictions/:id"
          element={
            <MainLayout>
              <PredictionDetailPage />
            </MainLayout>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <MainLayout>
                <ProfilePage />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/referrals"
          element={
            <ProtectedRoute>
              <MainLayout>
                <ReferralsPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/check-in"
          element={
            <MainLayout>
              <CheckInPage />
            </MainLayout>
          }
        />
        <Route
          path="/feedback"
          element={
            <MainLayout>
              <FeedbackPage />
            </MainLayout>
          }
        />
        <Route
          path="/surveys"
          element={
            <MainLayout>
              <SurveysPage />
            </MainLayout>
          }
        />
        <Route
          path="/surveys/:id"
          element={
            <ProtectedRoute>
              <MainLayout>
                <SurveyDetailPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Voting Routes */}
        <Route
          path="/voting"
          element={
            <MainLayout>
              <VotingCampaignsPage />
            </MainLayout>
          }
        />
        <Route
          path="/voting/:id"
          element={
            <MainLayout>
              <VotingDetailPage />
            </MainLayout>
          }
        />

        {/* Contest Routes */}
        <Route
          path="/contests"
          element={
            <MainLayout>
              <ContestsPage />
            </MainLayout>
          }
        />
        <Route
          path="/contests/:id"
          element={
            <MainLayout>
              <ContestDetailPage />
            </MainLayout>
          }
        />
        <Route
          path="/contests/history"
          element={
            <ProtectedRoute>
              <MainLayout>
                <ContestHistoryPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Shop Routes */}
        <Route
          path="/shop"
          element={
            <MainLayout>
              <ShopPage />
            </MainLayout>
          }
        />
        <Route
          path="/shop/products/:id"
          element={
            <MainLayout>
              <ProductDetailPage />
            </MainLayout>
          }
        />
        <Route
          path="/shop/cart"
          element={
            <MainLayout>
              <CartPage />
            </MainLayout>
          }
        />
        <Route
          path="/shop/checkout"
          element={
            <MainLayout>
              <CheckoutPage />
            </MainLayout>
          }
        />

        <Route
          path="/shop/orders"
          element={
            <ProtectedRoute>
              <MainLayout>
                <OrderHistoryPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/shop/orders/:id"
          element={
            <MainLayout>
              <OrderDetailPage />
            </MainLayout>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={['admin']}>
              <MainLayout>
                <AdminDashboard />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute roles={['admin']}>
              <MainLayout>
                <AdminDashboard />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/predictions"
          element={
            <ProtectedRoute roles={['admin']}>
              <MainLayout>
                <AdminPredictions />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/predictions/:id"
          element={
            <ProtectedRoute roles={['admin']}>
              <MainLayout>
                <AdminPredictionDetail />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/predictions/create"
          element={
            <ProtectedRoute roles={['admin']}>
              <MainLayout>
                <AdminPredictionCreate />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/predictions/:id/edit"
          element={
            <ProtectedRoute roles={['admin']}>
              <MainLayout>
                <AdminPredictionEdit />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute roles={['admin']}>
              <MainLayout>
                <AdminUsers />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/feedback"
          element={
            <ProtectedRoute roles={['admin']}>
              <MainLayout>
                <AdminFeedback />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/grant-points"
          element={
            <ProtectedRoute roles={['admin']}>
              <MainLayout>
                <AdminGrantPoints />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/staff"
          element={
            <ProtectedRoute roles={['admin']}>
              <MainLayout>
                <AdminStaff />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/questions"
          element={
            <ProtectedRoute roles={['admin']}>
              <MainLayout>
                <AdminQuestions />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/orders"
          element={
            <ProtectedRoute roles={['admin']}>
              <MainLayout>
                <AdminOrders />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/surveys"
          element={
            <ProtectedRoute roles={['admin']}>
              <MainLayout>
                <AdminSurveys />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/surveys/new"
          element={
            <ProtectedRoute roles={['admin']}>
              <MainLayout>
                <AdminSurveyForm />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/surveys/edit/:id"
          element={
            <ProtectedRoute roles={['admin']}>
              <MainLayout>
                <AdminSurveyForm />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/surveys/:id/results"
          element={
            <ProtectedRoute roles={['admin']}>
              <MainLayout>
                <AdminSurveyResults />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Admin Voting Routes */}
        <Route
          path="/admin/voting/campaigns"
          element={
            <ProtectedRoute roles={['admin']}>
              <MainLayout>
                <AdminVotingCampaigns />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/voting/campaigns/new"
          element={
            <ProtectedRoute roles={['admin']}>
              <MainLayout>
                <AdminVotingForm />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/voting/campaigns/:id/edit"
          element={
            <ProtectedRoute roles={['admin']}>
              <MainLayout>
                <AdminVotingForm />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/voting/campaigns/:id"
          element={
            <ProtectedRoute roles={['admin']}>
              <MainLayout>
                <AdminVotingDetail />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/voting/campaigns/:id/statistics"
          element={
            <ProtectedRoute roles={['admin']}>
              <MainLayout>
                <AdminVotingStatistics />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Admin Shop Routes */}
        <Route
          path="/admin/shop/products"
          element={
            <ProtectedRoute roles={['admin']}>
              <MainLayout>
                <AdminProducts />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/shop/products/new"
          element={
            <ProtectedRoute roles={['admin']}>
              <MainLayout>
                <AdminProductEdit />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/shop/products/:id/edit"
          element={
            <ProtectedRoute roles={['admin']}>
              <MainLayout>
                <AdminProductEdit />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/shop/categories"
          element={
            <ProtectedRoute roles={['admin']}>
              <MainLayout>
                <AdminCategories />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/shop/branches"
          element={
            <ProtectedRoute roles={['admin']}>
              <MainLayout>
                <AdminBranches />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/shop/settings"
          element={
            <ProtectedRoute roles={['admin']}>
              <MainLayout>
                <AdminPaymentSettings />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/shop/orders"
          element={
            <ProtectedRoute roles={['admin']}>
              <MainLayout>
                <AdminSystemOrders />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/shop/chat"
          element={
            <ProtectedRoute roles={['admin']}>
              <MainLayout>
                <AdminChat />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/shop/reviews"
          element={
            <ProtectedRoute roles={['admin']}>
              <MainLayout>
                <AdminReview />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/shop/coupons"
          element={
            <ProtectedRoute roles={['admin']}>
              <MainLayout>
                <AdminCoupons />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Admin Contest Routes */}
        <Route
          path="/admin/contests"
          element={
            <ProtectedRoute roles={['admin']}>
              <MainLayout>
                <AdminContests />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/contests/:id"
          element={
            <ProtectedRoute roles={['admin']}>
              <MainLayout>
                <AdminContestDetail />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/contests/:id/edit"
          element={
            <ProtectedRoute roles={['admin']}>
              <MainLayout>
                <AdminContestEdit />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Staff Routes */}
        <Route
          path="/staff"
          element={
            <ProtectedRoute roles={['staff']}>
              <MainLayout>
                <StaffDashboard />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff/questions"
          element={
            <ProtectedRoute roles={['staff']}>
              <MainLayout>
                <StaffQuestions />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff/users"
          element={
            <ProtectedRoute roles={['staff']}>
              <MainLayout>
                <StaffUsers />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff/predictions"
          element={
            <ProtectedRoute roles={['staff']}>
              <MainLayout>
                <StaffPredictions />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Email Verification */}
        <Route
          path="/verify-email"
          element={<EmailVerificationPage />}
        />

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/predictions" replace />} />

        {/* 404 */}
        <Route path="*" element={<Navigate to="/predictions" replace />} />
      </Routes>
    </ErrorBoundary>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-transparent">
          <AppRoutes />
          <Toaster
            position="top-right"
            reverseOrder={false}
            gutter={8}
            toastOptions={{
              duration: 3000,
              style: {
                background: '#fff',
                color: '#202124',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                borderRadius: '8px',
                border: '1px solid #f1f3f4',
                fontSize: '14px',
                fontWeight: '400',
                padding: '12px 16px',
                maxWidth: '420px',
              },
              success: {
                iconTheme: {
                  primary: '#1a73e8', // Google Blue
                  secondary: '#ffffff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#d93025', // Google Red
                  secondary: '#ffffff',
                },
              },
            }}
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
