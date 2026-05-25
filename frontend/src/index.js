import React from "react";
import ReactDOM from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import './styles/index.css'; // Import global styles
import App from "./App";

const CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID; // Ensure this is set in .env

const app = CLIENT_ID ? (
    <GoogleOAuthProvider clientId={CLIENT_ID}>
        <App />
    </GoogleOAuthProvider>
) : (
    <App />
);

ReactDOM.createRoot(document.getElementById("root")).render(app);

