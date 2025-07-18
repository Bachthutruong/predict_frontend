import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { CheckCircle, XCircle, Loader2, Mail } from 'lucide-react';
import { authAPI } from '../../services/api';
import { useLanguage } from '../../hooks/useLanguage';

const EmailVerificationPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const token = searchParams.get('token');
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage(t('auth.invalidVerificationLink'));
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await authAPI.verifyEmail(token);
        if (response.success) {
          setStatus('success');
          setMessage(response.message || t('auth.emailVerified'));
        } else {
          setStatus('error');
          setMessage(response.message || t('auth.verificationFailed'));
        }
      } catch (error) {
        setStatus('error');
        setMessage(t('auth.verificationError'));
      }
    };

    verifyEmail();
  }, [token, t]);

  const handleContinue = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              {status === 'loading' && <Loader2 className="h-12 w-12 text-primary animate-spin" />}
              {status === 'success' && <CheckCircle className="h-12 w-12 text-green-500" />}
              {status === 'error' && <XCircle className="h-12 w-12 text-red-500" />}
            </div>
            <CardTitle className="text-2xl">
              {status === 'loading' && t('auth.verifyingEmail')}
              {status === 'success' && t('auth.emailVerified')}
              {status === 'error' && t('auth.verificationFailed')}
            </CardTitle>
            <CardDescription>
              {status === 'loading' && t('auth.pleaseWaitVerification')}
              {status === 'success' && t('auth.emailVerifiedDescription')}
              {status === 'error' && t('auth.verificationProblem')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {message && (
              <Alert variant={status === 'error' ? 'destructive' : 'default'}>
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}

            {status === 'success' && (
              <Button onClick={handleContinue} className="w-full">
                {t('auth.continueToLogin')}
              </Button>
            )}

            {status === 'error' && (
              <div className="space-y-2">
                <Button onClick={handleContinue} variant="outline" className="w-full">
                  {t('auth.goToLogin')}
                </Button>
                <p className="text-center text-sm text-muted-foreground">
                  {t('auth.needHelpContact')}
                </p>
              </div>
            )}

            {status === 'loading' && (
              <div className="text-center">
                <div className="animate-pulse">
                  <Mail className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {t('auth.mayTakeFewMoments')}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmailVerificationPage; 