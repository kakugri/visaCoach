const ALLOWED_PROPERTY_KEYS = new Set([
  'answerLength',
  'confidence',
  'concerns',
  'country',
  'feedbackLevel',
  'feedbackStyle',
  'source',
  'model',
  'questionSource',
  'questionsAnswered',
  'readinessScore',
  'restarted',
  'visaType',
]);

const runtimeAnalytics = {
  totalEvents: 0,
  eventsByName: {},
  lastEventAt: null,
};

const normalizeEventName = (eventName) => (
  typeof eventName === 'string' && /^[a-z][a-z0-9_:-]{1,80}$/i.test(eventName.trim())
    ? eventName.trim()
    : 'unknown_event'
);

const sanitizeValue = (value) => {
  if (typeof value === 'string') return value.trim().slice(0, 120);
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'boolean') return value;

  if (Array.isArray(value)) {
    return value
      .filter((item) => ['string', 'number', 'boolean'].includes(typeof item))
      .map(sanitizeValue)
      .slice(0, 8);
  }

  return undefined;
};

const sanitizeProperties = (properties = {}) => Object.entries(properties)
  .filter(([key]) => ALLOWED_PROPERTY_KEYS.has(key))
  .reduce((cleaned, [key, value]) => {
    const sanitized = sanitizeValue(value);
    if (sanitized !== undefined) {
      cleaned[key] = sanitized;
    }
    return cleaned;
  }, {});

const parseEventBody = (body) => {
  if (typeof body !== 'string') return body || {};

  try {
    return JSON.parse(body);
  } catch (error) {
    return {};
  }
};

const recordProductEvent = ({ eventName, properties = {}, timestamp = new Date().toISOString() }) => {
  const cleanEventName = normalizeEventName(eventName);
  const event = {
    eventName: cleanEventName,
    properties: sanitizeProperties(properties),
    timestamp,
  };

  runtimeAnalytics.totalEvents += 1;
  runtimeAnalytics.eventsByName[cleanEventName] = (runtimeAnalytics.eventsByName[cleanEventName] || 0) + 1;
  runtimeAnalytics.lastEventAt = timestamp;

  return event;
};

const getProductAnalyticsStatus = () => ({
  totalEvents: runtimeAnalytics.totalEvents,
  eventsByName: { ...runtimeAnalytics.eventsByName },
  lastEventAt: runtimeAnalytics.lastEventAt,
});

module.exports = {
  getProductAnalyticsStatus,
  normalizeEventName,
  parseEventBody,
  recordProductEvent,
  sanitizeProperties,
};
