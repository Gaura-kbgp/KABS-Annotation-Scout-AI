import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import { Mail, Lock, User as UserIcon, LogIn, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '../ui/Button';

export const SignUp: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
          data: {
              full_name: fullName
          }
      }
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-dark-900 flex flex-col items-center justify-center p-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-900/20 via-dark-900 to-dark-900">
        <div className="w-full max-w-md bg-dark-800 border border-dark-700 rounded-2xl shadow-2xl overflow-hidden p-8 text-center animate-in zoom-in duration-300">
          <div className="w-16 h-16 bg-green-500/10 rounded-2xl flex items-center justify-center text-green-500 mx-auto mb-6">
            <CheckCircle size={32} />
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">Check Your Email</h1>
          <p className="text-gray-400 mb-8 leading-relaxed">
            We've sent a verification link to <span className="text-white font-medium">{email}</span>. 
            Please confirm your account to start collaborating with your team.
          </p>
          <Button 
            onClick={() => navigate('/login')}
            className="w-full py-4"
          >
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-900 flex flex-col items-center justify-center p-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-900/20 via-dark-900 to-dark-900">
      <div className="w-full max-w-md bg-dark-800 border border-dark-700 rounded-2xl shadow-2xl overflow-hidden p-8">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-brand-500/10 rounded-2xl flex items-center justify-center text-brand-500 mx-auto mb-4">
            <UserIcon size={32} />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
          <p className="text-gray-400">Join the KABS annotation team</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-900/50 rounded-xl flex items-center gap-3 text-red-100 text-sm animate-in fade-in slide-in-from-top-2 duration-200">
            <AlertCircle size={20} className="shrink-0 text-red-500" />
            {error}
          </div>
        )}

        <form onSubmit={handleSignUp} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 ml-1">Full Name</label>
            <div className="relative group">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-brand-500 transition-colors">
                <UserIcon size={18} />
              </div>
              <input 
                type="text" 
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                className="w-full bg-dark-900 border border-dark-600 rounded-xl pl-10 pr-4 py-2.5 text-white transition-all focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 ml-1">Email Address</label>
            <div className="relative group">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-brand-500 transition-colors">
                <Mail size={18} />
              </div>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full bg-dark-900 border border-dark-600 rounded-xl pl-10 pr-4 py-2.5 text-white transition-all focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 ml-1">Password</label>
            <div className="relative group">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-brand-500 transition-colors">
                <Lock size={18} />
              </div>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-dark-900 border border-dark-600 rounded-xl pl-10 pr-4 py-2.5 text-white transition-all focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 outline-none"
              />
            </div>
          </div>

          <Button 
            type="submit" 
            isLoading={loading}
            className="w-full py-6 text-lg"
          >
            Sign Up
          </Button>
        </form>

        <div className="mt-8 text-center text-sm">
          <span className="text-gray-400">Already have an account? </span>
          <Link to="/login" className="text-brand-500 hover:text-brand-400 font-bold ml-1 transition-colors">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
};
