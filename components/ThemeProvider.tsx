'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { preferences } = useAuthStore();
  const { financialHealth } = useUIStore();

  useEffect(() => {
    const root = document.documentElement;
    if (preferences.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Only allow brand-safe, pre-approved theme colors.
    // Any arbitrary color stored in DB (e.g. neon green) is ignored.
    const ALLOWED_THEME_COLORS = new Set([
      '#0A1128', // Azul (default)
      '#0C2340', // Océano
      '#4C1D95', // Morado
      '#831843', // Carmín
      '#1E293B', // Carbón
      '#EC4899', // Tema Cyber-Pink (Tienda)
      '#EAB308', // Tema Oro Imperial (Tienda)
    ]);

    const safeColor = preferences.themeColor && ALLOWED_THEME_COLORS.has(preferences.themeColor)
      ? preferences.themeColor
      : null;

    if (safeColor) {
      root.style.setProperty('--color-primary', safeColor);
      const hex = safeColor.replace('#', '');
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      root.style.setProperty('--color-border', `rgba(${r}, ${g}, ${b}, ${preferences.theme === 'dark' ? '0.25' : '0.12'})`);
    } else {
      // Default FinSense Blue
      root.style.setProperty('--color-primary', '#0057FF');
      root.style.setProperty('--color-border', `rgba(0, 87, 255, ${preferences.theme === 'dark' ? '0.25' : '0.12'})`);
    }
  }, [preferences.theme, preferences.themeColor]);

  useEffect(() => {
    // Apply financial health theme to body
    document.body.classList.remove('theme-good', 'theme-warning', 'theme-critical');
    document.body.classList.add(`theme-${financialHealth}`);
  }, [financialHealth]);

  return <>{children}</>;
}
