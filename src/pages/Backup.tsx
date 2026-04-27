import React, { useState } from 'react';
import axios from 'axios';
import { ChevronLeft, Download, Upload, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export default function Backup() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleExport = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post('/api/backup/export');
      const blob = new Blob([res.data.backup], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `secureauth_backup_${new Date().toISOString().split('T')[0]}.txt`;
      a.click();
      setSuccess('Backup downloaded successfully.');
    } catch (err) {
      setError('Export failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const content = event.target?.result as string;
        await axios.post('/api/backup/import', { backup: content });
        setSuccess('Backup restored successfully.');
        setTimeout(() => navigate('/dashboard'), 2000);
      } catch (err) {
        setError('Import failed. Invalid backup file.');
      } finally {
        setLoading(false);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex flex-col min-h-screen bg-bg-main">
      <header className="sticky top-0 z-40 bg-white border-b border-border px-4 md:px-8 py-4 md:py-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-bg-main rounded-lg transition-colors">
            <ChevronLeft className="w-5 h-5 text-text-secondary" />
          </button>
          <h1 className="font-bold tracking-tight text-xl text-text-primary">Encrypted Backups</h1>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-8 max-w-2xl mx-auto w-full space-y-8 md:space-y-12 overflow-y-auto">
        <div className="text-center space-y-4 pt-4">
          <div className="bg-brand w-16 h-16 rounded-2xl flex items-center justify-center mx-auto shadow-xl shadow-brand/20">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-text-primary">Data Security Protocols</h2>
            <p className="text-xs text-text-secondary font-medium lowercase tracking-tight max-w-xs mx-auto">
              Vault exports are AES-GCM encrypted. Keep these files in a secure physical location.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={handleExport}
            disabled={loading}
            className="group bg-white border border-border p-6 md:p-8 rounded-3xl flex flex-col items-center justify-center gap-4 hover:border-brand hover:shadow-md transition-all active:scale-95 disabled:opacity-50"
          >
            <div className="w-12 h-12 bg-brand/10 text-brand rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <Download className="w-6 h-6" />
            </div>
            <div className="text-center">
              <p className="font-bold text-sm text-text-primary">Export Vault</p>
              <p className="text-[10px] text-text-muted font-medium mt-0.5">Encrypted Download</p>
            </div>
          </button>

          <label className="group bg-white border border-border p-6 md:p-8 rounded-3xl flex flex-col items-center justify-center gap-4 hover:border-brand hover:shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-50">
            <input type="file" className="hidden" onChange={handleImport} disabled={loading} />
            <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <Upload className="w-6 h-6" />
            </div>
            <div className="text-center">
              <p className="font-bold text-sm text-text-primary">Import Vault</p>
              <p className="text-[10px] text-text-muted font-medium mt-0.5">Restore from File</p>
            </div>
          </label>
        </div>

        {(success || error || loading) && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn(
              "p-6 rounded-2xl flex items-center gap-4 border shadow-sm",
              success ? "bg-green-50 border-green-200 text-green-700" : 
              error ? "bg-red-50 border-red-200 text-red-700" :
              "bg-white border-border"
            )}
          >
            <div className={cn(
              "p-2 rounded-lg shrink-0",
              success ? "bg-green-100" : error ? "bg-red-100" : "bg-bg-main"
            )}>
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <AlertCircle className="w-5 h-5" />}
            </div>
            <div>
              <p className="font-bold text-xs uppercase tracking-wider">{loading ? 'Processing...' : success ? 'Success' : 'Error'}</p>
              <p className="text-xs font-medium opacity-80 mt-0.5">{loading ? 'Decrypting security nodes...' : success || error}</p>
            </div>
          </motion.div>
        )}

        <div className="pt-8 text-[10px] text-text-muted font-medium lowercase text-center leading-relaxed">
          Safety Notice: Importing a backup merges records. Duplicates are filtered automatically via key hashing.
        </div>
      </main>
    </div>
  );
}
