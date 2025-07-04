import React from 'react';
import type { ReactNode } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-primary mb-2">PredictWin</h1>
          <p className="text-muted-foreground">Win Big with Smart Predictions</p>
        </div>
        {children}
      </div>
    </div>
  );
};

export default AuthLayout; 