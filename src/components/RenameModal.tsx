import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Save, Edit3 } from 'lucide-react';
import { useAccountStore, TOTPAccount } from '../store/accountStore';
import { useToastStore } from '../store/toastStore';

interface RenameModalProps {
  account: TOTPAccount;
  onClose: () => void;
}

export default function RenameModal({ account, onClose }: RenameModalProps) {
  const [name, setName] = useState(account.customName || account.label);
  const [loading, setLoading] = useState(false);
  const { renameAccount } = useAccountStore();
  const { addToast } = useToastStore();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    setLoading(true);
    try {
      await renameAccount(account.id, name.trim());
      addToast('Account renamed successfully', 'success');
      onClose();
    } catch (err) {
      addToast('System error: Failed to update display identifier', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-[2.5rem] p-8 w-full max-w-md relative z-10 shadow-2xl border border-border"
      >
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-brand/10 text-brand rounded-2xl">
              <Edit3 className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-text-primary">Rename Account</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-bg-main rounded-xl transition-colors">
            <X className="w-6 h-6 text-text-muted" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-secondary ml-1">Account Display Name</label>
            <input
              autoFocus
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. My Personal Account"
              className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-xl py-3.5 px-4 focus:ring-2 focus:ring-brand/10 focus:border-brand outline-none transition-all text-sm font-medium"
            />
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3.5 rounded-xl text-sm font-bold text-text-secondary hover:bg-bg-main transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="flex-1 bg-brand text-white px-6 py-3.5 rounded-xl text-sm font-bold hover:bg-brand-hover shadow-lg shadow-brand/20 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
