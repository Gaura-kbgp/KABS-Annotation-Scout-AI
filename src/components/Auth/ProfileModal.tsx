import React, { useState, useEffect } from 'react';
import { X, User as UserIcon, Camera, Save, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  hideClose?: boolean;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, hideClose = false }) => {
  const { user, profile, refreshProfile } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
    }
  }, [profile]);

  if (!isOpen || !user) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const { error: updateError } = await supabase
      .from('user_profiles')
      .upsert({
        id: user.id,
        email: user.email,
        full_name: fullName,
        updated_at: new Date().toISOString(),
      });

    if (updateError) {
      setError(updateError.message);
    } else {
      await refreshProfile();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-dark-800 border border-dark-700 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-dark-700 flex items-center justify-between">
          <div className="flex items-center gap-3 text-white">
            <div className="p-2 bg-brand-500/10 rounded-lg text-brand-500">
              <UserIcon size={20} />
            </div>
            <h2 className="text-xl font-bold">Your Profile</h2>
          </div>
          {!hideClose && (
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-white hover:bg-dark-700 rounded-lg transition-colors">
              <X size={20} />
            </button>
          )}
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-6">
          <div className="flex flex-col items-center">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full bg-dark-700 border-4 border-dark-800 overflow-hidden flex items-center justify-center text-brand-500 mb-2">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <UserIcon size={40} />
                )}
              </div>
              <button 
                type="button"
                className="absolute bottom-1 right-1 p-2 bg-brand-500 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Camera size={14} />
              </button>
            </div>
            <span className="text-sm text-gray-500">{user.email}</span>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Display Name</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your full name"
              className="w-full bg-dark-900 border border-dark-600 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-brand-500/50 outline-none transition-all"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-900/20 border border-red-900/50 rounded-lg flex items-center gap-2 text-red-400 text-xs">
              <AlertCircle size={14} />
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-900/20 border border-green-900/50 rounded-lg flex items-center gap-2 text-green-400 text-xs">
              <CheckCircle2 size={14} />
              Profile updated successfully!
            </div>
          )}

          <div className="flex gap-3 pt-2">
            {!hideClose && (
              <Button
                type="button"
                variant="secondary"
                className="flex-1"
                onClick={onClose}
              >
                Close
              </Button>
            )}
            <Button
              type="submit"
              className="flex-1"
              isLoading={loading}
            >
              <Save size={18} className="mr-2" />
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
