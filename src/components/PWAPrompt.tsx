import React, { useEffect, useState } from 'react';
import { Download, X, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useRegisterSW } from 'virtual:pwa-register/react';

const DISMISS_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours
const STORAGE_KEY = 'pwa_install_dismissed_until';

export const PWAPrompt: React.FC = () => {
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  const {
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
    // If running in standalone mode (already installed), do not show install prompt
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    if (isStandalone) {
      return;
    }

    const checkDismissStatus = () => {
      const dismissedUntil = localStorage.getItem(STORAGE_KEY);
      if (dismissedUntil) {
        const expiry = Number(dismissedUntil);
        if (!isNaN(expiry) && Date.now() < expiry) {
          return false; // Still within 24-hour dismissal period
        }
      }
      return true;
    };

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);

      if (checkDismissStatus()) {
        setShowInstallBanner(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt
      );
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;

    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;

    if (outcome === 'accepted') {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      // If user dismissed system prompt, suppress for 24h as well
      const dismissUntil = Date.now() + DISMISS_DURATION_MS;
      localStorage.setItem(STORAGE_KEY, String(dismissUntil));
    }

    setInstallPrompt(null);
    setShowInstallBanner(false);
  };

  const handleCloseInstallBanner = () => {
    // Dismiss for 24 hours
    const dismissUntil = Date.now() + DISMISS_DURATION_MS;
    localStorage.setItem(STORAGE_KEY, String(dismissUntil));
    setShowInstallBanner(false);
  };

  return (
    <AnimatePresence>
      {/* Update Available notification */}
      {needRefresh && (
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
                  Update Available
                </h3>

                <p className="text-xs text-text-muted font-medium">
                  A new version of the app is available. Please refresh to update.
                </p>
              </div>
            </div>

            <button
              onClick={() => setNeedRefresh(false)}
              className="p-1 hover:bg-bg-main rounded-lg transition-colors text-text-muted"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => updateServiceWorker(true)}
            className="w-full py-2 bg-brand text-white text-xs font-bold rounded-xl hover:opacity-90 transition-opacity"
          >
            Refresh Now
          </button>
        </motion.div>
      )}

      {/* Install App Banner (Hidden for 24h once dismissed) */}
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
                  Install SecureAuth on your home screen for quick access and
                  offline features.
                </p>
              </div>
            </div>

            <button
              onClick={handleCloseInstallBanner}
              className="p-1 hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Close install prompt"
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
