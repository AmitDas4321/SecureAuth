import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useToastStore } from '../store/toastStore';
import { User, ArrowRight, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

export default function CompleteProfile() {
  const { user, completeProfile } = useAuthStore();
  const { addToast } = useToastStore();
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const isUpdate = !!user?.displayName;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (displayName.trim().length < 2) return;

    setLoading(true);
    try {
      await completeProfile(displayName);
      addToast(isUpdate ? 'Profile identity updated' : 'Profile initialized successfully', 'success');
      navigate(isUpdate ? '/settings' : '/dashboard');
    } catch (err: any) {
      addToast(err.response?.data?.error || 'System operation failed: Profile synchronization error', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-bg-main text-text-primary">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm text-center"
      >
        <div className="flex items-center justify-center mb-6">
          <div className="w-16 h-16 bg-brand rounded-2xl flex items-center justify-center shadow-xl shadow-brand/20">
            <User className="w-8 h-8 text-white" />
          </div>
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-[#0f172a] mb-2 uppercase">
          {isUpdate ? 'Update Profile' : 'Complete Profile'}
        </h1>
        <p className="text-sm text-text-secondary font-medium mb-10 lowercase">
          {isUpdate ? 'Modify your network identifier' : 'Establish your identity on the secure network'}
        </p>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-[#e5e5e5]">
          <form onSubmit={handleSubmit} className="space-y-6 text-left">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-secondary ml-1">Full Name</label>
              <div className="relative group">
                <input
                  type="text"
                  autoFocus
                  placeholder="e.g. John Doe"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-xl py-3.5 px-4 focus:ring-2 focus:ring-brand/10 focus:border-brand outline-none transition-all placeholder:text-text-muted/50 text-sm font-medium"
                  required
                />
              </div>
            </div>

            <button
              disabled={loading || displayName.trim().length < 2}
              className="w-full bg-brand text-white py-4 rounded-xl flex items-center justify-center gap-2 font-bold text-sm hover:bg-brand-hover disabled:opacity-50 transition-all shadow-md active:scale-95"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <>
                  {isUpdate ? 'Update Identity' : 'Initialize Identity'} <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="mt-8 text-[10px] text-text-muted font-medium leading-relaxed px-8">
          This name will be used to identify your security nodes. 
          You can modify this later in system configuration.
        </p>
      </motion.div>
    </div>
  );
}
