import {
  buildPracticeSummary,
  formatFeedbackForSummary,
  getStructuredFeedbackRows,
} from './interviewSummary';

const feedback = {
  quickRead: 'Clear but too short.',
  mainFix: 'Add one concrete example.',
  strongerAnswer: 'I chose this program because it fits my prior research.',
  consistencyCheck: 'Match the I-20 and bank statement.',
  riskFlags: ['Funding is vague', 'Return plan is thin'],
  followUpQuestion: 'Who is your sponsor?',
};

test('getStructuredFeedbackRows returns compact rows for brief feedback', () => {
  const rows = getStructuredFeedbackRows(feedback, { brief: true });

  expect(rows).toEqual([
    ['Quick read', 'Clear but too short.'],
    ['Main fix', 'Add one concrete example.'],
  ]);
});

test('getStructuredFeedbackRows returns detailed rows with risk flags and follow-up', () => {
  const rows = getStructuredFeedbackRows(feedback);

  expect(rows).toContainEqual(['Stronger answer', 'I chose this program because it fits my prior research.']);
  expect(rows).toContainEqual(['Risk flags', 'Funding is vague; Return plan is thin']);
  expect(rows).toContainEqual(['Follow-up', 'Who is your sponsor?']);
});

test('formatFeedbackForSummary prefers structured feedback and falls back to agent text', () => {
  expect(formatFeedbackForSummary({ feedback })).toContain('Main fix: Add one concrete example.');
  expect(formatFeedbackForSummary({ agentResponse: 'Local fallback response.' })).toBe('Local fallback response.');
  expect(formatFeedbackForSummary({})).toBe('No feedback captured.');
});

test('buildPracticeSummary includes context, concerns, feedback, and disclaimer', () => {
  const summary = buildPracticeSummary({
    selectedCountry: 'US',
    selectedVisaType: 'F1',
    userConfidence: 5,
    postSessionConfidence: 8,
    userNeeds: ['documentation', 'english'],
    sessionContext: {
      homeCountry: 'Ghana',
      institutionOrHost: 'Example University',
      programOrPurpose: 'MS Computer Science',
      fundingSource: 'Family sponsor',
      returnPlan: 'Return to Ghana for cybersecurity work',
    },
    interviewStats: {
      overallScore: 84,
      strongAreas: ['Prepared a funding source before practice'],
      improvementAreas: ['Add sponsor details'],
    },
    conversationHistory: [
      {
        question: 'How will you finance your education?',
        userResponse: 'My family sponsor will fund my studies.',
        feedback,
      },
    ],
  });

  expect(summary).toContain('VisaCoach Practice Summary');
  expect(summary).toContain('Concerns: Required documentation, English language skills');
  expect(summary).toContain('Home country or current residence: Ghana');
  expect(summary).toContain('Practice readiness: 84%');
  expect(summary).toContain('Risk flags: Funding is vague; Return plan is thin');
  expect(summary).toContain('It is not legal advice');
});
