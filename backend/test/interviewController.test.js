const test = require('node:test');
const assert = require('node:assert/strict');

const { _test } = require('../controllers/interviewController');

test('extractJson parses fenced and surrounding JSON', () => {
  const parsed = _test.extractJson(`Here is the object:
\`\`\`json
{"quickRead":"ok","riskFlags":["one"]}
\`\`\``);

  assert.equal(parsed.quickRead, 'ok');
  assert.deepEqual(parsed.riskFlags, ['one']);
});

test('normalizeFeedback trims fields and limits risk flags', () => {
  const feedback = _test.normalizeFeedback({
    quickRead: '  direct  ',
    mainFix: '  add detail ',
    check: ' match documents ',
    riskFlags: [' one ', '', ' two ', ' three ', ' four '],
  });

  assert.equal(feedback.quickRead, 'direct');
  assert.equal(feedback.mainFix, 'add detail');
  assert.equal(feedback.consistencyCheck, 'match documents');
  assert.deepEqual(feedback.riskFlags, ['one', 'two', 'three']);
});

test('validateAgentRequest rejects missing and whitespace-only fields', () => {
  const result = _test.validateAgentRequest({
    question: ' ',
    userAnswer: 'return home',
    country: 'US',
    visaType: '',
  });

  assert.equal(result.valid, false);
  assert.deepEqual(result.missing, ['question', 'visaType']);
});

test('buildAgentPrompt uses the F1 profile and context in detailed mode', () => {
  const prompt = _test.buildAgentPrompt({
    question: 'What are your plans after completing your studies in the US?',
    userAnswer: 'I will return home to work in cybersecurity.',
    country: 'US',
    visaType: 'F1',
    feedbackStyle: 'detailed',
    sessionContext: {
      confidence: 6,
      concerns: ['documentation'],
      context: {
        homeCountry: 'Ghana',
        institutionOrHost: 'University of Texas',
        fundingSource: 'family sponsor',
        returnPlan: 'work in Ghana',
      },
    },
  });

  assert.match(prompt, /F1 student visa/);
  assert.match(prompt, /study plan, school\/program fit, funding/);
  assert.match(prompt, /home country\/current residence: Ghana/);
  assert.match(prompt, /Return only valid JSON/);
});

test('buildAgentPrompt keeps realistic mode officer-style', () => {
  const prompt = _test.buildAgentPrompt({
    question: 'What is the purpose of your visit?',
    userAnswer: 'tourism',
    country: 'US',
    visaType: 'B1/B2',
    feedbackStyle: 'realistic',
  });

  assert.match(prompt, /B1\/B2 visitor or business visa/);
  assert.match(prompt, /Respond as the officer would/);
  assert.doesNotMatch(prompt, /Return only valid JSON/);
});

test('buildLocalFeedback returns structured fallback fields', () => {
  const local = _test.buildLocalFeedback({
    question: 'How will you finance your education?',
    userAnswer: 'family',
    country: 'US',
    visaType: 'F1',
    sessionContext: {
      context: {
        fundingSource: 'family sponsor and savings',
        returnPlan: 'join my employer in Ghana',
      },
    },
  });

  assert.equal(typeof local.response, 'string');
  assert.equal(local.feedback.quickRead.length > 0, true);
  assert.match(local.feedback.mainFix, /join my employer in Ghana/);
  assert.match(local.feedback.consistencyCheck, /family sponsor and savings/);
});

test('buildQuestionPrompt asks for exactly five contextual questions', () => {
  const prompt = _test.buildQuestionPrompt({
    country: 'US',
    visaType: 'F1',
    sessionContext: {
      context: {
        institutionOrHost: 'University of Texas',
        programOrPurpose: 'MS Computer Science',
        fundingSource: 'family sponsor',
        returnPlan: 'work in Ghana',
      },
    },
  });

  assert.match(prompt, /Return exactly five questions/);
  assert.match(prompt, /University of Texas/);
  assert.match(prompt, /purpose, funding/);
});

test('buildLocalQuestions personalizes question bank with context', () => {
  const questions = _test.buildLocalQuestions({
    country: 'US',
    visaType: 'F1',
    sessionContext: {
      context: {
        institutionOrHost: 'University of Texas',
        fundingSource: 'family sponsor',
      },
    },
  });

  assert.equal(questions.length, 5);
  assert.match(questions[0], /University of Texas/);
  assert.match(questions[1], /family sponsor/);
});

test('getGeminiRetryDelayMs reads retry delay from quota errors', () => {
  const retryMs = _test.getGeminiRetryDelayMs({
    status: 429,
    errorDetails: [{ retryDelay: '39s' }],
  });

  assert.equal(retryMs, 39_000);
});

test('getAiRuntimeStatus exposes sanitized model and usage shape', () => {
  const status = _test.getAiRuntimeStatus();

  assert.equal(typeof status.model, 'string');
  assert.equal(status.quotaCooldown.active, false);
  assert.equal(status.quotaCooldown.retryAfterSeconds, 0);
  assert.equal(typeof status.usageSinceStart.feedback.gemini, 'number');
  assert.equal(typeof status.usageSinceStart.questions.localFallback, 'number');
  assert.equal(Object.prototype.hasOwnProperty.call(status, 'apiKey'), false);
});

test('buildFallbackResponse marks quota fallback metadata', () => {
  const fallback = _test.buildFallbackResponse({
    reason: 'quota',
    retryAfterSeconds: 39,
    body: {
      question: 'What are your plans after completing your studies?',
      userAnswer: 'return home',
      country: 'US',
      visaType: 'F1',
    },
  });

  assert.equal(fallback.source, 'local');
  assert.equal(fallback.sourceReason, 'quota');
  assert.equal(fallback.retryAfterSeconds, 39);
  assert.equal(fallback.model, 'local-fallback');
});
