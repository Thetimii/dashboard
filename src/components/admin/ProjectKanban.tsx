'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

type FilterState = {
  status: string;
  search: string;
  assignedTo: string;
  showOnlyMine: boolean;
};

type Props = {
  filters?: FilterState;
};

// Define the types for the project and status
type Project = {
  id: string;
  user_id: string;
  business_name: string | null;
  full_name: string | null;
  email: string | null;
  project_status: Status | null;
  payment_status: string | null;
  assigned_admin_name: string | null;
  kickoff_completed: boolean;
  created_at: string;
};

type Status = 'not_touched' | 'in_progress' | 'complete' | 'live';

const statusColumns: Record<Status, string> = {
  not_touched: 'Not Touched',
  in_progress: 'In Progress',
  complete: 'Complete',
  live: 'Live',
};

// Draggable Project Card Component
function ProjectCard({ project }: { project: Project }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: project.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm border-2 border-gray-200 dark:border-gray-600 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-500 transition-all cursor-grab active:cursor-grabbing ${
        isDragging ? 'opacity-50 shadow-lg border-blue-400 dark:border-blue-400' : ''
      }`}
    >
      <div className="space-y-2">
        {/* Business Name */}
        <p className="font-medium text-sm text-gray-900 dark:text-gray-100 leading-relaxed">
          {project.business_name || 'No Business Name'}
        </p>
        
        {/* Client Info */}
        <div className="text-xs text-gray-600 dark:text-gray-400">
          <div className="font-medium">{project.full_name || 'No Name'}</div>
          <div className="truncate">{project.email}</div>
        </div>

        {/* Status Badges */}
        <div className="flex flex-wrap gap-1">
          {project.kickoff_completed && (
            <span className="inline-flex px-1.5 py-0.5 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded">
              Kickoff ✓
            </span>
          )}
          
          {project.payment_status && (
            <span className={`inline-flex px-1.5 py-0.5 text-xs font-medium rounded ${
              project.payment_status === 'paid' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
              project.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
              'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
            }`}>
              {project.payment_status}
            </span>
          )}
        </div>

        {/* Assignment */}
        {project.assigned_admin_name && (
          <div className="text-xs text-blue-600 dark:text-blue-400">
            Assigned to: {project.assigned_admin_name}
          </div>
        )}

        {/* Date */}
        <div className="text-xs text-gray-500 dark:text-gray-500">
          {new Date(project.created_at).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
}

// Droppable Column Component
function StatusColumn({ 
  status, 
  title, 
  projects 
}: { 
  status: Status; 
  title: string; 
  projects: Project[] 
}) {
  const { setNodeRef } = useDroppable({
    id: status,
  });

  return (
    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg border-2 border-gray-300 dark:border-gray-600">
      <div className="p-4 border-b-2 border-gray-300 dark:border-gray-600 bg-gray-200 dark:bg-gray-700">
        <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100 uppercase tracking-wide">
          {title}
          <span className="ml-2 text-xs text-gray-600 dark:text-gray-300 font-normal">
            ({projects.length})
          </span>
        </h3>
      </div>
      <div 
        ref={setNodeRef}
        className="p-4 space-y-3 min-h-[300px] bg-gray-50 dark:bg-gray-800"
      >
        <SortableContext items={projects.map(p => p.id)} strategy={verticalListSortingStrategy}>
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}

const ProjectKanban = ({ filters }: Props) => {
  const [projects, setProjects] = useState<Record<Status, Project[]>>({
    not_touched: [],
    in_progress: [],
    complete: [],
    live: [],
  });
  const [loading, setLoading] = useState(true);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const supabase = createClient();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    const fetchProjects = async () => {
      let query = supabase
        .from('projects_view')
        .select(`
          id, 
          user_id, 
          business_name, 
          full_name, 
          email,
          project_status,
          payment_status,
          assigned_admin_name,
          assigned_admin_id,
          kickoff_completed,
          created_at
        `);

      // Apply filters
      if (filters?.status) {
        query = query.eq('project_status', filters.status);
      }

      if (filters?.assignedTo) {
        query = query.eq('assigned_admin_id', filters.assignedTo);
      }

      if (filters?.search) {
        query = query.or(`business_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,full_name.ilike.%${filters.search}%`);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching projects:', error);
      } else {
        const groupedProjects = (data as any[]).reduce((acc, project) => {
          const status = (project.project_status as Status) || 'not_touched';
          if (!acc[status]) {
            acc[status] = [];
          }
          acc[status].push({
            id: project.id,
            user_id: project.user_id,
            business_name: project.business_name,
            full_name: project.full_name,
            email: project.email,
            project_status: status,
            payment_status: project.payment_status,
            assigned_admin_name: project.assigned_admin_name,
            kickoff_completed: project.kickoff_completed || false,
            created_at: project.created_at,
          });
          return acc;
        }, {
          not_touched: [],
          in_progress: [],
          complete: [],
          live: [],
        } as Record<Status, Project[]>);

        setProjects(groupedProjects);
      }
      setLoading(false);
    };

    fetchProjects();
  }, [supabase, filters]);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const project = findProjectById(active.id as string);
    setActiveProject(project);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;

    const projectId = active.id as string;
    const newStatus = over.id as Status;
    
    const project = findProjectById(projectId);
    if (!project || project.project_status === newStatus) return;

    // Update the local state immediately for better UX
    setProjects(prev => {
      const oldStatus = project.project_status || 'not_touched';
      const newProjects = { ...prev };
      
      // Remove from old column
      newProjects[oldStatus] = newProjects[oldStatus].filter(p => p.id !== projectId);
      
      // Add to new column
      newProjects[newStatus] = [...newProjects[newStatus], { ...project, project_status: newStatus }];
      
      return newProjects;
    });

    // Update the database
    try {
      // First check if a project_status record exists
      const { data: existingStatus } = await supabase
        .from('project_status')
        .select('id')
        .eq('user_id', project.user_id)
        .single();

      if (existingStatus) {
        // Update existing record
        const { error } = await supabase
          .from('project_status')
          .update({
            status: newStatus,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', project.user_id);

        if (error) throw error;
      } else {
        // Create new record
        const { error } = await supabase
          .from('project_status')
          .insert({
            user_id: project.user_id,
            status: newStatus,
            updated_at: new Date().toISOString(),
          });

        if (error) throw error;
      }
    } catch (error) {
      console.error('Error updating project status:', error);
      // Revert the change if database update fails
      setProjects(prev => {
        const newProjects = { ...prev };
        newProjects[newStatus] = newProjects[newStatus].filter(p => p.id !== projectId);
        newProjects[project.project_status || 'not_touched'].push(project);
        return newProjects;
      });
    }

    setActiveProject(null);
  };

  const findProjectById = (id: string): Project | null => {
    for (const status of Object.keys(projects) as Status[]) {
      const project = projects[status].find(p => p.id === id);
      if (project) return project;
    }
    return null;
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-4"></div>
          <div className="grid grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-3">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Client Project Status ({Object.values(projects).flat().length} total)
        </h2>
      </div>
      <div className="p-6">
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.keys(statusColumns).map((status) => (
              <StatusColumn
                key={status}
                status={status as Status}
                title={statusColumns[status as Status]}
                projects={projects[status as Status] || []}
              />
            ))}
          </div>
          
          <DragOverlay>
            {activeProject ? (
              <div className="bg-white dark:bg-gray-800 p-3 rounded-md shadow-lg border border-gray-200 dark:border-gray-600 opacity-95 transform rotate-3">
                <p className="font-medium text-sm text-gray-900 dark:text-white">
                  {activeProject.business_name}
                </p>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
};

export default ProjectKanban;
