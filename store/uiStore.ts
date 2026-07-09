// FinSense — UI Store (Zustand) — global UI state
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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

  deferredPrompt: unknown;
  setDeferredPrompt: (prompt: unknown) => void;
  isPWAInstalled: boolean;
  setPWAInstalled: (installed: boolean) => void;

  // Sidebar state
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;

  // Theme
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  setTheme: (theme: 'dark' | 'light') => void;

  // Floating widgets — mutually exclusive
  isChatOpen: boolean;
  isFABOpen: boolean;
  toggleChat: () => void;
  toggleFAB: () => void;
  closeChat: () => void;
  closeFAB: () => void;
  // Tour state
  hasSeenTour: boolean;
  setHasSeenTour: (seen: boolean) => void;
  tourStepIndex: number;
  setTourStepIndex: (index: number) => void;
  // Financial health theme
  financialHealth: 'good' | 'warning' | 'critical';
  setFinancialHealth: (health: 'good' | 'warning' | 'critical') => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
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
      setPWAInstalled: (isPWAInstalled) => set({ isPWAInstalled }),

      isSidebarCollapsed: false,
      toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),

      isChatOpen: false,
      isFABOpen: false,
      toggleChat: () => set((state) => ({
        isChatOpen: !state.isChatOpen,
        isFABOpen: false, // close FAB when opening chat
      })),
      toggleFAB: () => set((state) => ({
        isFABOpen: !state.isFABOpen,
        isChatOpen: false, // close chat when opening FAB
      })),
      closeChat: () => set({ isChatOpen: false }),
      closeFAB: () => set({ isFABOpen: false }),

      theme: 'dark',
      toggleTheme: () => set((state) => {
        const newTheme = state.theme === 'dark' ? 'light' : 'dark';
        if (typeof document !== 'undefined') {
          if (newTheme === 'dark') document.documentElement.classList.add('dark');
          else document.documentElement.classList.remove('dark');
        }
        return { theme: newTheme };
      }),
      setTheme: (theme) => {
        if (typeof document !== 'undefined') {
          if (theme === 'dark') document.documentElement.classList.add('dark');
          else document.documentElement.classList.remove('dark');
        }
        set({ theme });
      },

      hasSeenTour: false,
      setHasSeenTour: (hasSeenTour) => set({ hasSeenTour }),
      tourStepIndex: 0,
      setTourStepIndex: (tourStepIndex) => set({ tourStepIndex }),

      financialHealth: 'good',
      setFinancialHealth: (financialHealth) => set({ financialHealth }),
    }),
    {
      name: 'finsense-ui',
      partialize: (state) => ({ 
        theme: state.theme, 
        isSidebarCollapsed: state.isSidebarCollapsed,
        hasSeenTour: state.hasSeenTour
      }),
    }
  )
);
