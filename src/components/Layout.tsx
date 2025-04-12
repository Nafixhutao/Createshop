import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Home, User, LogOut } from 'lucide-react';

export function Layout({ children }: { children: React.ReactNode }) {
  const { signOut } = useAuthStore();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-indigo-600">SocialNet</h1>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <button
                  onClick={() => navigate('/')}
                  className="inline-flex items-center px-1 pt-1 text-gray-500 hover:text-gray-700"
                >
                  <Home className="h-5 w-5 mr-1" />
                  Home
                </button>
                <button
                  onClick={() => navigate('/profile')}
                  className="inline-flex items-center px-1 pt-1 text-gray-500 hover:text-gray-700"
                >
                  <User className="h-5 w-5 mr-1" />
                  Profile
                </button>
              </div>
            </div>
            <div className="flex items-center">
              <button
                onClick={() => signOut()}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}