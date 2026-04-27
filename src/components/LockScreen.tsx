import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, Shield, ArrowRight, Loader2, X, Delete } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useToastStore } from '../store/toastStore';
import { cn } from '../lib/utils';

export default function LockScreen() {
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const { verifyAppLock, user, logout } = useAuthStore();
  const { addToast } = useToastStore();
  const pinLength = user?.pinLength || 6;

  const handleInput = (val: string) => {
    if (pin.length < pinLength) {
      setPin(prev => prev + val);
      setError(false);
    }
  };

  const handleBackspace = () => {
    setPin(prev => prev.slice(0, -1));
    setError(false);
  };

  useEffect(() => {
    if (pin.length === pinLength) {
      const verify = async () => {
        setLoading(true);
        const success = await verifyAppLock(pin);
        if (success) {
          addToast('Vault accessible. Identity confirmed.', 'success');
        } else {
          setError(true);
          setPin('');
          addToast('Incorrect PIN. Security protocol remains active.', 'error');
        }
        setLoading(false);
      };
      
      verify();
    }
  }, [pin, pinLength]);

  const handleSubmit = async () => {
    if (pin.length < pinLength) return;
    setLoading(true);
    const success = await verifyAppLock(pin);
    if (!success) {
      setError(true);
      setPin('');
      addToast('Incorrect security code', 'error');
    }
    setLoading(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[200] bg-white flex flex-col items-center justify-center p-6 selection:bg-brand selection:text-white"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="w-full max-w-sm text-center"
      >
        <div className="flex items-center justify-center mb-10">
          <motion.div 
            animate={error ? { x: [-5, 5, -5, 5, 0] } : {}}
            className="w-20 h-20 bg-brand rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-brand/30 relative"
          >
            <Lock className="w-10 h-10 text-white" />
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
              className="absolute -inset-1 border border-brand/20 rounded-[2.8rem] border-dashed"
            />
          </motion.div>
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-text-primary mb-2 uppercase">Vault Locked</h1>
        <p className="text-sm text-text-secondary font-medium mb-12 lowercase">
          Confirm your terminal identifier to proceed
        </p>

        <div className="flex items-center justify-center gap-4 mb-16">
          {[...Array(pinLength)].map((_, i) => (
            <motion.div
              key={i}
              animate={error ? { scale: [1, 1.2, 1], transition: { delay: i * 0.05 } } : {}}
              className={cn(
                "w-4 h-4 rounded-full border-2 transition-all duration-300",
                i < pin.length 
                  ? "bg-brand border-brand shadow-[0_0_15px_rgba(37,99,235,0.4)]" 
                  : "border-border bg-transparent"
              )}
            />
          ))}
        </div>

        <div className="grid grid-cols-3 gap-4 mb-12">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
            <button
              key={n}
              onClick={() => handleInput(n.toString())}
              disabled={loading}
              className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-text-primary hover:bg-bg-main active:scale-90 transition-all font-mono"
            >
              {n}
            </button>
          ))}
          <button 
             onClick={handleBackspace}
             className="w-20 h-20 rounded-full flex items-center justify-center text-text-muted hover:bg-bg-main active:scale-95 transition-all"
          >
            <Delete className="w-7 h-7" />
          </button>
          <button
            onClick={() => handleInput('0')}
            disabled={loading}
            className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-text-primary hover:bg-bg-main active:scale-90 transition-all font-mono"
          >
            0
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || pin.length < pinLength}
            className="w-20 h-20 rounded-full flex items-center justify-center text-brand hover:bg-brand/10 active:scale-90 transition-all"
          >
            {loading ? <Loader2 className="w-7 h-7 animate-spin" /> : <ArrowRight className="w-7 h-7" />}
          </button>
        </div>

        <button 
          onClick={() => logout()}
          className="text-xs font-bold text-red-500 hover:bg-red-50 px-4 py-2 rounded-xl transition-all flex items-center gap-2 mx-auto"
        >
          Emergency System Logout
        </button>
      </motion.div>
    </motion.div>
  );
}
