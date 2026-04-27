import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Globe, Smartphone, Monitor, Shield, LogOut, Clock, MapPin, Trash2, ShieldAlert, AlertTriangle } from 'lucide-react';
import { useAuthStore, Session } from '../store/authStore';
import { useToastStore } from '../store/toastStore';
import { useConfirmStore } from '../store/confirmStore';
import { cn } from '../lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface SessionsModalProps {
  onClose: () => void;
}

export default function SessionsModal({ onClose }: SessionsModalProps) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const { getSessions, revokeSession, revokeOtherSessions, logout } = useAuthStore();
  const { addToast } = useToastStore();
  const { confirm } = useConfirmStore();

  const fetchSessions = async () => {
    try {
      const data = await getSessions();
      setSessions(data);
    } catch (err) {
      console.error('Failed to fetch sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleRevoke = async (id: string, isCurrent: boolean) => {
    if (isCurrent) {
      confirm({
        title: 'Logout Current Session?',
        message: 'Are you sure you want to terminate your current session on this device? You will need to re-authenticate to gain access again.',
        confirmLabel: 'Logout Now',
        type: 'danger',
        onConfirm: async () => {
          await logout();
          window.location.href = '/login';
        }
      });
      return;
    }

    try {
      await revokeSession(id);
      setSessions(prev => prev.filter(s => s.id !== id));
      addToast('Selected session has been revoked', 'info');
    } catch (err) {
      addToast('Security Error: Unable to revoke remote session', 'error');
    }
  };

  const handleRevokeOthers = async () => {
    confirm({
      title: 'Revoke Other Sessions?',
      message: 'This will instantly disconnect all other devices currently logged into your account. Only this active session will remain authorized.',
      confirmLabel: 'Disconnect Others',
      type: 'danger',
      onConfirm: async () => {
        try {
          await revokeOtherSessions();
          setSessions(prev => prev.filter(s => s.isCurrent));
          addToast('All other sessions terminated successfully', 'success');
        } catch (err: any) {
          const message = err.response?.data?.details || err.response?.data?.error || err.message || 'Failed to clear remote authorizations';
          addToast(`Error: ${message}`, 'error');
        }
      }
    });
  };

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'mobile': return <Smartphone className="w-5 h-5" />;
      case 'tablet': return <Smartphone className="w-5 h-5" />; // Lucide doesn't have a distinct Tablet that's very different
      default: return <Monitor className="w-5 h-5" />;
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
        className="bg-white rounded-[1.5rem] md:rounded-[2.5rem] p-5 md:p-8 w-full max-w-2xl relative z-10 shadow-2xl border border-border flex flex-col max-h-[90vh] md:max-h-[85vh]"
      >
        <div className="flex items-start justify-between mb-4 md:mb-6 shrink-0">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="p-2 md:p-3 bg-brand/10 text-brand rounded-xl md:rounded-2xl shrink-0">
              <Shield className="w-5 h-5 md:w-6 h-6" />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg md:text-xl font-bold text-text-primary leading-tight">Active Sessions</h2>
              <p className="text-[10px] md:text-xs text-text-muted font-medium line-clamp-1">Manage and terminate your active login sessions</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 md:p-2 hover:bg-bg-main rounded-xl transition-colors shrink-0">
            <X className="w-5 h-5 md:w-6 h-6 text-text-muted" />
          </button>
        </div>

        {sessions.length > 1 && (
          <button
            onClick={handleRevokeOthers}
            className="mb-4 md:mb-6 shrink-0 w-full py-2.5 md:py-3 px-4 border border-red-100 bg-red-50 text-red-600 rounded-xl md:rounded-2xl text-[10px] md:text-xs font-bold flex items-center justify-center gap-2 hover:bg-red-100 transition-colors"
          >
            <ShieldAlert className="w-4 h-4" />
            Terminate All Other Sessions
          </button>
        )}

        <div className="flex-1 overflow-y-auto pr-1 md:pr-2 space-y-3 md:space-y-4 custom-scrollbar">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-4 text-text-muted">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand" />
              <p className="text-sm font-medium text-center">Retrieving active secure sessions...</p>
            </div>
          ) : sessions.length === 0 ? (
             <div className="py-12 flex flex-col items-center justify-center gap-4 text-text-muted italic">
               <Globe className="w-12 h-12 opacity-20" />
               <p className="text-sm">No active sessions detected</p>
             </div>
          ) : (
            sessions.map((session) => (
              <div 
                key={session.id}
                className={cn(
                  "p-4 md:p-5 rounded-2xl md:rounded-3xl border transition-all flex flex-col sm:flex-row items-start gap-3 md:gap-4",
                  session.isCurrent ? "bg-brand/5 border-brand/20 shadow-sm" : "bg-white border-border hover:bg-bg-main"
                )}
              >
                <div className="flex items-start justify-between w-full sm:w-auto gap-3">
                  <div className={cn(
                    "p-2.5 md:p-3 rounded-xl md:rounded-2xl shrink-0",
                    session.isCurrent ? "bg-brand text-white" : "bg-bg-main text-text-muted"
                  )}>
                    {getDeviceIcon(session.device)}
                  </div>
                  
                  {/* Exit button for mobile inside the first row */}
                  <button
                    onClick={() => handleRevoke(session.id, session.isCurrent)}
                    className="sm:hidden p-2 text-text-muted hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    title="Logout session"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex-1 min-w-0 w-full">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h3 className="text-xs md:text-sm font-bold text-text-primary">
                      {session.browser} on {session.os}
                    </h3>
                    {session.isCurrent && (
                      <span className="px-1.5 py-0.5 bg-brand text-white text-[8px] md:text-[9px] font-black uppercase rounded-full tracking-wider shrink-0">
                        Current Session
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col sm:grid sm:grid-cols-2 gap-2 sm:gap-x-4">
                    <div className="flex items-center gap-1.5 text-[9px] md:text-[10px] text-text-muted font-bold uppercase truncate">
                      <MapPin className="w-3 h-3 shrink-0" />
                      <span className="truncate">{session.ip}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[9px] md:text-[10px] text-text-muted font-bold uppercase truncate">
                      <Clock className="w-3 h-3 shrink-0" />
                      <span>Active {formatDistanceToNow(session.lastActiveAt)} ago</span>
                    </div>
                  </div>

                  <div className="mt-2.5 text-[9px] md:text-[10px] text-text-muted font-medium flex items-center gap-1 opacity-70">
                    <span className="w-1 h-1 rounded-full bg-border shrink-0" />
                    <span className="truncate">First authorized {new Date(session.createdAt).toLocaleString()}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleRevoke(session.id, session.isCurrent)}
                  className="hidden sm:block p-2 text-text-muted hover:text-red-500 hover:bg-red-50 rounded-xl transition-all shrink-0"
                  title="Logout session"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t border-border shrink-0">
          <p className="text-[9px] md:text-[10px] text-center text-text-muted font-medium px-4 md:px-8 italic leading-relaxed">
            Terminating a session will immediately invalidate the security token for that device. 
            Unauthorized sessions should be reported and revoked immediately.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
