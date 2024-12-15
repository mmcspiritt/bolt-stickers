import React, { createContext, useContext, useEffect } from 'react';
import { Analytics, AnalyticsBrowser } from '@segment/analytics-next';
import { useLocation } from 'react-router-dom';

interface AnalyticsContextType {
  analytics: Analytics | null;
}

const AnalyticsContext = createContext<AnalyticsContextType>({ analytics: null });

export const useAnalytics = () => useContext(AnalyticsContext);

interface AnalyticsProviderProps {
  children: React.ReactNode;
  writeKey: string;
}

const ANONYMOUS_ID_KEY = 'sticker_app_anonymous_id';

export function AnalyticsProvider({ children, writeKey }: AnalyticsProviderProps) {
  const [analytics, setAnalytics] = React.useState<Analytics | null>(null);
  const location = useLocation();

  // Get or create anonymous ID
  const getAnonymousId = () => {
    let anonymousId = localStorage.getItem(ANONYMOUS_ID_KEY);
    if (!anonymousId) {
      anonymousId = crypto.randomUUID();
      localStorage.setItem(ANONYMOUS_ID_KEY, anonymousId);
    }
    return anonymousId;
  };

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        if (!writeKey) {
          console.error('Segment write key is missing');
          return;
        }

        const [response] = await AnalyticsBrowser.load({ writeKey });
        
        // Set anonymous ID before any other tracking
        const anonymousId = getAnonymousId();
        response.setAnonymousId(anonymousId);
        
        // Now identify the anonymous user
        response.identify({
          anonymousId,
          traits: {
            firstVisit: new Date().toISOString(),
            userAgent: navigator.userAgent,
            platform: navigator.platform
          }
        });

        setAnalytics(response);
        console.log('Segment Analytics initialized successfully with anonymousId:', anonymousId);
      } catch (error) {
        console.error('Failed to initialize Segment Analytics:', error);
      }
    };

    loadAnalytics();
  }, [writeKey]);

  // Track page views
  useEffect(() => {
    if (analytics) {
      analytics.page({
        path: location.pathname,
        url: window.location.href,
        title: document.title,
        anonymousId: getAnonymousId() // Ensure anonymousId is included in page views
      });
    }
  }, [location, analytics]);

  return (
    <AnalyticsContext.Provider value={{ analytics }}>
      {children}
    </AnalyticsContext.Provider>
  );
}
