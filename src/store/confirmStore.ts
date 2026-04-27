import { create } from 'zustand';

interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  type?: 'danger' | 'info';
  onConfirm: () => void;
}

interface ConfirmStore {
  config: ConfirmOptions | null;
  confirm: (options: ConfirmOptions) => void;
  close: () => void;
}

export const useConfirmStore = create<ConfirmStore>((set) => ({
  config: null,
  confirm: (options) => set({ config: options }),
  close: () => set({ config: null }),
}));
