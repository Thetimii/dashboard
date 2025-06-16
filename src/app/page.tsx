'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { LandingPage } from '@/components/LandingPage';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !loading && user) {
      // Only redirect if user is authenticated
      router.push('/dashboard');
    }
  }, [user, loading, router, mounted]);

  // Show loading while mounting or auth is loading
  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300 font-inter text-lg">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  // If user is authenticated, they'll be redirected to dashboard
  // If not authenticated, show the landing page
  if (user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300 font-inter text-lg">
            Redirecting to dashboard...
          </p>
        </div>
      </div>
    );
  }

  return <LandingPage />;
}
