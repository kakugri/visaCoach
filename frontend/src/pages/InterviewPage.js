import React, { useState } from 'react';
import CountrySelect from '../components/CountrySelect';
import InterviewScreen from '../components/InterviewScreen';

function InterviewPage() {
  const [selectedCountry, setSelectedCountry] = useState('');

  const handleCountrySelect = (country) => {
    setSelectedCountry(country);
  };

  return (
    <div>
      <h1>Visa Interview Prep</h1>
      {!selectedCountry ? (
        <CountrySelect onSelectCountry={handleCountrySelect} />
      ) : (
        <InterviewScreen selectedCountry={selectedCountry} />
      )}
    </div>
  );
}

export default InterviewPage;