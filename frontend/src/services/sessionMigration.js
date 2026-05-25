import { API_BASE_URL } from './apiConfig';

const LAST_SESSION_KEY = 'visaCoach:lastSession';
const MIGRATED_SESSION_IDS_KEY = 'visaCoach:migratedSessionIds';
const MIGRATION_STATUS_KEY = 'visaCoach:lastSessionMigrationStatus';

const readJson = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
  } catch (error) {
    console.error(`Unable to read ${key}:`, error);
    return fallback;
  }
};

const writeJson = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

export const getLocalSession = () => readJson(LAST_SESSION_KEY, null);

export const getSessionMigrationId = (session) => {
  if (!session) return '';

  if (session.sessionId) {
    return session.sessionId;
  }

  const questionCount = Array.isArray(session.interviewHistory)
    ? session.interviewHistory.length
    : 0;

  return [
    session.savedAt || 'unsaved',
    session.country || 'unknown-country',
    session.visaType || 'unknown-visa',
    questionCount,
  ].join('|');
};

const getMigratedSessionIds = () => readJson(MIGRATED_SESSION_IDS_KEY, []);

export const markLocalSessionMigrated = (session, result = {}) => {
  const migrationId = getSessionMigrationId(session);
  if (!migrationId) return;

  const nextIds = [...new Set([...getMigratedSessionIds(), migrationId])].slice(-50);
  const migratedAt = new Date().toISOString();
  writeJson(MIGRATED_SESSION_IDS_KEY, nextIds);
  writeJson(MIGRATION_STATUS_KEY, {
    status: result.status || 'migrated',
    sessionId: migrationId,
    migratedAt,
  });

  writeJson(LAST_SESSION_KEY, {
    ...session,
    sessionId: migrationId,
    migratedAt,
  });
};

export const migrateLocalSessionToAccount = async (token) => {
  const session = getLocalSession();

  if (!token || !session?.interviewHistory?.length) {
    return { status: 'skipped', reason: 'no-local-session' };
  }

  const sessionId = getSessionMigrationId(session);

  if (getMigratedSessionIds().includes(sessionId) || session.migratedAt) {
    return { status: 'skipped', reason: 'already-migrated', sessionId };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/interview/save-history`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        ...session,
        sessionId,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Session migration failed');
    }

    const data = await response.json();
    markLocalSessionMigrated({ ...session, sessionId }, { status: 'migrated' });
    return { status: 'migrated', sessionId, data };
  } catch (error) {
    console.error('Unable to migrate local session:', error);
    writeJson(MIGRATION_STATUS_KEY, {
      status: 'failed',
      sessionId,
      error: error.message,
      attemptedAt: new Date().toISOString(),
    });
    return { status: 'failed', sessionId, error: error.message };
  }
};
