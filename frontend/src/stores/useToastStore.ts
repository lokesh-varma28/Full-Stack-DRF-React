import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
}

interface ToastState {
  toasts: ToastMessage[];
  addToast: (message: string, type?: ToastType, title?: string) => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  addToast: (message, type = 'info', title) => {
    const id = Math.random().toString(36).substring(2, 9);
    set((state) => ({
      toasts: [...state.toasts, { id, message, type, title }],
    }));

    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, 4000);
  },
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },
}));

export const toast = {
  success: (msg: string, title?: string) => useToastStore.getState().addToast(msg, 'success', title),
  error: (msg: string, title?: string) => useToastStore.getState().addToast(msg, 'error', title),
  info: (msg: string, title?: string) => useToastStore.getState().addToast(msg, 'info', title),
  warning: (msg: string, title?: string) => useToastStore.getState().addToast(msg, 'warning', title),
};
