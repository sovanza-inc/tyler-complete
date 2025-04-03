import React, { useState } from 'react';
import '../assets/css/contracts.css';
import Breadcrums from '../Componenets/Breadcrums';

const Contracts = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleUpload = () => {
    // Implement upload logic
    console.log('Uploading contract:', searchTerm);
  };

  return (
    <div className="contracts-container">
      <div className="contracts-header">
        <div className="contracts-title">
          <Breadcrums name="Contract" />
        </div>
      </div>

      <div className="upload-section">
        <input 
          type="text" 
          className="upload-input" 
          placeholder="Search or upload contract" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button 
          className="upload-button" 
          onClick={handleUpload}
        >
          Upload
        </button>
      </div>

      <div className="flagged-section">
        <div className="flagged-header">
          <h3>Review Flagged Sections</h3>
        </div>
        <div className="flagged-row">
          <ul>
            <li>Section</li>
            <li>Issue Directed</li>
            <li>Details</li>
          </ul>
        </div>
        <div className="flagged-row">
          <ul>
            <li>Section 1.2</li>
            <li>
              <span className="issue-tag compliance-issue">
                Compliance Issue
              </span>
            </li>
            <li>Missing required clause</li>
          </ul>
        </div>
        <div className="flagged-row">
          <ul>
            <li>Section 3.4</li>
            <li>
              <span className="issue-tag missing-clause">
                Missing Clause
              </span>
            </li>
            <li>Clause 3.4.1 is required</li>
          </ul>
        </div>
      </div>

      <div className="comparison-section">
        <div className="comparison-header">
          <h3>Side-by-Side Comparison</h3>
        </div>
        <div className="comparison-containers">
          <div className="comparison-container">
            <div className="comparison-container-header">
              Upload Contract
            </div>
            <div className="comparison-container-content">
              [Uploaded contract content with highlighted issues]
            </div>
          </div>
          <div className="comparison-container">
            <div className="comparison-container-header">
              Reference Contract
            </div>
            <div className="comparison-container-content">
              [Reference contract content for comparison]
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contracts;
