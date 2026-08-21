import React from 'react';
import { X, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useRegisterSW } from 'virtual:pwa-register/react';

export const PWAPrompt: React.FC = () => {
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

  if (!needRefresh) return null;

  return (
    <AnimatePresence>
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
    </AnimatePresence>
  );
};