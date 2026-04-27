import { create } from 'zustand';
import axios from 'axios';

export interface OracleMetadata {
  deviceId?: string;
  domainName?: string;
  tenantName?: string;
  cloudAccountName?: string;
  loginUrl?: string;
  otp?: string;
  rsa?: string;
  requestId?: string;
  keyPairLength?: string;
  serviceType?: string;
  sse?: string;
}

export interface TOTPAccount {
  id: string;
  issuer: string;
  label: string;
  secret: string;
  digits: number;
  period: number;
  algorithm: string;
  customName?: string;
  provider?: "totp" | "oracle_mobile_authenticator";
  rawQrData?: string;
  oracleMetadata?: OracleMetadata;
}

interface AccountState {
  accounts: TOTPAccount[];
  loading: boolean;
  fetchAccounts: () => Promise<void>;
  addAccount: (account: Omit<TOTPAccount, 'id'>) => Promise<void>;
  updateAccount: (id: string, data: Partial<TOTPAccount>) => Promise<void>;
  renameAccount: (id: string, customName: string) => Promise<void>;
  deleteAccount: (id: string) => Promise<void>;
}

export const useAccountStore = create<AccountState>((set, get) => ({
  accounts: [],
  loading: false,
  fetchAccounts: async () => {
    set({ loading: true });
    try {
      const res = await axios.get('/api/accounts');
      set({ accounts: res.data });
    } catch (err) {
      console.error(err);
    } finally {
      set({ loading: false });
    }
  },
  addAccount: async (account) => {
    await axios.post('/api/accounts', account);
    get().fetchAccounts();
  },
  updateAccount: async (id, data) => {
    await axios.put(`/api/accounts/${id}`, data);
    get().fetchAccounts();
  },
  renameAccount: async (id, customName) => {
    await axios.patch(`/api/accounts/${id}/rename`, { customName });
    get().fetchAccounts();
  },
  deleteAccount: async (id) => {
    await axios.delete(`/api/accounts/${id}`);
    set({ accounts: get().accounts.filter(a => a.id !== id) });
  },
}));
