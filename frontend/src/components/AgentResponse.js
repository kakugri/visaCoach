import React from 'react';

function AgentResponse({ question, response }) {
  return (
    <div className="agent-response">
      <p><b>Visa Officer:</b> {question}</p>
      {response && <p><b>Your Response Feedback:</b> {response}</p>}
    </div>
  );
}

export default AgentResponse;