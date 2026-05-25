// In InterviewController.js
// const { Configuration, OpenAIApi } = require("openai"); // Example using OpenAI
require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash-lite";
const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL });
const ACTIVE_MODEL = process.env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL;
let geminiQuotaBlockedUntil = 0;

const PROMPT_PROFILES = {
  f1Student: {
    label: "F1 student visa",
    roleFocus: "study plan, school/program fit, funding, home ties, and post-study plans",
    rubric: [
      "Does the answer connect the chosen program to prior education or career goals?",
      "Does it explain funding with facts that can match documents?",
      "Does it show credible plans outside the destination country after study?",
      "Does it avoid sounding primarily focused on long-term work in the destination country?",
    ],
  },
  b1b2Visitor: {
    label: "B1/B2 visitor or business visa",
    roleFocus: "trip purpose, duration, itinerary, funds, occupation, host details, and return ties",
    rubric: [
      "Does the answer state a specific temporary purpose?",
      "Does it keep the trip timeline credible and bounded?",
      "Does it mention who pays and where the applicant will stay when relevant?",
      "Does it support return intent through work, family, property, school, or other ties?",
    ],
  },
  genericVisa: {
    label: "general visa interview",
    roleFocus: "purpose, funding, timeline, consistency, and return or onward plans",
    rubric: [
      "Does the answer directly address the question?",
      "Does it include one concrete fact rather than a vague claim?",
      "Does it stay consistent with the applicant context and likely documents?",
      "Does it avoid promises, exaggeration, or unsupported claims?",
    ],
  },
};

const CONTEXT_LABELS = {
  homeCountry: "home country/current residence",
  institutionOrHost: "school/employer/host/program",
  programOrPurpose: "program/role/trip purpose",
  fundingSource: "funding source",
  returnPlan: "return plan/home ties",
  notes: "application notes",
};

const SESSION_QUESTION_LIMIT = 5;

const QUESTION_BANK = {
  US: {
    F1: [
      "What are your plans after completing your studies in the US?",
      "Why did you choose to study in the United States instead of your home country or other countries?",
      "How will you finance your education and living expenses while in the US?",
      "What is your intended major of study and why did you choose this field?",
      "Have you researched your university's location? Where do you plan to stay?",
      "Can you describe your academic background and how it relates to your chosen field of study?",
      "Do you have family members currently in the United States?",
      "How will this degree help your career when you return to your home country?",
      "Have you taken the TOEFL or IELTS? What was your score?",
      "Have you been offered any scholarships or financial aid?",
      "What specific classes or projects are you looking forward to at your university?",
      "Have you traveled to the US before? If so, when and for what purpose?",
    ],
    "B1/B2": [
      "What is the purpose of your visit to the United States?",
      "How long do you plan to stay in the US?",
      "Where will you be staying during your visit?",
      "Have you visited the United States before?",
      "Who will you be visiting in the United States?",
      "What is your occupation in your home country?",
      "How will your responsibilities be handled while you're away?",
      "How are you financing this trip?",
      "What ties do you have to your home country that will ensure your return?",
      "Do you have family members in the United States?",
      "What places do you plan to visit during your stay?",
    ],
  },
  CA: {
    student: [
      "Why have you chosen to study in Canada?",
      "How will your studies in Canada benefit your future career?",
      "How do you plan to finance your studies and living expenses in Canada?",
      "Why did you choose this specific institution and program?",
      "What are your plans after completing your studies in Canada?",
      "Do you have family members currently in Canada?",
      "Have you researched the city where your institution is located?",
      "How does this program relate to your previous education or work experience?",
      "Have you applied for a Canadian study permit before?",
      "Do you plan to work part-time during your studies?",
      "How do educational options in Canada compare to those in your home country?",
    ],
  },
  UK: {
    student: [
      "Why do you want to study in the UK?",
      "How will you support yourself financially during your studies?",
      "What are your plans after completing your course in the UK?",
      "Why did you choose this specific institution and course?",
      "How does this course relate to your previous education?",
      "What are your career goals and how will this course help you achieve them?",
      "Have you previously studied or applied to study in the UK?",
      "Do you have family members currently in the UK?",
      "How will you accommodate yourself during your studies?",
      "Have you taken an English language test? What was your score?",
      "How do educational options in the UK compare to those in your home country?",
    ],
  },
};

const GENERIC_VISA_QUESTIONS = [
  "What is the purpose of your trip or visa application?",
  "Why did you choose this destination instead of another country?",
  "How will you fund your stay, studies, or planned activities?",
  "What ties do you have to your home country or current country of residence?",
  "What are your plans after the visa period ends?",
];

const normalizeString = (value) => (typeof value === "string" ? value.trim() : "");

const getPromptProfile = (country, visaType) => {
  const normalizedVisa = normalizeString(visaType).toUpperCase();
  const normalizedCountry = normalizeString(country).toUpperCase();

  if (normalizedCountry === "US" && normalizedVisa === "F1") {
    return PROMPT_PROFILES.f1Student;
  }

  if (normalizedCountry === "US" && ["B1/B2", "B1", "B2"].includes(normalizedVisa)) {
    return PROMPT_PROFILES.b1b2Visitor;
  }

  if (["STUDENT", "STUDY PERMIT", "TIER 4"].includes(normalizedVisa)) {
    return PROMPT_PROFILES.f1Student;
  }

  return PROMPT_PROFILES.genericVisa;
};

const buildContextBlock = (sessionContext = {}) => {
  const context = sessionContext.context || {};
  const lines = [];

  Object.entries(CONTEXT_LABELS).forEach(([key, label]) => {
    const value = normalizeString(context[key]);
    if (value) {
      lines.push(`- ${label}: ${value.slice(0, 700)}`);
    }
  });

  if (Number.isFinite(Number(sessionContext.confidence))) {
    lines.push(`- confidence before practice: ${Number(sessionContext.confidence)}/10`);
  }

  if (Array.isArray(sessionContext.concerns) && sessionContext.concerns.length) {
    lines.push(`- selected concerns: ${sessionContext.concerns.join(", ")}`);
  }

  return lines.length ? lines.join("\n") : "- no extra applicant context provided";
};

const extractJson = (text) => {
  const cleaned = text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch (firstError) {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");

    if (start === -1 || end === -1 || end <= start) {
      throw firstError;
    }

    return JSON.parse(cleaned.slice(start, end + 1));
  }
};

const normalizeFeedback = (feedback = {}) => ({
  quickRead: normalizeString(feedback.quickRead),
  mainFix: normalizeString(feedback.mainFix),
  strongerAnswer: normalizeString(feedback.strongerAnswer),
  consistencyCheck: normalizeString(feedback.consistencyCheck || feedback.check),
  riskFlags: Array.isArray(feedback.riskFlags)
    ? feedback.riskFlags.map(normalizeString).filter(Boolean).slice(0, 3)
    : [],
  followUpQuestion: normalizeString(feedback.followUpQuestion),
});

const normalizeQuestions = (questions = []) => {
  const seen = new Set();

  return questions
    .map(normalizeString)
    .filter((question) => question.length >= 12)
    .filter((question) => {
      const key = question.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, SESSION_QUESTION_LIMIT);
};

const getQuestionBank = (country, visaType) => (
  QUESTION_BANK[normalizeString(country)]?.[normalizeString(visaType)] || GENERIC_VISA_QUESTIONS
);

const buildLocalQuestions = ({ country, visaType, sessionContext = {} }) => {
  const context = sessionContext.context || {};
  const contextQuestions = [
    context.institutionOrHost
      ? `Why did you choose ${context.institutionOrHost}, and how does it fit your visa purpose?`
      : "",
    context.programOrPurpose
      ? `How does ${context.programOrPurpose} connect to your background and future plans?`
      : "",
    context.fundingSource
      ? `How will ${context.fundingSource} cover the costs connected to this visa?`
      : "",
    context.returnPlan
      ? `How does this visa support your plan to ${context.returnPlan}?`
      : "",
  ];

  return normalizeQuestions([
    ...contextQuestions,
    ...getQuestionBank(country, visaType),
  ]);
};

const feedbackToMarkdown = (feedback) => [
  feedback.quickRead ? `**Quick read:** ${feedback.quickRead}` : "",
  feedback.mainFix ? `**Main fix:** ${feedback.mainFix}` : "",
  feedback.strongerAnswer ? `**Stronger answer:** ${feedback.strongerAnswer}` : "",
  feedback.consistencyCheck ? `**Check:** ${feedback.consistencyCheck}` : "",
  feedback.riskFlags.length ? `**Risk flags:** ${feedback.riskFlags.join("; ")}` : "",
  feedback.followUpQuestion ? `**Follow-up:** ${feedback.followUpQuestion}` : "",
].filter(Boolean).join("\n");

const buildLocalFeedback = ({ question, userAnswer, country, visaType, sessionContext }) => {
  const answer = normalizeString(userAnswer);
  const context = sessionContext?.context || {};
  const wordCount = answer.split(/\s+/).filter(Boolean).length;
  const quickRead = wordCount < 20
    ? "The answer is understandable but too brief to sound fully prepared."
    : "The answer gives enough material to review.";
  const mainFix = context.returnPlan
    ? `Connect the answer to your return plan or home ties: ${context.returnPlan}.`
    : "Add one concrete detail and explain why it matters.";
  const consistencyCheck = context.fundingSource
    ? `Make sure this matches funding evidence for ${context.fundingSource}.`
    : "Check that this answer matches your application forms and supporting documents.";
  const feedback = normalizeFeedback({
    quickRead,
    mainFix,
    strongerAnswer: `A stronger answer should directly answer "${question}" with one truthful reason and one concrete fact.`,
    consistencyCheck,
    riskFlags: wordCount < 10 ? ["Very short answer"] : [],
    followUpQuestion: `What specific detail can you add for your ${country} ${visaType} interview?`,
  });

  return {
    response: feedbackToMarkdown(feedback),
    feedback,
  };
};

const getGeminiRetryDelayMs = (error) => {
  const retryInfo = error?.errorDetails?.find((detail) => detail.retryDelay);
  const retryDelay = normalizeString(retryInfo?.retryDelay);
  const seconds = Number.parseFloat(retryDelay.replace(/s$/, ""));

  if (Number.isFinite(seconds) && seconds > 0) {
    return Math.ceil(seconds * 1000);
  }

  return 60_000;
};

const isQuotaError = (error) => error?.status === 429 || /quota|too many requests|rate limit/i.test(error?.message || "");

const buildFallbackResponse = ({ body, isRealistic = false, reason = "error", retryAfterSeconds = 0 }) => {
  if (isRealistic) {
    return {
      response: "Thank you. Please be ready to explain that with one concrete detail if asked.",
      source: "local",
      sourceReason: reason,
      retryAfterSeconds,
      model: "local-fallback",
    };
  }

  const localFeedback = buildLocalFeedback(body);

  return {
    ...localFeedback,
    source: "local",
    sourceReason: reason,
    retryAfterSeconds,
    model: "local-fallback",
  };
};

const buildFallbackQuestionsResponse = ({ body, reason = "local", retryAfterSeconds = 0 }) => ({
  questions: buildLocalQuestions(body),
  source: "local",
  sourceReason: reason,
  retryAfterSeconds,
  model: "local-question-bank",
});

const validateAgentRequest = (body = {}) => {
  const fields = {
    question: normalizeString(body.question),
    userAnswer: normalizeString(body.userAnswer),
    country: normalizeString(body.country),
    visaType: normalizeString(body.visaType),
  };

  const missing = Object.entries(fields)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  return {
    valid: missing.length === 0,
    missing,
    fields,
  };
};

const buildAgentPrompt = ({
  question,
  userAnswer,
  country,
  visaType,
  feedbackStyle = "detailed",
  sessionContext = {},
}) => {
  const isRealistic = feedbackStyle === "realistic";
  const contextBlock = buildContextBlock(sessionContext);
  const promptProfile = getPromptProfile(country, visaType);
  const rubricBlock = promptProfile.rubric.map((item) => `- ${item}`).join("\n");

  if (isRealistic) {
    return `You are acting as a visa interview officer in a ${country} ${visaType} practice interview.

Visa prompt profile: ${promptProfile.label}
Officer focus: ${promptProfile.roleFocus}

Question: "${question}"
Applicant answer: "${userAnswer}"
Applicant context:
${contextBlock}

Respond as the officer would in the moment.

Rules:
- Keep the response under 35 words.
- Do not provide coaching, scoring, or a long explanation.
- If the answer is too vague, ask one concise follow-up question.
- If the answer is adequate, acknowledge it and move on naturally.
- Do not predict or guarantee any visa outcome.`;
  }

  return `You are a visa interview practice coach helping an applicant prepare for a ${country} ${visaType} interview.

Visa prompt profile: ${promptProfile.label}
Coaching focus: ${promptProfile.roleFocus}

Question: "${question}"
Applicant answer: "${userAnswer}"
Applicant context:
${contextBlock}

Evaluate using this rubric:
${rubricBlock}

Return only valid JSON with this exact shape:
{
  "quickRead": "One sentence on how the answer lands.",
  "mainFix": "One specific improvement the applicant should make.",
  "strongerAnswer": "One improved answer in the applicant's voice.",
  "consistencyCheck": "One document or fact they should keep consistent.",
  "riskFlags": ["Up to three concise red flags or empty array."],
  "followUpQuestion": "One concise follow-up question an officer might ask."
}

Rules:
- Keep the total JSON value text under 150 words.
- Use the applicant context when it is relevant, especially funding, return plan, school/employer/host, concerns, and confidence.
- Do not predict or guarantee a visa outcome.
- Do not provide legal advice.
- Do not repeat the full applicant answer.
- Do not include Markdown or code fences.`;
};

const buildQuestionPrompt = ({
  country,
  visaType,
  sessionContext = {},
}) => {
  const contextBlock = buildContextBlock(sessionContext);
  const promptProfile = getPromptProfile(country, visaType);
  const fallbackQuestions = getQuestionBank(country, visaType).slice(0, 8).map((question) => `- ${question}`).join("\n");

  return `You are preparing a short visa interview practice session.

Destination country: ${country}
Visa type: ${visaType}
Visa prompt profile: ${promptProfile.label}
Officer focus: ${promptProfile.roleFocus}

Applicant context:
${contextBlock}

Use these common questions as coverage guidance, but personalize when context is available:
${fallbackQuestions}

Return only valid JSON with this exact shape:
{
  "questions": [
    "Question 1",
    "Question 2",
    "Question 3",
    "Question 4",
    "Question 5"
  ]
}

Rules:
- Return exactly five questions.
- Each question should sound like something a visa officer might ask.
- Cover purpose, funding, destination/program fit, return or home ties, and consistency with documents.
- If applicant context is provided, make at least two questions specific to that context.
- Do not ask for private passwords, bank account numbers, or full document uploads.
- Do not include Markdown or explanations.`;
};

// const configuration = new Configuration({
//   apiKey: process.env.OPENAI_API_KEY,
// });
// const openai = new OpenAIApi(configuration);

const getAgentResponse = async (req, res) => {
  try {
    const {
      question,
      userAnswer,
      country,
      visaType,
      feedbackStyle = "detailed",
      sessionContext = {},
    } = req.body;

    const validation = validateAgentRequest(req.body);

    if (!validation.valid) {
      return res.status(400).json({
        error: "question, userAnswer, country, and visaType are required",
        missing: validation.missing,
      });
    }

    const safeQuestion = validation.fields.question;
    const safeUserAnswer = validation.fields.userAnswer;
    const safeCountry = validation.fields.country;
    const safeVisaType = validation.fields.visaType;
    const isRealistic = feedbackStyle === "realistic";
    const prompt = buildAgentPrompt({
      question: safeQuestion,
      userAnswer: safeUserAnswer,
      country: safeCountry,
      visaType: safeVisaType,
      feedbackStyle,
      sessionContext,
    });

    if (geminiQuotaBlockedUntil > Date.now()) {
      return res.status(200).json(buildFallbackResponse({
        body: req.body,
        isRealistic,
        reason: "quota_cooldown",
        retryAfterSeconds: Math.ceil((geminiQuotaBlockedUntil - Date.now()) / 1000),
      }));
    }
    
    // const completion = await openai.createCompletion({
    //   model: "gpt-4", // or other appropriate model
    //   prompt: prompt,
    //   max_tokens: 300,
    //   temperature: 0.7,
    // });

    const result = await model.generateContent(prompt);
    const rawText = result.response.text().trim();

    if (isRealistic) {
      return res.json({
        response: rawText,
        source: "gemini",
        model: ACTIVE_MODEL,
      });
    }

    const feedback = normalizeFeedback(extractJson(rawText));

    res.json({
      response: feedbackToMarkdown(feedback),
      feedback,
      source: "gemini",
      model: ACTIVE_MODEL,
    });
    
    // res.json({ response: completion.data.choices[0].text.trim() });
  } catch (error) {
    console.error('Error in AI response:', error);
    if (req.body?.question && req.body?.userAnswer && req.body?.country && req.body?.visaType) {
      const retryDelayMs = isQuotaError(error) ? getGeminiRetryDelayMs(error) : 0;

      if (retryDelayMs) {
        geminiQuotaBlockedUntil = Date.now() + retryDelayMs;
      }

      return res.status(200).json(buildFallbackResponse({
        body: req.body,
        isRealistic: req.body.feedbackStyle === "realistic",
        reason: retryDelayMs ? "quota" : "error",
        retryAfterSeconds: Math.ceil(retryDelayMs / 1000),
      }));
    }

    res.status(500).json({ error: "Failed to generate response" });
  }
};

const getInterviewQuestions = async (req, res) => {
  try {
    const country = normalizeString(req.body?.country);
    const visaType = normalizeString(req.body?.visaType);
    const sessionContext = req.body?.sessionContext || {};

    if (!country || !visaType) {
      return res.status(400).json({
        error: "country and visaType are required",
        missing: [
          ...(!country ? ["country"] : []),
          ...(!visaType ? ["visaType"] : []),
        ],
      });
    }

    if (geminiQuotaBlockedUntil > Date.now()) {
      return res.status(200).json(buildFallbackQuestionsResponse({
        body: { country, visaType, sessionContext },
        reason: "quota_cooldown",
        retryAfterSeconds: Math.ceil((geminiQuotaBlockedUntil - Date.now()) / 1000),
      }));
    }

    const prompt = buildQuestionPrompt({ country, visaType, sessionContext });
    const result = await model.generateContent(prompt);
    const rawText = result.response.text().trim();
    const parsed = extractJson(rawText);
    const questions = normalizeQuestions(parsed.questions);

    if (questions.length !== SESSION_QUESTION_LIMIT) {
      throw new Error("Gemini returned an invalid question set");
    }

    res.json({
      questions,
      source: "gemini",
      model: ACTIVE_MODEL,
    });
  } catch (error) {
    console.error('Error generating interview questions:', error);
    const retryDelayMs = isQuotaError(error) ? getGeminiRetryDelayMs(error) : 0;

    if (retryDelayMs) {
      geminiQuotaBlockedUntil = Date.now() + retryDelayMs;
    }

    res.status(200).json(buildFallbackQuestionsResponse({
      body: req.body || {},
      reason: retryDelayMs ? "quota" : "error",
      retryAfterSeconds: Math.ceil(retryDelayMs / 1000),
    }));
  }
};

// Implement the other controller functions similarly
const getPreInterviewTips = async (req, res) => {
  try {
    const { country, visaType } = req.query;

    // Define tips based on country and visa type
    const tipsData = {
      US: {
        F1: {
          general: [
            "Be prepared to explain your study plan and future goals clearly.",
            "Know how you will finance your education and living expenses.",
            "Demonstrate a strong connection to your home country.",
          ],
          specific: [
            "Clearly articulate your academic intentions.",
            "Be aware of the program and university details.",
            "Have your financial documents readily available.",
          ],
        },
        "B1/B2": {
          general: [
            "Clearly state the purpose of your visit.",
            "Provide evidence of sufficient funds.",
            "Prove that you will return to your home country.",
          ],
          specific: [
            "Be ready to explain your itinerary.",
            "Show ties to your home country.",
            "Have information about your host or accommodation.",
          ],
        },
      },
      CA: {
        student: {
          general: [
            "Clearly state your reasons for choosing to study in Canada.",
            "Be able to explain how your studies will benefit your future career.",
            "Provide evidence of sufficient funds for tuition and living expenses.",
          ],
          specific: [
            "Know details about the institution and program.",
            "Be aware of the city where your institution is located.",
            "Be ready to explain your plans after completing your studies.",
          ],
        },
      },
      UK: {
        student: {
          general: [
            "Clearly state why you want to study in the UK.",
            "Demonstrate that you have sufficient funds.",
            "Explain your plans after completing your course.",
          ],
          specific: [
            "Know the details of your chosen institution and course.",
            "Relate the course to your previous education or career goals.",
            "Be ready to explain your accommodation plans.",
          ],
        },
      },
    };

    if (tipsData[country] && tipsData[country][visaType]) {
      res.json(tipsData[country][visaType]);
    } else {
      res.status(404).json({ error: "Tips not found for the specified country and visa type." });
    }
  } catch (error) {
    console.error('Error getting pre-interview tips:', error);
    res.status(500).json({ error: "Failed to fetch pre-interview tips" });
  }
};

const getCommonMistakes = async (req, res) => {
  try {
    const { country, visaType } = req.query;
    // Define common mistakes based on country and visa type
    const mistakesData = {
        US: {
          F1: [
            "Not being able to clearly explain your study plans and goals.",
            "Inadequate proof of financial support.",
            "Vague or inconsistent answers about ties to home country.",
            "Lack of knowledge about the chosen university or program.",
            "Appearing overly focused on post-graduation work in the U.S.",
          ],
          "B1/B2": [
            "Inability to clearly state the purpose of the visit.",
            "Inadequate proof of funds or financial support.",
            "Failure to demonstrate ties to home country.",
            "Vague travel plans or itinerary.",
            "Inconsistencies in the provided information.",
            "Insufficient knowledge about the duration or purpose of the visit.",
          ],
        },
        CA: {
          student: [
            "Not being able to clearly explain your study plans.",
            "Inadequate proof of financial support.",
            "Vague or inconsistent answers about ties to home country.",
            "Lack of knowledge about the chosen university or program.",
            "Inconsistencies in the provided information.",
            "Appearing overly focused on post-graduation work in Canada.",
          ],
        },
        UK: {
          student: [
            "Not being able to clearly explain your study plans.",
            "Inadequate proof of financial support.",
            "Vague or inconsistent answers about ties to home country.",
            "Lack of knowledge about the chosen university or program.",
            "Inconsistencies in the provided information.",
            "Appearing overly focused on post-graduation work in the UK.",
          ],
        },
      };
    if(mistakesData[country] && mistakesData[country][visaType]){
        res.json(mistakesData[country][visaType]);
    }
    else{
        res.status(404).json({ error: "Common Mistakes not found for the specified country and visa type." });
    }
  } catch (error) {
    console.error('Error getting common mistakes:', error);
    res.status(500).json({ error: "Failed to fetch common mistakes" });
  }
};

module.exports = {
  getAgentResponse,
  getInterviewQuestions,
  getPreInterviewTips,
  getCommonMistakes,
  _test: {
    buildAgentPrompt,
    buildContextBlock,
    buildFallbackQuestionsResponse,
    buildFallbackResponse,
    buildLocalFeedback,
    buildLocalQuestions,
    buildQuestionPrompt,
    extractJson,
    feedbackToMarkdown,
    getGeminiRetryDelayMs,
    normalizeQuestions,
    getPromptProfile,
    isQuotaError,
    normalizeFeedback,
    validateAgentRequest,
  },
};
