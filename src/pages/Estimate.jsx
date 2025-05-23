import React, { useState, useCallback, useMemo, useEffect } from 'react';
import axios from 'axios';
import '../assets/css/estimate.css';
import { useNavigate } from 'react-router-dom';
import Breadcrums from '../Componenets/Breadcrums';
import Swal from 'sweetalert2';

// API URL configuration
const isDevelopment = process.env.NODE_ENV === 'development';
const API_BASE_URL = isDevelopment
  ? import.meta.env.APP_API_URL || 'http://localhost:5000'
  : 'https://tyler-complete-slvb.vercel.app';

const Estimate = () => {
  const navigate = useNavigate();
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
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_BASE_URL}/api/files/files`, {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          withCredentials: true
        });
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
        setIsUploading(true);
        const token = localStorage.getItem('token');

        // Upload to Node.js backend (which now handles table extraction and storage)
        const uploadResponse = await axios.post(`${API_BASE_URL}/api/files/upload`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          },
          withCredentials: true
        });

        const newFile = uploadResponse.data;
        setFiles(prevFiles => [...prevFiles, newFile]);

        // Show success alert
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'File uploaded successfully',
          timer: 2000,
          showConfirmButton: false
        });
      } catch (error) {
        console.error('Error uploading file:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: 'Failed to upload file: ' + error.message
        });
      } finally {
        setIsUploading(false);
      }
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Invalid File',
        text: 'Please upload a valid PDF file.'
      });
    }
  };

  const handleViewTable = async (fileId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/files/${fileId}/table`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        withCredentials: true
      });

      if (response.data) {
        navigate('/view-table', {
          state: {
            tableData: response.data,
            fileName: files.find(f => f.id === fileId)?.name
          }
        });
      } else {
        Swal.fire({
          icon: 'warning',
          title: 'No Table Data',
          text: 'No table data was extracted from this file'
        });
      }
    } catch (error) {
      console.error('Error fetching table data:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to fetch table data: ' + error.message
      });
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/api/files/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        withCredentials: true
      });
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
        const token = localStorage.getItem('token');
        const response = await axios.put(`${API_BASE_URL}/api/files/${id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          },
          withCredentials: true
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
          disabled={isUploading}
        />
        <label htmlFor="file-upload" className={`action-button upload-button ${isUploading ? 'uploading' : ''}`}>
          {isUploading ? (
            <span className="loading-text">
              <div className="spinner"></div>
              Uploading...
            </span>
          ) : (
            'Upload PDF'
          )}
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

                  {newFile && <span className="file-name">{newFile.name}</span>}
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
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="view-button"
                      onClick={(e) => {
                        e.preventDefault();
                        // Create a new blob from the base64 data
                        const byteCharacters = atob(file.url.split(',')[1]);
                        const byteNumbers = new Array(byteCharacters.length);
                        for (let i = 0; i < byteCharacters.length; i++) {
                          byteNumbers[i] = byteCharacters.charCodeAt(i);
                        }
                        const byteArray = new Uint8Array(byteNumbers);
                        const blob = new Blob([byteArray], { type: 'application/pdf' });

                        // Create an object URL and open it
                        const blobUrl = URL.createObjectURL(blob);
                        window.open(blobUrl, '_blank');
                      }}
                    >
                      View PDF
                    </a>
                    <button
                      className="view-table-button"
                      onClick={() => handleViewTable(file.id)}
                    >
                      View Table
                    </button>
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