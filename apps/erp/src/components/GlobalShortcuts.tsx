'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function GlobalShortcuts() {
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl + N or Cmd + N -> Navigate to /products/new
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        router.push('/products/new');
      }

      // Ctrl + S or Cmd + S -> Navigate to /orders
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        router.push('/orders');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [router]);

  return null;
}
