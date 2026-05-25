const STORAGE_KEY = 'visaCoach:analyticsEvents';
const MAX_EVENTS = 100;

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
