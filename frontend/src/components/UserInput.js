import React, { useState } from 'react';

function UserInput({ onResponseSubmit }) {
  const [userResponse, setUserResponse] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    onResponseSubmit(userResponse);
    setUserResponse(''); // Clear input after submit
  };

  const handleChange = (event) => {
    setUserResponse(event.target.value);
  };

  return (
    <form onSubmit={handleSubmit}>
      <textarea
        placeholder="Type your response here..."
        value={userResponse}
        onChange={handleChange}
        rows="3"
        style={{ width: '100%', marginBottom: '10px' }}
      />
      <button type="submit">Submit Response</button>
    </form>
  );
}

export default UserInput;