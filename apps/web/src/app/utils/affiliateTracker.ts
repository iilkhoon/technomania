'use client';

export interface AffiliateLinkItem {
  id: string;
  partner_id: string;
  partner_code: string;
  partner_name: string;
  product_id?: string;
  product_name?: string;
  product_slug?: string;
  target_url: string;
  tracking_url: string;
  clicks: number;
  leads_count: number;
  created_at: string;
}

export function trackAffiliateClick(partnerCode: string, currentUrl?: string) {
  if (typeof window === 'undefined' || !partnerCode) return;

  const code = partnerCode.trim().toUpperCase();
  const url = currentUrl || window.location.href;

  try {
    // Session duplicate click prevention (don't increment multiple times on same page reload within 30s)
    const sessionKey = `aff_clicked_${code}_${url.split('?')[0]}`;
    const lastClickTime = sessionStorage.getItem(sessionKey);
    const now = Date.now();
    if (lastClickTime && now - parseInt(lastClickTime, 10) < 30000) {
      return;
    }
    sessionStorage.setItem(sessionKey, String(now));

    // Save active referral session code
    localStorage.setItem('technomania_active_ref', code);

    // Read links list
    const savedLinks = localStorage.getItem('technomania_affiliate_links');
    let links: AffiliateLinkItem[] = savedLinks ? JSON.parse(savedLinks) : [];

    if (!Array.isArray(links)) links = [];

    // Find link item matching this partner and target url
    const baseUrl = url.split('?')[0];
    let matchedLink = links.find(
      l => l.partner_code.toUpperCase() === code && (l.tracking_url.split('?')[0] === baseUrl || l.target_url === baseUrl)
    );

    if (matchedLink) {
      matchedLink.clicks = (matchedLink.clicks || 0) + 1;
    } else {
      // Create new link record for this partner click
      const newLink: AffiliateLinkItem = {
        id: 'link-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
        partner_id: 'part-' + code,
        partner_code: code,
        partner_name: code,
        target_url: baseUrl,
        tracking_url: url,
        clicks: 1,
        leads_count: 0,
        created_at: new Date().toISOString(),
      };
      links.unshift(newLink);
    }

    localStorage.setItem('technomania_affiliate_links', JSON.stringify(links));
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new Event('techno_affiliate_links_updated'));

    fetch('/api/catalog/affiliates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(links),
    }).catch(e => console.error('Failed to sync affiliate links with backend API:', e));
  } catch (e) {
    console.error('Error tracking affiliate click:', e);
  }
}
