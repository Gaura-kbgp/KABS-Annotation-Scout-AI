import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LogOut, User as UserIcon, Settings } from 'lucide-react';
import { ProfileModal } from '../Auth/ProfileModal';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <>
      <nav className="h-16 border-b border-dark-700 bg-dark-900 flex items-center justify-between px-6 z-50 relative">
        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => navigate('/dashboard')}
        >
          <div className="bg-white/95 rounded-md px-3 py-0.5 flex items-center h-14">
            <img
              src={`/logo.png?t=${new Date().getTime()}`}
              alt="KABS"
              className="h-full w-auto object-contain"
              onError={(e) => {
                const target = e.currentTarget;
                target.style.display = 'none';
                target.parentElement!.style.display = 'none';
                document.getElementById('nav-fallback')?.classList.remove('hidden');
              }}
            />
          </div>
          <div id="nav-fallback" className="hidden flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">K</span>
            </div>
            <span className="text-lg font-semibold tracking-tight text-white">
              KABS <span className="text-gray-400 font-normal">Annotation & Scout AI</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div 
            onClick={() => setIsProfileOpen(true)}
            className="flex items-center gap-3 bg-dark-800/50 px-4 py-1.5 rounded-full border border-dark-700/50 hover:border-brand-500/50 transition-all cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-full bg-brand-500/10 flex items-center justify-center text-brand-500 overflow-hidden border border-brand-500/20 group-hover:scale-105 transition-transform">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <UserIcon size={16} />
              )}
            </div>
            <div className="flex flex-col">
              <span className={`text-sm font-semibold leading-none ${!profile?.full_name ? 'text-brand-400 italic' : 'text-white'}`}>
                {profile?.full_name || 'Add Name'}
              </span>
              <span className="text-[10px] text-gray-500 leading-none mt-0.5">
                {profile?.email || 'Guest User'}
              </span>
            </div>
            <Settings size={14} className="text-gray-600 group-hover:text-brand-500 group-hover:rotate-45 transition-all ml-1" />
          </div>

          <button 
            onClick={handleSignOut}
            className="p-2 text-gray-400 hover:text-white hover:bg-dark-800 rounded-lg transition-all group"
            title="Sign Out"
          >
            <LogOut size={20} className="group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </nav>

      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
    </>
  );
};
