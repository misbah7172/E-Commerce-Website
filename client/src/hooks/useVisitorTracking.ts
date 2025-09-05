import { useEffect } from 'react';

// Generate a comprehensive browser fingerprint
function generateBrowserFingerprint(): {
  fingerprint: string;
  browserInfo: object;
  screenResolution: string;
  timezone: string;
  language: string;
} {
  // Collect browser information
  const browserInfo = {
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language,
    languages: navigator.languages,
    cookieEnabled: navigator.cookieEnabled,
    doNotTrack: navigator.doNotTrack,
    hardwareConcurrency: navigator.hardwareConcurrency,
    maxTouchPoints: navigator.maxTouchPoints,
    vendor: navigator.vendor,
  };

  const screenResolution = `${screen.width}x${screen.height}x${screen.colorDepth}`;
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const language = navigator.language;

  // Create canvas fingerprint
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillStyle = '#f60';
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = '#069';
    ctx.fillText('Browser fingerprint 🔒', 2, 2);
  }
  const canvasFingerprint = canvas.toDataURL();

  // Combine all fingerprint data
  const fingerprintData = [
    navigator.userAgent,
    navigator.platform,
    navigator.language,
    screenResolution,
    timezone,
    screen.pixelDepth,
    new Date().getTimezoneOffset(),
    navigator.hardwareConcurrency || 'unknown',
    navigator.maxTouchPoints || 0,
    navigator.vendor,
    canvasFingerprint.substring(0, 100), // Truncate canvas data
  ].join('|');

  // Create a hash from the fingerprint data
  let hash = 0;
  for (let i = 0; i < fingerprintData.length; i++) {
    const char = fingerprintData.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  const fingerprint = 'bf_' + Math.abs(hash).toString(36) + '_' + Date.now().toString(36);

  return {
    fingerprint,
    browserInfo,
    screenResolution,
    timezone,
    language,
  };
}

// Check if this is a unique visitor based on browser fingerprint
function isUniqueVisitor(): { isUnique: boolean; fingerprintData: any } {
  const storageKey = 'shophub_browser_fingerprint';
  const visitCountKey = 'shophub_visit_count';
  const firstVisitKey = 'shophub_first_visit';
  
  const existingFingerprint = localStorage.getItem(storageKey);
  const fingerprintData = generateBrowserFingerprint();
  
  if (!existingFingerprint) {
    // First time visitor - store fingerprint
    localStorage.setItem(storageKey, fingerprintData.fingerprint);
    localStorage.setItem(visitCountKey, '1');
    localStorage.setItem(firstVisitKey, new Date().toISOString());
    localStorage.setItem('shophub_last_visit', new Date().toISOString());
    
    return { isUnique: true, fingerprintData };
  } else {
    // Returning visitor - increment visit count
    const currentCount = parseInt(localStorage.getItem(visitCountKey) || '1');
    localStorage.setItem(visitCountKey, (currentCount + 1).toString());
    localStorage.setItem('shophub_last_visit', new Date().toISOString());
    
    // Use stored fingerprint for consistency
    fingerprintData.fingerprint = existingFingerprint;
    
    return { isUnique: false, fingerprintData };
  }
}

// Get visitor info from localStorage
function getVisitorInfo() {
  return {
    browserFingerprint: localStorage.getItem('shophub_browser_fingerprint'),
    visitCount: parseInt(localStorage.getItem('shophub_visit_count') || '0'),
    firstVisit: localStorage.getItem('shophub_first_visit'),
    lastVisit: localStorage.getItem('shophub_last_visit'),
  };
}

export function useVisitorTracking() {
  useEffect(() => {
    // Track visitor function
    const trackVisit = () => {
      try {
        const { isUnique, fingerprintData } = isUniqueVisitor();
        const visitorInfo = getVisitorInfo();
        
        console.log('🔍 Browser fingerprint tracking:', {
          isUnique,
          fingerprint: fingerprintData.fingerprint.substring(0, 20) + '...',
          visitCount: visitorInfo.visitCount,
        });
        
        // Send browser fingerprint data to backend for unique visitor tracking
        fetch('/api/analytics/browser-visit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            browserFingerprint: fingerprintData.fingerprint,
            isNewVisitor: isUnique,
            browserInfo: JSON.stringify(fingerprintData.browserInfo),
            screenResolution: fingerprintData.screenResolution,
            timezone: fingerprintData.timezone,
            language: fingerprintData.language,
            visitCount: visitorInfo.visitCount,
            timestamp: new Date().toISOString(),
          }),
        })
        .then(response => response.json())
        .then(data => {
          console.log('✅ Visitor tracking response:', data);
        })
        .catch(error => {
          console.log('❌ Browser fingerprint tracking error:', error.message);
        });
      } catch (error) {
        console.error('Error in visitor tracking:', error);
      }
    };

    // Wait a bit for the app to be fully loaded, then track
    const timer = setTimeout(() => {
      trackVisit();
    }, 1000);

    // Track page visibility changes (when user returns to tab)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        trackVisit();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      clearTimeout(timer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Return visitor info without using useQuery
  return {
    visitorInfo: typeof window !== 'undefined' ? getVisitorInfo() : null,
  };
}
