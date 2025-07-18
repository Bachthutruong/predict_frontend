import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../hooks/use-toast';
import { useLanguage } from '../../hooks/useLanguage';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
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
          description: t('messages.loginSuccess'),
          variant: "default"
        });
        navigate('/dashboard');
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
    <Card className="w-full">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl flex items-center justify-center gap-2">
          <LogIn className="h-6 w-6" />
          {t('auth.signIn')}
        </CardTitle>
        <CardDescription>
          {t('auth.login')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Show registration success message */}
        {showRegistrationMessage && registrationMessage && (
          <Alert className="mb-4">
            <Mail className="h-4 w-4" />
            <AlertDescription>
              {registrationMessage}
            </AlertDescription>
          </Alert>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              {t('auth.email')}
            </label>
            <Input
              id="email"
              type="email"
              placeholder={t('auth.email')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              {t('auth.password')}
            </label>
            <Input
              id="password"
              type="password"
              placeholder={t('auth.password')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
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
          <p className="text-sm text-muted-foreground">
            {t('auth.dontHaveAccount')}{' '}
            <Link to="/register" className="text-primary hover:underline font-medium">
              {t('auth.signUp')}
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default LoginPage; 