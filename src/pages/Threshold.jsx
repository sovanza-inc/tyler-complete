import React, { useState, useCallback, useMemo } from 'react';
import '../assets/css/threshold.css';

const Threshold = () => {
  const [thresholdData, setThresholdData] = useState({
    analysisThreshold: '',
    alertThreshold: '',
    projectThreshold: ''
  });

  const [validationErrors, setValidationErrors] = useState({});

  const validateThreshold = useCallback((name, value) => {
    const numValue = parseFloat(value);
    const errors = { ...validationErrors };

    if (value === '') {
      errors[name] = 'Threshold cannot be empty';
    } else if (isNaN(numValue)) {
      errors[name] = 'Must be a valid number';
    } else if (numValue < 0 || numValue > 100) {
      errors[name] = 'Must be between 0 and 100';
    } else {
      delete errors[name];
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [validationErrors]);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setThresholdData(prev => ({
      ...prev,
      [name]: value
    }));
    validateThreshold(name, value);
  }, [validateThreshold]);

  const handleAnalyze = useCallback(() => {
    const isValid = Object.keys(thresholdData).every(key => 
      validateThreshold(key, thresholdData[key])
    );

    if (isValid) {
      const processedThresholds = {
        analysisThreshold: parseFloat(thresholdData.analysisThreshold),
        alertThreshold: parseFloat(thresholdData.alertThreshold),
        projectThreshold: parseFloat(thresholdData.projectThreshold)
      };

      console.log('Analyzing thresholds:', processedThresholds);
      // Simulate API call or complex analysis
      alert('Thresholds analyzed successfully');
    } else {
      alert('Please correct the errors in the thresholds');
    }
  }, [thresholdData, validateThreshold]);

  const thresholdFields = useMemo(() => [
    {
      name: 'analysisThreshold',
      label: 'Analysis Threshold',
      placeholder: 'Enter analysis threshold'
    },
    {
      name: 'alertThreshold',
      label: 'Alert Threshold',
      placeholder: 'Enter alert threshold'
    },
    {
      name: 'projectThreshold',
      label: 'Project Threshold',
      placeholder: 'Enter project threshold'
    }
  ], []);

  return (
    <div className="container">
      <div className="content-section">
        <div className="section-header">
          <h2 className="section-title">Define Precision Thresholds</h2>
        </div>

        <div className="threshold-options">
          {thresholdFields.map(({ name, label, placeholder }) => (
            <div key={name} className="threshold-option">
              <div className="threshold-option-title">
                {label}
              </div>
              <input 
                type="number" 
                name={name}
                step="0.01"
                min="0"
                max="100"
                value={thresholdData[name]}
                onChange={handleInputChange}
                placeholder={placeholder}
                className={validationErrors[name] ? 'error' : ''}
              />
              {validationErrors[name] && (
                <div className="error">{validationErrors[name]}</div>
              )}
            </div>
          ))}

          <div className="threshold-actions">
            <button 
              className="analyze-button"
              onClick={handleAnalyze}
              disabled={Object.keys(validationErrors).length > 0}
            >
              Analyze Thresholds
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Threshold;
