import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, QrCode, Keyboard, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AddSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddSelectionModal({ isOpen, onClose }: AddSelectionModalProps) {
  const navigate = useNavigate();

  const handleSelect = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
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
            className="bg-white rounded-[2.5rem] p-8 w-full max-w-sm relative z-10 shadow-2xl border border-border"
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-text-primary">Add Account</h2>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-bg-main rounded-xl transition-colors"
              >
                <X className="w-6 h-6 text-text-muted" />
              </button>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => handleSelect('/qr-import')}
                className="w-full flex items-center justify-between p-6 bg-brand/5 border border-brand/20 rounded-3xl hover:bg-brand/10 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-brand rounded-2xl flex items-center justify-center text-white shadow-lg shadow-brand/20">
                    <QrCode className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-text-primary">Scan QR Code</p>
                    <p className="text-xs text-text-secondary">Automatic setup</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-brand opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
              </button>

              <button
                onClick={() => handleSelect('/add')}
                className="w-full flex items-center justify-between p-6 bg-bg-main border border-border rounded-3xl hover:border-text-muted transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-text-primary border border-border">
                    <Keyboard className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-text-primary">Manual Add</p>
                    <p className="text-xs text-text-secondary">Enter secret key</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-text-muted opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
