import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import logger from '../utils/logger';

function URLList() {
  const [urls, setUrls] = useState([]);
  const [copied, setCopied] = useState(null);

  useEffect(() => {
    loadURLs();
    // Log page view
    logger.info('URLList', 'User viewed URL list');
  }, []);

  const loadURLs = () => {
    try {
      const savedUrls = JSON.parse(localStorage.getItem('shortenedUrls') || '[]');
      setUrls(savedUrls);
    } catch (error) {
      logger.error('URLList', 'Failed to load URLs', error);
    }
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
    logger.info('URLList', 'Copied URL to clipboard', { url: text });
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return 'N/A';
    }
  };

  if (urls.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px' }}>
        <h2 style={{ color: '#6c757d', marginBottom: '20px' }}>No URLs shortened yet</h2>
        <p style={{ marginBottom: '20px' }}>Shorten your first URL to see it here</p>
        <Link 
          to="/" 
          style={{
            display: 'inline-block',
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '4px',
            fontWeight: 'bold'
          }}
        >
          Create Short URL
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '30px',
        flexWrap: 'wrap',
        gap: '15px'
      }}>
        <h2 style={{ margin: 0, color: '#2c3e50' }}>Your Shortened URLs</h2>
        <Link 
          to="/" 
          style={{
            padding: '8px 16px',
            backgroundColor: '#28a745',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '4px',
            fontWeight: '500',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span>+</span> New Short URL
        </Link>
      </div>
      
      <div style={{ 
        background: 'white', 
        borderRadius: '8px', 
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
        overflow: 'hidden'
      }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr 1fr',
          borderBottom: '1px solid #eee',
          fontWeight: '600',
          backgroundColor: '#f8f9fa',
          padding: '12px 15px'
        }}>
          <div>Original URL</div>
          <div>Short URL</div>
          <div style={{ textAlign: 'right' }}>Created</div>
        </div>
        
        {urls.map((url, index) => (
          <div 
            key={index}
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              borderBottom: '1px solid #f0f0f0',
              padding: '12px 15px',
              ':hover': {
                backgroundColor: '#f8f9fa'
              }
            }}
          >
            <div style={{ 
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              paddingRight: '15px'
            }}>
              <a 
                href={url.originalUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{
                  color: '#007bff',
                  textDecoration: 'none',
                  ':hover': {
                    textDecoration: 'underline'
                  }
                }}
              >
                {url.originalUrl.length > 40 
                  ? `${url.originalUrl.substring(0, 40)}...` 
                  : url.originalUrl}
              </a>
            </div>
            
            <div style={{ 
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              paddingRight: '15px'
            }}>
              <a 
                href={`${window.location.origin}/r/${url.shortCode}`} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{
                  color: '#28a745',
                  textDecoration: 'none',
                  fontFamily: 'monospace',
                  flex: '1',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {window.location.host}/r/{url.shortCode}
              </a>
              <button
                onClick={() => copyToClipboard(`${window.location.origin}/r/${url.shortCode}`, index)}
                style={{
                  background: 'none',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  padding: '4px 8px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  color: copied === index ? '#28a745' : '#6c757d',
                  minWidth: '60px',
                  ':hover': {
                    background: '#f8f9fa'
                  }
                }}
              >
                {copied === index ? 'Copied!' : 'Copy'}
              </button>
            </div>
            
            <div style={{ 
              textAlign: 'right',
              color: '#6c757d',
              fontSize: '14px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end'
            }}>
              <div>{formatDate(url.createdAt)}</div>
              <div style={{ fontSize: '12px', color: '#6c757d' }}>
                {url.clicks || 0} {url.clicks === 1 ? 'click' : 'clicks'}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default URLList;
