import { create } from 'zustand';
import axios from 'axios';

export interface Session {
  id: string;
  userAgent: string;
  browser: string;
  os: string;
  device: string;
  ip: string;
  createdAt: number;
  lastActiveAt: number;
  isCurrent: boolean;
}

interface User {
  userId: string;
  phoneNumber: string;
  displayName?: string;
  sessionId?: string;
  isAppLockEnabled?: boolean;
  pinLength?: number;
  autoLockTimeout?: number;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  initialized: boolean;
  isAppLocked: boolean;
  checkAuth: () => Promise<void>;
  login: (phoneNumber: string) => Promise<{ verificationId: string }>;
  verify: (verificationId: string, otp: string) => Promise<{ isNewUser: boolean }>;
  completeProfile: (displayName: string) => Promise<void>;
  logout: () => Promise<void>;
  getSessions: () => Promise<Session[]>;
  revokeSession: (sessionId: string) => Promise<void>;
  revokeOtherSessions: () => Promise<void>;
  setupAppLock: (pin: string, enabled?: boolean, autoLockTimeout?: number) => Promise<void>;
  updateAppLockSettings: (settings: { autoLockTimeout?: number }) => Promise<void>;
  toggleAppLock: (enabled: boolean) => Promise<void>;
  verifyAppLock: (pin: string) => Promise<boolean>;
  lockApp: () => void;
  unlockApp: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: true,
  initialized: false,
  isAppLocked: false,
  checkAuth: async () => {
    try {
      const res = await axios.get('/api/auth/me');
      const user = res.data.user;
      set({ 
        user, 
        initialized: true,
        isAppLocked: !!user?.isAppLockEnabled
      });
    } catch {
      set({ user: null, initialized: true });
    } finally {
      set({ loading: false });
    }
  },
  login: async (phoneNumber) => {
    const res = await axios.post('/api/auth/send-otp', { phoneNumber });
    return res.data;
  },
  verify: async (verificationId, otp) => {
    const res = await axios.post('/api/auth/verify-otp', { verificationId, otp });
    set({ user: res.data.user });
    return { isNewUser: res.data.isNewUser };
  },
  completeProfile: async (displayName) => {
    const res = await axios.post('/api/auth/complete-profile', { displayName });
    set({ user: res.data.user });
  },
  logout: async () => {
    await axios.post('/api/auth/logout');
    set({ user: null });
  },
  getSessions: async () => {
    const res = await axios.get('/api/auth/sessions');
    return res.data;
  },
  revokeSession: async (sessionId) => {
    await axios.delete(`/api/auth/sessions/${sessionId}`);
  },
  revokeOtherSessions: async () => {
    await axios.delete('/api/auth/sessions/others');
  },
  setupAppLock: async (pin, enabled = true, autoLockTimeout = 300000) => {
    const res = await axios.post('/api/auth/app-lock/setup', { pin, enabled, autoLockTimeout });
    set({ user: { ...get().user!, ...res.data } });
  },
  updateAppLockSettings: async (settings) => {
    const res = await axios.post('/api/auth/app-lock/settings', settings);
    set({ user: { ...get().user!, ...res.data } });
  },
  toggleAppLock: async (enabled) => {
    const res = await axios.post('/api/auth/app-lock/toggle', { enabled });
    set({ user: { ...get().user!, isAppLockEnabled: res.data.isAppLockEnabled } });
  },
  verifyAppLock: async (pin) => {
    try {
      await axios.post('/api/auth/app-lock/verify', { pin });
      set({ isAppLocked: false });
      return true;
    } catch (err) {
      return false;
    }
  },
  lockApp: () => set({ isAppLocked: true }),
  unlockApp: () => set({ isAppLocked: false }),
}));
