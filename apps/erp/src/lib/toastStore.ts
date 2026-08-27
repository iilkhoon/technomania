/**
 * Universal Toast Notification Store & Helpers
 */

export interface ToastItem {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export function showToast(message: string, type: 'success' | 'error' | 'info' = 'success') {
  if (typeof window === 'undefined') return;

  const event = new CustomEvent('techno_show_toast', {
    detail: {
      id: `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      message,
      type,
    },
  });

  window.dispatchEvent(event);
}
