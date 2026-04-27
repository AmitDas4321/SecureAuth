import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, Info, XCircle, X } from 'lucide-react';
import { useToastStore, ToastType } from '../store/toastStore';
import { cn } from '../lib/utils';

const icons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle2 className="w-5 h-5 text-green-500" />,
  error: <XCircle className="w-5 h-5 text-red-500" />,
  warning: <AlertCircle className="w-5 h-5 text-orange-500" />,
  info: <Info className="w-5 h-5 text-brand" />,
};

const bgColors: Record<ToastType, string> = {
  success: 'bg-green-50 border-green-100',
  error: 'bg-red-50 border-red-100',
  warning: 'bg-orange-50 border-orange-100',
  info: 'bg-brand/5 border-brand/10',
};

export default function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center gap-3 w-full max-w-md px-6 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            layout
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className={cn(
              "w-full p-4 rounded-2xl border shadow-xl flex items-center gap-4 pointer-events-auto backdrop-blur-md",
              bgColors[toast.type]
            )}
          >
            <div className="shrink-0">
              {icons[toast.type]}
            </div>
            <p className="flex-1 text-sm font-bold text-text-primary leading-tight">
              {toast.message}
            </p>
            <button 
              onClick={() => removeToast(toast.id)}
              className="p-1 hover:bg-black/5 rounded-lg transition-colors text-text-muted"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
