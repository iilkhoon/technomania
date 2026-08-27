import React from "react";
import type { Metadata } from "next";
import Script from "next/script";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

import { fetchSiteSettingsServer } from "./data/products";
import DynamicFaviconManager from "./components/DynamicFaviconManager";
import LoadingScreen from "./components/LoadingScreen";
import BottomMobileNav from "./components/BottomMobileNav";
import ToastNotifier from "./components/ToastNotifier";
import CartDrawer from "./components/CartDrawer";
import StoresModal from "./components/StoresModal";
import AuthModal from "./components/AuthModal";
import { Providers } from "./providers";

export async function generateMetadata(): Promise<Metadata> {

  const settings = await fetchSiteSettingsServer();
  const title = settings?.tabTitle || "TechnoMania — Elektronika Mağazası";
  const desc = settings?.metaDesc || "Azərbaycanın ən böyük elektronika mağazası. Smartfonlar, noutbuklar, televizorlar və daha çox.";

  return {
    metadataBase: new URL("https://technomania.az"),
    title: {
      default: title,
      template: `%s | ${title}`,
    },
    description: desc,
    icons: {
      icon: '/api/favicon',
      shortcut: '/api/favicon',
      apple: '/api/favicon',
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const serverSettings = await fetchSiteSettingsServer();
  const initialSettingsJson = JSON.stringify(serverSettings || {});

  return (
    <html
      lang="az"
      className={`${plusJakarta.variable} ${inter.variable} ${plusJakarta.className} font-sans antialiased`}
      suppressHydrationWarning
    >
      <head>
        <link rel="preload" as="image" href="/logo.webp" fetchPriority="high" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var serverData = ${initialSettingsJson};
                  var settings = serverData && Object.keys(serverData).length > 0 ? serverData : null;
                  if (!settings) {
                    var saved = localStorage.getItem('technomania_site_settings');
                    if (saved) settings = JSON.parse(saved);
                  }
                  if (settings) {
                    window.__SERVER_SITE_SETTINGS__ = settings;
                    var logo = settings.logoUrl || settings.erpLogoUrl;
                    if (logo) {
                      window.__CACHED_LOGO_URL__ = logo;
                      try { var img = new Image(); img.src = logo; } catch(e) {}
                    }
                    var fav = settings.faviconUrl || logo;
                    if (fav) {
                      var l = document.querySelector("link[rel*='icon']");
                      if (!l) {
                        l = document.createElement('link');
                        l.rel = 'icon';
                        document.head.appendChild(l);
                      }
                      l.href = fav;
                      var a = document.querySelector("link[rel='apple-touch-icon']");
                      if (!a) {
                        a = document.createElement('link');
                        a.rel = 'apple-touch-icon';
                        document.head.appendChild(a);
                      }
                      a.href = fav;
                    }
                    if (settings.tabTitle) {
                      document.title = settings.tabSlogan ? settings.tabTitle + ' | ' + settings.tabSlogan : settings.tabTitle;
                    }
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
        {/* Google Tag Manager */}
        <Script
          id="gtm-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','GTM-NWLRRP7T');
            `,
          }}
        />
        {/* Meta Pixel Code */}
        <Script
          id="fb-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '1315440073778157');
              fbq('track', 'PageView');
            `,
          }}
        />
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=1315440073778157&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
      </head>
      <body className="min-h-screen flex flex-col bg-[#f4f5f8] pb-16 md:pb-0" suppressHydrationWarning>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-NWLRRP7T"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        <Providers>
          <React.Suspense fallback={null}>
            <LoadingScreen />
          </React.Suspense>
          <DynamicFaviconManager />
          <ToastNotifier />
          <CartDrawer />
          <StoresModal />
          <AuthModal />
          {children}
          <BottomMobileNav />
        </Providers>
      </body>
    </html>
  );
}

