import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const TableView = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { tableData, fileName } = location.state || {};

  if (!tableData) {
    return (
      <div className="table-view-container">
        <h2>No Table Data Available</h2>
        <button onClick={() => navigate(-1)} className="back-button">
          Back to Files
        </button>
      </div>
    );
  }

  return (
    <div className="table-view-container">
      <h2>Extracted Table from: {fileName}</h2>
      <div className="table-wrapper">
        {tableData.columns.length > 0 ? (
          <table>
            <thead>
              <tr>
                {tableData.columns.map((column, index) => (
                  <th key={index}>{column}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableData.rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No table data was extracted from this file.</p>
        )}
      </div>
      <button 
        onClick={() => navigate(-1)}
        className="back-button"
      >
        Back to Files
      </button>
    </div>
  );
};

export default TableView;
