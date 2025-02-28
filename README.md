# visaCoach - Visa Interview Prep App

This application helps users prepare for their visa interviews through a simulated interview experience. It provides a basic interview flow with feedback and allows users to select a country and visa type. This is a Minimum Viable Product (MVP) version, with more features and improvements to come in the future.

## Features

*   **Simulated Visa Interview:** Users can go through a series of questions similar to what they might experience in a real visa interview.
*   **Country and Visa Type Selection:** Users can select the country and visa type for their simulated interview.
*   **Mock Feedback:** The app provides basic feedback on user responses, simulating what a visa officer might say.
* **Google Login**: Users can use their google account to login.

## Current Limitations (MVP)

*   **Mock Agent Service:** The feedback given by the "Visa Officer" is currently mocked. It is based on simple keyword matching and does not involve any real AI/GPT service.
*   **Limited Question Set:** The number of questions and scenarios are limited and hardcoded for the US F1 visa.
* **Basic Backend**: The backend only validates the google token.

## Technologies Used

*   **Frontend:**
    *   React (v19.0.0)
    *   React Router DOM (v6.22.2)
    * `@react-oauth/google` (v0.12.1)
    *   Create React App (react-scripts v5.0.1)
*   **Backend:**
    *   Node.js
    *   Express.js (v4.18.2)
    *   cors (v2.8.5)
    *   dotenv (v16.4.7)
    * `google-auth-library` (v9.15.1)
* **Other**
    * concurrently (v9.1.2)

## Setup and Run (Local Testing)

This project uses a monorepo structure to manage both the frontend and backend code within a single repository.

**Prerequisites**

*   Node.js and npm installed on your machine.
*   A Google Cloud Project with an OAuth 2.0 Client ID configured.
*   `.env` file in the project root with the following content:
    ```
    REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
    ```

**Installation**

1.  Clone the repository: `git clone <your-repo-url>`
2.  Navigate to the project root directory: `cd visaCoach`
3.  Install dependencies: `npm install`
4.  Navigate to the backend directory `cd backend`
5.  Install dependencies: `npm install`
6.  Go back to root directory `cd ..`

**Running the Development Servers**

1.  **Start the entire project:** From the project root directory, run:
    ```bash
    npm start
    ```

    This script will:
    *   Copy your `.env` file to the backend directory (`cp .env backend/.env`).
    *   Start the backend server using `cd backend && node server.js`.
    *   Start the frontend development server using `cd frontend && npm start`.
    *   Start the project concurrently, so you don't need to open multiple terminal window.

**Important Notes**

* Make sure your `.env` file (in the root) includes the right `REACT_APP_GOOGLE_CLIENT_ID` value.
* The backend runs on `http://localhost:5000`.
* The frontend will run on `http://localhost:3000`.
* **Google OAuth**: Make sure to go to your google account to add `http://localhost:3000` as an authorized Javascript origin.
* If you change the backend, you will need to restart the backend. If you change the front end, the server will restart automatically.

**Accessing the App**

*   Once both the frontend and backend servers are running, open your web browser and go to `http://localhost:3000`.

## Future Improvements

*   Integrate with a real GPT/AI service to provide more accurate and meaningful feedback.
*   Expand the set of questions and scenarios to cover a wider range of visa types and countries.
*   Add user profiles and history tracking.
*   Improve the UI/UX to be more engaging and user-friendly.
*   Add more tests.
* Improve error messages.
* Add more documentation.

## Contact

If you have any questions or suggestions, feel free to contact me.

## License

[Add your license here, e.g., MIT License]
