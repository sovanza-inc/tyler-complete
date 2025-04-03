import React, { useState } from 'react';

const InputFile = () => {
  const [fileName, setFileName] = useState('');
  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setFileName(e.target.files[0].name); 
    }
  };

  return (
    <div className="InputFile">
      <label htmlFor="fileUpload" className="file-upload-label">
        <img src="/img/DropFile.png" alt="" />
        <div>
          <p className="FUT-1">
            <b>Click to upload </b>
            <span className="spam">or drag and drop</span>
          </p>
          <p className="FUT-2">SVG, PNG, JPG or PDF (MAX. 10MB)</p>
          {fileName && <p className="file-name">Uploaded: {fileName}</p>}
        </div>
        <input
          type="file"
          name="fileUpload"
          id="fileUpload"
          onChange={handleFileChange} // Handle file selection
        />
      </label>
    </div>
  );
};

export default InputFile;
