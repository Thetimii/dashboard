'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !loading) {
      if (user) {
        router.push('/dashboard');
      } else {
        router.push('/signup');
      }
    }
  }, [user, loading, router, mounted]);

  // Show loading while mounting or auth is loading
  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300 font-inter text-lg">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Fallback content (should rarely be seen due to redirect)
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-serif font-bold text-gray-900 dark:text-white mb-4">
          Welcome to Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-300 font-inter mb-8">
          Redirecting you to the right place...
        </p>
        <div className="space-x-4">
          <button
            onClick={() => router.push('/signup')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-inter"
          >
            Get Started
          </button>
          <button
            onClick={() => router.push('/signin')}
            className="px-6 py-3 border border-gray-300 text-gray-700 dark:text-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-inter"
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
}
