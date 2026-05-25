import { API_BASE_URL } from './apiConfig';

const STORAGE_KEY = 'visaCoach:analyticsEvents';
const MAX_EVENTS = 100;

const sendRemoteEvent = (event) => {
  const body = JSON.stringify(event);
  const url = `${API_BASE_URL}/api/analytics/event`;

  try {
    if (navigator.sendBeacon) {
      const blob = new Blob([body], { type: 'text/plain' });
      if (navigator.sendBeacon(url, blob)) {
        return;
      }
    }
  } catch (error) {
    // Fall through to fetch; analytics should never interrupt the product flow.
  }

  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
    keepalive: true,
  }).catch(() => {});
};

export const trackEvent = (eventName, properties = {}) => {
  const event = {
    eventName,
    properties,
    timestamp: new Date().toISOString(),
  };

  try {
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const nextEvents = [...existing, event].slice(-MAX_EVENTS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextEvents));
  } catch (error) {
    console.error('Unable to record analytics event:', error);
  }

  sendRemoteEvent(event);
  return event;
};

export const getStoredEvents = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch (error) {
    console.error('Unable to read analytics events:', error);
    return [];
  }
};
