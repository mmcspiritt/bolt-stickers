import { Analytics } from '@segment/analytics-next';

const ANONYMOUS_ID_KEY = 'sticker_app_anonymous_id';

// Get the stored anonymous ID
const getAnonymousId = () => {
  return localStorage.getItem(ANONYMOUS_ID_KEY);
};

export interface StickerDesignTrackingProps {
  width: number;
  height: number;
  shape: string;
  finish: 'matte' | 'glossy';
  quantity: number;
  price: number;
}

export interface UserIdentifyProps {
  userId?: string;
  traits?: {
    email?: string;
    name?: string;
    [key: string]: any;
  };
}

export const trackEvents = {
  DESIGN_CREATED: 'Design Created',
  DESIGN_EDITED: 'Design Edited',
  DESIGN_NAME_CHANGED: 'Design Name Changed',
  SHAPE_CHANGED: 'Shape Changed',
  SIZE_CHANGED: 'Size Changed',
  FINISH_CHANGED: 'Finish Changed',
  QUANTITY_CHANGED: 'Quantity Changed',
  CHECKOUT_STARTED: 'Checkout Started',
  CHECKOUT_COMPLETED: 'Checkout Completed',
  DESIGN_DOWNLOADED: 'Design Downloaded',
} as const;

interface BaseTrackingProps {
  width?: number;
  height?: number;
  shape?: string;
  finish?: string;
  quantity?: number;
  price?: number;
  [key: string]: any;
}

export const trackStickerDesign = (
  analytics: Analytics | null,
  event: string,
  properties: BaseTrackingProps
) => {
  if (!analytics) return;

  const anonymousId = getAnonymousId();
  if (!anonymousId) {
    console.warn('No anonymous ID found for analytics tracking');
    return;
  }

  const baseProperties = {
    timestamp: new Date().toISOString(),
    anonymousId,
    ...properties
  };

  analytics.track(event, baseProperties);
};

export const identifyUser = (
  analytics: Analytics | null,
  { userId, traits }: UserIdentifyProps
) => {
  if (!analytics || !userId) return;

  analytics.identify(userId, {
    ...traits,
    updatedAt: new Date().toISOString(),
  });
};
