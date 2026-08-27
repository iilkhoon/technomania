'use client';

import { useEffect } from 'react';

export default function DynamicFaviconManager() {
  useEffect(() => {
    const updateFaviconAndTitle = (settings: any) => {
      if (!settings || typeof settings !== 'object') return;

      const faviconUrl = settings.faviconUrl || settings.logoUrl || settings.erpLogoUrl;
      if (faviconUrl) {
        // Find existing icon link or create new
        let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
        if (!link) {
          link = document.createElement('link');
          link.rel = 'icon';
          document.head.appendChild(link);
        }
        link.href = faviconUrl;

        let appleLink: HTMLLinkElement | null = document.querySelector("link[rel='apple-touch-icon']");
        if (!appleLink) {
          appleLink = document.createElement('link');
          appleLink.rel = 'apple-touch-icon';
          document.head.appendChild(appleLink);
        }
        appleLink.href = faviconUrl;
      }

      if (settings.tabTitle) {
        document.title = settings.tabTitle;
      }
    };

    const fetchAndApplySettings = () => {
      // 1. Try local cache first for instant feedback
      try {
        const saved = localStorage.getItem('technomania_site_settings');
        if (saved) {
          const parsed = JSON.parse(saved);
          updateFaviconAndTitle(parsed);
        }
      } catch (e) {}

      // 2. Fetch live settings from server database so other computers update automatically!
      fetch('/api/catalog/settings', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      })
        .then(res => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.json();
        })
        .then(data => {
          if (data && typeof data === 'object' && !Array.isArray(data) && !data.statusCode) {
            updateFaviconAndTitle(data);
            try {
              localStorage.setItem('technomania_site_settings', JSON.stringify(data));
            } catch (e) {}
          }
        })
        .catch(() => {});
    };

    fetchAndApplySettings();

    window.addEventListener('techno_settings_updated', fetchAndApplySettings);
    window.addEventListener('storage', fetchAndApplySettings);

    return () => {
      window.removeEventListener('techno_settings_updated', fetchAndApplySettings);
      window.removeEventListener('storage', fetchAndApplySettings);
    };
  }, []);

  return null;
}
