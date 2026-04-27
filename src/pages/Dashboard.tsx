import React, { useEffect, useState } from 'react';
import { useAccountStore } from '../store/accountStore';
import TOTPCard from '../components/TOTPCard';
import { Search, Loader2, AlertCircle, Plus, Shield, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import AddSelectionModal from '../components/AddSelectionModal';

export default function Dashboard() {
  const { accounts, fetchAccounts, loading } = useAccountStore();
  const [search, setSearch] = useState('');
  const [showWarning, setShowWarning] = useState(() => {
    return localStorage.getItem('hide_security_warning') !== 'true';
  });
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAccounts();
  }, []);

  const filteredAccounts = accounts.filter(acc => 
    acc.issuer.toLowerCase().includes(search.toLowerCase()) || 
    acc.label.toLowerCase().includes(search.toLowerCase()) ||
    (acc.customName && acc.customName.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden h-full">
      <header className="h-auto md:h-16 bg-white border-b border-border px-4 md:px-8 py-4 md:py-0 flex flex-col md:flex-row items-center justify-between gap-4 shrink-0">
        <div className="flex items-center bg-[#f1f5f9] rounded-full px-4 py-2 w-full md:w-96 group focus-within:ring-2 focus-within:ring-brand/20 transition-all">
          <Search className="w-4 h-4 text-text-muted group-focus-within:text-brand" />
          <input
            type="text"
            placeholder="Search accounts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent border-none text-sm ml-2 w-full focus:outline-none text-text-primary placeholder:text-text-muted"
          />
        </div>
        
        <div className="flex items-center justify-between w-full md:w-auto gap-4 md:gap-6">
          <div className="flex items-center gap-2 text-[10px] md:text-xs font-medium text-text-secondary whitespace-nowrap">
            <Loader2 className={cn("w-3 h-3 md:w-4 md:h-4", loading && "animate-spin")} />
            {loading ? 'Syncing...' : 'Up to date'}
          </div>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-brand text-white px-4 md:px-5 py-2 rounded-lg text-xs md:text-sm font-semibold hover:bg-brand-hover shadow-sm flex items-center gap-2 transition-all active:scale-95"
          >
            <Plus className="w-3 h-3 md:w-4 md:h-4" />
            Add
          </button>
        </div>
      </header>

      <div className="flex-1 p-4 md:p-8 overflow-y-auto bg-bg-main">
        <div className="mb-6 md:mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-[#0f172a]">Authenticator</h1>
            <p className="text-text-secondary text-xs md:text-sm">Secure TOTP Vault</p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
            <span className="px-3 py-1 bg-white border border-[#e2e8f0] rounded text-[10px] md:text-xs font-medium text-[#475569] whitespace-nowrap">Total: {accounts.length}</span>
            <span className="px-3 py-1 bg-[#dbeafe] text-[#2563eb] border border-[#bfdbfe] rounded text-[10px] md:text-xs font-medium whitespace-nowrap">Matches: {filteredAccounts.length}</span>
          </div>
        </div>

        {filteredAccounts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAccounts.map((acc) => (
              <TOTPCard key={acc.id} account={acc} />
            ))}
            
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="bg-dashed border-2 border-dashed border-[#cbd5e1] rounded-2xl p-6 flex flex-col items-center justify-center text-center opacity-70 group cursor-pointer hover:bg-white hover:border-brand hover:opacity-100 transition-all"
            >
              <div className="w-12 h-12 bg-[#f1f5f9] rounded-full flex items-center justify-center mb-3 group-hover:bg-[#dbeafe] group-hover:text-brand transition-colors">
                <Plus className="w-6 h-6 text-text-secondary group-hover:text-brand" />
              </div>
              <p className="text-sm font-semibold text-text-secondary group-hover:text-[#1e293b]">Add another account</p>
              <p className="text-xs text-text-muted">QR Code or Manual Entry</p>
            </button>
          </div>
        ) : (
          <div className="h-[50vh] flex flex-col items-center justify-center text-center opacity-40">
            {search ? (
              <>
                <Search className="w-12 h-12 mb-4" />
                <p className="text-sm font-medium uppercase tracking-widest">No matching accounts</p>
              </>
            ) : (
              <>
                <AlertCircle className="w-12 h-12 mb-4" />
                <p className="text-sm font-medium uppercase tracking-widest mb-2">Vault is empty</p>
                <p className="text-xs max-w-xs">Start by adding your first authentication factor.</p>
                <button 
                  onClick={() => setIsAddModalOpen(true)}
                  className="mt-6 text-brand font-bold text-xs uppercase hover:underline"
                >
                  Create manual account &rarr;
                </button>
              </>
            )}
          </div>
        )}

        <AnimatePresence>
          {showWarning && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mt-12 bg-[#fff7ed] border border-[#ffedd5] rounded-xl p-4 flex items-center gap-4 relative group"
            >
              <div className="w-10 h-10 bg-[#fb923c] rounded-full flex items-center justify-center text-white shrink-0">
                 <Shield className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-[#9a3412]">Security Protocol</p>
                <p className="text-xs text-[#c2410c]">Your keys are stored locally and encrypted using AES-GCM. Never share your secret codes.</p>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => navigate('/backup')}
                  className="bg-white text-[#9a3412] px-3 py-1.5 rounded-lg border border-[#fed7aa] text-xs font-bold shadow-sm whitespace-nowrap hover:bg-[#fff7ed] transition-colors"
                >
                  Backup Vault
                </button>
                <button 
                  onClick={() => {
                    setShowWarning(false);
                    localStorage.setItem('hide_security_warning', 'true');
                  }}
                  className="p-1.5 text-[#9a3412] hover:bg-[#ffedd5] rounded-lg transition-colors"
                  aria-label="Dismiss warning"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AddSelectionModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
}

