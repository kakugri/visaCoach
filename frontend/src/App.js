import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import InterviewPage from './pages/InterviewPage';
import LandingPage from './pages/LandingPage';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false); // User state

  return (
    <BrowserRouter>
      <div className="app-container">
        <Routes>
          <Route
            path="/"
            element={<LandingPage setIsLoggedIn={setIsLoggedIn} />}
          />
          <Route
            path="/interview"
            element={isLoggedIn ? <InterviewPage /> : <Navigate to="/" />}
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;


// // /mnt/c/Users/akugr/OneDrive/Desktop/Projects/visaCoach/frontend/src/App.js
// import React from 'react';
// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import InterviewPage from './pages/InterviewPage';

// function App() {
//   return (
//     <Router>
//       <div className="app-container">
//         <Routes>
//           <Route path="/" element={<InterviewPage />} /> {/* InterviewPage is now the root */}
//         </Routes>
//       </div>
//     </Router>
//   );
// }

// export default App;
