import { onCLS, onINP, onLCP, type Metric } from 'web-vitals';

interface RUMPayload {
  name: string;
  value: number;
  rating: string;
  delta: number;
  id: string;
  navigationType: string;
  url: string;
  timestamp: number;
}

/**
 * Send Web Vitals metrics to backend /api/rum endpoint
 */
async function sendToBackend(metric: Metric) {
  const payload: RUMPayload = {
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    delta: metric.delta,
    id: metric.id,
    navigationType: metric.navigationType,
    url: window.location.href,
    timestamp: Date.now(),
  };

  try {
    await fetch('/api/rum', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true, // Ensure request completes even if page unloads
    });
  } catch (error) {
    // Silently fail - don't disrupt user experience
    console.debug('[RUM] Failed to send metric:', error);
  }
}

/**
 * Send Web Vitals metrics to PostHog (if configured)
 */
function sendToPostHog(metric: Metric) {
  if (typeof window === 'undefined') return;
  
  // Check if PostHog is available
  const posthog = (window as any).posthog;
  if (!posthog) return;

  posthog.capture('web_vital', {
    metric_name: metric.name,
    value: metric.value,
    rating: metric.rating,
    delta: metric.delta,
    id: metric.id,
    navigation_type: metric.navigationType,
    url: window.location.href,
  });
}

/**
 * Handle metric collection and dispatch
 */
function handleMetric(metric: Metric) {
  // Send to backend
  sendToBackend(metric);
  
  // Send to PostHog if available
  sendToPostHog(metric);
  
  // Log in development
  if (import.meta.env.DEV) {
    console.log(`[RUM] ${metric.name}:`, {
      value: metric.value,
      rating: metric.rating,
      delta: metric.delta,
    });
  }
}

/**
 * Initialize Web Vitals monitoring
 * Captures LCP (Largest Contentful Paint), CLS (Cumulative Layout Shift), and INP (Interaction to Next Paint)
 */
export function initWebVitals() {
  // Check if RUM is enabled via feature flag
  const rumEnabled = import.meta.env.VITE_RUM_ENABLED === '1' || 
                     import.meta.env.VITE_RUM_ENABLED === 'true';
  
  if (!rumEnabled) {
    console.debug('[RUM] Web Vitals monitoring disabled');
    return;
  }

  console.debug('[RUM] Web Vitals monitoring enabled');

  // Monitor Core Web Vitals
  onLCP(handleMetric);
  onCLS(handleMetric);
  onINP(handleMetric);
}

