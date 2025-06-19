'use client';

import { useAuth } from '@/contexts/AuthContext';

export default function DebugPage() {
  const { user, isAdmin, loading } = useAuth();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Debug Info</h1>
      <div className="space-y-2">
        <p><strong>Loading:</strong> {loading.toString()}</p>
        <p><strong>User:</strong> {user ? user.email : 'No user'}</p>
        <p><strong>User ID:</strong> {user ? user.id : 'No user ID'}</p>
        <p><strong>Is Admin:</strong> {isAdmin.toString()}</p>
      </div>
    </div>
  );
}
