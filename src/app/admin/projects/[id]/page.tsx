'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase';

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
      if (!params.id) return;

      // Fetch kickoff form data
      const { data: kickoffData, error: kickoffError } = await supabase
        .from('kickoff_forms')
        .select(`
          *,
          user_profiles!inner(full_name)
        `)
        .eq('id', params.id)
        .single();

      if (kickoffError) {
        console.error('Error fetching kickoff form:', kickoffError);
        setLoading(false);
        return;
      }

      // Fetch project status
      const { data: statusData } = await supabase
        .from('project_status')
        .select('status, final_url')
        .eq('user_id', kickoffData.user_id)
        .single();

      // Fetch demo links
      const { data: demoData } = await supabase
        .from('demo_links')
        .select('option_1_url, option_2_url, option_3_url, approved_option')
        .eq('user_id', kickoffData.user_id)
        .single();

      const projectDetails: ProjectDetails = {
        ...kickoffData,
        full_name: kickoffData.user_profiles?.full_name || null,
        project_status: statusData?.status || null,
        final_url: statusData?.final_url || null,
        option_1_url: demoData?.option_1_url || null,
        option_2_url: demoData?.option_2_url || null,
        option_3_url: demoData?.option_3_url || null,
        approved_option: demoData?.approved_option || null,
      };

      setProject(projectDetails);
      setLoading(false);
    };

    fetchProject();
  }, [params.id, supabase]);

  if (loading) {
    return <div>Loading project details...</div>;
  }

  if (!project) {
    return <div>Project not found</div>;
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{project.business_name}</h1>
        <a
          href={`/admin/projects/${project.id}/edit`}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
        >
          Edit Project
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">Client Information</h2>
          <div className="space-y-2">
            <p><strong>Client Name:</strong> {project.full_name}</p>
            <p><strong>Business Name:</strong> {project.business_name}</p>
            <p><strong>Business Description:</strong> {project.business_description}</p>
            <p><strong>Website Style:</strong> {project.website_style}</p>
            <p><strong>Color Preferences:</strong> {project.color_preferences}</p>
            <p><strong>Special Requests:</strong> {project.special_requests}</p>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Project Status</h2>
          <div className="space-y-2">
            <p><strong>Status:</strong> {project.project_status}</p>
            <p><strong>Final URL:</strong> 
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
          <h2 className="text-xl font-semibold mb-4">Demo Links</h2>
          <div className="space-y-2">
            <p><strong>Option 1:</strong> 
              {project.option_1_url ? (
                <a href={project.option_1_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline ml-1">
                  {project.option_1_url}
                </a>
              ) : (
                ' Not available'
              )}
            </p>
            <p><strong>Option 2:</strong> 
              {project.option_2_url ? (
                <a href={project.option_2_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline ml-1">
                  {project.option_2_url}
                </a>
              ) : (
                ' Not available'
              )}
            </p>
            <p><strong>Option 3:</strong> 
              {project.option_3_url ? (
                <a href={project.option_3_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline ml-1">
                  {project.option_3_url}
                </a>
              ) : (
                ' Not available'
              )}
            </p>
            <p><strong>Approved Option:</strong> {project.approved_option || 'Not selected'}</p>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Files</h2>
          <div className="space-y-2">
            <p><strong>Logo:</strong> 
              {project.logo_url ? (
                <a href={project.logo_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline ml-1">
                  View Logo
                </a>
              ) : (
                ' Not uploaded'
              )}
            </p>
            <p><strong>Content:</strong> 
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
    </div>
  );
}
