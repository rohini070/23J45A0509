import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function URLForm({ onShorten }) {
  const [url, setUrl] = useState('');
  const [customCode, setCustomCode] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Basic URL validation
    if (!url) {
      setError('Please enter a URL');
      return;
    }

    try {
      // Create a simple short URL (in a real app, this would call your backend)
      const shortCode = customCode || Math.random().toString(36).substr(2, 8);
      const shortUrl = `${window.location.origin}/r/${shortCode}`;
      
      // Save to localStorage (temporary solution)
      const urlData = {
        originalUrl: url,
        shortCode,
        createdAt: new Date().toISOString(),
        clicks: 0
      };
      
      const existingUrls = JSON.parse(localStorage.getItem('shortenedUrls') || '[]');
      localStorage.setItem('shortenedUrls', JSON.stringify([...existingUrls, urlData]));
      
      // Update parent component and clear form
      onShorten(shortUrl);
      setUrl('');
      setCustomCode('');
      setError('');
      
      // Navigate to the list after a short delay
      setTimeout(() => navigate('/shortened'), 1500);
      
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Error shortening URL:', err);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ marginBottom: '20px' }}>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter long URL to shorten"
            style={{
              width: '100%',
              padding: '12px',
              fontSize: '16px',
              border: error ? '1px solid #dc3545' : '1px solid #ced4da',
              borderRadius: '4px',
              marginBottom: '10px'
            }}
          />
          {error && <div style={{ color: '#dc3545', fontSize: '14px', marginTop: '5px' }}>{error}</div>}
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          <input
            type="text"
            value={customCode}
            onChange={(e) => setCustomCode(e.target.value)}
            placeholder="Custom short code (optional)"
            style={{
              width: '100%',
              padding: '12px',
              fontSize: '16px',
              border: '1px solid #ced4da',
              borderRadius: '4px'
            }}
          />
        </div>
        
        <button
          type="submit"
          style={{
            width: '100%',
            padding: '12px',
            fontSize: '16px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#0056b3'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#007bff'}
        >
          Shorten URL
        </button>
      </form>
    </div>
  );
}

export default URLForm;
