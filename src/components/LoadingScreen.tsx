import React from 'react';
import { motion } from 'motion/react';
import { Shield } from 'lucide-react';
import { APP_NAME } from '../constants';

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-bg-main overflow-hidden">
      {/* Background Radial Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.08)_0%,transparent_70%)]" />
      
      <div className="relative flex flex-col items-center">
        {/* Animated Rings */}
        <div className="relative mb-12">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.2, 0.1],
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute inset-[-40px] border border-brand/20 rounded-full"
          />
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ 
              scale: [1, 1.4, 1],
              opacity: [0.05, 0.1, 0.05],
            }}
            transition={{ 
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5
            }}
            className="absolute inset-[-80px] border border-brand/10 rounded-full"
          />
          
          {/* Main Icon Container */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative w-24 h-24 bg-white rounded-3xl shadow-2xl border border-border flex items-center justify-center overflow-hidden group"
          >
            {/* Glossy Overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/50 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            
            <motion.div
              animate={{ 
                rotateY: [0, 360],
              }}
              transition={{ 
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Shield className="w-10 h-10 text-brand" />
            </motion.div>
            
            {/* Bottom Glow */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-brand/30 blur-sm" />
          </motion.div>
        </div>

        {/* Text Section */}
        <div className="text-center space-y-4">
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-2xl font-black text-text-primary tracking-tighter uppercase"
          >
            {APP_NAME} <span className="text-brand">Vault</span>
          </motion.h2>
          
          <div className="flex flex-col items-center gap-3">
            <div className="w-48 h-1.5 bg-border rounded-full overflow-hidden relative">
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute inset-0 bg-brand w-1/2"
              />
            </div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em]"
            >
              Initializing Secure Environment
            </motion.p>
          </div>
        </div>

        {/* Subtle Bottom Badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="fixed bottom-12 flex items-center gap-2 px-4 py-2 bg-white/50 backdrop-blur-md rounded-full border border-border shadow-sm"
        >
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
          <span className="text-[9px] font-bold text-text-secondary uppercase tracking-widest">AES-256 Encrypted</span>
        </motion.div>
      </div>
    </div>
  );
}
