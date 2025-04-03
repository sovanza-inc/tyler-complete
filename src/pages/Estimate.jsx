import React, { useState, useCallback, useMemo, useEffect } from 'react';
import axios from 'axios';
import '../assets/css/estimate.css';
import Breadcrums from '../Componenets/Breadcrums';

const Estimate = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [estimateData, setEstimateData] = useState([
    {
      contractor: 'Contractor A',
      estimate: 10000,
      marketValue: 10000,
      discrepancyType: 'no-discrepancy'
    },
    {
      contractor: 'Contractor B',
      estimate: 12000,
      marketValue: 11500,
      discrepancyType: 'minor-discrepancy'
    },
    {
      contractor: 'Contractor C',
      estimate: 15000,
      marketValue: 10000,
      discrepancyType: 'major-discrepancy'
    }
  ]);

  const [files, setFiles] = useState([]);
  const [filteredFiles, setFilteredFiles] = useState([]);
  const [editingFile, setEditingFile] = useState(null);
  const [newFile, setNewFile] = useState(null);

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await axios.get('/api/files/files');
        setFiles(response.data || []);
      } catch (error) {
        console.error('Error fetching files:', error);
        setFiles([]);
      }
    };

    fetchFiles();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = files.filter(file =>
        file.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredFiles(filtered || []);
    } else {
      setFilteredFiles(files || []);
    }
  }, [searchTerm, files]);

  const handleUpload = async (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await axios.post('/api/files/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setFiles((prevFiles) => [...prevFiles, response.data]);
      } catch (error) {
        console.error('Error uploading file:', error);
        alert('Failed to upload file: ' + error.message);
      }
    } else {
      alert('Please upload a valid PDF file.');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/files/${id}`);
      setFiles((prevFiles) => prevFiles.filter((file) => file.id !== id));
    } catch (error) {
      console.error('Error deleting file:', error);
      alert('Failed to delete file: ' + error.message);
    }
  };

  const handleEdit = async (id) => {
    setEditingFile(id);
    setNewFile(null);
  };

  const handleSaveEdit = async (id) => {
    if (newFile) {
      const formData = new FormData();
      formData.append('file', newFile);

      try {
        const response = await axios.put(`/api/files/${id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setFiles((prevFiles) =>
          prevFiles.map((file) => (file.id === id ? response.data : file))
        );
        setEditingFile(null);
      } catch (error) {
        console.error('Error updating file:', error);
        alert('Failed to update file: ' + error.message);
      }
    } else {
      alert('Please upload a new file to replace the existing one.');
    }
  };

  const handleCancelEdit = useCallback(() => {
    setEditingFile(null);
  }, []);

  const handleNewFileChange = useCallback((event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      setNewFile(file);
    } else {
      alert('Please upload a valid PDF file.');
    }
  }, []);

  const handleNotifyTeam = useCallback(() => {
    alert('Team Notified');
  }, []);

  const handleDownloadReport = useCallback(() => {
    alert('Downloading Comprehensive Estimate Report');
  }, []);

  const handleFlagReview = useCallback(() => {
    alert('Estimates Flagged for Detailed Review');
  }, []);

  const getDiscrepancyLabel = useMemo(() => ({
    'no-discrepancy': 'No Discrepancy',
    'minor-discrepancy': 'Minor Discrepancy',
    'major-discrepancy': 'Major Discrepancy'
  }), []);

  const renderDiscrepancyTag = useCallback((type) => {
    return (
      <span className={`discrepancy ${type}`}>
        {getDiscrepancyLabel[type]}
      </span>
    );
  }, [getDiscrepancyLabel]);

  return (
    <div className="estimate-container">
      <div className="estimate-header">
        <div className="estimate-title">
          <Breadcrums name="Estimate" />
        </div>
      </div>

      <div className="upload-section">
        <input 
          type="text" 
          className="upload-input" 
          placeholder="Search contractor estimates" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <input 
          type="file" 
          id="file-upload" 
          style={{ display: 'none' }} 
          onChange={handleUpload} 
          accept="application/pdf"
        />
        <label htmlFor="file-upload" className="action-button upload-button">
          Upload PDF
        </label>
      </div>

      <div className="files-list">
        {Array.isArray(filteredFiles) && filteredFiles.length > 0 ? (
          filteredFiles.map((file) => (
            <div key={file.id} className="file-item">
              {editingFile === file.id ? (
                <div className="edit-file-section">
                  <input 
                    type="file" 
                    id={`edit-file-${file.id}`} 
                    style={{ display: 'none' }} 
                    onChange={handleNewFileChange} 
                    accept="application/pdf"
                  />
                  <label htmlFor={`edit-file-${file.id}`} className="action-button edit-file-button">
                    Choose New File
                  </label>
                  {newFile && <span>{newFile.name}</span>}
                </div>
              ) : (
                <span>{file.name}</span>
              )}
              <div className="file-actions">
                {editingFile === file.id ? (
                  <>
                    <button className="save-button" onClick={() => handleSaveEdit(file.id)}>Save</button>
                    <button className="cancel-button" onClick={handleCancelEdit}>Cancel</button>
                  </>
                ) : (
                  <>
                    <button className="edit-button" onClick={() => handleEdit(file.id)}>Edit</button>
                    <button className="delete-button" onClick={() => handleDelete(file.id)}>Delete</button>
                    <a href={file.url} target="_blank" rel="noopener noreferrer" className="view-button">View</a>
                  </>
                )}
              </div>
            </div>
          ))
        ) : (
          <p>No files found.</p>
        )}
      </div>

      <div className="comparison-table">
        <div className="comparison-header">
          <h3>Estimate Comparisons</h3>
        </div>
        <div className="comparison-row">
          <ul>
            <li>Contractor</li>
            <li>Estimate</li>
            <li>Market Value</li>
            <li>Discrepancy</li>
          </ul>
        </div>
        {estimateData.map((entry, index) => (
          <div key={index} className="comparison-row">
            <ul>
              <li>{entry.contractor}</li>
              <li>${entry.estimate.toLocaleString()}</li>
              <li>${entry.marketValue.toLocaleString()}</li>
              <li>
                {renderDiscrepancyTag(entry.discrepancyType)}
              </li>
            </ul>
          </div>
        ))}
      </div>

      <div className="actions-section">
        <div className="actions-header">
          <h3>Actions</h3>
        </div>
        <div className="actions-buttons">
          <button 
            className="action-button notify-button" 
            onClick={handleNotifyTeam}
          >
            Notify Team
          </button>
          <button 
            className="action-button download-button" 
            onClick={handleDownloadReport}
          >
            Download Report
          </button>
          <button 
            className="action-button flag-button" 
            onClick={handleFlagReview}
          >
            Flag for Review
          </button>
        </div>
      </div>
    </div>
  );
};

export default Estimate;