// FinSense — UI Store (Zustand) — global UI state
import { create } from 'zustand';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

interface UIState {
  // Toast notifications
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;

  // Bottom sheet
  bottomSheetOpen: boolean;
  bottomSheetContent: React.ReactNode | null;
  openBottomSheet: (content: React.ReactNode) => void;
  closeBottomSheet: () => void;

  // Loading states
  globalLoading: boolean;
  setGlobalLoading: (loading: boolean) => void;

  // PWA install
  deferredPrompt: unknown;
  setDeferredPrompt: (prompt: unknown) => void;
  isPWAInstalled: boolean;
  setIsPWAInstalled: (installed: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  toasts: [],
  addToast: (toast) =>
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id: `toast_${Date.now()}` }],
    })),
  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),

  bottomSheetOpen: false,
  bottomSheetContent: null,
  openBottomSheet: (content) => set({ bottomSheetOpen: true, bottomSheetContent: content }),
  closeBottomSheet: () => set({ bottomSheetOpen: false, bottomSheetContent: null }),

  globalLoading: false,
  setGlobalLoading: (globalLoading) => set({ globalLoading }),

  deferredPrompt: null,
  setDeferredPrompt: (deferredPrompt) => set({ deferredPrompt }),
  isPWAInstalled: false,
  setIsPWAInstalled: (isPWAInstalled) => set({ isPWAInstalled }),
}));
