import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import logoSymbol from '../assets/images/logo-symbol.svg';
import './InfoPage.css';

const CONTACT_URL = process.env.REACT_APP_CONTACT_URL || '';

const FEEDBACK_TEMPLATE = [
  'VisaCoach feedback',
  '',
  'Visa path practiced:',
  'What I was trying to do:',
  'What felt confusing or broken:',
  'What would make this more useful:',
  'Browser/device:',
].join('\n');

const PAGE_CONTENT = {
  about: {
    title: 'About VisaCoach',
    intro: 'VisaCoach helps applicants practice short visa interview conversations before an appointment.',
    sections: [
      {
        heading: 'What it does',
        body: 'The app asks visa interview-style questions, reviews answers for clarity and consistency, and creates a practice summary the user can copy or save.',
      },
      {
        heading: 'Product boundary',
        body: 'VisaCoach is practice support only. It is not legal advice, official immigration guidance, or a prediction of any application outcome.',
      },
    ],
  },
  privacy: {
    title: 'Privacy Policy',
    intro: 'VisaCoach collects only the information needed to run practice sessions and, for signed-in users, save session history.',
    sections: [
      {
        heading: 'Practice data',
        body: 'Practice answers, feedback, selected visa path, confidence checks, and optional context may be stored locally in the browser or saved to an account when the user is signed in.',
      },
      {
        heading: 'Sensitive information',
        body: 'Users should avoid entering documents or personal details that are not needed for practice. API keys and system secrets are stored in environment variables and should never be committed.',
      },
    ],
  },
  terms: {
    title: 'Terms of Service',
    intro: 'By using VisaCoach, users agree that the product is for interview practice and preparation support.',
    sections: [
      {
        heading: 'No guarantees',
        body: 'VisaCoach does not guarantee interview performance, visa approval, or any official decision. Users remain responsible for truthful answers and complete application materials.',
      },
      {
        heading: 'Acceptable use',
        body: 'Users should use the app for lawful practice only and should not use it to create misleading, false, or fraudulent application statements.',
      },
    ],
  },
  contact: {
    title: 'Contact',
    intro: 'For product feedback, support requests, or partnership conversations, use the project owner contact channel configured for deployment.',
    sections: [
      {
        heading: 'Feedback',
        body: 'The most useful feedback includes the visa path practiced, what felt confusing, and what would make the session more helpful.',
      },
      {
        heading: 'Support',
        body: 'Do not send sensitive documents, passport numbers, bank statements, or private immigration records through general support channels.',
      },
    ],
  },
};

function InfoPage({ type = 'about' }) {
  const content = PAGE_CONTENT[type] || PAGE_CONTENT.about;
  const [copyStatus, setCopyStatus] = useState('');

  const handleCopyFeedbackTemplate = async () => {
    try {
      await navigator.clipboard.writeText(FEEDBACK_TEMPLATE);
      setCopyStatus('Feedback template copied.');
    } catch (error) {
      console.error('Unable to copy feedback template:', error);
      setCopyStatus('Copy was unavailable. Select the template text manually.');
    }
  };

  return (
    <main className="info-page">
      <div className="info-shell">
        <Link to="/" className="info-brand">
          <img src={logoSymbol} alt="VisaCoach Logo" />
          <span>VisaCoach</span>
        </Link>

        <section className="info-panel">
          <h1>{content.title}</h1>
          <p className="info-intro">{content.intro}</p>

          {content.sections.map((section) => (
            <div className="info-section" key={section.heading}>
              <h2>{section.heading}</h2>
              <p>{section.body}</p>
            </div>
          ))}

          {type === 'contact' && (
            <div className="contact-card">
              <div>
                <h2>Send useful feedback</h2>
                <p>
                  Include the visa path, what happened, what you expected, and the device or browser used.
                </p>
              </div>

              <div className="contact-actions">
                {CONTACT_URL ? (
                  <a className="info-return" href={CONTACT_URL} target="_blank" rel="noreferrer">
                    Open Contact Channel
                  </a>
                ) : (
                  <p className="contact-unconfigured">
                    Contact channel is not configured in this deployment yet.
                  </p>
                )}
                <button type="button" className="info-secondary-action" onClick={handleCopyFeedbackTemplate}>
                  Copy Feedback Template
                </button>
              </div>

              <pre className="feedback-template">{FEEDBACK_TEMPLATE}</pre>
              {copyStatus && <p className="copy-status">{copyStatus}</p>}
            </div>
          )}

          <Link to="/" className="info-return">Return to practice</Link>
        </section>
      </div>
    </main>
  );
}

export default InfoPage;
