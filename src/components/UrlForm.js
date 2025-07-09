import React, { useState } from 'react';
import { generateShortCode, validateUrl } from '../utils/urlUtils';

const UrlForm = ({ onShortenUrl }) => {
  const [url, setUrl] = useState('');
  const [customCode, setCustomCode] = useState('');
  const [expiryMinutes, setExpiryMinutes] = useState(30);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate URL
    const { isValid, url: validatedUrl, error: validationError } = validateUrl(url);
    if (!isValid) {
      setError(validationError);
      return;
    }

    // Generate short code
    const shortCode = customCode || generateShortCode();
    
    // Calculate expiration time
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + parseInt(expiryMinutes));

    // Create URL data object
    const urlData = {
      originalUrl: validatedUrl,
      shortCode,
      createdAt: new Date().toISOString(),
      expiresAt: expiresAt.toISOString(),
      clicks: 0
    };

    // Pass data to parent
    onShortenUrl(urlData);
    
    // Reset form
    setUrl('');
    setCustomCode('');
    setError('');
  };

  return (
    <div className="url-form">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter URL to shorten"
            className="form-control"
            required
          />
        </div>
        
        <button 
          type="button" 
          className="btn btn-link" 
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          {showAdvanced ? 'Hide Advanced' : 'Advanced Options'}
        </button>
        
        {showAdvanced && (
          <div className="advanced-options">
            <div className="form-group">
              <label>Custom Code (optional):</label>
              <input
                type="text"
                value={customCode}
                onChange={(e) => setCustomCode(e.target.value)}
                placeholder="Custom short code"
                className="form-control"
                pattern="[a-zA-Z0-9-]+"
                title="Only letters, numbers, and hyphens are allowed"
              />
            </div>
            <div className="form-group">
              <label>Expires after (minutes):</label>
              <input
                type="number"
                value={expiryMinutes}
                onChange={(e) => setExpiryMinutes(e.target.value)}
                min="1"
                className="form-control"
              />
            </div>
          </div>
        )}
        
        {error && <div className="alert alert-danger">{error}</div>}
        
        <button type="submit" className="btn btn-primary">
          Shorten URL
        </button>
      </form>
    </div>
  );
};

export default UrlForm;
