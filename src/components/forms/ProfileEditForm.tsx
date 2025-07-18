import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../hooks/useLanguage';
import { userAPI } from '../../services/api';
import { useToast } from '../../hooks/use-toast';
import { User, Lock, Save, Eye, EyeOff } from 'lucide-react';

interface ProfileData {
  name: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
}

interface PasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const ProfileEditForm: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();
  
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const [profileData, setProfileData] = useState<ProfileData>({
    name: user?.name || '',
    phone: user?.phone || '',
    dateOfBirth: user?.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
    gender: user?.gender === '' ? 'prefer-not-to-say' : (user?.gender || 'prefer-not-to-say'),
    address: {
      street: user?.address?.street || '',
      city: user?.address?.city || '',
      state: user?.address?.state || '',
      postalCode: user?.address?.postalCode || '',
      country: user?.address?.country || ''
    }
  });

  const [passwordData, setPasswordData] = useState<PasswordData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Convert 'prefer-not-to-say' back to empty string for backend
      const dataToSubmit = {
        ...profileData,
        gender: profileData.gender === 'prefer-not-to-say' ? '' : profileData.gender
      };
      
      const response = await userAPI.updateProfile(dataToSubmit);
      
      if (response.success) {
        await refreshUser();
        toast({
          title: t('common.success'),
          description: t('profile.profileUpdated')
        });
      } else {
        throw new Error(response.message || t('profile.failedToUpdateProfile'));
      }
    } catch (error) {
      console.error('Profile update error:', error);
      toast({
        title: t('common.error'),
        description: error instanceof Error ? error.message : t('profile.failedToUpdateProfile'),
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: t('common.error'),
        description: t('profile.passwordsDoNotMatch'),
        variant: "destructive"
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        title: t('common.error'),
        description: t('profile.passwordTooShort'),
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await userAPI.changePassword({
        currentPassword: user?.isAutoCreated ? 'auto-created' : passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      if (response.success) {
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        await refreshUser();
        toast({
          title: t('common.success'),
          description: t('profile.passwordChangedSuccessfully')
        });
      } else {
        throw new Error(response.message || t('profile.failedToChangePassword'));
      }
    } catch (error) {
      console.error('Password change error:', error);
      toast({
        title: t('common.error'),
        description: error instanceof Error ? error.message : t('profile.failedToChangePassword'),
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  return (
    <div className="space-y-6">
      {/* Personal Information Form */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5" />
            <CardTitle>{t('profile.personalInformation')}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t('profile.fullName')}</Label>
                <Input
                  id="name"
                  value={profileData.name}
                  onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder={t('profile.enterFullName')}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">{t('profile.phoneNumber')}</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder={t('profile.enterPhoneNumber')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">{t('profile.dateOfBirth')}</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={profileData.dateOfBirth}
                  onChange={(e) => setProfileData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">{t('profile.gender')}</Label>
                <Select value={profileData.gender} onValueChange={(value) => setProfileData(prev => ({ ...prev, gender: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('profile.selectGender')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">{t('profile.male')}</SelectItem>
                    <SelectItem value="female">{t('profile.female')}</SelectItem>
                    <SelectItem value="other">{t('profile.other')}</SelectItem>
                    <SelectItem value="prefer-not-to-say">{t('profile.preferNotToSay')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Address Information */}
            <div className="border-t pt-4 mt-6">
              <h3 className="text-sm font-medium mb-4">{t('profile.addressInformation')}</h3>
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="street">{t('profile.streetAddress')}</Label>
                  <Input
                    id="street"
                    value={profileData.address.street}
                    onChange={(e) => setProfileData(prev => ({
                      ...prev,
                      address: { ...prev.address, street: e.target.value }
                    }))}
                    placeholder={t('profile.enterStreetAddress')}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">{t('profile.city')}</Label>
                    <Input
                      id="city"
                      value={profileData.address.city}
                      onChange={(e) => setProfileData(prev => ({
                        ...prev,
                        address: { ...prev.address, city: e.target.value }
                      }))}
                      placeholder={t('profile.enterCity')}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state">{t('profile.stateProvince')}</Label>
                    <Input
                      id="state"
                      value={profileData.address.state}
                      onChange={(e) => setProfileData(prev => ({
                        ...prev,
                        address: { ...prev.address, state: e.target.value }
                      }))}
                      placeholder={t('profile.enterState')}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="postalCode">{t('profile.postalCode')}</Label>
                    <Input
                      id="postalCode"
                      value={profileData.address.postalCode}
                      onChange={(e) => setProfileData(prev => ({
                        ...prev,
                        address: { ...prev.address, postalCode: e.target.value }
                      }))}
                      placeholder={t('profile.enterPostalCode')}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="country">{t('profile.country')}</Label>
                    <Input
                      id="country"
                      value={profileData.address.country}
                      onChange={(e) => setProfileData(prev => ({
                        ...prev,
                        address: { ...prev.address, country: e.target.value }
                      }))}
                      placeholder={t('profile.enterCountry')}
                    />
                  </div>
                </div>
              </div>
            </div>

            <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? t('profile.saving') : t('profile.saveChanges')}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Password Change Form */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            <CardTitle>{t('profile.changePassword')}</CardTitle>
          </div>
          {user?.isAutoCreated && (
            <p className="text-sm text-muted-foreground">
              {t('profile.accountCreatedAutomatically')}
            </p>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            {!user?.isAutoCreated && (
              <div className="space-y-2">
                <Label htmlFor="currentPassword">{t('profile.currentPassword')}</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showPasswords.current ? "text" : "password"}
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                    placeholder={t('profile.enterCurrentPassword')}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => togglePasswordVisibility('current')}
                  >
                    {showPasswords.current ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="newPassword">{t('profile.newPassword')}</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPasswords.new ? "text" : "password"}
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                  placeholder={t('profile.enterNewPassword')}
                  required
                  minLength={6}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => togglePasswordVisibility('new')}
                >
                  {showPasswords.new ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{t('profile.confirmNewPassword')}</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showPasswords.confirm ? "text" : "password"}
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  placeholder={t('profile.confirmNewPasswordPlaceholder')}
                  required
                  minLength={6}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => togglePasswordVisibility('confirm')}
                >
                  {showPasswords.confirm ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
              <Lock className="h-4 w-4 mr-2" />
              {isLoading ? t('profile.changing') : t('profile.changePassword')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileEditForm; 