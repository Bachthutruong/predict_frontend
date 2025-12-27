import React from 'react';
import type { ReactNode } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f0f2f5] p-4 transition-colors font-roboto">
      <div className="max-w-[448px] w-full bg-white rounded-xl shadow-none sm:shadow-google p-8 sm:p-10 space-y-6 border border-[#dadce0]">
        <div className="text-center flex flex-col items-center mb-4">
          <div className="text-blue-600 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" /><path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" /><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" /><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" /></svg>
          </div>
          <h1 className="text-2xl font-normal text-gray-900 mb-2">PredictWin</h1>
          <p className="text-gray-500 text-base">Win Big with Smart Predictions</p>
        </div>
        {children}
      </div>
      <div className="fixed bottom-4 text-xs text-gray-400 flex gap-4">
        <span>Help</span>
        <span>Privacy</span>
        <span>Terms</span>
      </div>
    </div>
  );
};

export default AuthLayout; 