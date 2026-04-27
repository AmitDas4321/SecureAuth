import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Plus, QrCode, Database, Settings } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import AddSelectionModal from './AddSelectionModal';

export default function MobileNav() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const items = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Vault' },
    { to: '/qr-import', icon: QrCode, label: 'Scan' },
    { to: '#', icon: Plus, label: 'Add', primary: true, onClick: (e: React.MouseEvent) => { e.preventDefault(); setIsAddModalOpen(true); } },
    { to: '/backup', icon: Database, label: 'Backup' },
    { to: '/settings', icon: Settings, label: 'Config' },
  ];

  return (
    <>
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-border z-50">
        <div className="flex items-center justify-between px-1 h-16 max-w-md mx-auto">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={item.onClick}
              className={({ isActive }) => cn(
                "flex flex-col items-center justify-center flex-1 h-full transition-all duration-200 relative",
                isActive && !item.primary ? "text-brand" : "text-text-secondary hover:text-text-primary",
                item.primary && "z-10"
              )}
            >
              {({ isActive }) => (
                <>
                  {item.primary ? (
                    <div className="flex flex-col items-center -translate-y-4">
                      <div className="w-12 h-12 bg-brand rounded-2xl shadow-lg shadow-brand/30 flex items-center justify-center text-white active:scale-95 transition-transform border-4 border-white">
                        <item.icon className="w-6 h-6" />
                      </div>
                      <span className="text-[9px] font-bold mt-1 text-brand uppercase tracking-tighter">Add</span>
                    </div>
                  ) : (
                    <>
                      <item.icon className={cn("w-5 h-5 mb-0.5 transition-transform", isActive && "scale-110")} />
                      <span className={cn(
                        "text-[9px] font-bold uppercase tracking-tight transition-all",
                        isActive ? "opacity-100" : "opacity-70 text-[8.5px]"
                      )}>
                        {item.label}
                      </span>
                      {isActive && (
                        <motion.div 
                          layoutId="activeTab"
                          className="absolute top-0 w-8 h-1 bg-brand rounded-full"
                        />
                      )}
                    </>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>
        {/* Safe Area Spacer */}
        <div className="h-[env(safe-area-inset-bottom)]" />
      </nav>

      <AddSelectionModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </>
  );
}
