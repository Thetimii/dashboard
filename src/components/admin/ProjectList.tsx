'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase';
import Link from 'next/link';

type FilterState = {
  status: string;
  search: string;
  assignedTo: string;
  showOnlyMine: boolean;
};

type Project = {
  id: string;
  user_id: string;
  business_name: string | null;
  business_description: string | null;
  website_style: string | null;
  desired_pages: string[] | null;
  color_preferences: string | null;
  logo_url: string | null;
  content_upload_url: string | null;
  special_requests: string | null;
  kickoff_completed: boolean;
  full_name: string | null;
  email: string | null;
  created_at: string;
  project_status: string | null;
  final_url: string | null;
  status_updated_at: string | null;
  option_1_url: string | null;
  option_2_url: string | null;
  option_3_url: string | null;
  approved_option: string | null;
  approved_at: string | null;
  payment_status: string | null;
  payment_amount: number | null;
  stripe_customer_id: string | null;
  subscription_status: string | null;
  cancel_at_period_end: boolean | null;
  canceled_at: string | null;
  assigned_admin_id: string | null;
  assigned_admin_name: string | null;
};

type Props = {
  filters?: FilterState;
};

const ProjectList = ({ filters }: Props) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const supabase = createClient();

  useEffect(() => {
    const fetchProjects = async () => {
      let query = supabase.from('projects_view').select('*');

      // Apply filters
      if (filters?.status) {
        query = query.eq('project_status', filters.status);
      }

      if (filters?.assignedTo) {
        query = query.eq('assigned_admin_id', filters.assignedTo);
      }

      if (filters?.showOnlyMine && user) {
        query = query.eq('assigned_admin_id', user.id);
      }

      if (filters?.search) {
        query = query.or(`business_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,full_name.ilike.%${filters.search}%`);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching projects:', error);
      } else {
        setProjects(data as Project[]);
      }
      setLoading(false);
    };

    fetchProjects();
  }, [supabase, filters, user]);

  const assignClient = async (clientId: string, adminId: string) => {
    const { error } = await supabase
      .from('client_assignments')
      .upsert({
        client_id: clientId,
        admin_id: adminId,
      });

    if (error) {
      console.error('Error assigning client:', error);
      alert('Error assigning client');
    } else {
      // Refresh the projects list
      window.location.reload();
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Client Projects ({projects.length})
        </h2>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Client Info</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Business Details</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Project Status</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Payment Status</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Assignment</th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {projects.map((project) => (
              <tr key={project.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                {/* Client Info */}
                <td className="px-4 py-4">
                  <div className="space-y-1">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {project.full_name || 'No Name'}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {project.email}
                    </div>
                    <div className="text-xs text-gray-400 dark:text-gray-500">
                      Joined: {new Date(project.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </td>

                {/* Business Details */}
                <td className="px-4 py-4">
                  <div className="space-y-1">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {project.business_name || 'No Business Name'}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 max-w-xs truncate">
                      {project.business_description || 'No description'}
                    </div>
                    <div className="text-xs text-gray-400 dark:text-gray-500">
                      Style: {project.website_style || 'Not specified'}
                    </div>
                    {project.desired_pages && (
                      <div className="text-xs text-gray-400 dark:text-gray-500">
                        Pages: {Array.isArray(project.desired_pages) ? project.desired_pages.length : 0}
                      </div>
                    )}
                  </div>
                </td>

                {/* Project Status */}
                <td className="px-4 py-4">
                  <div className="space-y-2">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      project.project_status === 'live' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                      project.project_status === 'complete' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                      project.project_status === 'in_progress' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {project.project_status || 'not_touched'}
                    </span>
                    
                    {project.kickoff_completed && (
                      <div className="text-xs text-green-600 dark:text-green-400">
                        ✓ Kickoff Complete
                      </div>
                    )}
                    
                    {project.final_url && (
                      <div className="text-xs">
                        <a 
                          href={project.final_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          View Live Site
                        </a>
                      </div>
                    )}

                    {(project.option_1_url || project.option_2_url || project.option_3_url) && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Demos: {[project.option_1_url, project.option_2_url, project.option_3_url].filter(Boolean).length}/3
                        {project.approved_option && (
                          <span className="text-green-600 dark:text-green-400 ml-1">
                            (#{project.approved_option} approved)
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </td>

                {/* Payment Status */}
                <td className="px-4 py-4">
                  <div className="space-y-1">
                    {project.payment_status ? (
                      <>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          project.payment_status === 'paid' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                          project.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                          'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {project.payment_status}
                        </span>
                        {project.payment_amount && (
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            ${(project.payment_amount / 100).toFixed(2)}
                          </div>
                        )}
                        {project.subscription_status && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Subscription: {project.subscription_status}
                            {project.cancel_at_period_end && (
                              <span className="text-orange-600 dark:text-orange-400"> (Canceling)</span>
                            )}
                          </div>
                        )}
                      </>
                    ) : (
                      <span className="text-xs text-gray-400 dark:text-gray-500">No payment info</span>
                    )}
                  </div>
                </td>

                {/* Assignment */}
                <td className="px-4 py-4">
                  <div className="space-y-1">
                    {project.assigned_admin_name ? (
                      <div className="text-sm text-gray-900 dark:text-white">
                        {project.assigned_admin_name}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400 dark:text-gray-500">Unassigned</span>
                    )}
                  </div>
                </td>

                {/* Actions */}
                <td className="px-4 py-4">
                  <div className="flex flex-col space-y-2">
                    <Link 
                      href={`/admin/projects/${project.id}`} 
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 transition-colors text-sm"
                    >
                      View Details
                    </Link>
                    <Link 
                      href={`/admin/projects/${project.id}/edit`} 
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 transition-colors text-sm"
                    >
                      Edit Project
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {projects.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 dark:text-gray-400">
              No client projects found matching your filters.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectList;
