import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';
import { User } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { ProfileModal } from '../Auth/ProfileModal';

interface LayoutProps {
  children: React.ReactNode;
  user?: User | null;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { profile, loading } = useAuth();
  const location = useLocation();
  const isEditor = location.pathname.includes('/editor/');
  
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    // If user is loaded but profile has no name, show onboarding
    if (!loading && !profile?.full_name) {
      setShowOnboarding(true);
    } else {
      setShowOnboarding(false);
    }
  }, [profile?.full_name, loading]);

  const mainContent = (
    <>
      {children}
      <ProfileModal 
        isOpen={showOnboarding} 
        onClose={() => setShowOnboarding(false)} 
        hideClose={true} 
      />
    </>
  );

  if (isEditor) {
    return <div className="h-screen w-screen overflow-hidden bg-dark-900 text-white font-sans">{mainContent}</div>;
  }

  return (
    <div className="h-screen flex flex-col bg-dark-900 text-white font-sans overflow-hidden">
      <Navbar />
      <main className="flex-1 overflow-y-auto custom-scrollbar relative">
        <div className="min-h-full flex flex-col">
          {mainContent}
          <footer className="py-6 text-center text-gray-600 text-sm border-t border-dark-800 mt-auto">
            &copy; {new Date().getFullYear()} KABS Annotation & Scout AI
          </footer>
        </div>
      </main>
    </div>
  );
};
