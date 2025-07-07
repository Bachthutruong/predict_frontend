import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useAuth } from '../../context/AuthContext';
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
          title: "Success",
          description: "Profile updated successfully"
        });
      } else {
        throw new Error(response.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update profile",
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
        title: "Error",
        description: "New passwords don't match",
        variant: "destructive"
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
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
          title: "Success",
          description: "Password changed successfully"
        });
      } else {
        throw new Error(response.message || 'Failed to change password');
      }
    } catch (error) {
      console.error('Password change error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to change password",
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
            <CardTitle>Personal Information</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={profileData.name}
                  onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter your full name"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Enter your phone number"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={profileData.dateOfBirth}
                  onChange={(e) => setProfileData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select value={profileData.gender} onValueChange={(value) => setProfileData(prev => ({ ...prev, gender: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                    <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Address Information */}
            <div className="border-t pt-4 mt-6">
              <h3 className="text-sm font-medium mb-4">Address Information</h3>
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="street">Street Address</Label>
                  <Input
                    id="street"
                    value={profileData.address.street}
                    onChange={(e) => setProfileData(prev => ({
                      ...prev,
                      address: { ...prev.address, street: e.target.value }
                    }))}
                    placeholder="Enter your street address"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={profileData.address.city}
                      onChange={(e) => setProfileData(prev => ({
                        ...prev,
                        address: { ...prev.address, city: e.target.value }
                      }))}
                      placeholder="Enter your city"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state">State/Province</Label>
                    <Input
                      id="state"
                      value={profileData.address.state}
                      onChange={(e) => setProfileData(prev => ({
                        ...prev,
                        address: { ...prev.address, state: e.target.value }
                      }))}
                      placeholder="Enter your state"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="postalCode">Postal Code</Label>
                    <Input
                      id="postalCode"
                      value={profileData.address.postalCode}
                      onChange={(e) => setProfileData(prev => ({
                        ...prev,
                        address: { ...prev.address, postalCode: e.target.value }
                      }))}
                      placeholder="Enter your postal code"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      value={profileData.address.country}
                      onChange={(e) => setProfileData(prev => ({
                        ...prev,
                        address: { ...prev.address, country: e.target.value }
                      }))}
                      placeholder="Enter your country"
                    />
                  </div>
                </div>
              </div>
            </div>

            <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Password Change Form */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            <CardTitle>Change Password</CardTitle>
          </div>
          {user?.isAutoCreated && (
            <p className="text-sm text-muted-foreground">
              Your account was created automatically. You can set a new password here.
            </p>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            {!user?.isAutoCreated && (
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showPasswords.current ? "text" : "password"}
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                    placeholder="Enter current password"
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
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPasswords.new ? "text" : "password"}
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                  placeholder="Enter new password (min 6 characters)"
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
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showPasswords.confirm ? "text" : "password"}
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  placeholder="Confirm new password"
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
              {isLoading ? 'Changing...' : 'Change Password'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileEditForm; 