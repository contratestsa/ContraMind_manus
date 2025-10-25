/**
 * PostHog Analytics Integration
 * https://posthog.com/docs/libraries/react
 */

import posthog from 'posthog-js';

const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY || '';
const POSTHOG_HOST = import.meta.env.VITE_POSTHOG_HOST || 'https://app.posthog.com';

let initialized = false;

export function initAnalytics() {
  if (initialized || !POSTHOG_KEY) {
    return;
  }

  try {
    posthog.init(POSTHOG_KEY, {
      api_host: POSTHOG_HOST,
      autocapture: true,
      capture_pageview: true,
      capture_pageleave: true,
      persistence: 'localStorage',
      loaded: (posthog) => {
        if (import.meta.env.DEV) {
          posthog.opt_out_capturing();
        }
      },
    });
    initialized = true;
  } catch (error) {
    console.error('Failed to initialize PostHog:', error);
  }
}

export function identifyUser(userId: number, properties?: Record<string, any>) {
  if (!initialized) return;
  
  try {
    posthog.identify(userId.toString(), properties);
  } catch (error) {
    console.error('Failed to identify user:', error);
  }
}

export function trackEvent(eventName: string, properties?: Record<string, any>) {
  if (!initialized) return;
  
  try {
    posthog.capture(eventName, properties);
  } catch (error) {
    console.error('Failed to track event:', error);
  }
}

export function trackPageView(path: string) {
  if (!initialized) return;
  
  try {
    posthog.capture('$pageview', { path });
  } catch (error) {
    console.error('Failed to track page view:', error);
  }
}

export function resetAnalytics() {
  if (!initialized) return;
  
  try {
    posthog.reset();
  } catch (error) {
    console.error('Failed to reset analytics:', error);
  }
}

// Event tracking helpers
export const analytics = {
  // Contract events
  contractUploaded: (contractId: number, fileSize: number, mimeType: string) => {
    trackEvent('contract_uploaded', { contractId, fileSize, mimeType });
  },
  contractAnalyzed: (contractId: number, riskScore: string, duration: number) => {
    trackEvent('contract_analyzed', { contractId, riskScore, duration });
  },
  contractDeleted: (contractId: number) => {
    trackEvent('contract_deleted', { contractId });
  },

  // AI events
  aiMessageSent: (contractId: number, messageLength: number) => {
    trackEvent('ai_message_sent', { contractId, messageLength });
  },
  aiFeedbackSubmitted: (messageId: number, rating: string) => {
    trackEvent('ai_feedback_submitted', { messageId, rating });
  },

  // Subscription events
  subscriptionUpgraded: (tier: string, billingCycle: string) => {
    trackEvent('subscription_upgraded', { tier, billingCycle });
  },
  subscriptionCancelled: (tier: string) => {
    trackEvent('subscription_cancelled', { tier });
  },

  // Support events
  supportTicketCreated: (ticketId: number, subject: string) => {
    trackEvent('support_ticket_created', { ticketId, subject });
  },

  // User events
  userSignedIn: () => {
    trackEvent('user_signed_in');
  },
  userSignedOut: () => {
    trackEvent('user_signed_out');
  },
  profileUpdated: (fields: string[]) => {
    trackEvent('profile_updated', { fields });
  },
};

