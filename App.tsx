
import React, { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { supabase } from './services/supabase';
import { User } from './types';
import { Auth } from './components/Auth';
import { Dashboard } from './components/Dashboard';
import { ProjectList } from './components/ProjectList';
import { EditorPage } from './components/Editor/EditorPage';
import { DrawingSuggestionAI } from './components/DrawingSuggestionAI';
import { Navbar } from './components/Layout/Navbar';
import { LandingPage } from './components/LandingPage';
import { ProductDetails } from './components/ProductDetails';
import { PricingPage } from './components/PricingPage';
import { PaymentPage } from './components/PaymentPage';
import { PrivacyPolicy, TermsConditions } from './components/LegalPages';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminLogin } from './components/AdminLogin';

// Extended User type for App state
interface AppUser extends User {
  is_active?: boolean;
  access_expiry?: string;
}

// Layout wrapper for pages requiring Navbar
const Layout: React.FC<{ children: React.ReactNode, user: AppUser | null }> = ({ children, user }) => {
  const location = useLocation();
  const isEditor = location.pathname.includes('/editor/');

  if (isEditor) {
    return <div className="h-screen w-screen overflow-hidden bg-dark-900 text-white font-sans">{children}</div>;
  }

  return (
    <div className="h-screen flex flex-col bg-dark-900 text-white font-sans overflow-hidden">
      <Navbar user={user} />
      <main className="flex-1 overflow-y-auto custom-scrollbar relative">
        <div className="min-h-full flex flex-col">
          {children}
          <footer className="py-6 text-center text-gray-600 text-sm border-t border-dark-800 mt-auto">
            &copy; {new Date().getFullYear()} KABS Annotation & Scout AI
          </footer>
        </div>
      </main>
    </div>
  );
};

const AccessDenied: React.FC<{ reason: 'blocked' | 'expired' }> = ({ reason }) => (
  <div className="min-h-screen bg-dark-900 text-white flex items-center justify-center p-4">
    <div className="bg-dark-800 p-8 rounded-xl border border-red-500/30 max-w-md text-center">
      <h2 className="text-2xl font-bold text-red-500 mb-4">Access Denied</h2>
      <p className="text-gray-300 mb-6">
        {reason === 'expired'
          ? "Your free trial or subscription has expired. Please contact admin or renew your plan."
          : "Your access has been suspended by the administrator."}
      </p>
      <a href="/" className="bg-brand-600 hover:bg-brand-700 text-white px-6 py-2 rounded-lg transition-colors">
        Return Home
      </a>
    </div>
  </div>
);

const ProtectedRoute: React.FC<{ user: AppUser | null; children: React.ReactNode }> = ({ user, children }) => {
  if (!user) return <Navigate to="/login" replace />;

  // Check Access Control
  if (user.is_active === false) return <AccessDenied reason="blocked" />;

  if (user.access_expiry) {
    const expiry = new Date(user.access_expiry);
    if (expiry < new Date()) return <AccessDenied reason="expired" />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async (sessionUser: any) => {
      if (!sessionUser) return null;
      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', sessionUser.id)
          .single();

        // If no profile (migration not run or new user), assume default active for now or strict?
        // Let's rely on the trigger. If no trigger run, data might be null.
        if (error || !data) return { id: sessionUser.id, email: sessionUser.email! };

        return {
          id: sessionUser.id,
          email: sessionUser.email!,
          is_active: data.is_active,
          access_expiry: data.access_expiry
        };
      } catch (e) {
        return { id: sessionUser.id, email: sessionUser.email! };
      }
    };

    // Initial Session Check
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const userWithProfile = await fetchProfile(session.user);
        setUser(userWithProfile);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    // Auth Change Listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        // We might want to re-fetch profile on sign-in event specifically, but this is okay for now
        const userWithProfile = await fetchProfile(session.user);
        setUser(userWithProfile);
      } else {
        setUser(null);
      }
    });

    // Force loading to stop after 3 seconds to prevent infinite stuck state
    const timer = setTimeout(() => setLoading(false), 3000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="ml-4 text-gray-400 animate-pulse">Initializing KABS...</p>
      </div>
    );
  }

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <LandingPage />} />
        <Route path="/product-details" element={<ProductDetails />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/payment" element={<PaymentPage />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsConditions />} />


        <Route path="/login" element={!user ? <Auth /> : <Navigate to="/dashboard" />} />

        {/* Admin Routes */}
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />

        {/* Protected Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute user={user}>
            <Layout user={user}><Dashboard /></Layout>
          </ProtectedRoute>
        } />

        <Route path="/projects" element={
          <ProtectedRoute user={user}>
            <Layout user={user}><ProjectList user={user!} /></Layout>
          </ProtectedRoute>
        } />

        <Route path="/editor/:id" element={
          <ProtectedRoute user={user}>
            <Layout user={user}><EditorPage user={user!} /></Layout>
          </ProtectedRoute>
        } />

        <Route path="/scout" element={
          <ProtectedRoute user={user}>
            <Layout user={user}><DrawingSuggestionAI user={user!} /></Layout>
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
};

export default App;
