const { test, expect } = require('@playwright/test');

const expectNoHorizontalOverflow = async (page) => {
  const overflow = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));

  expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth + 1);
};

const mockPrepApis = async (page) => {
  await page.route('**/api/interview/tips?**', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        general: ['Answer truthfully and keep your explanation focused.'],
        specific: ['Know your program, funding, and return plan.'],
      }),
    });
  });

  await page.route('**/api/interview/common-mistakes?**', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify(['Giving vague answers', 'Forgetting document consistency']),
    });
  });

  await page.route('**/api/interview/questions', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        questions: [
          'Generated question 1: What are your plans after completing your studies?',
          'Generated question 2: Why did you choose this university?',
          'Generated question 3: How will you fund your studies?',
          'Generated question 4: How does this program fit your background?',
          'Generated question 5: What ties support your return plan?',
        ],
        source: 'gemini',
        model: 'test-question-model',
      }),
    });
  });
};

const mockStructuredFeedback = async (page) => {
  let feedbackCount = 0;

  await page.route('**/api/interview/agent-response', async (route) => {
    feedbackCount += 1;
    const feedback = {
      quickRead: `Mock quick read ${feedbackCount}`,
      mainFix: `Mock main fix ${feedbackCount}`,
      strongerAnswer: `Mock stronger answer ${feedbackCount}`,
      consistencyCheck: `Mock consistency check ${feedbackCount}`,
      riskFlags: [`Mock risk ${feedbackCount}`],
      followUpQuestion: `Mock follow-up ${feedbackCount}?`,
    };

    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        response: [
          `**Quick read:** ${feedback.quickRead}`,
          `**Main fix:** ${feedback.mainFix}`,
          `**Stronger answer:** ${feedback.strongerAnswer}`,
          `**Check:** ${feedback.consistencyCheck}`,
        ].join('\n'),
        feedback,
        source: 'gemini',
        model: 'test-model',
      }),
    });
  });
};

const mockSavedSessions = async (page) => {
  let deleted = false;
  let accountDeleted = false;
  let savedPracticeProfile = {
    destinationCountry: 'US',
    visaType: 'F1',
    sessionContext: {
      homeCountry: 'Ghana',
      institutionOrHost: 'Example University',
      programOrPurpose: 'MS Computer Science',
      fundingSource: 'Family sponsor',
      returnPlan: 'Return home to work in software',
      notes: '',
    },
    confidence: { before: 7 },
    concerns: ['answering'],
    feedbackLevel: 'detailed',
  };
  const sessions = [
    {
      _id: 'session-1',
      sessionId: 'session-1',
      date: '2026-05-24T12:30:00.000Z',
      country: 'US',
      visaType: 'F1',
      sessionContext: {
        homeCountry: 'Ghana',
        programOrPurpose: 'MS Computer Science',
      },
      confidence: {
        before: 5,
        after: 7,
      },
      questionSet: {
        source: 'gemini',
        model: 'test-question-model',
      },
      stats: {
        overallScore: 82,
        strongAreas: ['Prepared a funding source before practice'],
        improvementAreas: ['Add more specific details'],
      },
      questions: [
        {
          question: 'How will you finance your education?',
          answer: 'My family sponsor and savings will fund my studies.',
          revisedAnswer: 'My parents will sponsor my studies with bank statements that match my application.',
          revisionComparison: {
            wordDelta: 6,
            notes: ['Added 6 words of detail.', 'Added a concrete visa-relevant fact.'],
          },
          feedback: 'Add sponsor details and document consistency.',
          feedbackSource: 'gemini',
        },
      ],
    },
  ];

  await page.route('**/api/auth/profile', async (route) => {
    if (accountDeleted) {
      await route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'User not found' }),
      });
      return;
    }

    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        createdAt: '2026-05-24T12:00:00.000Z',
        lastLogin: '2026-05-24T12:30:00.000Z',
        practiceProfile: savedPracticeProfile,
      }),
    });
  });

  await page.route('**/api/auth/profile', async (route) => {
    if (accountDeleted) {
      await route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'User not found' }),
      });
      return;
    }

    if (route.request().method() !== 'PUT') {
      await route.fallback();
      return;
    }

    const payload = route.request().postDataJSON();
    savedPracticeProfile = payload.practiceProfile;
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        message: 'Profile updated',
        practiceProfile: savedPracticeProfile,
      }),
    });
  });

  await page.route('**/api/interview/history', async (route) => {
    if (deleted || accountDeleted) {
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
      return;
    }

    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify(sessions),
    });
  });

  await page.route('**/api/auth/export', async (route) => {
    if (accountDeleted) {
      await route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'User not found' }),
      });
      return;
    }

    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        exportedAt: '2026-05-25T12:00:00.000Z',
        profile: {
          id: 'user-1',
          name: 'Test User',
          email: 'test@example.com',
          createdAt: '2026-05-24T12:00:00.000Z',
          practiceProfile: savedPracticeProfile,
        },
        sessionCount: sessions.length,
        sessions,
      }),
    });
  });

  await page.route('**/api/interview/history/session-1', async (route) => {
    if (route.request().method() !== 'DELETE') {
      await route.fallback();
      return;
    }

    deleted = true;
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ message: 'Saved session deleted', sessionId: 'session-1' }),
    });
  });

  await page.route('**/api/auth/account', async (route) => {
    if (route.request().method() !== 'DELETE') {
      await route.fallback();
      return;
    }

    accountDeleted = true;
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ message: 'Account deleted' }),
    });
  });
};

const createLocalSession = () => ({
  sessionId: 'local-session-1',
  country: 'US',
  visaType: 'F1',
  savedAt: '2026-05-24T14:00:00.000Z',
  sessionContext: {
    homeCountry: 'Ghana',
    programOrPurpose: 'MS Computer Science',
    fundingSource: 'Family sponsor and savings',
    returnPlan: 'Return to Ghana for cybersecurity work',
  },
  confidence: {
    before: 5,
    after: 7,
  },
  concerns: ['documentation'],
  feedbackLevel: 'detailed',
  stats: {
    overallScore: 84,
    strongAreas: ['Prepared a funding source before practice'],
    improvementAreas: ['Add sponsor details'],
  },
  interviewHistory: [
    {
      question: 'How will you finance your education?',
      userResponse: 'My family sponsor and savings will pay for my studies.',
      revisedResponse: 'My parents will sponsor my studies with bank statements that match my application.',
      revisionComparison: {
        wordDelta: 6,
        notes: ['Added 6 words of detail.', 'Added a concrete visa-relevant fact.'],
      },
      agentResponse: 'Add sponsor relationship and document consistency.',
      feedbackSource: 'gemini',
      feedbackStyle: 'detailed',
      feedback: {
        quickRead: 'Clear but needs detail.',
        mainFix: 'Add sponsor relationship.',
        strongerAnswer: 'My parents will sponsor my program.',
        consistencyCheck: 'Match the I-20 and bank statements.',
        riskFlags: ['Needs amounts'],
        followUpQuestion: 'Who is your sponsor?',
      },
    },
  ],
});

const mockRegistrationWithMigration = async (page) => {
  const migrationRequests = [];

  await page.route('**/api/auth/register', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        token: 'registered-token',
        user: {
          id: 'user-1',
          name: 'Migrated User',
          email: 'migrated@example.com',
        },
      }),
    });
  });

  await page.route('**/api/interview/save-history', async (route) => {
    migrationRequests.push(route.request().postDataJSON());
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        message: 'Interview history saved successfully',
        sessionId: 'local-session-1',
      }),
    });
  });

  await page.route('**/api/auth/profile', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        name: 'Migrated User',
        email: 'migrated@example.com',
        createdAt: '2026-05-24T14:10:00.000Z',
      }),
    });
  });

  await page.route('**/api/interview/history', async (route) => {
    const migratedSession = migrationRequests[0] || createLocalSession();
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify([
        {
          _id: 'migrated-session',
          date: migratedSession.savedAt,
          country: migratedSession.country,
          visaType: migratedSession.visaType,
          sessionId: migratedSession.sessionId,
          sessionContext: migratedSession.sessionContext,
          confidence: migratedSession.confidence,
          stats: migratedSession.stats,
          questions: migratedSession.interviewHistory.map((item) => ({
            question: item.question,
            answer: item.userResponse,
            revisedAnswer: item.revisedResponse,
            revisionComparison: item.revisionComparison,
            feedback: item.agentResponse,
            feedbackSource: item.feedbackSource,
          })),
        },
      ]),
    });
  });

  return migrationRequests;
};

const mockRegistrationWithoutMigration = async (page) => {
  const saveHistoryRequests = [];

  await page.route('**/api/auth/register', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        token: 'new-user-token',
        user: {
          id: 'user-2',
          name: 'First Run User',
          email: 'first-run@example.com',
        },
      }),
    });
  });

  await page.route('**/api/interview/save-history', async (route) => {
    saveHistoryRequests.push(route.request().postDataJSON());
    await route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'Unexpected migration request' }),
    });
  });

  await page.route('**/api/auth/profile', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        name: 'First Run User',
        email: 'first-run@example.com',
        createdAt: '2026-05-25T12:00:00.000Z',
      }),
    });
  });

  await page.route('**/api/interview/history', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify([]),
    });
  });

  return saveHistoryRequests;
};

const mockEmailLogin = async (page) => {
  const profileRequests = [];

  await page.route('**/api/auth/login', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        token: 'login-token',
        user: {
          id: 'user-login',
          name: 'Login User',
          email: 'login@example.com',
        },
      }),
    });
  });

  await page.route('**/api/auth/profile', async (route) => {
    profileRequests.push(route.request().headers().authorization || '');
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        name: 'Login User',
        email: 'login@example.com',
        createdAt: '2026-05-25T13:00:00.000Z',
        lastLogin: '2026-05-25T13:05:00.000Z',
        practiceProfile: {
          destinationCountry: 'US',
          visaType: 'F1',
          sessionContext: {
            homeCountry: 'Ghana',
            institutionOrHost: 'Login University',
            programOrPurpose: 'MS Information Security',
          },
          confidence: { before: 6 },
          concerns: ['documentation'],
          feedbackLevel: 'detailed',
        },
      }),
    });
  });

  await page.route('**/api/interview/history', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify([]),
    });
  });

  return profileRequests;
};

const mockAccountLoadRetry = async (page) => {
  let shouldFail = true;

  await page.route('**/api/auth/profile', async (route) => {
    if (shouldFail) {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Profile unavailable' }),
      });
      return;
    }

    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        name: 'Recovered User',
        email: 'recovered@example.com',
        createdAt: '2026-05-25T14:00:00.000Z',
      }),
    });
  });

  await page.route('**/api/interview/history', async (route) => {
    if (shouldFail) {
      await route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'History unavailable' }),
      });
      return;
    }

    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify([]),
    });
  });

  return {
    recover: () => {
      shouldFail = false;
    },
  };
};

const chooseF1Path = async (page) => {
  await page.getByText('United States', { exact: true }).click();
  await expect(page.locator('.visa-type-container.expanded')).toBeVisible();
  await page.locator('.visa-type-card').filter({ hasText: 'F1 Student Visa' }).click();
  await expect(page.getByRole('heading', { name: 'Prepare for Your Interview' })).toBeVisible();
};

const fillPrepContext = async (page) => {
  await page.getByLabel('Home country or current residence').fill('Ghana');
  await page.getByLabel('School, employer, host, or program').fill('University of Texas');
  await page.getByLabel('Program, role, or trip purpose').fill('MS Computer Science');
  await page.getByLabel('Funding source').fill('Family sponsor and savings');
  await page.getByLabel('Return plan or home ties').fill('Return to Ghana for cybersecurity work');
};

test.beforeEach(async ({ page }) => {
  await mockPrepApis(page);
});

test('renders the visa practice landing screen', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: /Practice a Visa Interview/i })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Choose Visa Path' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Create account' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Create Profile First' })).toHaveCount(0);
  await expect(page.getByText('Practice support only')).toBeVisible();

  await page.getByRole('button', { name: 'Choose Visa Path' }).click();
  await page.waitForFunction(() => window.scrollY > 200);
  await expect(page.getByRole('heading', { name: 'Select your destination & visa type' })).toBeVisible();
  await expectNoHorizontalOverflow(page);
});

test('renders public info pages and copies the feedback template', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);

  await page.goto('/privacy');
  await expect(page.getByRole('heading', { name: 'Privacy Policy' })).toBeVisible();
  await expect(page.getByText('Practice answers, feedback')).toBeVisible();

  await page.goto('/terms');
  await expect(page.getByRole('heading', { name: 'Terms of Service' })).toBeVisible();
  await expect(page.getByText('No guarantees')).toBeVisible();

  await page.goto('/contact');
  await expect(page.getByRole('heading', { name: 'Contact' })).toBeVisible();
  await expect(page.getByText('VisaCoach feedback')).toBeVisible();

  await page.getByRole('button', { name: 'Copy Feedback Template' }).click();
  await expect(page.getByText('Feedback template copied.')).toBeVisible();
  const template = await page.evaluate(() => navigator.clipboard.readText());
  expect(template).toContain('Visa path practiced:');
  expect(template).toContain('Browser/device:');

  const events = await page.evaluate(() => JSON.parse(localStorage.getItem('visaCoach:analyticsEvents') || '[]'));
  expect(events.some((event) => event.eventName === 'feedback_template_copied')).toBe(true);
  await expectNoHorizontalOverflow(page);
});

test('opens the F1 prep screen from country and visa selection', async ({ page }) => {
  await page.goto('/');
  await chooseF1Path(page);

  await expect(page.getByText('Destination: US')).toBeVisible();
  await expect(page.getByText('Visa type: F1')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Start Interview Simulation' })).toBeVisible();
  await expectNoHorizontalOverflow(page);
});

test('starts a practice session from the prep screen', async ({ page }) => {
  await page.goto('/');
  await chooseF1Path(page);

  await fillPrepContext(page);
  await page.getByRole('button', { name: 'Start Interview Simulation' }).click();

  await expect(page.getByText('Welcome to your practice session')).toBeVisible();
  await expect(page.getByText('Question 1 of 5')).toBeVisible();
  await expect(page.getByText('Questions: Gemini · test-question-model')).toBeVisible();
  const events = await page.evaluate(() => JSON.parse(localStorage.getItem('visaCoach:analyticsEvents') || '[]'));
  const questionEvent = events.find((event) => event.eventName === 'question_set_prepared');
  expect(questionEvent.properties).toMatchObject({
    country: 'US',
    visaType: 'F1',
    questionSource: 'gemini',
    model: 'test-question-model',
    personalizedQuestions: true,
    questionCount: 5,
    contextFieldCount: 5,
  });
  await expectNoHorizontalOverflow(page);
});

test('uses the question bank with a visible notice when personalized questions fail', async ({ page }) => {
  await page.route('**/api/interview/questions', async (route) => {
    await route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'Question generation failed' }),
    });
  });

  await page.goto('/');
  await chooseF1Path(page);
  await fillPrepContext(page);
  await page.getByRole('button', { name: 'Start Interview Simulation' }).click();

  await expect(page.getByRole('status')).toContainText('Personalized questions are unavailable right now');
  await expect(page.getByText('Questions: Question bank')).toBeVisible();
  await expect(page.getByText('Question 1 of 5')).toBeVisible();
  const events = await page.evaluate(() => JSON.parse(localStorage.getItem('visaCoach:analyticsEvents') || '[]'));
  const questionEvent = events.find((event) => event.eventName === 'question_set_prepared');
  expect(questionEvent.properties).toMatchObject({
    questionSource: 'local',
    questionSourceReason: 'network',
    personalizedQuestions: true,
    contextFieldCount: 5,
  });
  await expectNoHorizontalOverflow(page);
});

test('completes a full session, renders structured feedback, and copies the summary', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await mockStructuredFeedback(page);
  await page.goto('/');
  await chooseF1Path(page);
  await fillPrepContext(page);
  await page.getByRole('button', { name: 'Start Interview Simulation' }).click();

  const answers = [
    'After graduation I will return to Ghana to work in cybersecurity.',
    'I chose the US because this program has security systems coursework.',
    'My family sponsor and savings will cover tuition and living costs.',
    'I will study computer science because it fits my prior software work.',
    'I researched the university location and plan to stay near campus.',
  ];

  for (let index = 0; index < answers.length; index += 1) {
    await expect(page.getByText(`Question ${index + 1} of 5`)).toBeVisible();
    await page.getByPlaceholder('Type your answer here...').fill(answers[index]);
    await page.getByRole('button', { name: 'Submit Answer' }).click();
    await expect(page.getByText(`Mock quick read ${index + 1}`)).toBeVisible();

    if (index === 0) {
      await expect(page.getByRole('button', { name: 'Revise Answer' })).toBeVisible();
      await page.getByRole('button', { name: 'Revise Answer' }).click();
      await expect(page.getByRole('heading', { name: 'Strengthen this answer before moving on' })).toBeVisible();
      await page.locator('.revision-input').fill('After graduation I will return to Ghana to work in cybersecurity with my current employer.');
      await page.getByRole('button', { name: 'Save Revision' }).click();
      await expect(page.getByText('Revision saved. Moving forward with the stronger version.')).toBeVisible();
      await expect(page.getByText('Revised answer')).toBeVisible();
    }

    if (index < answers.length - 1) {
      await expect(page.getByText(`Question ${index + 2} of 5`)).toBeVisible({ timeout: 6_000 });
    }
  }

  await expect(page.getByRole('heading', { name: 'Interview Simulation Complete' })).toBeVisible({ timeout: 6_000 });
  await expect(page.getByText('Practice Readiness')).toBeVisible();
  await expect(page.getByText('Confidence Check')).toBeVisible();
  await expectNoHorizontalOverflow(page);

  await page.getByRole('button', { name: 'Copy Summary' }).click();
  await expect(page.getByText('Summary copied to clipboard.')).toBeVisible();
  const summary = await page.evaluate(() => navigator.clipboard.readText());
  expect(summary).toContain('VisaCoach Practice Summary');
  expect(summary).toContain('Mock quick read 1');
  expect(summary).toContain('Revised answer: After graduation I will return to Ghana');
  expect(summary).toContain('Consistency prep:');

  await page.getByRole('link', { name: 'Share Feedback' }).click();
  await expect(page).toHaveURL(/\/contact$/);
  await expect(page.getByRole('heading', { name: 'Contact' })).toBeVisible();
});

test('shows saved session history and copies a saved summary', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await mockSavedSessions(page);
  await page.addInitScript(() => {
    localStorage.setItem('token', 'test-token');
  });

  await page.goto('/history');

  await expect(page.getByRole('heading', { name: 'Saved Sessions', exact: true })).toBeVisible();
  await expect(page.getByText('US F1')).toBeVisible();
  await expect(page.getByText('82%')).toBeVisible();
  await expect(page.getByText('Prepared a funding source before practice')).toBeVisible();

  await page.getByLabel('Search').fill('Ghana');
  await page.getByLabel('Country').selectOption('US');
  await page.getByLabel('Visa').selectOption('F1');
  await page.getByLabel('Sort').selectOption('score');
  await expect(page.getByText('US F1')).toBeVisible();

  await page.getByLabel('Search').fill('Canada');
  await expect(page.getByText('No matching sessions')).toBeVisible();
  await page.getByRole('button', { name: 'Clear Filters' }).click();
  await expect(page.getByText('US F1')).toBeVisible();

  await page.getByText('Review answers').click();
  await expect(page.getByText('How will you finance your education?')).toBeVisible();
  await expect(page.getByText('My family sponsor and savings will fund my studies.')).toBeVisible();
  await expect(page.getByText('My parents will sponsor my studies with bank statements')).toBeVisible();

  await page.getByRole('button', { name: 'Copy Summary' }).click();
  await expect(page.getByText('Session summary copied.')).toBeVisible();
  const savedSummary = await page.evaluate(() => navigator.clipboard.readText());
  expect(savedSummary).toContain('VisaCoach Saved Session');
  expect(savedSummary).toContain('US');
  expect(savedSummary).toContain('Revised answers: 1');
  expect(savedSummary).toContain('Revised answer: My parents will sponsor');

  page.once('dialog', async (dialog) => {
    expect(dialog.message()).toContain('Delete this saved practice session');
    await dialog.accept();
  });
  await page.getByRole('button', { name: 'Delete Session' }).click();
  await expect(page.getByText('Saved session deleted.')).toBeVisible();
  await expect(page.getByText('No saved sessions yet')).toBeVisible();
  await expectNoHorizontalOverflow(page);
});

test('starts a new practice from a saved session with saved context', async ({ page }) => {
  await mockSavedSessions(page);
  await page.addInitScript(() => {
    localStorage.setItem('token', 'test-token');
  });

  await page.goto('/history');

  await page.getByRole('button', { name: 'Practice Again' }).click();
  await expect(page).toHaveURL(/\/interview$/);
  await expect(page.getByRole('heading', { name: 'Prepare for Your Interview' })).toBeVisible({ timeout: 6_000 });
  await expect(page.getByText('Destination: US')).toBeVisible();
  await expect(page.getByText('Visa type: F1')).toBeVisible();
  await expect(page.getByLabel('Home country or current residence')).toHaveValue('Ghana');
  await expect(page.getByLabel('Program, role, or trip purpose')).toHaveValue('MS Computer Science');
  await expect(page.getByLabel('Interview confidence before practice')).toHaveValue('7');
  await expect(page.getByLabel('Detailed (Provide specific suggestions)')).toBeChecked();
  await expectNoHorizontalOverflow(page);
});

test('recovers the account page after account data fails to load', async ({ page }) => {
  const accountLoad = await mockAccountLoadRetry(page);
  await page.addInitScript(() => {
    localStorage.setItem('token', 'retry-token');
    localStorage.setItem('user', JSON.stringify({
      name: 'Recovered User',
      email: 'recovered@example.com',
    }));
  });

  await page.goto('/history');
  await expect(page.getByRole('heading', { name: 'Account data unavailable' })).toBeVisible();
  await expect(page.getByText('We could not load your account data')).toBeVisible();

  accountLoad.recover();
  await page.getByRole('button', { name: 'Try Again' }).click();
  await expect(page.getByRole('heading', { name: 'Saved Sessions', exact: true })).toBeVisible();
  await expect(page.getByText('No saved sessions yet')).toBeVisible();
  await expectNoHorizontalOverflow(page);
});

test('opens profile and settings from the account dropdown', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await mockSavedSessions(page);
  await page.addInitScript(() => {
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('user', JSON.stringify({
      name: 'Test User',
      email: 'test@example.com',
    }));
  });

  await page.goto('/history');

  await expect(page.getByRole('heading', { name: 'Saved Sessions' })).toBeVisible();
  await expect(page.getByRole('button', { name: /Test User/ })).toBeVisible();
  await expect(page.locator('.dropdown-menu')).toBeHidden();

  await page.getByRole('button', { name: /Test User/ }).hover();
  await expect(page.locator('.dropdown-menu')).toBeHidden();

  await page.getByRole('button', { name: /Test User/ }).click();
  await expect(page.getByRole('menuitem', { name: 'Profile' })).toBeVisible();
  await expect(page.getByRole('menuitem', { name: 'Settings' })).toBeVisible();

  await page.keyboard.press('Escape');
  await expect(page.locator('.dropdown-menu')).toBeHidden();

  await page.getByRole('button', { name: /Test User/ }).click();
  await page.getByRole('menuitem', { name: 'Settings' }).click();
  await expect(page).toHaveURL(/\/settings$/);
  await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible();

  await page.getByRole('button', { name: 'Copy Account Data' }).click();
  await expect(page.getByText('Account data copied.')).toBeVisible();
  const accountData = JSON.parse(await page.evaluate(() => navigator.clipboard.readText()));
  expect(accountData.profile.name).toBe('Test User');
  expect(accountData.profile.password).toBeUndefined();
  expect(accountData.sessionCount).toBe(1);
  expect(accountData.sessions[0].sessionId).toBe('session-1');

  await page.getByRole('button', { name: 'Saved Sessions', exact: true }).click();
  await expect(page).toHaveURL(/\/history$/);
  await expect(page.getByRole('heading', { name: 'Saved Sessions' })).toBeVisible();

  await page.getByRole('button', { name: /Test User/ }).click();
  await page.getByRole('menuitem', { name: 'Profile' }).click();
  await expect(page).toHaveURL(/\/profile$/);
  await expect(page.getByRole('heading', { name: 'Test User' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Progress' })).toBeVisible();
  await expect(page.getByText('Revisions saved')).toBeVisible();
  await expect(page.getByText('Member since')).toBeVisible();
  await expectNoHorizontalOverflow(page);
});

test('saves a practice profile and starts setup with saved defaults', async ({ page }) => {
  await mockSavedSessions(page);
  await page.addInitScript(() => {
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('user', JSON.stringify({
      name: 'Test User',
      email: 'test@example.com',
    }));
  });

  await page.goto('/profile');
  await expect(page.getByRole('heading', { name: 'Practice Profile' })).toBeVisible();
  await expect(page.getByText('Ready for personalized practice')).toBeVisible();
  await expect(page.getByText('These details prefill setup')).toBeVisible();
  await expect(page.getByText('7/7')).toBeVisible();

  await page.getByLabel('Destination').selectOption('CA');
  await page.getByLabel('Visa type').selectOption('student');
  await page.getByLabel('Home country or current residence').fill('Nigeria');
  await page.getByLabel('School, employer, host, or program').fill('Toronto Tech College');
  await page.getByLabel('Program, role, or trip purpose').fill('Graduate diploma in cybersecurity');
  await page.getByLabel('Funding source').fill('Personal savings and family support');
  await page.getByLabel('Return plan or home ties').fill('Return to join my employer security team');
  await page.getByLabel('Feedback style').selectOption('brief');
  await page.getByLabel('English clarity').check();

  await page.getByRole('button', { name: 'Save Practice Profile' }).click();
  await expect(page.getByText('Practice profile saved.')).toBeVisible();

  await page.getByRole('button', { name: 'Start Practice' }).first().click();
  await expect(page).toHaveURL(/\/interview$/);
  await expect(page.getByRole('heading', { name: 'Prepare for Your Interview' })).toBeVisible({ timeout: 6_000 });
  await expect(page.getByText('Destination: CA')).toBeVisible();
  await expect(page.getByText('Visa type: student')).toBeVisible();
  await expect(page.getByLabel('Home country or current residence')).toHaveValue('Nigeria');
  await expect(page.getByLabel('School, employer, host, or program')).toHaveValue('Toronto Tech College');
  await expect(page.getByLabel('Program, role, or trip purpose')).toHaveValue('Graduate diploma in cybersecurity');
  await expect(page.getByLabel('Funding source')).toHaveValue('Personal savings and family support');
  await expect(page.getByLabel('Return plan or home ties')).toHaveValue('Return to join my employer security team');
  await expect(page.getByLabel("Brief (Just tell me if I'm on the right track)")).toBeChecked();
  await expectNoHorizontalOverflow(page);
});

test('deletes the signed-in account from settings', async ({ page }) => {
  await mockSavedSessions(page);
  await page.addInitScript(() => {
    if (window.location.pathname !== '/settings') return;
    if (localStorage.getItem('account-delete-test-seeded')) return;
    localStorage.setItem('account-delete-test-seeded', 'true');
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('user', JSON.stringify({
      name: 'Test User',
      email: 'test@example.com',
    }));
    localStorage.setItem('visaCoach:lastSession', JSON.stringify({ sessionId: 'session-1' }));
  });

  await page.goto('/settings');
  await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible();

  page.once('dialog', async (dialog) => {
    expect(dialog.message()).toContain('Delete your VisaCoach account');
    await dialog.accept();
  });

  await page.getByRole('button', { name: 'Delete Account' }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole('button', { name: 'Choose Visa Path' })).toBeVisible();

  const storageState = await page.evaluate(() => ({
    token: localStorage.getItem('token'),
    user: localStorage.getItem('user'),
    lastSession: localStorage.getItem('visaCoach:lastSession'),
    seeded: localStorage.getItem('account-delete-test-seeded'),
  }));

  expect(storageState).toEqual({
    token: null,
    user: null,
    lastSession: null,
    seeded: 'true',
  });
  await expectNoHorizontalOverflow(page);
});

test('guides new registrations into first practice setup', async ({ page }) => {
  const saveHistoryRequests = await mockRegistrationWithoutMigration(page);

  await page.goto('/register');
  await page.getByLabel('Full Name').fill('First Run User');
  await page.getByLabel('Email').fill('first-run@example.com');
  await page.getByLabel('Password', { exact: true }).fill('strong-password');
  await page.getByLabel('Confirm Password').fill('strong-password');
  await page.getByLabel(/I agree to the Terms/).check();
  await page.getByRole('button', { name: 'Create Account' }).click();

  await expect(page).toHaveURL(/\/profile\?setup=1$/);
  await expect(page.getByRole('heading', { name: 'Set your practice defaults' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Practice Profile' })).toBeVisible();
  await expect(page.getByText('Add 5 more details')).toBeVisible();
  await expect(page.getByText('2/7')).toBeVisible();
  expect(saveHistoryRequests).toHaveLength(0);

  await page.getByRole('button', { name: 'Start With Defaults' }).click();
  await expect(page).toHaveURL(/\/interview$/);
  await expect(page.getByRole('heading', { name: 'Prepare for Your Interview' })).toBeVisible({ timeout: 6_000 });
  await expect(page.getByText('Destination: US')).toBeVisible();
  await expect(page.getByText('Visa type: F1')).toBeVisible();
  await expectNoHorizontalOverflow(page);
});

test('persists first-run profile prompt dismissal', async ({ page }) => {
  await mockRegistrationWithoutMigration(page);
  await page.addInitScript(() => {
    localStorage.setItem('token', 'first-run-token');
    localStorage.setItem('user', JSON.stringify({
      name: 'First Run User',
      email: 'first-run@example.com',
    }));
  });

  await page.goto('/profile?setup=1');
  await expect(page.getByRole('heading', { name: 'Set your practice defaults' })).toBeVisible();
  await page.getByRole('button', { name: 'Dismiss' }).click();
  await expect(page).toHaveURL(/\/profile$/);
  await expect(page.getByRole('heading', { name: 'Set your practice defaults' })).toHaveCount(0);

  const dismissed = await page.evaluate(() => localStorage.getItem('visaCoach:firstRunProfilePromptDismissed'));
  expect(dismissed).toBe('true');

  await page.reload();
  await expect(page.getByRole('heading', { name: 'Practice Profile' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Set your practice defaults' })).toHaveCount(0);
  await expectNoHorizontalOverflow(page);
});

test('signs in with email and refreshes the profile with saved auth', async ({ page }) => {
  const profileRequests = await mockEmailLogin(page);

  await page.goto('/login');
  await page.getByLabel('Email').fill('login@example.com');
  await page.getByLabel('Password').fill('correct-password');
  await page.getByRole('button', { name: 'Sign In' }).click();

  await expect(page).toHaveURL(/\/interview$/);
  const storedAuth = await page.evaluate(() => ({
    token: localStorage.getItem('token'),
    user: JSON.parse(localStorage.getItem('user')),
  }));
  expect(storedAuth.token).toBe('login-token');
  expect(storedAuth.user.name).toBe('Login User');

  await page.goto('/profile');
  await expect(page.getByRole('heading', { name: 'Login User' })).toBeVisible();
  await expect(page.getByLabel('Home country or current residence')).toHaveValue('Ghana');
  await expect(page.getByLabel('School, employer, host, or program')).toHaveValue('Login University');

  await page.reload();
  await expect(page).toHaveURL(/\/profile$/);
  await expect(page.getByRole('heading', { name: 'Login User' })).toBeVisible();
  expect(profileRequests.every((header) => header === 'Bearer login-token')).toBe(true);
  expect(profileRequests.length).toBeGreaterThanOrEqual(2);
  await expectNoHorizontalOverflow(page);
});

test('returns to a protected page after login', async ({ page }) => {
  await mockEmailLogin(page);

  await page.goto('/history');
  await expect(page).toHaveURL(/\/login$/);

  await page.getByLabel('Email').fill('login@example.com');
  await page.getByLabel('Password').fill('correct-password');
  await page.getByRole('button', { name: 'Sign In' }).click();

  await expect(page).toHaveURL(/\/history$/);
  await expect(page.getByRole('heading', { name: 'Saved Sessions', exact: true })).toBeVisible();
  await expect(page.getByText('No saved sessions yet')).toBeVisible();
  await expectNoHorizontalOverflow(page);
});

test('redirects already signed-in users away from auth pages', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('token', 'existing-token');
    localStorage.setItem('user', JSON.stringify({
      name: 'Existing User',
      email: 'existing@example.com',
    }));
  });

  await page.goto('/login');
  await expect(page).toHaveURL(/\/interview$/);

  await page.goto('/register');
  await expect(page).toHaveURL(/\/profile$/);
  await expectNoHorizontalOverflow(page);
});

test('migrates a local practice session after registration', async ({ page }) => {
  const migrationRequests = await mockRegistrationWithMigration(page);

  await page.addInitScript((session) => {
    localStorage.setItem('visaCoach:lastSession', JSON.stringify(session));
  }, createLocalSession());

  await page.goto('/register');
  await page.getByLabel('Full Name').fill('Migrated User');
  await page.getByLabel('Email').fill('migrated@example.com');
  await page.getByLabel('Password', { exact: true }).fill('strong-password');
  await page.getByLabel('Confirm Password').fill('strong-password');
  await page.getByLabel(/I agree to the Terms/).check();
  await page.getByRole('button', { name: 'Create Account' }).click();

  await expect(page).toHaveURL(/\/history$/);
  await expect(page.getByRole('heading', { name: 'Saved Sessions' })).toBeVisible();
  await expect(page.getByText('US F1')).toBeVisible();
  await expect(page.getByText('Prepared a funding source before practice')).toBeVisible();

  expect(migrationRequests).toHaveLength(1);
  expect(migrationRequests[0].sessionId).toBe('local-session-1');
  expect(migrationRequests[0].interviewHistory[0].userResponse).toContain('family sponsor');

  const migratedStatus = await page.evaluate(() => JSON.parse(localStorage.getItem('visaCoach:lastSessionMigrationStatus')));
  expect(migratedStatus.status).toBe('migrated');
  await expectNoHorizontalOverflow(page);
});
