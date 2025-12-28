import { supabase } from './supabase';
import { Project } from '../types';

const LOCAL_STORAGE_KEY = 'kabs_projects';

// Helper to get local projects
const getLocalProjects = (): Project[] => {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Local storage parse error", e);
    return [];
  }
};

const saveLocalProjects = (projects: Project[]) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(projects));
  } catch (e) {
    console.error("Local storage save error", e);
  }
};

export const projectService = {
  async getProjects(userId: string): Promise<{ data: Project[], error: any, source: 'supabase' | 'local' }> {
    try {
      // Try Supabase first
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      // If successful, return Supabase data
      if (!error) {
        return { data: data as Project[], error: null, source: 'supabase' };
      }
      
      // Log connection issue but don't crash or error loudly. 
      // This handles the "400" error (missing table) gracefully.
      console.warn("Supabase fetch failed (likely missing table), falling back to local storage.");
    } catch (err) {
      console.warn("Supabase client exception, falling back to local storage.");
    }

    // Fallback to LocalStorage
    const local = getLocalProjects().filter(p => p.user_id === userId);
    return { data: local, error: null, source: 'local' };
  },

  async createProject(project: Partial<Project>): Promise<{ data: Project | null, error: any }> {
     try {
       // Try Supabase
       const { data, error } = await supabase
        .from('projects')
        .insert([project])
        .select()
        .single();

       if (!error) return { data: data as Project, error: null };
     } catch (err) {
       // Ignore supabase errors for fallback
     }

     // Fallback
     const newProject: Project = {
       ...project,
       id: crypto.randomUUID(),
       updated_at: new Date().toISOString(),
       status: 'draft',
       annotations: [],
       current_page: 1,
       total_pages: 1
     } as Project;

     const projects = getLocalProjects();
     projects.unshift(newProject);
     saveLocalProjects(projects);
     
     return { data: newProject, error: null };
  },

  async updateProject(id: string, updates: Partial<Project>): Promise<{ error: any }> {
    try {
      // Try Supabase
      const { error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', id);

      if (!error) return { error: null };
    } catch (err) {
      // Ignore
    }

    // Fallback
    const projects = getLocalProjects();
    const index = projects.findIndex(p => p.id === id);
    if (index !== -1) {
      projects[index] = { ...projects[index], ...updates, updated_at: new Date().toISOString() };
      saveLocalProjects(projects);
      return { error: null };
    }
    return { error: 'Project not found locally' };
  },

  async deleteProject(id: string): Promise<{ error: any }> {
    try {
      // Try Supabase
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (!error) {
        // Also remove from local storage just in case
        const projects = getLocalProjects().filter(p => p.id !== id);
        saveLocalProjects(projects);
        return { error: null };
      }
    } catch (err) {
      // Ignore
    }

    // Fallback
    const projects = getLocalProjects();
    const filtered = projects.filter(p => p.id !== id);
    saveLocalProjects(filtered);
    
    return { error: null };
  },

  async getProject(id: string): Promise<{ data: Project | null, error: any }> {
     try {
       const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('id', id)
          .single();
      
       if (!error) return { data: data as Project, error: null };
     } catch (err) {
       // Ignore
     }

     const projects = getLocalProjects();
     const project = projects.find(p => p.id === id);
     return { data: project || null, error: project ? null : 'Not found' };
  }
};