import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Shield, Lock, Smartphone, Loader2, Save, Trash2, Clock } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useToastStore } from '../store/toastStore';
import { cn } from '../lib/utils';

interface AppLockModalProps {
  onClose: () => void;
}

export default function AppLockModal({ onClose }: AppLockModalProps) {
  const { user, setupAppLock, toggleAppLock, updateAppLockSettings } = useAuthStore();
  const { addToast } = useToastStore();
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [step, setStep] = useState(user?.isAppLockEnabled ? 'settings' : 'setup');
  const [loading, setLoading] = useState(false);
  const [showTimeoutSelector, setShowTimeoutSelector] = useState(false);

  const timeoutOptions = [
    { label: '1 Minute', value: 60000 },
    { label: '5 Minutes', value: 300000 },
    { label: '15 Minutes', value: 900000 },
    { label: '30 Minutes', value: 1800000 },
    { label: '1 Hour', value: 3600000 },
    { label: 'Never', value: -1 },
  ];

  const currentTimeout = timeoutOptions.find(o => o.value === (user?.autoLockTimeout ?? 300000)) || timeoutOptions[1];

  const handleTimeoutChange = async (value: number) => {
    setLoading(true);
    try {
      await updateAppLockSettings({ autoLockTimeout: value });
      addToast(`Auto-lock set to ${timeoutOptions.find(o => o.value === value)?.label}`, 'success');
      setShowTimeoutSelector(false);
    } catch (err) {
      addToast('Failed to update timeout', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pin !== confirmPin) {
      addToast('PINs do not match', 'error');
      return;
    }
    if (pin.length !== 4 && pin.length !== 6) {
      addToast('PIN must be 4 or 6 digits', 'error');
      return;
    }

    setLoading(true);
    try {
      await setupAppLock(pin, true);
      addToast('App Lock configured and enabled', 'success');
      onClose();
    } catch (err) {
      addToast('Failed to configure App Lock', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async () => {
    setLoading(true);
    try {
      await toggleAppLock(!user?.isAppLockEnabled);
      addToast(`App Lock ${!user?.isAppLockEnabled ? 'enabled' : 'disabled'}`, 'success');
      onClose();
    } catch (err) {
      addToast('Failed to update App Lock status', 'error');
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
              <Shield className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-text-primary">App Lock</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-bg-main rounded-xl transition-colors">
            <X className="w-6 h-6 text-text-muted" />
          </button>
        </div>

        {step === 'settings' ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between p-5 bg-bg-main rounded-3xl border border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-brand/10 text-brand rounded-xl flex items-center justify-center">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-text-primary uppercase tracking-tight">Security Status</p>
                  <p className={cn("text-xs font-bold", user?.isAppLockEnabled ? "text-green-600" : "text-text-muted")}>
                    {user?.isAppLockEnabled ? 'Active Protection' : 'Inactive'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleToggle}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-bold transition-all",
                  user?.isAppLockEnabled 
                    ? "bg-red-50 text-red-500 hover:bg-red-100" 
                    : "bg-brand text-white hover:bg-brand-hover"
                )}
              >
                {user?.isAppLockEnabled ? 'Disable' : 'Enable'}
              </button>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => setStep('setup')}
                className="w-full py-4 border-2 border-dashed border-border rounded-3xl text-xs font-bold text-text-muted hover:border-brand hover:text-brand transition-all flex items-center justify-center gap-2"
              >
                <Smartphone className="w-4 h-4" />
                Change Security PIN
              </button>

              {user?.isAppLockEnabled && (
                <>
                  <div className="relative">
                    <button
                      onClick={() => setShowTimeoutSelector(!showTimeoutSelector)}
                      className="w-full py-4 px-5 bg-bg-main rounded-3xl border border-border flex items-center justify-between hover:border-brand transition-all group"
                    >
                      <div className="flex items-center gap-2 text-text-muted group-hover:text-brand transition-colors">
                        <Clock className="w-4 h-4" />
                        <span className="text-[10px] font-bold uppercase tracking-tight">Auto-Lock Inactivity</span>
                      </div>
                      <span className="text-[10px] font-bold text-text-primary px-2 py-0.5 bg-white rounded-lg border border-border group-hover:border-brand group-hover:text-brand transition-all">
                        {currentTimeout.label}
                      </span>
                    </button>

                    <AnimatePresence>
                      {showTimeoutSelector && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-3xl border border-border shadow-xl overflow-hidden z-20"
                        >
                          <div className="p-2 grid grid-cols-2 gap-1">
                            {timeoutOptions.map((opt) => (
                              <button
                                key={opt.value}
                                onClick={() => handleTimeoutChange(opt.value)}
                                className={cn(
                                  "py-3 px-4 rounded-2xl text-[10px] font-bold transition-all",
                                  opt.value === currentTimeout.value
                                    ? "bg-brand text-white"
                                    : "hover:bg-bg-main text-text-muted hover:text-text-primary"
                                )}
                              >
                                {opt.label}
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  
                  <button
                    onClick={() => {
                      useAuthStore.getState().lockApp();
                      addToast('Secure vault locked', 'info');
                      onClose();
                    }}
                    className="w-full py-4 bg-bg-main hover:bg-red-50 hover:text-red-500 rounded-3xl text-xs font-bold text-text-muted transition-all flex items-center justify-center gap-2"
                  >
                    <Lock className="w-4 h-4" />
                    Lock Vault Immediately
                  </button>
                </>
              )}
            </div>
          </div>
        ) : (
          <form onSubmit={handleSetup} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-secondary ml-1 lowercase">enter new pin (4 or 6 digits)</label>
                <input
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, ''))}
                  className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-xl py-3.5 px-4 focus:ring-2 focus:ring-brand/10 focus:border-brand outline-none transition-all text-center tracking-[1rem] text-xl font-bold"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-secondary ml-1 lowercase">confirm pin</label>
                <input
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value.replace(/[^0-9]/g, ''))}
                  className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-xl py-3.5 px-4 focus:ring-2 focus:ring-brand/10 focus:border-brand outline-none transition-all text-center tracking-[1rem] text-xl font-bold"
                  required
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => user?.isAppLockEnabled ? setStep('settings') : onClose()}
                className="flex-1 px-6 py-3.5 rounded-xl text-sm font-bold text-text-secondary hover:bg-bg-main transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || pin.length < 4 || pin !== confirmPin}
                className="flex-1 bg-brand text-white px-6 py-3.5 rounded-xl text-sm font-bold hover:bg-brand-hover shadow-lg shadow-brand/20 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  <>
                    <Save className="w-4 h-4" />
                    Save PIN
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}
