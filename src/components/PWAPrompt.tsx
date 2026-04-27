import React, { useEffect, useState } from 'react';
import { Download, X, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useRegisterSW } from 'virtual:pwa-register/react';

export const PWAPrompt: React.FC = () => {
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered: ' + r);
    },
    onRegisterError(error) {
      console.log('SW registration error', error);
    },
  });

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setInstallPrompt(e);
      setShowInstallBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;

    // Show the install prompt
    installPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await installPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);

    // We've used the prompt, and can't use it again, throw it away
    setInstallPrompt(null);
    setShowInstallBanner(false);
  };

  const closePrompt = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  return (
    <AnimatePresence>
      {(offlineReady || needRefresh) && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-24 left-4 right-4 md:left-auto md:right-8 md:w-80 z-50 p-4 bg-white rounded-2xl shadow-2xl border border-border flex flex-col gap-3"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-brand/10 text-brand rounded-xl">
                <RefreshCw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-text-primary">
                  {offlineReady ? 'Ready to work offline' : 'Update Available'}
                </h3>
                <p className="text-xs text-text-muted font-medium">
                  {offlineReady 
                    ? 'App has been cached and is ready for offline use.' 
                    : 'A new version of the app is available. Please refresh to update.'}
                </p>
              </div>
            </div>
            <button
              onClick={closePrompt}
              className="p-1 hover:bg-bg-main rounded-lg transition-colors text-text-muted"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          {needRefresh && (
            <button
              onClick={() => updateServiceWorker(true)}
              className="w-full py-2 bg-brand text-white text-xs font-bold rounded-xl hover:opacity-90 transition-opacity"
            >
              Refresh Now
            </button>
          )}
        </motion.div>
      )}

      {showInstallBanner && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-24 left-4 right-4 md:left-8 md:right-auto md:w-80 z-50 p-4 bg-brand text-white rounded-2xl shadow-2xl flex flex-col gap-3"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl">
                <Download className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold">Install App</h3>
                <p className="text-xs text-white/80 font-medium">
                  Install SecureAuth on your home screen for quick access and offline features.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowInstallBanner(false)}
              className="p-1 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={handleInstallClick}
            className="w-full py-2 bg-white text-brand text-xs font-bold rounded-xl hover:bg-opacity-90 transition-colors"
          >
            Install Now
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
