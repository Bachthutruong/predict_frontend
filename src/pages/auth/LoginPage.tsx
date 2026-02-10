import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../hooks/use-toast';
import { useLanguage } from '../../hooks/useLanguage';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { LogIn, Loader2, Mail } from 'lucide-react';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showRegistrationMessage, setShowRegistrationMessage] = useState(false);
  const [registrationMessage, setRegistrationMessage] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { t } = useLanguage();

  // Check for registration success message
  useEffect(() => {
    if (location.state?.message && !showRegistrationMessage) {
      setRegistrationMessage(location.state.message);
      setShowRegistrationMessage(true);

      // Pre-fill email if provided
      if (location.state?.email) {
        setEmail(location.state.email);
      }

      // Clear the location state to prevent re-showing
      navigate(location.pathname, { replace: true });
    }
  }, [location.state, navigate, location.pathname, showRegistrationMessage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError(t('auth.emailRequired'));
      toast({
        title: t('common.error'),
        description: t('auth.emailRequired'),
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await login({ email, password });
      if (result.success) {
        toast({
          title: t('messages.welcomeBack'),
          description: result.mustChangePassword ? (t('auth.mustChangePassword') || 'Vui lòng đổi mật khẩu lần đầu.') : t('messages.loginSuccess'),
          variant: "default"
        });
        navigate(result.mustChangePassword ? '/change-password' : '/dashboard');
      } else {
        setError(result.message || t('auth.invalidCredentials'));
        toast({
          title: t('auth.login'),
          description: result.message || t('auth.invalidCredentials'),
          variant: "destructive"
        });
      }
    } catch (error) {
      setError(t('errors.unknownError'));
      toast({
        title: t('common.error'),
        description: t('errors.unknownError'),
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-medium tracking-tight flex items-center justify-center gap-2 text-gray-900">
          <LogIn className="h-6 w-6 text-blue-600" />
          {t('auth.signIn')}
        </h1>
        <p className="text-gray-500 text-sm">
          {t('auth.login')}
        </p>
      </div>

      <div>
        {/* Show registration success message */}
        {showRegistrationMessage && registrationMessage && (
          <Alert className="mb-4 bg-green-50 text-green-700 border-green-200">
            <Mail className="h-4 w-4" />
            <AlertDescription>
              {registrationMessage}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label htmlFor="email" className="text-sm font-medium text-gray-700">
              {t('auth.email')}
            </label>
            <Input
              id="email"
              type="email"
              placeholder={t('auth.email')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-11 border-gray-200 focus-visible:ring-blue-500"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="text-sm font-medium text-gray-700">
              {t('auth.password')}
            </label>
            <Input
              id="password"
              type="password"
              placeholder={t('auth.password')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-11 border-gray-200 focus-visible:ring-blue-500"
            />
          </div>

          <Button type="submit" className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm transition-colors" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('common.loading')}
              </>
            ) : (
              t('auth.signIn')
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            {t('auth.dontHaveAccount')}{' '}
            <Link to="/register" className="text-blue-600 hover:text-blue-700 font-medium hover:underline">
              {t('auth.signUp')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 