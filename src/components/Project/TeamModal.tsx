import React, { useState } from 'react';
import { Project, TeamMember } from '../../types';
import { Button } from '../ui/Button';
import { X, Mail, Plus, Users, Trash2, Shield, Eye, AlertCircle } from 'lucide-react';
import { projectService } from '../../services/projectService';
import { emailService } from '../../services/emailService';

interface TeamModalProps {
  project: Project;
  onClose: () => void;
  onUpdate?: (updatedProject: Project) => void;
}

export const TeamModal: React.FC<TeamModalProps> = ({ project, onClose, onUpdate }) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'editor' | 'viewer'>('editor');
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const teamMembers = project.team_members || [];
  const limit = 5;

  const handleInviteMembers = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (teamMembers.length >= limit) {
      setError(`Maximum team size is ${limit} people.`);
      return;
    }

    if (teamMembers.find(m => m.email.toLowerCase() === email.toLowerCase())) {
      setError("This person is already a member of the team.");
      return;
    }

    setIsAdding(true);
    
    // Create new member mock record
    const newMember: TeamMember = {
      id: crypto.randomUUID(),
      email: email.toLowerCase(),
      role: role,
      added_at: new Date().toISOString()
    };

    const updatedTeam = [...teamMembers, newMember];

    const { error: updateError } = await projectService.updateProject(project.id, {
      team_members: updatedTeam
    });

    if (updateError) {
      if (updateError.message.includes('column') || updateError.message.includes('team_members')) {
        setError("Database update required! Please run the 'ADD_TEAM_COLLABORATION.sql' migration in your Supabase SQL Editor.");
      } else {
        setError(`Failed to invite: ${updateError.message}`);
      }
    } else {
      // SUCCESS: Send actual invitation email via our real methods
      await emailService.sendTeamInvite({ 
        toEmail: email.toLowerCase(), 
        projectName: project.name, 
        projectId: project.id,
        inviterEmail: 'KABS Design AI', // More professional
        role: role.toUpperCase()
      });

      setSuccess(`Invitation sent to ${email} (Real-time sync active!)`);
      setEmail('');
      if (onUpdate) {
        onUpdate({ ...project, team_members: updatedTeam });
      }
    }
    
    setIsAdding(false);
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm("Are you sure you want to remove this member?")) return;

    const updatedTeam = teamMembers.filter(m => m.id !== memberId);

    const { error: updateError } = await projectService.updateProject(project.id, {
      team_members: updatedTeam
    });

    if (updateError) {
      setError(`Failed to remove: ${updateError.message}`);
    } else {
      if (onUpdate) {
        onUpdate({ ...project, team_members: updatedTeam });
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-dark-800 border border-dark-700 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-dark-700 flex justify-between items-center bg-dark-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-500/10 rounded-xl flex items-center justify-center text-brand-500">
              <Users size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white leading-tight">Project Team</h2>
              <p className="text-xs text-gray-400">Manage who can access this project</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-500 hover:text-white transition-colors hover:bg-dark-700 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {/* Status Message */}
          {error && (
            <div className="mb-6 p-3 bg-red-900/20 border border-red-900/50 rounded-lg flex items-center gap-2 text-red-200 text-sm">
              <AlertCircle size={16} className="shrink-0" />
              {error}
            </div>
          )}
          
          {success && (
            <div className="mb-6 p-3 bg-green-900/20 border border-green-900/50 rounded-lg flex items-center gap-2 text-green-200 text-sm">
              <Shield size={16} className="shrink-0" />
              {success}
            </div>
          )}

          {/* Invitation Section */}
          <section className="mb-8">
            <h3 className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wider">Invite New Member</h3>
            <form onSubmit={handleInviteMembers} className="space-y-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input 
                    type="email" 
                    required
                    disabled={teamMembers.length >= limit}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="teammate@example.com"
                    className="w-full bg-dark-900 border border-dark-600 rounded-lg pl-10 pr-4 py-2 text-white focus:ring-2 focus:ring-brand-500 focus:outline-none placeholder-gray-500 disabled:opacity-50"
                  />
                </div>
                <select 
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="bg-dark-900 border border-dark-600 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="editor">Editor</option>
                  <option value="viewer">Viewer</option>
                </select>
                <Button 
                  type="submit" 
                  disabled={isAdding || teamMembers.length >= limit || !email}
                  isLoading={isAdding}
                  className="shrink-0"
                >
                  <Plus size={18} />
                </Button>
              </div>
              <p className="text-[10px] text-gray-500">
                You can add up to 5 members to this project. Current: {teamMembers.length} / {limit}
              </p>
            </form>
          </section>

          {/* Members List */}
          <section>
            <h3 className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wider">Current Members</h3>
            <div className="space-y-2 max-h-[240px] overflow-y-auto pr-2 custom-scrollbar">
              {teamMembers.length === 0 ? (
                <div className="text-center py-6 border border-dashed border-dark-700 rounded-xl">
                  <p className="text-sm text-gray-500 italic">No team members added yet.</p>
                </div>
              ) : (
                teamMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-3 bg-dark-900/50 border border-dark-700 rounded-xl group transition-all hover:border-dark-600">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white">
                        {member.email.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white truncate">{member.email}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full flex items-center gap-1 ${member.role === 'editor' ? 'bg-amber-900/20 text-amber-500 border border-amber-900/50' : 'bg-blue-900/20 text-blue-500 border border-blue-900/50'}`}>
                            {member.role === 'editor' ? <Shield size={10} /> : <Eye size={10} />}
                            <span className="capitalize">{member.role}</span>
                          </span>
                          <span className="text-[10px] text-gray-500">
                            Added {new Date(member.added_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleRemoveMember(member.id)}
                      className="p-2 text-gray-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                      title="Remove Member"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        <div className="px-6 py-4 bg-dark-900/50 border-t border-dark-700 text-center">
            <p className="text-[10px] text-gray-500">
              Only editors can annotate. Viewers can only see annotations and suggestions.
            </p>
        </div>
      </div>
    </div>
  );
};
