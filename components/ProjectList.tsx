import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectService } from '../services/projectService';
import { Project, User } from '../types';
import { Button } from './ui/Button';
import { Plus, FileText, Clock, UploadCloud, Database, Trash2, Search, CheckCircle2, PencilRuler } from 'lucide-react';

export const ProjectList: React.FC<{ user: User }> = ({ user }) => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [creating, setCreating] = useState(false);
  const [usingLocal, setUsingLocal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchProjects();
  }, [user]);

  const fetchProjects = async () => {
    const { data, source } = await projectService.getProjects(user.id);
    setProjects(data);
    setUsingLocal(source === 'local');
    setLoading(false);
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName || !pdfFile) return;

    setCreating(true);

    const { data, error } = await projectService.createProject({ 
      name: newProjectName, 
      user_id: user.id,
      status: 'draft',
      current_page: 1,
      total_pages: 1, 
      annotations: [] 
    });

    if (error) {
      alert(`Failed to create project: ${error.message}`);
      setCreating(false);
      return;
    }

    if (data) {
      navigate(`/editor/${data.id}`, { state: { file: pdfFile } });
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
        await projectService.deleteProject(id);
        setProjects(prev => prev.filter(p => p.id !== id));
    }
  };

  // Filter and Categorize Logic
  const filteredProjects = projects.filter(p => {
    const name = p.name || '';
    return name.toLowerCase().includes(searchQuery.toLowerCase().trim());
  });
  
  const savedProjects = filteredProjects.filter(p => p.status === 'saved');
  const draftProjects = filteredProjects.filter(p => p.status !== 'saved');

  const renderProjectCard = (project: Project) => (
    <div 
      key={project.id}
      onClick={() => navigate(`/editor/${project.id}`)}
      className="bg-dark-800 border border-dark-700 hover:border-brand-500/50 rounded-xl p-5 cursor-pointer transition-all hover:shadow-lg hover:shadow-black/40 group relative"
    >
      <div className="flex justify-between items-start mb-4">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${project.status === 'saved' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
          <FileText size={20} />
        </div>
        <div className="flex items-center gap-2 relative z-10" onClick={(e) => e.stopPropagation()}>
            <span className={`text-xs font-medium px-2 py-1 rounded capitalize ${project.status === 'saved' ? 'bg-green-900/30 text-green-400' : 'bg-dark-700 text-gray-400'}`}>
            {project.status || 'Draft'}
            </span>
            <button 
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  handleDeleteProject(project.id);
                }}
                className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                title="Delete Project"
            >
                <Trash2 size={16} />
            </button>
        </div>
      </div>
      <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-brand-400 transition-colors pr-8 truncate">
        {project.name}
      </h3>
      <div className="flex items-center text-xs text-gray-500 mt-4 gap-4">
        <span className="flex items-center gap-1">
          <Clock size={12} /> {new Date(project.updated_at).toLocaleDateString()}
        </span>
      </div>
    </div>
  );

  return (
    <div className="p-8 max-w-7xl mx-auto w-full">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Projects</h1>
          <p className="text-gray-400">Manage your annotation projects</p>
          {usingLocal && (
            <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-500 text-xs border border-yellow-500/20">
              <Database size={12} />
              <span>Offline Mode (Database not connected)</span>
            </div>
          )}
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
           {/* Search Bar */}
           <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input 
                type="text" 
                placeholder="Search projects..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-dark-800 border border-dark-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:ring-2 focus:ring-brand-500 focus:outline-none placeholder-gray-500"
              />
           </div>
           
           <Button onClick={() => setIsModalOpen(true)} className="gap-2 shrink-0">
             <Plus size={18} /> New Project
           </Button>
        </div>
      </div>

      {loading ? (
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           {[...Array(3)].map((_, i) => (
             <div key={i} className="h-48 bg-dark-800 rounded-xl animate-pulse" />
           ))}
         </div>
      ) : projects.length === 0 ? (
          // Total Empty State
          <div className="text-center py-20 bg-dark-800 rounded-2xl border border-dark-700 border-dashed">
            <div className="w-16 h-16 bg-dark-700 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-500">
              <FileText size={32} />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No projects yet</h3>
            <p className="text-gray-400 mb-6">Create your first project to start annotating.</p>
            <Button variant="secondary" onClick={() => setIsModalOpen(true)}>Create Project</Button>
          </div>
      ) : (
        <div className="space-y-12 pb-12">
           {/* Saved Projects Section */}
           <section>
              <div className="flex items-center gap-3 mb-6 border-b border-dark-700 pb-4">
                 <div className="p-1.5 bg-green-500/10 rounded-lg text-green-500">
                    <CheckCircle2 size={20} />
                 </div>
                 <h2 className="text-xl font-bold text-white">Saved Projects</h2>
                 <span className="bg-dark-700 text-gray-400 text-xs px-2 py-0.5 rounded-full">{savedProjects.length}</span>
              </div>
              
              {savedProjects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                   {savedProjects.map(renderProjectCard)}
                </div>
              ) : (
                <div className="text-gray-500 italic text-sm py-4">
                  {searchQuery ? `No saved projects matching "${searchQuery}"` : "No saved projects found."}
                </div>
              )}
           </section>

           {/* Draft Projects Section */}
           <section>
              <div className="flex items-center gap-3 mb-6 border-b border-dark-700 pb-4">
                 <div className="p-1.5 bg-yellow-500/10 rounded-lg text-yellow-500">
                    <PencilRuler size={20} />
                 </div>
                 <h2 className="text-xl font-bold text-white">Draft Projects</h2>
                 <span className="bg-dark-700 text-gray-400 text-xs px-2 py-0.5 rounded-full">{draftProjects.length}</span>
              </div>
              
              {draftProjects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                   {draftProjects.map(renderProjectCard)}
                </div>
              ) : (
                <div className="text-gray-500 italic text-sm py-4">
                  {searchQuery ? `No draft projects matching "${searchQuery}"` : "No draft projects found."}
                </div>
              )}
           </section>
        </div>
      )}

      {/* New Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-dark-800 border border-dark-700 rounded-2xl w-full max-w-md p-6 shadow-2xl my-auto">
            <h2 className="text-xl font-bold text-white mb-4">Create New Project</h2>
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Project Name</label>
                <input 
                  type="text" 
                  required
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="w-full bg-dark-900 border border-dark-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  placeholder="e.g. Living Room Renovation"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Upload PDF</label>
                <div className="border-2 border-dashed border-dark-600 rounded-lg p-6 text-center hover:border-brand-500/50 transition-colors cursor-pointer relative">
                  <input 
                    type="file" 
                    accept="application/pdf"
                    required
                    onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <UploadCloud className="mx-auto text-gray-500 mb-2" size={24} />
                  <p className="text-sm text-gray-300">
                    {pdfFile ? pdfFile.name : "Click to upload PDF"}
                  </p>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button 
                  type="button" 
                  variant="ghost" 
                  className="flex-1" 
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1" 
                  isLoading={creating}
                  disabled={!pdfFile || !newProjectName}
                >
                  Create Project
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};