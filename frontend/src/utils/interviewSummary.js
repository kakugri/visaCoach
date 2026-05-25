import {
  getEffectiveAnswer,
  getFactConsistencyInsights,
} from './practiceInsights.js';

export const CONCERN_LABELS = {
  answering: 'Answering questions effectively',
  documentation: 'Required documentation',
  english: 'English language skills',
  nervousness: 'Managing nervousness',
};

export const CONTEXT_FIELD_LABELS = {
  homeCountry: 'Home country or current residence',
  institutionOrHost: 'School, employer, host, or program',
  programOrPurpose: 'Program, role, or trip purpose',
  fundingSource: 'Funding source',
  sponsorDetails: 'Sponsor or financial evidence',
  returnPlan: 'Return plan or home ties',
  importantDates: 'Important dates or timeline',
  notes: 'Application notes',
};

export const getStructuredFeedbackRows = (feedback, { brief = false } = {}) => {
  if (!feedback) return [];

  const riskFlags = Array.isArray(feedback.riskFlags)
    ? feedback.riskFlags.filter(Boolean)
    : [];

  const rows = brief
    ? [
        ['Quick read', feedback.quickRead],
        ['Main fix', feedback.mainFix],
      ]
    : [
        ['Quick read', feedback.quickRead],
        ['Main fix', feedback.mainFix],
        ['Stronger answer', feedback.strongerAnswer],
        ['Consistency check', feedback.consistencyCheck],
        ...(riskFlags.length ? [['Risk flags', riskFlags.join('; ')]] : []),
        ...(feedback.followUpQuestion ? [['Follow-up', feedback.followUpQuestion]] : []),
      ];

  return rows.filter(([, value]) => value);
};

export const formatFeedbackForSummary = (item) => {
  if (!item.feedback) {
    return item.agentResponse || 'No feedback captured.';
  }

  const lines = [
    item.feedback.quickRead ? `Quick read: ${item.feedback.quickRead}` : '',
    item.feedback.mainFix ? `Main fix: ${item.feedback.mainFix}` : '',
    item.feedback.strongerAnswer ? `Stronger answer: ${item.feedback.strongerAnswer}` : '',
    item.feedback.consistencyCheck ? `Consistency check: ${item.feedback.consistencyCheck}` : '',
    Array.isArray(item.feedback.riskFlags) && item.feedback.riskFlags.length
      ? `Risk flags: ${item.feedback.riskFlags.join('; ')}`
      : '',
    item.feedback.followUpQuestion ? `Follow-up: ${item.feedback.followUpQuestion}` : '',
  ].filter(Boolean);

  return lines.join('\n');
};

const getContextSummaryLines = (sessionContext = {}) => Object.entries(sessionContext)
  .filter(([, value]) => value)
  .map(([key, value]) => `${CONTEXT_FIELD_LABELS[key] || key}: ${value}`);

export const buildPracticeSummary = ({
  selectedCountry,
  selectedVisaType,
  userConfidence,
  postSessionConfidence,
  userNeeds = [],
  sessionContext = {},
  interviewStats = {},
  conversationHistory = [],
}) => {
  const contextLines = getContextSummaryLines(sessionContext);
  const concernLines = userNeeds.map(need => CONCERN_LABELS[need]).filter(Boolean);
  const strongAreas = interviewStats.strongAreas || [];
  const improvementAreas = interviewStats.improvementAreas || [];
  const consistencyInsights = getFactConsistencyInsights({ sessionContext, conversationHistory });
  const revisionCount = conversationHistory.filter((item) => item.revisedResponse).length;

  const lines = [
    'VisaCoach Practice Summary',
    `Country: ${selectedCountry}`,
    `Visa type: ${selectedVisaType}`,
    `Confidence before: ${userConfidence}/10`,
    `Confidence after: ${postSessionConfidence}/10`,
    ...(concernLines.length ? [`Concerns: ${concernLines.join(', ')}`] : []),
    ...(contextLines.length ? ['', 'Applicant context:', ...contextLines] : []),
    `Practice readiness: ${interviewStats.overallScore || 0}%`,
    `Revised answers: ${revisionCount}`,
    '',
    'Strengths:',
    ...strongAreas.map(area => `- ${area}`),
    '',
    'Focus areas:',
    ...improvementAreas.map(area => `- ${area}`),
    '',
    'Consistency prep:',
    ...(consistencyInsights.preparedFacts.length
      ? [`- Facts prepared: ${consistencyInsights.preparedFacts.map((field) => field.label).join(', ')}`]
      : ['- No applicant facts were prepared before this session.']),
    ...(consistencyInsights.gaps.length
      ? consistencyInsights.gaps.map((field) => `- Gap: ${field.gap}`)
      : ['- No obvious prepared-fact gaps from this session.']),
    ...(consistencyInsights.missingCoreFacts.length
      ? [`- Add before next practice: ${consistencyInsights.missingCoreFacts.map((field) => field.label).join(', ')}`]
      : []),
    '',
    'Practice answers:',
    ...conversationHistory.flatMap((item, index) => {
      const linesForAnswer = [
        `${index + 1}. ${item.question}`,
        `Answer: ${item.userResponse}`,
      ];

      if (item.revisedResponse) {
        linesForAnswer.push(`Revised answer: ${getEffectiveAnswer(item)}`);
        if (item.revisionComparison?.notes?.length) {
          linesForAnswer.push(`Revision notes: ${item.revisionComparison.notes.join(' ')}`);
        }
      }

      linesForAnswer.push(`Feedback: ${formatFeedbackForSummary(item)}`);
      linesForAnswer.push('');
      return linesForAnswer;
    }),
    'Note: This is practice support only. It is not legal advice and does not predict or guarantee a visa decision.',
  ];

  return lines.join('\n');
};
