'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';

type ProjectStatus = 'not_touched' | 'in_progress' | 'complete' | 'live';

type ProjectEditData = {
  id: string;
  user_id: string;
  business_name: string | null;
  project_status: ProjectStatus;
  final_url: string | null;
  option_1_url: string | null;
  option_2_url: string | null;
  option_3_url: string | null;
  assigned_admin_id: string | null;
};

type Admin = {
  id: string;
  full_name: string | null;
};

export default function ProjectEditPage() {
  const params = useParams();
  const router = useRouter();
  const [project, setProject] = useState<ProjectEditData | null>(null);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const fetchProject = async () => {
      if (!params.id) return;

      // Fetch admins
      const { data: adminsData } = await supabase
        .from('user_profiles')
        .select('id, full_name')
        .eq('role', 'admin');

      if (adminsData) {
        setAdmins(adminsData);
      }

      // Fetch kickoff form data
      const { data: kickoffData, error: kickoffError } = await supabase
        .from('kickoff_forms')
        .select('id, user_id, business_name')
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
        .select('option_1_url, option_2_url, option_3_url')
        .eq('user_id', kickoffData.user_id)
        .single();

      // Fetch client assignment
      const { data: assignmentData } = await supabase
        .from('client_assignments')
        .select('admin_id')
        .eq('client_id', kickoffData.user_id)
        .single();

      const projectData: ProjectEditData = {
        ...kickoffData,
        project_status: (statusData?.status as ProjectStatus) || 'not_touched',
        final_url: statusData?.final_url || null,
        option_1_url: demoData?.option_1_url || null,
        option_2_url: demoData?.option_2_url || null,
        option_3_url: demoData?.option_3_url || null,
        assigned_admin_id: assignmentData?.admin_id || null,
      };

      setProject(projectData);
      setLoading(false);
    };

    fetchProject();
  }, [params.id, supabase]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project) return;

    setSaving(true);

    try {
      // Update or create project status
      const { data: existingStatus } = await supabase
        .from('project_status')
        .select('id')
        .eq('user_id', project.user_id)
        .single();

      if (existingStatus) {
        const { error: statusError } = await supabase
          .from('project_status')
          .update({
            status: project.project_status,
            final_url: project.final_url,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', project.user_id);

        if (statusError) throw statusError;
      } else {
        const { error: statusError } = await supabase
          .from('project_status')
          .insert({
            user_id: project.user_id,
            status: project.project_status,
            final_url: project.final_url,
            updated_at: new Date().toISOString(),
          });

        if (statusError) throw statusError;
      }

      // Update or create demo links
      const { data: existingDemo } = await supabase
        .from('demo_links')
        .select('id')
        .eq('user_id', project.user_id)
        .single();

      if (existingDemo) {
        const { error: demoError } = await supabase
          .from('demo_links')
          .update({
            option_1_url: project.option_1_url,
            option_2_url: project.option_2_url,
            option_3_url: project.option_3_url,
          })
          .eq('user_id', project.user_id);

        if (demoError) throw demoError;
      } else {
        const { error: demoError } = await supabase
          .from('demo_links')
          .insert({
            user_id: project.user_id,
            option_1_url: project.option_1_url,
            option_2_url: project.option_2_url,
            option_3_url: project.option_3_url,
          });

        if (demoError) throw demoError;
      }

      // Handle admin assignment
      if (project.assigned_admin_id) {
        // Check if assignment already exists
        const { data: existingAssignment } = await supabase
          .from('client_assignments')
          .select('id')
          .eq('client_id', project.user_id)
          .single();

        if (existingAssignment) {
          const { error: assignmentError } = await supabase
            .from('client_assignments')
            .update({
              admin_id: project.assigned_admin_id,
            })
            .eq('client_id', project.user_id);

          if (assignmentError) throw assignmentError;
        } else {
          const { error: assignmentError } = await supabase
            .from('client_assignments')
            .insert({
              admin_id: project.assigned_admin_id,
              client_id: project.user_id,
            });

          if (assignmentError) throw assignmentError;
        }
      } else {
        // Remove assignment if no admin selected
        await supabase
          .from('client_assignments')
          .delete()
          .eq('client_id', project.user_id);
      }

      alert('Project updated successfully!');
      router.push(`/admin/projects/${project.id}`);
    } catch (error) {
      console.error('Error updating project:', error);
      alert('Error updating project. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div>Loading project...</div>;
  }

  if (!project) {
    return <div>Project not found</div>;
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Edit: {project.business_name}</h1>
        <button
          onClick={() => router.push(`/admin/projects/${project.id}`)}
          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md"
        >
          Cancel
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Project Status</label>
            <select
              value={project.project_status}
              onChange={(e) => setProject({ ...project, project_status: e.target.value as ProjectStatus })}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="not_touched">Not Touched</option>
              <option value="in_progress">In Progress</option>
              <option value="complete">Complete</option>
              <option value="live">Live</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Assign to Admin</label>
            <select
              value={project.assigned_admin_id || ''}
              onChange={(e) => setProject({ ...project, assigned_admin_id: e.target.value || null })}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">No Admin Assigned</option>
              {admins.map((admin) => (
                <option key={admin.id} value={admin.id}>
                  {admin.full_name || 'Unnamed Admin'}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Final URL</label>
          <input
            type="url"
            value={project.final_url || ''}
            onChange={(e) => setProject({ ...project, final_url: e.target.value })}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="https://example.com"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Demo Option 1 URL</label>
            <input
              type="url"
              value={project.option_1_url || ''}
              onChange={(e) => setProject({ ...project, option_1_url: e.target.value })}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://demo1.example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Demo Option 2 URL</label>
            <input
              type="url"
              value={project.option_2_url || ''}
              onChange={(e) => setProject({ ...project, option_2_url: e.target.value })}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://demo2.example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Demo Option 3 URL</label>
            <input
              type="url"
              value={project.option_3_url || ''}
              onChange={(e) => setProject({ ...project, option_3_url: e.target.value })}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://demo3.example.com"
            />
          </div>
        </div>

        <div className="flex space-x-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="submit"
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium px-6 py-3 rounded-md transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            type="button"
            onClick={() => router.push(`/admin/projects/${project.id}`)}
            className="bg-gray-500 hover:bg-gray-600 text-white font-medium px-6 py-3 rounded-md transition-colors focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
