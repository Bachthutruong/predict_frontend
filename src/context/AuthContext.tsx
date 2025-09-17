import React, { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { AuthUser, LoginCredentials, RegisterData, User } from '../types';
import { authAPI, userAPI } from '../services/api';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://predict-backend-63un.onrender.com/api';

// Public API instance for token validation
const publicApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; message?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper function to convert User to AuthUser
const convertUserToAuthUser = (user: User): AuthUser => {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    points: user.points,
    avatarUrl: user.avatarUrl,
    isEmailVerified: user.isEmailVerified,
    consecutiveCheckIns: user.consecutiveCheckIns,
    totalSuccessfulReferrals: user.totalSuccessfulReferrals,
    referralCode: user.referralCode,
    createdAt: user.createdAt,
    phone: user.phone,
    address: user.address ? {
      street: user.address.street || '',
      city: user.address.city || '',
      state: user.address.state || '',
      postalCode: user.address.postalCode || '',
      country: user.address.country || '',
    } : undefined,
  };
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const validateToken = async (token: string): Promise<boolean> => {
    try {
      // Use public API instance to avoid 401 redirect
      const response = await publicApi.get('/users/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.success;
    } catch (error) {
      return false;
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (token && storedUser) {
        try {
          // Validate token before setting user
          const isValid = await validateToken(token);
          if (isValid) {
            setUser(JSON.parse(storedUser));
          } else {
            // Clear invalid token
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
        } catch (error) {
          console.error('Failed to restore auth state:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await authAPI.login(credentials);
      
      if (response.success && response.data) {
        const { token, user: userData } = response.data;
        
        // Check if email is verified
        if (!userData.isEmailVerified) {
          return { 
            success: false, 
            message: 'Please verify your email address before logging in. Check your email for the verification link.' 
          };
        }
        
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(convertUserToAuthUser(userData));
        
        return { success: true };
      } else {
        return { success: false, message: response.message || 'Login failed' };
      }
    } catch (error: any) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'An error occurred during login' 
      };
    }
  };

  const register = async (data: RegisterData) => {
    try {
      const response = await authAPI.register(data);
      
      if (response.success && response.data) {
        const { user: userData } = response.data;
        console.log(userData)
        // Don't log in user immediately - they need to verify email first
        return { 
          success: true, 
          message: 'Account created successfully! Please check your email to verify your account before logging in.',
          requiresVerification: true 
        };
      } else {
        return { success: false, message: response.message || 'Registration failed' };
      }
    } catch (error: any) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'An error occurred during registration' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const response = await userAPI.getProfile();
      if (response.success && response.data) {
        const updatedUser = response.data;
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(convertUserToAuthUser(updatedUser));
      }
    } catch (error) {
      console.error('Failed to refresh user data:', error);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    register,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 