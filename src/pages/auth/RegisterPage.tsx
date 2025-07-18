import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../hooks/use-toast';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { UserPlus, Loader2 } from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';

const RegisterPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { register } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();

  // Auto-fill referral code from URL parameter
  useEffect(() => {
    const refCode = searchParams.get('ref');
    if (refCode) {
      setReferralCode(refCode);
      console.log('Auto-filled referral code from URL:', refCode);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError(t('auth.fillAllFields'));
      toast({
        title: t('auth.missingInformation'),
        description: t('auth.fillAllFields'),
        variant: "destructive"
      });
      return;
    }

    if (password !== confirmPassword) {
      setError(t('auth.passwordMismatch'));
      toast({
        title: t('auth.passwordMismatch'),
        description: t('auth.passwordMismatch'),
        variant: "destructive"
      });
      return;
    }

    if (password.length < 6) {
      setError(t('auth.passwordMinLength'));
      toast({
        title: t('auth.passwordTooShort'),
        description: t('auth.passwordMinLength'),
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await register({ 
        name, 
        email, 
        password, 
        referralCode: referralCode || undefined 
      });
      
      if (result.success) {
        toast({
          title: t('auth.registrationSuccessful'),
          description: result.message || t('auth.accountCreated'),
          variant: "default"
        });
        
        navigate('/login', { 
          state: { 
            message: result.message,
            email: email 
          } 
        });
      } else {
        setError(result.message || t('auth.registrationFailed'));
        toast({
          title: t('auth.registrationFailed'),
          description: result.message || t('auth.failedToCreateAccount'),
          variant: "destructive"
        });
      }
    } catch (error) {
      setError(t('auth.registrationError'));
      toast({
        title: t('common.error'),
        description: t('auth.registrationError'),
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
          <UserPlus className="h-6 w-6" />
          {t('auth.signUp')}
        </CardTitle>
        <CardDescription>
          {t('auth.createAccountToStart')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              {t('auth.fullName')} *
            </label>
            <Input
              id="name"
              type="text"
              placeholder={t('auth.enterFullName')}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              {t('auth.email')} *
            </label>
            <Input
              id="email"
              type="email"
              placeholder={t('auth.enterEmail')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              {t('auth.password')} *
            </label>
            <Input
              id="password"
              type="password"
              placeholder={t('auth.enterPassword')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="text-sm font-medium">
              {t('auth.confirmPassword')} *
            </label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder={t('auth.confirmPassword')}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="referralCode" className="text-sm font-medium">
              {t('auth.referralCode')} ({t('auth.optional')})
            </label>
            <Input
              id="referralCode"
              type="text"
              placeholder={t('auth.enterReferralCode')}
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value)}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('auth.creatingAccount')}
              </>
            ) : (
              t('auth.createAccount')
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            {t('auth.alreadyHaveAccount')}{' '}
            <Link to="/login" className="text-primary hover:underline font-medium">
              {t('auth.signIn')}
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default RegisterPage; 