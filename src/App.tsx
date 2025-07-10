import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

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

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminPredictions from './pages/admin/AdminPredictions';
import AdminUsers from './pages/admin/AdminUsers';
import AdminFeedback from './pages/admin/AdminFeedback';
import AdminGrantPoints from './pages/admin/AdminGrantPoints';
import AdminStaff from './pages/admin/AdminStaff';
import AdminQuestions from './pages/admin/AdminQuestions';
import AdminOrders from './pages/admin/AdminOrders';
import AdminSurveys from './pages/admin/AdminSurveys';
import AdminSurveyForm from './pages/admin/AdminSurveyForm';
import AdminSurveyResults from './pages/admin/AdminSurveyResults';

// Staff pages
import StaffDashboard from './pages/staff/StaffDashboard';
import StaffQuestions from './pages/staff/StaffQuestions';
import StaffUsers from './pages/staff/StaffUsers';
import StaffPredictions from './pages/staff/StaffPredictions';

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
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
          <AppRoutes />
          <Toaster
            position="top-right"
            reverseOrder={false}
            gutter={8}
            toastOptions={{
              duration: 3000,
              style: {
                background: '#fff',
                color: '#363636',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                borderRadius: '8px',
                border: '1px solid #e1e5e9',
                fontSize: '14px',
                fontWeight: '500',
                padding: '12px 16px',
                maxWidth: '420px',
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#ffffff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
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
