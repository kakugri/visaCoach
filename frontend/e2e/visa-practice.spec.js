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
  await page.route('**/api/auth/profile', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        createdAt: '2026-05-24T12:00:00.000Z',
        lastLogin: '2026-05-24T12:30:00.000Z',
      }),
    });
  });

  await page.route('**/api/interview/history', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify([
        {
          _id: 'session-1',
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
          stats: {
            overallScore: 82,
            strongAreas: ['Prepared a funding source before practice'],
            improvementAreas: ['Add more specific details'],
          },
          questions: [
            {
              question: 'How will you finance your education?',
              answer: 'My family sponsor and savings will fund my studies.',
              feedback: 'Add sponsor details and document consistency.',
            },
          ],
        },
      ]),
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
            feedback: item.agentResponse,
          })),
        },
      ]),
    });
  });

  return migrationRequests;
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
  await expect(page.getByRole('button', { name: 'Start Practice' })).toBeVisible();
  await expect(page.getByText('Practice support only')).toBeVisible();
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
});

test('shows saved session history and copies a saved summary', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await mockSavedSessions(page);
  await page.addInitScript(() => {
    localStorage.setItem('token', 'test-token');
  });

  await page.goto('/history');

  await expect(page.getByRole('heading', { name: 'Saved Sessions' })).toBeVisible();
  await expect(page.getByText('US F1')).toBeVisible();
  await expect(page.getByText('82%')).toBeVisible();
  await expect(page.getByText('Prepared a funding source before practice')).toBeVisible();

  await page.getByText('Review answers').click();
  await expect(page.getByText('How will you finance your education?')).toBeVisible();
  await expect(page.getByText('My family sponsor and savings will fund my studies.')).toBeVisible();

  await page.getByRole('button', { name: 'Copy Summary' }).click();
  await expect(page.getByText('Session summary copied.')).toBeVisible();
  const savedSummary = await page.evaluate(() => navigator.clipboard.readText());
  expect(savedSummary).toContain('VisaCoach Saved Session');
  expect(savedSummary).toContain('US');
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
