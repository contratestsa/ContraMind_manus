/**
 * Sentry Error Monitoring Integration
 * https://docs.sentry.io/platforms/javascript/guides/react/
 */

import * as Sentry from '@sentry/react';

const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN || '';
const ENVIRONMENT = import.meta.env.MODE || 'development';

let initialized = false;

export function initSentry() {
  if (initialized || !SENTRY_DSN) {
    return;
  }

  try {
    Sentry.init({
      dsn: SENTRY_DSN,
      environment: ENVIRONMENT,
      integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration({
          maskAllText: true,
          blockAllMedia: true,
        }),
      ],
      // Performance Monitoring
      tracesSampleRate: ENVIRONMENT === 'production' ? 0.1 : 1.0,
      // Session Replay
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
      // Don't capture errors in development
      enabled: ENVIRONMENT === 'production',
      beforeSend(event, hint) {
        // Filter out certain errors
        if (event.exception) {
          const error = hint.originalException;
          if (error && typeof error === 'object' && 'message' in error) {
            const message = String(error.message);
            // Ignore network errors
            if (message.includes('NetworkError') || message.includes('Failed to fetch')) {
              return null;
            }
          }
        }
        return event;
      },
    });

    initialized = true;
  } catch (error) {
    console.error('Failed to initialize Sentry:', error);
  }
}

export function setUser(userId: number, email?: string, name?: string) {
  if (!initialized) return;

  try {
    Sentry.setUser({
      id: userId.toString(),
      email,
      username: name,
    });
  } catch (error) {
    console.error('Failed to set Sentry user:', error);
  }
}

export function clearUser() {
  if (!initialized) return;

  try {
    Sentry.setUser(null);
  } catch (error) {
    console.error('Failed to clear Sentry user:', error);
  }
}

export function captureError(error: Error, context?: Record<string, any>) {
  if (!initialized) {
    console.error('Sentry not initialized, logging error:', error);
    return;
  }

  try {
    Sentry.captureException(error, {
      extra: context,
    });
  } catch (err) {
    console.error('Failed to capture error in Sentry:', err);
  }
}

export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
  if (!initialized) return;

  try {
    Sentry.captureMessage(message, level);
  } catch (error) {
    console.error('Failed to capture message in Sentry:', error);
  }
}

export function addBreadcrumb(message: string, category?: string, data?: Record<string, any>) {
  if (!initialized) return;

  try {
    Sentry.addBreadcrumb({
      message,
      category,
      data,
      level: 'info',
    });
  } catch (error) {
    console.error('Failed to add breadcrumb:', error);
  }
}

export { Sentry };

