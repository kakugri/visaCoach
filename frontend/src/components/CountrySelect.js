import React, { useState, useEffect } from 'react';

function CountrySelect({ onSelectCountry, onSelectVisaType }) {
  const countries = [
    { value: 'US', label: 'United States' },
    { value: 'CA', label: 'Canada' }, // Add more countries later
    { value: 'UK', label: 'United Kingdom' }, 
  ];

  const visaTypes = {
    US: [
      { value: 'F1', label: 'F1 Student Visa' },
      { value: 'B1/B2', label: 'B1/B2 Tourist/Business Visa' }, // Add more visa types for the US
    ],
    CA: [ // Visa types for Canada
      { value: 'student', label: 'Student Visa' },
    ],
    UK: [ // Visa types for UK
     { value: 'student', label: 'Student Visa' },
    ]
    // Add more countries and visa types later
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
    // We will call onSelectCountry later, when both country and visa are selected
  };

  const handleVisaTypeChange = (event) => {
    const visaType = event.target.value;
    setSelectedVisaType(visaType);
    // Call onSelectCountry and onSelectVisaType when both country and visa type are selected
    onSelectCountry(selectedCountry); // Pass the country value
    onSelectVisaType(visaType); // Pass the visa type
  };

  return (
    <div>
      <h2>Select Country and Visa Type</h2>
      <div>
        <select onChange={handleCountryChange} value={selectedCountry}>
          <option value="">-- Select Country --</option>
          {countries.map((country) => (
            <option key={country.value} value={country.value}>
              {country.label}
            </option>
          ))}
        </select>
      </div>

      {selectedCountry && (
        <div>
          <select onChange={handleVisaTypeChange} value={selectedVisaType}>
            <option value="">-- Select Visa Type --</option>
            {availableVisaTypes.map((visa) => (
              <option key={visa.value} value={visa.value}>
                {visa.label}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}

export default CountrySelect;
