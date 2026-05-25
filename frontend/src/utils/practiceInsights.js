export const VISA_FACT_FIELDS = [
  {
    key: 'homeCountry',
    label: 'Home country or current residence',
    core: true,
    gap: 'Tie at least one answer back to your home country or current residence.',
    keywords: ['home', 'country', 'residence', 'return'],
  },
  {
    key: 'institutionOrHost',
    label: 'School, employer, host, or program',
    core: true,
    gap: 'Mention the school, host, employer, or program when explaining fit.',
    keywords: ['school', 'university', 'college', 'host', 'employer', 'program'],
  },
  {
    key: 'programOrPurpose',
    label: 'Program, role, or trip purpose',
    core: true,
    gap: 'Connect your answer to the stated program, role, or trip purpose.',
    keywords: ['program', 'study', 'course', 'degree', 'trip', 'purpose', 'role'],
  },
  {
    key: 'fundingSource',
    label: 'Funding source',
    core: true,
    gap: 'Clarify funding with facts that can match financial evidence.',
    keywords: ['fund', 'sponsor', 'scholarship', 'savings', 'bank', 'tuition', 'salary'],
  },
  {
    key: 'sponsorDetails',
    label: 'Sponsor or financial evidence',
    core: false,
    gap: 'If you have a sponsor, name the relationship or evidence consistently.',
    keywords: ['sponsor', 'parent', 'family', 'employer', 'bank', 'statement', 'evidence'],
  },
  {
    key: 'returnPlan',
    label: 'Return plan or home ties',
    core: true,
    gap: 'State the return plan or home ties that support your temporary intent.',
    keywords: ['return', 'home', 'family', 'job', 'employer', 'business', 'property', 'career'],
  },
  {
    key: 'importantDates',
    label: 'Important dates or timeline',
    core: false,
    gap: 'Keep your dates and timeline consistent with forms and admission/travel plans.',
    keywords: ['date', 'start', 'end', 'semester', 'month', 'year', 'weeks', 'days'],
  },
  {
    key: 'notes',
    label: 'Application notes',
    core: false,
    gap: 'Use your application notes to avoid vague or conflicting answers.',
    keywords: ['application', 'form', 'notes', 'ds-160', 'resume', 'sop'],
  },
];

export const countWords = (value = '') => (
  String(value).trim().split(/\s+/).filter(Boolean).length
);

export const getEffectiveAnswer = (item = {}) => (
  item.revisedResponse || item.revisedAnswer || item.answer || item.userResponse || ''
);

const getSignificantTokens = (value = '') => (
  String(value)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length >= 4)
    .slice(0, 8)
);

const textMentionsFact = (text, field, value) => {
  const lowerText = text.toLowerCase();
  const valueTokens = getSignificantTokens(value);

  if (valueTokens.some((token) => lowerText.includes(token))) {
    return true;
  }

  return field.keywords.some((keyword) => lowerText.includes(keyword));
};

export const buildRevisionComparison = (originalAnswer = '', revisedAnswer = '') => {
  const originalWordCount = countWords(originalAnswer);
  const revisedWordCount = countWords(revisedAnswer);
  const wordDelta = revisedWordCount - originalWordCount;
  const revisedLower = String(revisedAnswer).toLowerCase();
  const notes = [];

  if (wordDelta > 0) {
    notes.push(`Added ${wordDelta} word${wordDelta === 1 ? '' : 's'} of detail.`);
  } else if (wordDelta < 0) {
    notes.push(`Made the answer ${Math.abs(wordDelta)} word${Math.abs(wordDelta) === 1 ? '' : 's'} shorter.`);
  } else {
    notes.push('Kept the answer about the same length.');
  }

  if (/(because|so that|therefore|my goal|i plan|after|return)/i.test(revisedAnswer)) {
    notes.push('Added clearer reasoning or timeline language.');
  }

  if (/(sponsor|fund|scholarship|savings|bank|tuition|employer|family|home|return)/i.test(revisedAnswer)) {
    notes.push('Added a concrete visa-relevant fact.');
  }

  if (!/(specific|because|sponsor|fund|return|home|university|program|work|job|family|bank)/.test(revisedLower)) {
    notes.push('Still needs at least one concrete fact if this answer is used live.');
  }

  return {
    originalWordCount,
    revisedWordCount,
    wordDelta,
    notes,
  };
};

export const getRevisionCount = (questions = []) => (
  questions.filter((item) => item.revisedResponse || item.revisedAnswer).length
);

export const getPreparedFactFields = (sessionContext = {}) => (
  VISA_FACT_FIELDS.filter((field) => String(sessionContext[field.key] || '').trim())
);

export const getMissingCoreFactFields = (sessionContext = {}) => (
  VISA_FACT_FIELDS.filter((field) => field.core && !String(sessionContext[field.key] || '').trim())
);

export const getFactConsistencyInsights = ({ sessionContext = {}, conversationHistory = [] } = {}) => {
  const preparedFacts = getPreparedFactFields(sessionContext);
  const answerText = conversationHistory.map(getEffectiveAnswer).join(' ');
  const coveredFacts = [];
  const gaps = [];

  preparedFacts.forEach((field) => {
    const value = sessionContext[field.key];
    if (textMentionsFact(answerText, field, value)) {
      coveredFacts.push(field);
    } else {
      gaps.push(field);
    }
  });

  return {
    preparedFacts,
    coveredFacts,
    gaps,
    missingCoreFacts: getMissingCoreFactFields(sessionContext),
  };
};

const normalizeInsight = (value = '') => (
  String(value).trim().replace(/\s+/g, ' ')
);

export const getProgressInsights = (sessions = []) => {
  const scoredSessions = sessions.filter((session) => session.stats?.overallScore || session.score);
  const totalScore = scoredSessions.reduce((sum, session) => sum + (session.stats?.overallScore || session.score || 0), 0);
  const confidenceDeltas = sessions
    .map((session) => {
      const before = Number(session.confidence?.before);
      const after = Number(session.confidence?.after);
      return Number.isFinite(before) && Number.isFinite(after) ? after - before : null;
    })
    .filter((value) => value !== null);
  const improvementCounts = {};
  const feedbackSourceCounts = {};
  const questionSourceCounts = {};
  let totalRevisions = 0;

  sessions.forEach((session) => {
    const questions = session.questions || session.interviewHistory || [];
    totalRevisions += getRevisionCount(questions);

    (session.stats?.improvementAreas || session.weaknesses || []).forEach((item) => {
      const key = normalizeInsight(item);
      if (key) improvementCounts[key] = (improvementCounts[key] || 0) + 1;
    });

    questions.forEach((item) => {
      const source = item.feedbackSource || 'unknown';
      feedbackSourceCounts[source] = (feedbackSourceCounts[source] || 0) + 1;
    });

    const questionSource = session.questionSet?.source || 'unknown';
    questionSourceCounts[questionSource] = (questionSourceCounts[questionSource] || 0) + 1;
  });

  const recurringImprovements = Object.entries(improvementCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 4)
    .map(([label, count]) => ({ label, count }));

  return {
    averageScore: scoredSessions.length ? Math.round(totalScore / scoredSessions.length) : 0,
    averageConfidenceDelta: confidenceDeltas.length
      ? Number((confidenceDeltas.reduce((sum, value) => sum + value, 0) / confidenceDeltas.length).toFixed(1))
      : 0,
    recurringImprovements,
    feedbackSourceCounts,
    questionSourceCounts,
    totalRevisions,
    sessionsWithRevisions: sessions.filter((session) => getRevisionCount(session.questions || session.interviewHistory || []) > 0).length,
  };
};
