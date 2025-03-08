// CountrySelect.js
import React, { useState, useEffect } from 'react';
import './CountrySelect.css';

function CountrySelect({ onSelectCountry, onSelectVisaType, selectedCountry }) {
  const countries = [
    { 
      value: 'US', 
      label: 'United States', 
      flagCode: 'us',
      description: 'One of the most popular destinations for education, business, and tourism.'
    },
    { 
      value: 'CA', 
      label: 'Canada', 
      flagCode: 'ca',
      description: 'Known for its welcoming immigration policies and high quality of life.'
    },
    { 
      value: 'UK', 
      label: 'United Kingdom', 
      flagCode: 'gb',
      description: 'A global hub for education, business, and cultural experiences.'
    },
    { 
      value: 'AU', 
      label: 'Australia', 
      flagCode: 'au',
      description: 'Popular for its excellent universities and working holiday options.'
    },
    { 
      value: 'NZ', 
      label: 'New Zealand', 
      flagCode: 'nz',
      description: 'Known for its stunning landscapes and quality education system.'
    },
    { 
      value: 'DE', 
      label: 'Germany', 
      flagCode: 'de',
      description: 'Europe\'s economic powerhouse with many tuition-free universities.'
    },
    { 
      value: 'FR', 
      label: 'France', 
      flagCode: 'fr',
      description: 'Famous for its culture, cuisine, and education opportunities.'
    },
    { 
      value: 'JP', 
      label: 'Japan', 
      flagCode: 'jp',
      description: 'Combining traditional culture with cutting-edge technology and education.'
    }
  ];

  const visaTypes = {
    US: [
      { value: 'F1', label: 'F1 Student Visa', icon: '🎓', description: 'For academic students enrolled in US colleges, universities, or language programs' },
      { value: 'B1/B2', label: 'B1/B2 Tourist/Business Visa', icon: '✈️', description: 'For temporary visitors for business or pleasure' },
      { value: 'H1B', label: 'H1B Work Visa', icon: '💼', description: 'For specialty occupations requiring theoretical or technical expertise' },
      { value: 'O1', label: 'O1 Extraordinary Ability Visa', icon: '🌟', description: 'For individuals with extraordinary ability in sciences, arts, education, business, or athletics' },
      { value: 'J1', label: 'J1 Exchange Visitor Visa', icon: '🔄', description: 'For approved exchange visitor programs' }
    ],
    CA: [
      { value: 'student', label: 'Student Visa', icon: '🎓', description: 'For international students accepted by a Canadian educational institution' },
      { value: 'work', label: 'Work Permit', icon: '💼', description: 'For temporary foreign workers with valid job offers' },
      { value: 'visitor', label: 'Visitor Visa', icon: '✈️', description: 'For temporary visitors for tourism or family visits' },
      { value: 'business', label: 'Business Visa', icon: '📊', description: 'For business meetings, conferences, or negotiations' },
      { value: 'express', label: 'Express Entry', icon: '🚀', description: 'For skilled workers seeking permanent residence' }
    ],
    UK: [
      { value: 'student', label: 'Student Visa', icon: '🎓', description: 'For studying at a UK educational institution' },
      { value: 'skilled', label: 'Skilled Worker Visa', icon: '💼', description: 'For qualified professionals with job offers' },
      { value: 'visitor', label: 'Standard Visitor Visa', icon: '✈️', description: 'For tourism, visiting family/friends, or business activities' },
      { value: 'startup', label: 'Start-up Visa', icon: '🚀', description: 'For entrepreneurs starting an innovative business' },
      { value: 'family', label: 'Family Visa', icon: '👪', description: 'For joining family members who are UK citizens or settled persons' }
    ],
    AU: [
      { value: 'student', label: 'Student Visa (Subclass 500)', icon: '🎓', description: 'For international students enrolled in Australian courses' },
      { value: 'work', label: 'Temporary Skill Shortage Visa', icon: '💼', description: 'For skilled workers with employer sponsorship' },
      { value: 'visitor', label: 'Visitor Visa', icon: '✈️', description: 'For tourism, business visits, or family visits' },
      { value: 'working-holiday', label: 'Working Holiday Visa', icon: '🏄', description: 'For young adults wanting to work and travel in Australia' }
    ],
    NZ: [
      { value: 'student', label: 'Student Visa', icon: '🎓', description: 'For international students accepted by NZ educational institutions' },
      { value: 'work', label: 'Work Visa', icon: '💼', description: 'For skilled workers with job offers' },
      { value: 'visitor', label: 'Visitor Visa', icon: '✈️', description: 'For tourism or short business visits' }
    ],
    DE: [
      { value: 'student', label: 'Student Visa', icon: '🎓', description: 'For studying at German universities or language schools' },
      { value: 'work', label: 'Work Visa', icon: '💼', description: 'For qualified professionals with job offers' },
      { value: 'jobseeker', label: 'Job Seeker Visa', icon: '🔍', description: 'For qualified professionals seeking employment' }
    ],
    FR: [
      { value: 'student', label: 'Student Visa', icon: '🎓', description: 'For studying at French educational institutions' },
      { value: 'work', label: 'Work Visa', icon: '💼', description: 'For temporary workers with contracts' },
      { value: 'visitor', label: 'Visitor Visa', icon: '✈️', description: 'For tourism or short-term visits' }
    ],
    JP: [
      { value: 'student', label: 'Student Visa', icon: '🎓', description: 'For studying at Japanese schools or universities' },
      { value: 'work', label: 'Work Visa', icon: '💼', description: 'For skilled workers in designated fields' },
      { value: 'tourist', label: 'Tourist Visa', icon: '✈️', description: 'For short-term visits for tourism' }
    ]
  };

  const [countrySelection, setCountrySelection] = useState(selectedCountry || '');
  const [visaTypeSelection, setVisaTypeSelection] = useState('');
  const [availableVisaTypes, setAvailableVisaTypes] = useState([]);
  const [visaTypeExpanded, setVisaTypeExpanded] = useState(false);
  const [hoverInfo, setHoverInfo] = useState({ visible: false, content: '', type: '' });

  useEffect(() => {
    if (countrySelection) {
      setAvailableVisaTypes(visaTypes[countrySelection] || []);
    } else {
      setAvailableVisaTypes([]);
    }
    setVisaTypeSelection(''); // Reset visa type when country changes
  }, [countrySelection]);

  const handleCountryChange = (country) => {
    setCountrySelection(country);
    setVisaTypeExpanded(true);
  };

  const handleVisaTypeChange = (visaType) => {
    setVisaTypeSelection(visaType);
    
    // Only call the parent handlers when both values are selected
    if (countrySelection && visaType) {
      onSelectCountry(countrySelection);
      onSelectVisaType(visaType);
    }
  };

  const handleInfoHover = (content, type) => {
    setHoverInfo({ visible: true, content, type });
  };

  const handleInfoLeave = () => {
    setHoverInfo({ visible: false, content: '', type: '' });
  };

  const getSelectedCountryData = () => {
    return countries.find(c => c.value === countrySelection) || {};
  };

  const getSelectedVisaData = () => {
    return availableVisaTypes.find(v => v.value === visaTypeSelection) || {};
  };

  return (
    <div className="country-visa-container">
      <h2 className="form-title">Where are you going?</h2>
      
      <div className="country-grid">
        {countries.map((country) => (
          <div 
            key={country.value}
            className={`country-card ${countrySelection === country.value ? 'selected' : ''}`}
            onClick={() => handleCountryChange(country.value)}
            onMouseEnter={() => handleInfoHover(country.description, 'country')}
            onMouseLeave={handleInfoLeave}
          >
            <div className="country-flag">
              <span className={`fi fi-${country.flagCode}`}></span>
            </div>
            <span className="country-name">{country.label}</span>
          </div>
        ))}
      </div>
      
      {countrySelection && (
        <div className={`visa-type-container ${visaTypeExpanded ? 'expanded' : ''}`}>
          <h3 className="visa-section-title">
            <span className="section-number">2</span> Select Visa Type for {getSelectedCountryData().label}
          </h3>
          
          <div className="visa-type-grid">
            {availableVisaTypes.map((visa) => (
              <div 
                key={visa.value}
                className={`visa-type-card ${visaTypeSelection === visa.value ? 'selected' : ''}`}
                onClick={() => handleVisaTypeChange(visa.value)}
                onMouseEnter={() => handleInfoHover(visa.description, 'visa')}
                onMouseLeave={handleInfoLeave}
              >
                <div className="visa-icon">{visa.icon}</div>
                <span className="visa-name">{visa.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {hoverInfo.visible && (
        <div className="info-tooltip">
          <p>{hoverInfo.content}</p>
        </div>
      )}

      {countrySelection && visaTypeSelection && (
        <div className="selection-summary">
          <div className="summary-header">
            <div className="summary-icon">✓</div>
            <h3>You've selected:</h3>
          </div>
          <div className="summary-details">
            <div className="summary-country">
              <span className={`fi fi-${getSelectedCountryData().flagCode}`}></span>
              <span>{getSelectedCountryData().label}</span>
            </div>
            <div className="summary-visa">
              <span className="visa-icon-small">{getSelectedVisaData().icon}</span>
              <span>{getSelectedVisaData().label}</span>
            </div>
          </div>
          <p className="ready-message">You're ready to begin your interview preparation!</p>
        </div>
      )}
    </div>
  );
}

export default CountrySelect;