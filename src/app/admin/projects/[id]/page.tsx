'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { ManualEmailTrigger } from '@/components/admin/ManualEmailTrigger';

type ProjectDetails = {
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
  full_name: string | null;
  project_status: string | null;
  final_url: string | null;
  option_1_url: string | null;
  option_2_url: string | null;
  option_3_url: string | null;
  approved_option: string | null;
};

export default function ProjectDetailPage() {
  const params = useParams();
  const [project, setProject] = useState<ProjectDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchProject = async () => {
      if (!params.id) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // Fetch kickoff form data first
        const { data: kickoffData, error: kickoffError } = await supabase
          .from('kickoff_forms')
          .select('*')
          .eq('id', params.id)
          .single();

        if (kickoffError || !kickoffData) {
          console.error('Error fetching kickoff form or no data found:', kickoffError);
          setProject(null);
          setLoading(false);
          return;
        }

        // Fetch related data in parallel
        const [
          { data: userProfile, error: userProfileError },
          { data: statusData, error: statusDataError },
          { data: demoData, error: demoDataError }
        ] = await Promise.all([
          supabase
            .from('user_profiles')
            .select('full_name')
            .eq('id', kickoffData.user_id)
            .single(),
          supabase
            .from('project_status')
            .select('status, final_url')
            .eq('user_id', kickoffData.user_id)
            .single(),
          supabase
            .from('demo_links')
            .select('option_1_url, option_2_url, option_3_url, approved_option')
            .eq('user_id', kickoffData.user_id)
            .single()
        ]);

        if (userProfileError && userProfileError.code !== 'PGRST116') {
          console.error('Error fetching user profile:', userProfileError);
        }
        if (statusDataError && statusDataError.code !== 'PGRST116') {
          console.error('Error fetching project status:', statusDataError);
        }
        if (demoDataError && demoDataError.code !== 'PGRST116') {
          console.error('Error fetching demo links:', demoDataError);
        }

        const projectDetails: ProjectDetails = {
          ...kickoffData,
          full_name: userProfile?.full_name || null,
          project_status: statusData?.status || 'not_touched', // Default status
          final_url: statusData?.final_url || null,
          option_1_url: demoData?.option_1_url || null,
          option_2_url: demoData?.option_2_url || null,
          option_3_url: demoData?.option_3_url || null,
          approved_option: demoData?.approved_option || null,
        };

        setProject(projectDetails);
      } catch (error) {
        console.error('Error fetching project details:', error);
        setProject(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [params.id, supabase]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading project details...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 18.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Project Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            The project with ID "{params.id}" could not be found or you don't have permission to view it.
          </p>
          <div className="space-y-2">
            <button 
              onClick={() => window.history.back()}
              className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              Go Back
            </button>
            <a 
              href="/database-debug"
              className="block w-full px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Debug Database
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{project.business_name}</h1>
            <a
              href={`/admin/projects/${project.id}/edit`}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors"
            >
              Edit Project
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Client Information</h2>
              <div className="space-y-2">
                <p className="text-gray-700 dark:text-gray-300"><strong>Client Name:</strong> {project.full_name}</p>
                <p className="text-gray-700 dark:text-gray-300"><strong>Business Name:</strong> {project.business_name}</p>
                <p className="text-gray-700 dark:text-gray-300"><strong>Business Description:</strong> {project.business_description}</p>
                <p className="text-gray-700 dark:text-gray-300"><strong>Website Style:</strong> {project.website_style}</p>
                <p className="text-gray-700 dark:text-gray-300"><strong>Color Preferences:</strong> {project.color_preferences}</p>
                <p className="text-gray-700 dark:text-gray-300"><strong>Special Requests:</strong> {project.special_requests}</p>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Project Status</h2>
              <div className="space-y-2">
                <p className="text-gray-700 dark:text-gray-300"><strong>Status:</strong> {project.project_status}</p>
                <p className="text-gray-700 dark:text-gray-300"><strong>Final URL:</strong> 
                  {project.final_url ? (
                    <a href={project.final_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline ml-1">
                      {project.final_url}
                    </a>
                  ) : (
                    ' Not available'
                  )}
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Demo Links</h2>
              <div className="space-y-2">
                <p className="text-gray-700 dark:text-gray-300"><strong>Option 1:</strong> 
                  {project.option_1_url ? (
                    <a href={project.option_1_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline ml-1">
                      {project.option_1_url}
                    </a>
                  ) : (
                    ' Not available'
                  )}
                </p>
                <p className="text-gray-700 dark:text-gray-300"><strong>Option 2:</strong> 
                  {project.option_2_url ? (
                    <a href={project.option_2_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline ml-1">
                      {project.option_2_url}
                    </a>
                  ) : (
                    ' Not available'
                  )}
                </p>
                <p className="text-gray-700 dark:text-gray-300"><strong>Option 3:</strong> 
                  {project.option_3_url ? (
                    <a href={project.option_3_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline ml-1">
                      {project.option_3_url}
                    </a>
                  ) : (
                    ' Not available'
                  )}
                </p>
                <p className="text-gray-700 dark:text-gray-300"><strong>Approved Option:</strong> {project.approved_option || 'Not selected'}</p>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Files</h2>
              <div className="space-y-2">
                <p className="text-gray-700 dark:text-gray-300"><strong>Logo:</strong> 
                  {project.logo_url ? (
                    <a href={project.logo_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline ml-1">
                      View Logo
                    </a>
                  ) : (
                    ' Not uploaded'
                  )}
                </p>
                <p className="text-gray-700 dark:text-gray-300"><strong>Content:</strong> 
                  {project.content_upload_url ? (
                    <a href={project.content_upload_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline ml-1">
                      View Content
                    </a>
                  ) : (
                    ' Not uploaded'
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Manual Email Triggers Section */}
          <div className="mt-8">
            <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">Email Notifications</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ManualEmailTrigger
                userId={project.user_id}
                emailType="demo_ready"
                projectData={project}
              />
              <ManualEmailTrigger
                userId={project.user_id}
                emailType="website_launch"
                projectData={project}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
