import React, { useState, useCallback } from 'react';
import '../assets/css/blueprint.css';
import InputFile from '../Componenets/InputFile';
import Breadcrums from '../Componenets/Breadcrums';

const Blueprint = () => {
  const [formData, setFormData] = useState({
    blueprintUrl: '',
    projectNumber: '',
    projectName: '',
    imageLink: '',
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [highlightAnomalies, setHighlightAnomalies] = useState(false);
  const [highlightDiscrepancies, setHighlightDiscrepancies] = useState(false);

  const validateField = useCallback((name, value) => {
    const errors = { ...validationErrors };

    switch (name) {
      case 'blueprintUrl':
        errors.blueprintUrl = !value || !value.match(/^https?:\/\/\S+$/) 
          ? 'Please enter a valid URL' 
          : '';
        break;
      case 'projectNumber':
        errors.projectNumber = !value || value.trim().length < 3
          ? 'Project number must be at least 3 characters'
          : '';
        break;
      case 'projectName':
        errors.projectName = !value || value.trim().length < 2
          ? 'Project name must be at least 2 characters'
          : '';
        break;
      case 'imageLink':
        errors.imageLink = value && !value.match(/^https?:\/\/\S+$/)
          ? 'Please enter a valid image URL'
          : '';
        break;
      default:
        break;
    }

    setValidationErrors(errors);
    return Object.values(errors).every(error => error === '');
  }, [validationErrors]);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    validateField(name, value);
  }, [validateField]);

  const toggleSwitch = useCallback((setter) => {
    setter(prev => !prev);
  }, []);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    const isValid = Object.keys(formData).every(key => 
      validateField(key, formData[key])
    );

    if (isValid) {
      const blueprintData = {
        ...formData,
        highlightAnomalies,
        highlightDiscrepancies
      };

      console.log('Blueprint Submission:', blueprintData);
      // Add your submission logic here
      alert('Blueprint submitted successfully');
    } else {
      alert('Please correct the errors in the form');
    }
  }, [formData, highlightAnomalies, highlightDiscrepancies, validateField]);

  return (
    <div className="blueprint-container">
      <div className="blueprint-header">
        <div className="blueprint-title">
          <Breadcrums name="Blueprint" />
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="blueprint-form">
          {Object.entries({
            blueprintUrl: 'Blueprint URL',
            projectNumber: 'Project Number',
            projectName: 'Project Name',
            imageLink: 'Image Link'
          }).map(([key, label]) => (
            <div key={key} className="blueprint-form-group">
              <label className="blueprint-form-label">{label}</label>
              <input 
                type={key === 'imageLink' || key === 'blueprintUrl' ? 'url' : 'text'}
                name={key}
                className={`blueprint-input ${validationErrors[key] ? 'is-invalid' : ''}`}
                placeholder={`Enter ${label.toLowerCase()}`}
                value={formData[key]}
                onChange={handleInputChange}
                required={key !== 'imageLink'}
              />
              {validationErrors[key] && (
                <div className="validation-error">{validationErrors[key]}</div>
              )}
            </div>
          ))}
        </div>

        <div className="blueprint-file-upload">
          <InputFile />
        </div>

        <div className="visual-overlay">
          <div className="visual-overlay-header">
            Visual Overlay Tools
          </div>
          <div className="visual-overlay-options">
            {[
              { 
                label: 'Highlight Anomalies', 
                state: highlightAnomalies, 
                setter: setHighlightAnomalies 
              },
              { 
                label: 'Highlight Discrepancies', 
                state: highlightDiscrepancies, 
                setter: setHighlightDiscrepancies 
              }
            ].map(({ label, state, setter }) => (
              <div key={label} className="visual-overlay-option">
                <span>{label}</span>
                <div 
                  className={`visual-overlay-toggle ${state ? 'active' : ''}`}
                  onClick={() => toggleSwitch(setter)}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="blueprint-actions">
          <button type="submit" className="blueprint-submit-button">
            Submit Blueprint
          </button>
        </div>
      </form>
    </div>
  );
};

export default Blueprint;