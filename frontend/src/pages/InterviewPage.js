import React, { useState } from 'react';
import CountrySelect from '../components/CountrySelect';
import InterviewScreen from '../components/InterviewScreen';

function InterviewPage() {
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedVisaType, setSelectedVisaType] = useState('');

  const handleCountrySelect = (country) => {
    setSelectedCountry(country);
  };

  const handleVisaTypeSelect = (visaType) => {
    setSelectedVisaType(visaType);
  };

  const handleGoBack = () => {
    setSelectedCountry('');
    setSelectedVisaType('');
  };

  return (
    <div>
      <h1>Visa Interview Prep</h1>
      {!selectedCountry || !selectedVisaType ? (
        <CountrySelect
          onSelectCountry={handleCountrySelect}
          onSelectVisaType={handleVisaTypeSelect}
        />
      ) : (
        <InterviewScreen
          selectedCountry={selectedCountry}
          selectedVisaType={selectedVisaType}
          onGoBack={handleGoBack} // Pass handleGoBack as onGoBack prop
        />
      )}
    </div>
  );
}

export default InterviewPage;
