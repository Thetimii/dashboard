'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase';
import ProjectList from '@/components/admin/ProjectList';
import ProjectKanban from '@/components/admin/ProjectKanban';
import { ThemeToggle } from '@/components/ThemeToggle';

type FilterState = {
  status: string;
  search: string;
  assignedTo: string;
  showOnlyMine: boolean;
};

type Admin = {
  id: string;
  full_name: string | null;
};

export default function ProjectsPage() {
  const [view, setView] = useState<'list' | 'kanban'>('list');
  const [filters, setFilters] = useState<FilterState>({
    status: '',
    search: '',
    assignedTo: '',
    showOnlyMine: false,
  });
  const [admins, setAdmins] = useState<Admin[]>([]);
  const { user } = useAuth();
  const supabase = createClient();

  useEffect(() => {
    const fetchAdmins = async () => {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, full_name')
        .eq('role', 'admin');

      if (!error && data) {
        setAdmins(data);
      }
    };

    fetchAdmins();
  }, [supabase]);

  const handleFilterChange = (key: keyof FilterState, value: string | boolean) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      search: '',
      assignedTo: '',
      showOnlyMine: false,
    });
  };

  return (
    <div>
      {/* Header with View Toggle */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Projects</h1>
        <div className="flex items-center space-x-4">
          <ThemeToggle />
          <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setView('list')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                view === 'list'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              List View
            </button>
            <button
              onClick={() => setView('kanban')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                view === 'kanban'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Kanban View
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Filters</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Search (Business/Client)
            </label>
            <input
              type="text"
              placeholder="Search by business name or client email..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Statuses</option>
              <option value="not_touched">Not Touched</option>
              <option value="in_progress">In Progress</option>
              <option value="complete">Complete</option>
              <option value="live">Live</option>
            </select>
          </div>

          {/* Assigned To Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Assigned To
            </label>
            <select
              value={filters.assignedTo}
              onChange={(e) => handleFilterChange('assignedTo', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Admins</option>
              {admins.map((admin) => (
                <option key={admin.id} value={admin.id}>
                  {admin.full_name || 'Unnamed Admin'}
                </option>
              ))}
            </select>
          </div>

          {/* Show Only Mine Toggle */}
          <div className="flex items-center">
            <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
              <input
                type="checkbox"
                checked={filters.showOnlyMine}
                onChange={(e) => handleFilterChange('showOnlyMine', e.target.checked)}
                className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              Show only my clients
            </label>
          </div>
        </div>

        {/* Clear Filters Button */}
        <div className="flex justify-end">
          <button
            onClick={clearFilters}
            className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            Clear All Filters
          </button>
        </div>
      </div>
      
      {/* Content */}
      {view === 'list' ? (
        <ProjectList filters={filters} />
      ) : (
        <ProjectKanban filters={filters} />
      )}
    </div>
  );
}
