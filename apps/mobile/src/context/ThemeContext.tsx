import React, { createContext, useContext } from 'react';

export interface ThemeColors {
  background: string;
  card: string;
  surface: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  primary: string;
  primaryHover: string;
  primaryLight: string;
  accent: string;
  badgeBg: string;
  badgeText: string;
  creditBadgeBg: string;
  creditBadgeText: string;
  discountBadge: string;
  success: string;
  warning: string;
  danger: string;
}

export const lightColors: ThemeColors = {
  background: '#f8fafc',
  card: '#ffffff',
  surface: '#f1f5f9',
  text: '#0f172a',
  textSecondary: '#475569',
  textMuted: '#94a3b8',
  border: '#e2e8f0',
  primary: '#4f533b',
  primaryHover: '#3e4230',
  primaryLight: '#eaecdb',
  accent: '#4f533b',
  badgeBg: '#eaecdb',
  badgeText: '#4f533b',
  creditBadgeBg: '#fef3c7',
  creditBadgeText: '#b45309',
  discountBadge: '#ef4444',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
};

export const fontFamilies = {
  regular: 'PlusJakartaSans_400Regular',
  semiBold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
  extraBold: 'PlusJakartaSans_800ExtraBold',
};

interface ThemeContextType {
  colors: ThemeColors;
  fonts: typeof fontFamilies;
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  colors: lightColors,
  fonts: fontFamilies,
  isDark: false,
  toggleTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ThemeContext.Provider
      value={{
        colors: lightColors,
        fonts: fontFamilies,
        isDark: false,
        toggleTheme: () => {},
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
