import React, { useState } from 'react';

const UrlItem = ({ urlData, onDelete }) => {
  const [copied, setCopied] = useState(false);
  const fullShortUrl = `${window.location.origin}/${urlData.shortCode}`;
  const expiresAt = new Date(urlData.expiresAt);
  const timeRemaining = Math.ceil((expiresAt - new Date()) / (1000 * 60)); // in minutes

  const handleCopy = () => {
    navigator.clipboard.writeText(fullShortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this URL?')) {
      onDelete(urlData.shortCode);
    }
  };

  return (
    <div className="url-item">
      <div className="url-original">
        <a href={urlData.originalUrl} target="_blank" rel="noopener noreferrer">
          {urlData.originalUrl}
        </a>
      </div>
      <div className="url-short">
        <a href={fullShortUrl} target="_blank" rel="noopener noreferrer">
          {fullShortUrl}
        </a>
        <button 
          onClick={handleCopy} 
          className={`btn btn-sm ${copied ? 'btn-success' : 'btn-outline-secondary'}`}
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <div className="url-meta">
        <span>Clicks: {urlData.clicks || 0}</span>
        <span>Expires in: {timeRemaining > 0 ? `${timeRemaining} minutes` : 'Expired'}</span>
        <button 
          onClick={handleDelete}
          className="btn btn-sm btn-outline-danger"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default UrlItem;
