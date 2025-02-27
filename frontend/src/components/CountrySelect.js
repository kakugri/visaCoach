import React from 'react';

function CountrySelect({ onSelectCountry }) {
  const countries = [
    { value: 'US_F1', label: 'United States - F1 Student Visa' }, // MVP Focus
    // Add more countries later
  ];

  const handleChange = (event) => {
    onSelectCountry(event.target.value);
  };

  return (
    <div>
      <h2>Select Visa Type</h2>
      <select onChange={handleChange}>
        <option value="">-- Select --</option>
        {countries.map((country) => (
          <option key={country.value} value={country.value}>
            {country.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default CountrySelect;