import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { API_BASE_URL } from '../services/apiConfig';

function GoogleAuth({ onLoginSuccess = () => {}, onLoginError = () => {} }) {
  if (!process.env.REACT_APP_GOOGLE_CLIENT_ID) {
    return null;
  }

  const handleLoginSuccess = async (credentialResponse) => {
    console.log('Google Login Success:', credentialResponse);

    try {
      // Send the token to the backend for verification
      const backendResponse = await fetch(`${API_BASE_URL}/api/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: credentialResponse.credential }),
      });

      if (backendResponse.ok) {
        const data = await backendResponse.json();
        console.log('Backend verification successful:', data);
        await onLoginSuccess(data.user, data.token);
      } else {
        const errorData = await backendResponse.json();
        console.error('Backend verification failed:', errorData);
        onLoginError(errorData.error || "Login failed");
      }
    } catch (error) {
      console.error('Error handling Google login:', error);
      onLoginError("Login failed");
    }
  };

  return (
    <div>
      <GoogleLogin
        onSuccess={handleLoginSuccess}
        onError={() => {
          console.error('Google Login Failed');
          onLoginError("Login failed");
        }}
        useOneTap
      />
    </div>
  );
}

export default GoogleAuth;
