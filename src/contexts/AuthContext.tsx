import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { User, UserProfile } from '../types';

interface AuthContextType {
  user: User;
  profile: UserProfile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to get or create a stable guest identity
const getGuestUser = (): User => {
  const storedId = localStorage.getItem('kabs_guest_userId');
  const storedEmail = localStorage.getItem('kabs_guest_email');
  const userId = storedId || crypto.randomUUID();
  const userEmail = storedEmail || `guest_${userId.slice(0, 4)}@kabs.local`;
  if (!storedId) localStorage.setItem('kabs_guest_userId', userId);
  if (!storedEmail) localStorage.setItem('kabs_guest_email', userEmail);
  return { id: userId, email: userEmail };
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(getGuestUser());
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user as any);
        fetchProfile(session.user.id);
      }
      setLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        setUser(session.user as any);
        fetchProfile(session.user.id);
      } else {
        setUser(getGuestUser());
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (data && !error) {
      setProfile(data);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(getGuestUser());
    setProfile(null);
  };

  const refreshProfile = async () => {
    if (user?.id) {
      await fetchProfile(user.id);
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
