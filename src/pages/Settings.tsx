import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useConfirmStore } from '../store/confirmStore';
import { useToastStore } from '../store/toastStore';
import { LogOut, Shield, Github, HelpCircle, ChevronRight, Smartphone, User, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import SessionsModal from '../components/SessionsModal';
import AppLockModal from '../components/AppLockModal';
import { APP_NAME } from '../constants';

export default function Settings() {
  const { user, logout, lockApp } = useAuthStore();
  const { confirm } = useConfirmStore();
  const { addToast } = useToastStore();
  const [showSessions, setShowSessions] = useState(false);
  const [showAppLock, setShowAppLock] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    confirm({
      title: 'Sign Out?',
      message: 'Are you sure you want to terminate your current session? You will be returned to the gatekeeper login screen.',
      confirmLabel: 'Logout Now',
      type: 'danger',
      onConfirm: async () => {
        await logout();
        addToast('Session terminated successfully', 'info');
        navigate('/login');
      }
    });
  };

  const sections = [
    {
      title: 'Profile',
      items: [
        { 
          icon: User, 
          label: 'Change Name', 
          detail: user?.displayName || 'Not Set',
          arrow: true,
          onClick: () => navigate('/complete-profile')
        },
      ]
    },
    {
      title: 'Security',
      items: [
        { 
          icon: Shield, 
          label: 'App Lock', 
          detail: user?.isAppLockEnabled ? 'Active' : 'Inactive',
          arrow: true,
          onClick: () => setShowAppLock(true)
        },
        { 
          icon: Smartphone, 
          label: 'Session Management', 
          detail: 'Manage',
          arrow: true,
          onClick: () => setShowSessions(true)
        },

      ]
    },
    {
      title: 'Support',
      items: [
        { 
          icon: HelpCircle, 
          label: 'Documentation', 
          arrow: true, 
          onClick: () => window.open('https://github.com/AmitDas4321/SecureAuth/wiki', '_blank')
        },
        { 
          icon: Github, 
          label: 'Open Source', 
          arrow: true, 
          onClick: () => window.open('https://github.com/AmitDas4321/SecureAuth', '_blank')
        },
      ]
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-bg-main">
      <header className="bg-white pt-10 md:pt-12 pb-6 px-4 md:px-8 border-b border-border">
        <h1 className="font-bold tracking-tight text-2xl text-text-primary mb-8 lowercase">General Configuration</h1>
        
        <div className="flex items-center gap-4 bg-[#f8fafc] p-4 rounded-3xl border border-border">
          <div className="w-12 h-12 bg-brand rounded-2xl flex items-center justify-center text-white font-bold shadow-lg shadow-brand/20">
            {user?.displayName ? user.displayName[0].toUpperCase() : user?.phoneNumber?.slice(-2)}
          </div>
          <div>
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-0.5">{user?.displayName || 'Identity Index'}</p>
            <p className="font-bold text-sm text-text-primary">{user?.phoneNumber}</p>
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-8 max-w-2xl mx-auto w-full space-y-8 md:space-y-10 overflow-y-auto">
        {sections.map((section) => (
          <div key={section.title} className="space-y-4">
            <h3 className="text-xs font-bold text-text-muted px-2 lowercase tracking-tight">{section.title}</h3>
            <div className="bg-white rounded-3xl border border-border shadow-sm overflow-hidden">
              {section.items.map((item) => (
                <button 
                  key={item.label}
                  onClick={item.onClick}
                  className="w-full flex items-center justify-between p-4 hover:bg-bg-main transition-all group border-b border-border last:border-0"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-bg-main rounded-xl group-hover:bg-brand/10 group-hover:text-brand transition-colors text-text-muted">
                      <item.icon className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-semibold text-text-primary">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.detail && <span className="text-[10px] font-bold text-text-muted uppercase tracking-tight">{item.detail}</span>}
                    {item.arrow && <ChevronRight className="w-4 h-4 text-text-muted opacity-50 group-hover:translate-x-1 transition-transform" />}
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}

        <div className="pt-4">
          <button
            onClick={handleLogout}
            className="w-full bg-red-50 text-red-600 border border-red-100 py-4 rounded-2xl flex items-center justify-center gap-2 font-bold text-sm hover:bg-red-100 transition-all active:scale-95 shadow-sm"
          >
            <LogOut className="w-4 h-4" /> De-authenticate Client
          </button>
        </div>

        <div className="text-center opacity-40 space-y-1 py-10">
          <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest leading-relaxed px-10">
            {APP_NAME} Vault Core 2.8.1 <br/> AES-256 System Integrity Verified
          </p>
        </div>
      </main>

      <AnimatePresence>
        {showSessions && (
          <SessionsModal onClose={() => setShowSessions(false)} />
        )}
        {showAppLock && (
          <AppLockModal onClose={() => setShowAppLock(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
