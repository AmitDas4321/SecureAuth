import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Plus, QrCode, Database, Settings, Shield } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuthStore } from '../store/authStore';
import { APP_NAME } from '../constants';

export default function Sidebar() {
  const { user } = useAuthStore();
  
  const items = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/qr-import', icon: QrCode, label: 'Scan QR Code' },
    { to: '/add', icon: Plus, label: 'Manual Add' },
    { to: '/backup', icon: Database, label: 'Backups' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <aside className="hidden md:flex w-64 bg-white border-r border-[#e5e5e5] h-full flex flex-col shrink-0">
      <div className="p-6 border-b border-[#e5e5e5] flex items-center gap-3">
        <div className="w-10 h-10 bg-[#2563eb] rounded-xl flex items-center justify-center">
          <Shield className="w-6 h-6 text-white" />
        </div>
        <span className="font-bold text-lg tracking-tight text-[#1a1a1a]">{APP_NAME}</span>
      </div>
      
      <nav className="flex-1 p-4 space-y-1">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm font-medium",
              isActive 
                ? "bg-[#f5f5f5] text-[#2563eb]" 
                : "text-[#64748b] hover:bg-[#fafafa] hover:text-[#1e293b]"
            )}
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 mt-auto border-t border-[#e5e5e5]">
        <div className="flex items-center gap-3 p-2 bg-[#f8fafc] rounded-xl border border-[#e2e8f0]">
          <div className="w-8 h-8 bg-[#2563eb] text-white rounded-full flex items-center justify-center font-bold text-xs uppercase">
            {user?.displayName ? user.displayName[0] : (user?.phoneNumber?.slice(-1) || 'U')}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-xs font-bold truncate text-[#1e293b]">{user?.displayName || user?.phoneNumber}</p>
            <p className="text-[10px] text-green-600 font-medium uppercase tracking-wider">Verified</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
