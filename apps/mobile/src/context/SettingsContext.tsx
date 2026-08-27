import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchSettings, API_BASE } from '../api/client';

export interface SiteSettings {
  logoUrl?: string;
  erpLogoUrl?: string;
  tabTitle?: string;
  tabSlogan?: string;
  primaryColor?: string;
  socialPhone?: string;
  socialWhatsapp?: string;
  socialInstagram?: string;
  [key: string]: any;
}

interface SettingsContextType {
  settings: SiteSettings | null;
  logoUrl: string | null;
  logos: string[];
  isLoading: boolean;
  refreshSettings: () => Promise<void>;
}

const SETTINGS_STORAGE_KEY = '@technomania_site_settings';

const SettingsContext = createContext<SettingsContextType>({
  settings: null,
  logoUrl: null,
  logos: [],
  isLoading: true,
  refreshSettings: async () => {},
});

export const useSettings = () => useContext(SettingsContext);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const resolveLogoUrl = (data: SiteSettings | null): string | null => {
    if (!data) return null;
    const url = data.logoUrl || data.erpLogoUrl;
    if (!url) return null;
    if (url.startsWith('data:image') || url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    if (url.startsWith('/')) {
      return `${API_BASE.replace('/api', '')}${url}`;
    }
    return url;
  };

  const resolveLogos = (data: SiteSettings | null): string[] => {
    if (!data) return [];
    if (Array.isArray(data.logos) && data.logos.length > 0) {
      return data.logos.filter(Boolean);
    }
    const list = [data.logoUrl, data.logoUrl2, data.logoUrl3].filter(Boolean) as string[];
    if (list.length > 0) return list;
    if (data.erpLogoUrl) return [data.erpLogoUrl];
    return [];
  };

  const loadCached = async () => {
    try {
      const cached = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        setSettings(parsed);
      }
    } catch (e) {
      console.warn('Error loading cached settings:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshSettings = async () => {
    try {
      const data = await fetchSettings();
      if (data && typeof data === 'object') {
        setSettings(data);
        await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(data));
      }
    } catch (e) {
      console.warn('Error refreshing settings:', e);
    }
  };

  useEffect(() => {
    loadCached().then(() => {
      refreshSettings();
    });
  }, []);

  const logoUrl = resolveLogoUrl(settings);
  const logos = resolveLogos(settings);

  return (
    <SettingsContext.Provider
      value={{
        settings,
        logoUrl,
        logos,
        isLoading,
        refreshSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}
