// CountrySelect.js
import React, { useState, useEffect } from 'react';
import './CountrySelect.css'; // You'll need to create this file for styling

function CountrySelect({ onSelectCountry, onSelectVisaType }) {
  const countries = [
    { value: 'US', label: 'United States' },
    { value: 'CA', label: 'Canada' },
    { value: 'UK', label: 'United Kingdom' },
    // Add more countries as needed
  ];

  const visaTypes = {
    US: [
      { value: 'F1', label: 'F1 Student Visa' },
      { value: 'B1/B2', label: 'B1/B2 Tourist/Business Visa' },
      { value: 'H1B', label: 'H1B Work Visa' },
      { value: 'O1', label: 'O1 Extraordinary Ability Visa' },
    ],
    CA: [
      { value: 'student', label: 'Student Visa' },
      { value: 'work', label: 'Work Permit' },
      { value: 'visitor', label: 'Visitor Visa' },
    ],
    UK: [
      { value: 'student', label: 'Student Visa' },
      { value: 'skilled', label: 'Skilled Worker Visa' },
      { value: 'visitor', label: 'Standard Visitor Visa' },
    ]
  };

  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedVisaType, setSelectedVisaType] = useState('');
  const [availableVisaTypes, setAvailableVisaTypes] = useState([]);

  useEffect(() => {
    if (selectedCountry) {
      setAvailableVisaTypes(visaTypes[selectedCountry] || []);
    } else {
      setAvailableVisaTypes([]);
    }
    setSelectedVisaType(''); // Reset visa type when country changes
  }, [selectedCountry]);

  const handleCountryChange = (event) => {
    setSelectedCountry(event.target.value);
  };

  const handleVisaTypeChange = (event) => {
    const visaType = event.target.value;
    setSelectedVisaType(visaType);
    
    // Only call the parent handlers when both values are selected
    if (selectedCountry && visaType) {
      onSelectCountry(selectedCountry);
      onSelectVisaType(visaType);
    }
  };

  return (
    <div className="country-visa-container">
      <h2 className="form-title">Select Country and Visa Type</h2>
      
      <div className="form-group">
        <label htmlFor="country-select">Country:</label>
        <select 
          id="country-select"
          value={selectedCountry}
          onChange={handleCountryChange}
          className="select-input"
        >
          <option value="">-- Select Country --</option>
          {countries.map((country) => (
            <option key={country.value} value={country.value}>
              {country.label}
            </option>
          ))}
        </select>
      </div>
      
      {selectedCountry && (
        <div className="form-group">
          <label htmlFor="visa-select">Visa Type:</label>
          <select
            id="visa-select"
            value={selectedVisaType}
            onChange={handleVisaTypeChange}
            className="select-input"
          >
            <option value="">-- Select Visa Type --</option>
            {availableVisaTypes.map((visa) => (
              <option key={visa.value} value={visa.value}>
                {visa.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {selectedCountry && selectedVisaType && (
        <div className="selection-summary">
          <p>You selected: <strong>{countries.find(c => c.value === selectedCountry)?.label}</strong> with 
          <strong> {availableVisaTypes.find(v => v.value === selectedVisaType)?.label}</strong></p>
        </div>
      )}
    </div>
  );
}

export default CountrySelect;