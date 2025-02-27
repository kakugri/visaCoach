# visaCoach
visa prep app

# Visa Interview Prep App - MVP

This is a Minimum Viable Product (MVP) for a Visa Interview Preparation Application.

## Setup and Run (Local Testing)

**Frontend (React):**

1.  Navigate to the `frontend` directory in your terminal: `cd frontend`
2.  Install dependencies: `npm install`
3.  Start the frontend development server: `npm start`
    *   This will usually open the app in your browser at `http://localhost:3000`

**Backend (Node.js/Express):**

1.  Open a **new** terminal window.
2.  Navigate to the `backend` directory: `cd backend`
3.  Install dependencies: `npm install`
4.  Start the backend server: `node server.js`
    *   The backend will run on `http://localhost:5000` (or the port defined in `backend/server.js`)

**Accessing the App:**

*   Once both frontend and backend (if you choose to test backend route) are running, open your browser and go to `http://localhost:3000`.

**Note:**

*   This is a basic MVP for local testing. The agent responses are currently mocked in the `frontend/src/services/mockAgentService.js` file for simplicity.
*   To integrate with a real GPT service, you would replace the mock service with code to call the GPT API in a later iteration.
*   The backend is very minimal in this MVP and mainly serves as a placeholder for future backend functionality.

Enjoy testing your Visa Prep MVP!
