import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../hooks/useLanguage';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Lock, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { userAPI } from '../../services/api';

export default function ChangePasswordPage() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error(t('profile.passwordMinLength') || 'Mật khẩu mới tối thiểu 6 ký tự');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error(t('profile.passwordMismatch') || 'Mật khẩu xác nhận không khớp');
      return;
    }
    if (!user?.isAutoCreated && !currentPassword) {
      toast.error(t('profile.enterCurrentPassword') || 'Vui lòng nhập mật khẩu hiện tại');
      return;
    }
    setIsLoading(true);
    try {
      const currentPwd = currentPassword;
      const res = await userAPI.changePassword({
        currentPassword: currentPwd,
        newPassword
      });
      if (res.success) {
        toast.success(t('profile.passwordChanged') || 'Đổi mật khẩu thành công');
        await refreshUser();
        navigate('/dashboard', { replace: true });
      } else {
        toast.error(res.message || t('profile.changePasswordFailed'));
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || t('profile.changePasswordFailed') || 'Đổi mật khẩu thất bại');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            {t('profile.changePassword')}
          </CardTitle>
          <CardDescription>
            {user?.isAutoCreated
              ? (t('auth.changePasswordRequired') || 'Đây là lần đăng nhập đầu tiên. Vui lòng đặt mật khẩu mới (mật khẩu mặc định từ email: 123456789).')
              : (t('auth.changePasswordOptional') || 'Nhập mật khẩu hiện tại và mật khẩu mới.')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current">{t('profile.currentPassword')}</Label>
              <Input
                id="current"
                type="password"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                placeholder={user?.isAutoCreated ? '123456789' : t('profile.enterCurrentPassword')}
                required
              />
              {user?.isAutoCreated && (
                <p className="text-xs text-gray-500">{t('auth.defaultPasswordHint')}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="new">{t('profile.newPassword')}</Label>
              <Input
                id="new"
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder={t('profile.enterNewPassword')}
                required
                minLength={6}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm">{t('profile.confirmNewPassword')}</Label>
              <Input
                id="confirm"
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder={t('profile.confirmNewPasswordPlaceholder')}
                required
                minLength={6}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('common.loading')}
                </>
              ) : (
                t('profile.changePassword')
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
