import React, { useState, useEffect } from 'react';
import * as OTPAuth from 'otpauth';
import { Copy, Trash2, CheckCircle2, MoreVertical, Edit3, AlertTriangle } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useAccountStore, TOTPAccount } from '../store/accountStore';
import { useToastStore } from '../store/toastStore';
import { useConfirmStore } from '../store/confirmStore';
import RenameModal from './RenameModal';

interface TOTPCardProps {
  account: TOTPAccount;
}

export const TOTPCard: React.FC<TOTPCardProps> = ({ account }) => {
  const [code, setCode] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [copied, setCopied] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showRename, setShowRename] = useState(false);
  const { deleteAccount } = useAccountStore();
  const { addToast } = useToastStore();
  const { confirm } = useConfirmStore();

  const hasSecret = account.secret && account.secret.trim().length > 0;
  const isOracle = account.provider === 'oracle_mobile_authenticator';
  const displayName = account.customName || account.label;

  const totp = hasSecret ? new OTPAuth.TOTP({
    issuer: account.issuer,
    label: account.label,
    algorithm: account.algorithm,
    digits: account.digits,
    period: account.period,
    secret: account.secret,
  }) : null;

  useEffect(() => {
    if (!totp) {
      setCode('');
      setTimeLeft(0);
      return;
    }

    const updateCode = () => {
      try {
        const newCode = totp.generate();
        setCode(newCode);
        
        const seconds = Math.floor(Date.now() / 1000);
        setTimeLeft(account.period - (seconds % account.period));
      } catch (err) {
        console.error('OTP Gen Error:', err);
      }
    };

    updateCode();
    const timer = setInterval(updateCode, 1000);
    return () => clearInterval(timer);
  }, [account, totp]);

  const handleCopy = () => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopied(true);
    addToast('Security code copied to system clipboard', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    confirm({
      title: 'Delete Security Factor?',
      message: `Are you sure you want to permanently remove "${displayName}"? This action cannot be undone and will prevent you from accessing the associated service if backups are not configured.`,
      confirmLabel: 'Delete Forever',
      cancelLabel: 'Keep It',
      type: 'danger',
      onConfirm: () => {
        deleteAccount(account.id);
        addToast(`Factor for ${displayName} deleted successfully`, 'info');
      }
    });
    setShowMenu(false);
  };

  const isExpiringSoon = timeLeft < 5 && hasSecret;

  return (
    <>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-[2rem] p-6 shadow-sm border border-[#e2e8f0] hover:shadow-md transition-all cursor-pointer relative overflow-hidden group"
        onClick={() => hasSecret && handleCopy()}
      >
        <div className="absolute top-0 right-0 p-4 flex items-center gap-2">
           {hasSecret ? (
             <div className="w-8 h-8 rounded-full border-2 border-[#e2e8f0] flex items-center justify-center relative overflow-hidden">
                <svg className="w-full h-full -rotate-90">
                  <circle
                    cx="14" cy="14" r="12"
                    fill="none"
                    stroke={isExpiringSoon ? "#ef4444" : "#2563eb"}
                    strokeWidth="2.5"
                    strokeDasharray="75.4"
                    strokeDashoffset={75.4 - (75.4 * timeLeft) / account.period}
                    className="transition-all duration-1000 linear"
                    transform="translate(2, 2)"
                  />
                </svg>
                <span className={cn(
                  "absolute inset-0 flex items-center justify-center text-[8px] font-bold",
                  isExpiringSoon ? "text-red-500" : "text-text-secondary"
                )}>
                  {timeLeft}s
                </span>
             </div>
           ) : (
             <div className="px-2 py-1 bg-orange-100 text-orange-600 rounded text-[8px] font-bold uppercase">
               Enrollment
             </div>
           )}

           <div className="relative">
             <button
               onClick={(e) => {
                 e.stopPropagation();
                 setShowMenu(!showMenu);
               }}
               className="p-1.5 hover:bg-bg-main rounded-lg transition-colors text-text-muted"
             >
               <MoreVertical className="w-4 h-4" />
             </button>

             <AnimatePresence>
               {showMenu && (
                 <>
                   <div 
                     className="fixed inset-0 z-10" 
                     onClick={(e) => { e.stopPropagation(); setShowMenu(false); }} 
                   />
                   <motion.div
                     initial={{ opacity: 0, y: -10, scale: 0.95 }}
                     animate={{ opacity: 1, y: 0, scale: 1 }}
                     exit={{ opacity: 0, y: -10, scale: 0.95 }}
                     className="absolute right-0 mt-2 w-32 bg-white rounded-xl shadow-xl border border-border overflow-hidden z-20"
                   >
                     <button
                       onClick={(e) => {
                         e.stopPropagation();
                         setShowRename(true);
                         setShowMenu(false);
                       }}
                       className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-text-secondary hover:bg-bg-main transition-colors"
                     >
                       <Edit3 className="w-4 h-4" /> Rename
                     </button>
                     <button
                       onClick={handleDelete}
                       className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-red-500 hover:bg-red-50 transition-colors"
                     >
                       <Trash2 className="w-4 h-4" /> Delete
                     </button>
                   </motion.div>
                 </>
               )}
             </AnimatePresence>
           </div>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <div className={cn(
            "w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-inner uppercase",
            isOracle ? 'bg-[#f80000]' :
            account.issuer.toLowerCase().includes('google') ? 'bg-[#ea4335]' :
            account.issuer.toLowerCase().includes('amazon') ? 'bg-[#ff9900]' :
            account.issuer.toLowerCase().includes('github') ? 'bg-[#333]' :
            account.issuer.toLowerCase().includes('microsoft') ? 'bg-[#0078d4]' :
            account.issuer.toLowerCase().includes('discord') ? 'bg-[#5865F2]' : 'bg-brand'
          )}>
            {isOracle ? 'O' : account.issuer[0]}
          </div>
          <div className="overflow-hidden pr-8">
            <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted truncate">
              {isOracle ? 'Oracle Mobile Authenticator' : account.issuer}
            </p>
            <p className="text-base text-text-primary font-bold truncate leading-tight">
              {displayName}
            </p>
          </div>
        </div>

        {!hasSecret && (
          <div className="bg-orange-50/50 border border-orange-100 text-orange-700 p-3 rounded-xl text-[10px] font-bold mb-6">
            <p className="uppercase tracking-widest mb-1 opacity-60">Push-Based Account</p>
            Oracle enrollment / push-based account. Code generation disabled.
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {hasSecret ? (
              <span className={cn(
                "text-3xl font-mono font-bold tracking-[0.2em] transition-colors",
                isExpiringSoon ? "text-red-500" : "text-brand"
              )}>
                {code.slice(0, 3)} {code.slice(3)}
              </span>
            ) : (
              <span className="text-sm font-medium text-text-muted italic">
                Verification via Push Only
              </span>
            )}
          </div>
          
          <div className="flex gap-1">
            {hasSecret && (
              <div className="p-2 text-text-muted transition-all">
                {copied ? (
                  <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }}>
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  </motion.div>
                ) : (
                  <Copy className="w-5 h-5 group-hover:text-brand transition-colors" />
                )}
              </div>
            )}
          </div>
        </div>

        {isExpiringSoon && (
          <div className="absolute bottom-0 left-0 h-1 bg-red-500 animate-pulse transition-all" style={{ width: '100%' }} />
        )}
      </motion.div>

      <AnimatePresence>
        {showRename && (
          <RenameModal 
            account={account} 
            onClose={() => setShowRename(false)} 
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default TOTPCard;
