'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function Analytics() {
  const pathname = usePathname();
  
  useEffect(() => {
    // Get or create visitor ID
    let visitorId = localStorage.getItem('pps_visitor');
    if (!visitorId) {
      visitorId = crypto.randomUUID();
      localStorage.setItem('pps_visitor', visitorId);
    }
    
    // Track page view
    const trackPageView = async () => {
      try {
        await fetch('/api/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            path: pathname,
            referrer: document.referrer || null,
            visitorId,
          }),
        });
      } catch (e) {
        // Silently fail - don't break user experience
        console.debug('Analytics tracking failed:', e);
      }
    };
    
    // Don't track admin pages
    if (!pathname.startsWith('/admin')) {
      trackPageView();
    }
  }, [pathname]);
  
  return null;
}
