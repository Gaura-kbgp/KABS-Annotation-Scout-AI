
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users, Plus, Shield, LogOut, AlertTriangle
} from 'lucide-react';
import { createClient, User as SupabaseUser } from '@supabase/supabase-js';
import { UserProfile } from '../types';

// Admin Client with Service Role Key for User Management
const serviceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

const supabaseAdmin = serviceRoleKey
    ? createClient(supabaseUrl, serviceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
            storageKey: 'kabs_admin_auth_client'
        }
    })
    : null;

export const AdminDashboard: React.FC = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // Simple auth check
        const isAdmin = localStorage.getItem('kabs_admin_auth') === 'true';
        if (!isAdmin) {
            navigate('/admin-login');
        }
    }, [navigate]);

    return (
        <div className="min-h-screen bg-dark-900 text-white flex flex-col">
            {/* Header */}
            <header className="bg-dark-800 border-b border-dark-700 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Shield className="w-6 h-6 text-brand-500" />
                    <h1 className="text-xl font-bold">Admin Dashboard</h1>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="text-gray-400 hover:text-white text-sm"
                    >
                        Back to App
                    </button>
                    <button
                        onClick={() => {
                            localStorage.removeItem('kabs_admin_auth');
                            navigate('/admin-login');
                        }}
                        className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-dark-700"
                    >
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 p-6 flex flex-col max-w-7xl mx-auto w-full">
                <div className="flex-1 bg-dark-800 rounded-xl border border-dark-700 p-6 min-h-[500px]">
                    <UserManagementTab />
                </div>
            </main>
        </div>
    );
};

// --- User Management Component ---


const UserManagementTab: React.FC = () => {
    const [users, setUsers] = useState<(SupabaseUser & { profile?: UserProfile })[]>([]);
    const [loading, setLoading] = useState(true);
    const [newUserEmail, setNewUserEmail] = useState('');
    const [newUserPassword, setNewUserPassword] = useState('');
    const [creating, setCreating] = useState(false);
    const [msg, setMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [customDays, setCustomDays] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        if (!supabaseAdmin) {
            setMsg({ type: 'error', text: 'Service Role Key missing. Cannot manage users.' });
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            // 1. Fetch Auth Users
            const { data: { users: authUsers }, error: authError } = await supabaseAdmin.auth.admin.listUsers();
            if (authError) throw authError;

            // 2. Fetch User Profiles
            const { data: profiles, error: profileError } = await supabaseAdmin
                .from('user_profiles')
                .select('*');

            if (profileError && profileError.code !== '42P01') {
                console.error('Profile fetch error:', profileError);
            }

            // Merge
            const mergedUsers = authUsers.map(u => ({
                ...u,
                profile: profiles?.find(p => p.id === u.id)
            }));

            // Sort by creation date (newest first)
            mergedUsers.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

            setUsers(mergedUsers);
        } catch (err: any) {
            console.error('Error fetching users:', err);
            setMsg({ type: 'error', text: err.message });
        } finally {
            setLoading(false);
        }
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!supabaseAdmin) return;
        setCreating(true);
        setMsg(null);

        try {
            // Create user with auto-confirm
            const { data, error } = await supabaseAdmin.auth.admin.createUser({
                email: newUserEmail,
                password: newUserPassword,
                email_confirm: true
            });

            if (error) throw error;
            if (!data.user) throw new Error('Failed to create user');

            // Create Profile
            const expiry = new Date();
            expiry.setDate(expiry.getDate() + 30); // 30 days default

            const { error: profileError } = await supabaseAdmin
                .from('user_profiles')
                .upsert({
                    id: data.user.id,
                    email: newUserEmail,
                    role: 'user',
                    is_active: true,
                    access_expiry: expiry.toISOString()
                });

            if (profileError) console.error('Profile upsert error:', profileError);

            setMsg({ type: 'success', text: `User ${newUserEmail} created successfully!` });
            setNewUserEmail('');
            setNewUserPassword('');
            fetchUsers();
        } catch (err: any) {
            setMsg({ type: 'error', text: err.message });
        } finally {
            setCreating(false);
        }
    };

    const updateUserStatus = async (userId: string, updates: Partial<UserProfile>) => {
        if (!supabaseAdmin) return;
        try {
            const { error } = await supabaseAdmin
                .from('user_profiles')
                .update(updates)
                .eq('id', userId);

            if (error) throw error;
            fetchUsers();
        } catch (err: any) {
            console.error('Update failed:', err);
            alert('Update failed: ' + err.message);
        }
    };

    const extendAccess = async (userId: string, daysStr: string) => {
        const days = parseInt(daysStr);
        if (isNaN(days) || days <= 0) return;

        const date = new Date();
        date.setDate(date.getDate() + days);
        await updateUserStatus(userId, { access_expiry: date.toISOString(), is_active: true });

        // Clear input
        setCustomDays(prev => {
            const next = { ...prev };
            delete next[userId];
            return next;
        });
    };

    if (!supabaseAdmin) {
        return <div className="text-red-400 p-4">Error: VITE_SUPABASE_SERVICE_ROLE_KEY is not configured in .env.local</div>;
    }

    return (
        <div className="space-y-8">
            {/* Create User Section */}
            <div className="bg-dark-900/50 p-6 rounded-xl border border-dark-700">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Plus className="w-5 h-5 text-brand-500" />
                    Create New User
                </h3>
                <form onSubmit={handleCreateUser} className="flex gap-4 items-end">
                    <div className="flex-1 group">
                        <label className="block text-sm text-gray-400 mb-1 group-focus-within:text-brand-400 transition-colors">User Email / ID</label>
                        <input
                            type="email"
                            value={newUserEmail}
                            onChange={e => setNewUserEmail(e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 hover:border-brand-500/50 hover:bg-zinc-950 transition-all duration-300 shadow-inner"
                            required
                        />
                    </div>
                    <div className="flex-1 group">
                        <label className="block text-sm text-gray-400 mb-1 group-focus-within:text-brand-400 transition-colors">Password</label>
                        <input
                            type="text"
                            value={newUserPassword}
                            onChange={e => setNewUserPassword(e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 hover:border-brand-500/50 hover:bg-zinc-950 transition-all duration-300 shadow-inner"
                            placeholder="Set initial password"
                            required
                            minLength={6}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={creating}
                        className="bg-brand-600 hover:bg-brand-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 h-[42px]"
                    >
                        {creating ? 'Creating...' : 'Create User'}
                    </button>
                </form>
                {msg && (
                    <div className={`mt-4 text-sm ${msg.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                        {msg.text}
                    </div>
                )}
            </div>

            {/* User List */}
            <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-brand-500" />
                    Registered Users & Access Management
                </h3>
                {loading ? (
                    <div className="text-gray-400">Loading users...</div>
                ) : (
                    <div className="overflow-x-auto rounded-lg border border-dark-700">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-dark-800 text-gray-400 text-sm">
                                    <th className="py-3 px-4 font-medium">Email / ID</th>
                                    <th className="py-3 px-4 font-medium">Status</th>
                                    <th className="py-3 px-4 font-medium">Access Expiry</th>
                                    <th className="py-3 px-4 font-medium">Manage Access</th>
                                    <th className="py-3 px-4 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user, idx) => {
                                    const hasProfile = !!user.profile;
                                    const isActive = user.profile?.is_active ?? false; // Default to false if no profile
                                    // If manually created via dashboard, we might have set it up correctly. 
                                    // But self-signup without trigger = no profile.

                                    const expiry = user.profile?.access_expiry ? new Date(user.profile.access_expiry) : null;
                                    const isExpired = expiry && expiry < new Date();

                                    // Calculate days reamining
                                    let daysLeft = 0;
                                    if (expiry) {
                                        const diffTime = expiry.getTime() - new Date().getTime();
                                        daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                    }

                                    return (
                                        <tr key={user.id} className={`border-b border-dark-800 hover:bg-dark-700/30 transition-colors ${idx % 2 === 0 ? 'bg-dark-900/30' : ''}`}>
                                            <td className="py-3 px-4">
                                                <div className="font-medium text-white">{user.email}</div>
                                                <div className="text-xs text-gray-500">Created: {new Date(user.created_at).toLocaleDateString()}</div>
                                            </td>
                                            <td className="py-3 px-4">
                                                {!hasProfile ? (
                                                    <span className="inline-flex items-center gap-1.5 bg-yellow-500/10 text-yellow-500 px-2.5 py-1 rounded-full text-xs font-medium border border-yellow-500/20">
                                                        <AlertTriangle size={10} />
                                                        Profile Missing
                                                    </span>
                                                ) : isActive && !isExpired ? (
                                                    <span className="inline-flex items-center gap-1.5 bg-green-500/10 text-green-400 px-2.5 py-1 rounded-full text-xs font-medium border border-green-500/20">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                                        Active
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 bg-red-500/10 text-red-400 px-2.5 py-1 rounded-full text-xs font-medium border border-red-500/20">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                                                        {isExpired ? 'Expired' : 'Stopped'}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-3 px-4 text-sm">
                                                {expiry ? (
                                                    <div className="flex flex-col">
                                                        <span className={isExpired ? 'text-red-400 font-medium' : 'text-gray-300'}>
                                                            {expiry.toLocaleDateString()}
                                                        </span>
                                                        {!isExpired && (
                                                            <span className={`text-xs ${daysLeft < 5 ? 'text-orange-400' : 'text-gray-500'}`}>
                                                                {daysLeft} days left
                                                            </span>
                                                        )}
                                                    </div>
                                                ) : hasProfile ? <span className="text-gray-500 italic">No Expiry Set</span> : <span className="text-red-500/50 text-xs italic">Sync Needed</span>}
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="number"
                                                        className="w-16 bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-sm text-center text-white focus:border-brand-500 focus:outline-none"
                                                        placeholder="30"
                                                        min="1"
                                                        value={customDays[user.id] || ''}
                                                        onChange={(e) => setCustomDays({ ...customDays, [user.id]: e.target.value })}
                                                    />
                                                    <span className="text-sm text-gray-500">days</span>
                                                    <button
                                                        onClick={() => extendAccess(user.id, customDays[user.id] || '30')}
                                                        className="ml-2 px-3 py-1 bg-brand-600/20 hover:bg-brand-600/40 text-brand-400 text-xs font-medium rounded border border-brand-500/30 transition-colors uppercase tracking-wide"
                                                    >
                                                        {isExpired ? 'Renew' : 'Extend'}
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <button
                                                    title={isActive ? "Stop Access Immediately" : "Unblock User"}
                                                    onClick={() => updateUserStatus(user.id, { is_active: !isActive })}
                                                    className={`p-2 rounded-lg border transition-colors ${isActive
                                                        ? 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20'
                                                        : 'bg-green-500/10 border-green-500/20 text-green-400 hover:bg-green-500/20'
                                                        }`}
                                                >
                                                    <Shield className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};



