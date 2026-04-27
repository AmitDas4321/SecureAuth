import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccountStore } from '../store/accountStore';
import { useToastStore } from '../store/toastStore';
import { ChevronLeft, Plus, Hash, User, Briefcase, Settings2, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

export default function AddAccount() {
  const [formData, setFormData] = useState({
    issuer: '',
    label: '',
    secret: '',
    digits: 6,
    period: 30,
    algorithm: 'SHA1'
  });
  const [loading, setLoading] = useState(false);
  const { addAccount } = useAccountStore();
  const { addToast } = useToastStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addAccount(formData);
      addToast('Security factor added successfully', 'success');
      navigate('/dashboard');
    } catch (err) {
      addToast('Authorization Failure: Account could not be persisted in the vault', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-bg-main">
      <header className="sticky top-0 z-40 bg-white border-b border-border px-4 md:px-8 py-4 md:py-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-bg-main rounded-lg transition-colors">
            <ChevronLeft className="w-5 h-5 text-text-secondary" />
          </button>
          <h1 className="font-bold tracking-tight text-xl text-text-primary">New Factor</h1>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-8 max-w-2xl mx-auto w-full overflow-y-auto">
        <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8 bg-white p-6 md:p-8 rounded-3xl border border-border shadow-sm">
          <div className="space-y-6">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-secondary ml-1">Issuer (e.g. Google)</label>
              <div className="relative group">
                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-brand transition-colors" />
                <input
                  required
                  type="text"
                  value={formData.issuer}
                  onChange={(e) => setFormData(prev => ({ ...prev, issuer: e.target.value }))}
                  className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-xl py-3.5 pl-12 pr-4 focus:ring-2 focus:ring-brand/10 focus:border-brand outline-none transition-all placeholder:text-text-muted/50 text-sm font-medium"
                  placeholder="Service Name"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-secondary ml-1">Label (e.g. user@email.com)</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-brand transition-colors" />
                <input
                  required
                  type="text"
                  value={formData.label}
                  onChange={(e) => setFormData(prev => ({ ...prev, label: e.target.value }))}
                  className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-xl py-3.5 pl-12 pr-4 focus:ring-2 focus:ring-brand/10 focus:border-brand outline-none transition-all placeholder:text-text-muted/50 text-sm font-medium"
                  placeholder="Identifier"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-secondary ml-1">Secret Key (Base32)</label>
              <div className="relative group">
                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-brand transition-colors" />
                <input
                  required
                  type="text"
                  value={formData.secret}
                  onChange={(e) => setFormData(prev => ({ ...prev, secret: e.target.value.toUpperCase().replace(/[^A-Z2-7]/g, '') }))}
                  className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-xl py-3.5 pl-12 pr-4 font-mono text-sm tracking-[0.1em] focus:ring-2 focus:ring-brand/10 focus:border-brand outline-none transition-all placeholder:text-text-muted/50"
                  placeholder="JBSWY3DPEHPK3PXP"
                />
              </div>
            </div>

            <details className="group border border-border rounded-xl overflow-hidden">
              <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-bg-main transition-colors list-none">
                <span className="flex items-center gap-2 text-xs font-bold text-text-secondary">
                  <Settings2 className="w-4 h-4" /> Advanced Configuration
                </span>
                <span className="text-xs text-text-muted group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="p-6 pt-2 space-y-6 bg-bg-main/50">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-text-muted uppercase">Digits</label>
                    <select 
                      value={formData.digits}
                      onChange={(e) => setFormData(prev => ({ ...prev, digits: parseInt(e.target.value) }))}
                      className="w-full bg-white border border-border rounded-xl py-2.5 px-3 text-sm font-medium focus:ring-2 focus:ring-brand/10 focus:border-brand outline-none transition-all"
                    >
                      <option value={6}>6 Digits</option>
                      <option value={8}>8 Digits</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-text-muted uppercase">Period (s)</label>
                    <input 
                      type="number"
                      value={formData.period}
                      onChange={(e) => setFormData(prev => ({ ...prev, period: parseInt(e.target.value) }))}
                      className="w-full bg-white border border-border rounded-xl py-2.5 px-3 text-sm font-medium focus:ring-2 focus:ring-brand/10 focus:border-brand outline-none transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-text-muted uppercase">Algorithm</label>
                  <select 
                    value={formData.algorithm}
                    onChange={(e) => setFormData(prev => ({ ...prev, algorithm: e.target.value }))}
                    className="w-full bg-white border border-border rounded-xl py-2.5 px-3 text-sm font-medium focus:ring-2 focus:ring-brand/10 focus:border-brand outline-none transition-all"
                  >
                    <option value="SHA1">SHA1 (Standard)</option>
                    <option value="SHA256">SHA256</option>
                    <option value="SHA512">SHA512</option>
                  </select>
                </div>
              </div>
            </details>
          </div>

          <button
            disabled={loading}
            className="w-full bg-brand text-white py-4 rounded-xl flex items-center justify-center gap-2 font-bold text-sm hover:bg-brand-hover disabled:opacity-50 transition-all shadow-md active:scale-95"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
              <>
                Register Account <Plus className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </main>
    </div>
  );
}
