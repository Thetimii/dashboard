'use client';

import ProjectList from '@/components/admin/ProjectList';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function AdminPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <ThemeToggle />
      </div>
      <ProjectList />
    </div>
  );
}
