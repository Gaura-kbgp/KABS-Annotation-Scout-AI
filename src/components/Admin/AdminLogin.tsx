
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, AlertCircle } from 'lucide-react';

export const AdminLogin: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // Hardcoded credentials as per project requirements
        // Case-insensitive email check and trim whitespace
        if (email.trim().toLowerCase() === 'contact@kbglobalpartners.com' && password.trim() === 'admin@kabs') {
            localStorage.setItem('kabs_admin_auth', 'true');
            navigate('/admin-dashboard');
        } else {
            setError('Invalid admin credentials');
        }
    };

    return (
        <div className="min-h-screen bg-dark-900 flex items-center justify-center p-4">
            <div className="bg-dark-800 p-8 rounded-xl border border-dark-700 w-full max-w-md shadow-2xl">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-brand-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Lock className="w-8 h-8 text-brand-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">Admin Access</h2>
                    <p className="text-gray-400 mt-2">Enter your credentials to continue</p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 mb-6 flex items-center gap-3 text-red-400">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <p className="text-sm">{error}</p>
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="group">
                        <label className="block text-sm font-medium text-gray-400 mb-2 group-focus-within:text-brand-400 transition-colors">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-hover:text-brand-400 group-focus-within:text-brand-500 transition-colors" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 hover:border-brand-500/50 hover:bg-zinc-950 transition-all duration-300 shadow-inner group-hover:shadow-[0_0_10px_rgba(59,130,246,0.1)]"
                                placeholder="Enter admin email"
                                required
                            />
                        </div>
                    </div>

                    <div className="group">
                        <label className="block text-sm font-medium text-gray-400 mb-2 group-focus-within:text-brand-400 transition-colors">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-hover:text-brand-400 group-focus-within:text-brand-500 transition-colors" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 hover:border-brand-500/50 hover:bg-zinc-950 transition-all duration-300 shadow-inner group-hover:shadow-[0_0_10px_rgba(59,130,246,0.1)]"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-brand-600 hover:bg-brand-700 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                        Admin Sign In
                    </button>
                </form>
            </div>
        </div>
    );
};
