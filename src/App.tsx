import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Login from './pages/Login';
import VerifyOtp from './pages/VerifyOtp';
import Dashboard from './pages/Dashboard';
import AddAccount from './pages/AddAccount';
import QRImport from './pages/QRImport';
import Backup from './pages/Backup';
import Settings from './pages/Settings';
import CompleteProfile from './pages/CompleteProfile';
import Sidebar from './components/Sidebar';
import MobileNav from './components/MobileNav';
import ToastContainer from './components/ToastContainer';
import ConfirmModal from './components/ConfirmModal';
import LockScreen from './components/LockScreen';
import LoadingScreen from './components/LoadingScreen';
import { PWAPrompt } from './components/PWAPrompt';
import { motion, AnimatePresence } from 'motion/react';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, initialized, isAppLocked, lockApp, unlockApp } = useAuthStore();
  const location = useLocation();
  
  useEffect(() => {
    if (!user?.isAppLockEnabled) return;

    let timeout: NodeJS.Timeout;
    const INACTIVITY_LIMIT = user?.autoLockTimeout ?? 300000;
    
    if (INACTIVITY_LIMIT === -1) return; // Never lock

    const resetTimer = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        lockApp();
      }, INACTIVITY_LIMIT);
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(e => document.addEventListener(e, resetTimer));

    resetTimer();

    return () => {
      events.forEach(e => document.removeEventListener(e, resetTimer));
      clearTimeout(timeout);
    };
  }, [user?.isAppLockEnabled, lockApp]);

  if (!initialized || loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" />;
  
  // If user hasn't set a display name, force them to complete profile unless they are already on that page
  if (!user.displayName && location.pathname !== '/complete-profile') {
    return <Navigate to="/complete-profile" />;
  }

  if (isAppLocked) {
    return <LockScreen />;
  }
  
  return <>{children}</>;
}

function PageWrapper({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.2 }}
        className="flex-1 flex flex-col h-full overflow-hidden"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

import Landing from './pages/Landing';

export default function App() {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <BrowserRouter>
      <div className="bg-bg-main min-h-screen text-text-primary font-sans selection:bg-brand selection:text-white">
        <ToastContainer />
        <ConfirmModal />
        <PWAPrompt />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/verify-otp" element={<VerifyOtp />} />
          
          <Route path="/*" element={
            <PrivateRoute>
              <div className="flex h-screen overflow-hidden flex-col md:flex-row">
                <Sidebar />
                <main className="flex-1 flex flex-col min-w-0 bg-bg-main relative overflow-hidden h-full pb-24 md:pb-0">
                  <PageWrapper>
                    <Routes>
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/add" element={<AddAccount />} />
                      <Route path="/qr-import" element={<QRImport />} />
                      <Route path="/backup" element={<Backup />} />
                      <Route path="/settings" element={<Settings />} />
                      <Route path="/complete-profile" element={<CompleteProfile />} />
                      {/* Fallback for protected routes */}
                      <Route path="*" element={<Navigate to="/dashboard" />} />
                    </Routes>
                  </PageWrapper>
                </main>
                <MobileNav />
              </div>
            </PrivateRoute>
          } />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
