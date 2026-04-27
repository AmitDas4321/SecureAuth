import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, Info, X } from 'lucide-react';
import { useConfirmStore } from '../store/confirmStore';
import { cn } from '../lib/utils';

export default function ConfirmModal() {
  const { config, close } = useConfirmStore();

  if (!config) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={close}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-[2.5rem] p-8 w-full max-w-sm relative z-10 shadow-2xl border border-border"
        >
          <div className="flex items-center justify-between mb-6">
            <div className={cn(
              "p-3 rounded-2xl",
              config.type === 'danger' ? "bg-red-50 text-red-500" : "bg-brand/10 text-brand"
            )}>
              {config.type === 'danger' ? <AlertTriangle className="w-6 h-6" /> : <Info className="w-6 h-6" />}
            </div>
            <button onClick={close} className="p-2 hover:bg-bg-main rounded-xl transition-colors">
              <X className="w-5 h-5 text-text-muted" />
            </button>
          </div>

          <h2 className="text-xl font-bold text-text-primary mb-2">{config.title}</h2>
          <p className="text-sm text-text-secondary font-medium leading-relaxed mb-8">
            {config.message}
          </p>

          <div className="flex gap-3">
            <button
              onClick={close}
              className="flex-1 px-6 py-3.5 rounded-xl text-sm font-bold text-text-secondary hover:bg-bg-main transition-all"
            >
              {config.cancelLabel || 'Cancel'}
            </button>
            <button
              onClick={() => {
                config.onConfirm();
                close();
              }}
              className={cn(
                "flex-1 text-white px-6 py-3.5 rounded-xl text-sm font-bold shadow-lg transition-all active:scale-95",
                config.type === 'danger' 
                  ? "bg-red-500 hover:bg-red-600 shadow-red-500/20" 
                  : "bg-brand hover:bg-brand-hover shadow-brand/20"
              )}
            >
              {config.confirmLabel || 'Confirm'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
