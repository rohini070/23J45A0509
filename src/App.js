import React, { useState, useEffect } from 'react';

function App() {
  const [url, setUrl] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [error, setError] = useState('');
  const [urls, setUrls] = useState([]);
  const [expiryMinutes, setExpiryMinutes] = useState(30);
  const [customCode, setCustomCode] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Load saved URLs on component mount
  useEffect(() => {
    try {
      const savedUrls = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('url_')) {
          const urlData = JSON.parse(localStorage.getItem(key));
          // Check if URL has expired
          if (new Date(urlData.expiresAt) > new Date()) {
            savedUrls.push(urlData);
          } else {
            // Remove expired URLs
            localStorage.removeItem(key);
          }
        }
      }
      setUrls(savedUrls);
    } catch (err) {
      console.error('Error loading saved URLs:', err);
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate URL
    if (!url) {
      setError('Please enter a URL');
      return;
    }
    
    // Add https:// if missing
    let processedUrl = url;
    if (!url.match(/^https?:\/\//)) {
      processedUrl = 'https://' + url;
    }
    
    try {
      // Validate URL
      new URL(processedUrl);
    } catch (err) {
      setError('Please enter a valid URL');
      return;
    }
    
    // Generate or use custom code
    let code;
    if (customCode) {
      // Validate custom code
      if (!/^[a-zA-Z0-9_-]+$/.test(customCode)) {
        setError('Custom code can only contain letters, numbers, hyphens, and underscores');
        return;
      }
      if (customCode.length < 4 || customCode.length > 20) {
        setError('Custom code must be between 4 and 20 characters');
        return;
      }
      // Check if code already exists
      if (localStorage.getItem(`url_${customCode}`)) {
        setError('This custom code is already in use');
        return;
      }
      code = customCode;
    } else {
      // Generate random code
      code = Math.random().toString(36).substring(2, 8);
    }
    
    const newShortUrl = `${window.location.origin}/${code}`;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + expiryMinutes * 60000);
    
    try {
      // Save to localStorage
      const urlData = {
        originalUrl: processedUrl,
        shortCode: code,
        createdAt: now.toISOString(),
        expiresAt: expiresAt.toISOString(),
        clicks: 0,
        lastClickedAt: null
      };
      
      localStorage.setItem(`url_${code}`, JSON.stringify(urlData));
      setShortUrl(newShortUrl);
      setUrls(prev => [urlData, ...prev]);
      setError('');
      setCustomCode('');
      setUrl('');
      
      // Scroll to the new URL
      setTimeout(() => {
        const element = document.getElementById('shortened-urls');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
      
    } catch (err) {
      console.error('Error saving URL:', err);
      setError('Failed to shorten URL. Please try again.');
    }
  };

  const copyToClipboard = (text) => {
    try {
      navigator.clipboard.writeText(text);
      alert('Copied to clipboard!');
      return true;
    } catch (err) {
      console.error('Failed to copy:', err);
      return false;
    }
  };

  const handleRedirect = (code) => {
    const urlData = JSON.parse(localStorage.getItem(`url_${code}`));
    if (!urlData) return;
    
    // Update click count
    const updatedData = {
      ...urlData,
      clicks: (urlData.clicks || 0) + 1,
      lastClickedAt: new Date().toISOString()
    };
    
    localStorage.setItem(`url_${code}`, JSON.stringify(updatedData));
    setUrls(urls.map(u => u.shortCode === code ? updatedData : u));
    
    // Redirect to the original URL
    window.location.href = urlData.originalUrl;
  };

  return (
    <div className="app" style={{
      maxWidth: '800px',
      margin: '0 auto',
      padding: '20px',
      fontFamily: 'Arial, sans-serif',
      minHeight: '100vh',
      backgroundColor: '#f5f7fa'
    }}>
      <header style={{
        backgroundColor: '#2c3e50',
        color: 'white',
        padding: '20px 0',
        marginBottom: '30px',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ margin: 0, fontSize: '2.2em' }}>URL Shortener</h1>
        <p style={{ margin: '10px 0 0', opacity: 0.9 }}>Create short, easy-to-share links</p>
      </header>

      <div style={{
        backgroundColor: 'white',
        padding: '25px',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        marginBottom: '30px'
      }}>
        <form onSubmit={handleSubmit}>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '10px',
            marginBottom: '15px'
          }}>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter your long URL here"
              style={{
                flex: '1',
                minWidth: '200px',
                padding: '12px 15px',
                fontSize: '16px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                boxSizing: 'border-box'
              }}
            />
            <button
              type="submit"
              style={{
                padding: '0 25px',
                fontSize: '16px',
                backgroundColor: '#3498db',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                fontWeight: 'bold',
                transition: 'background-color 0.2s',
                height: '44px'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#2980b9'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#3498db'}
            >
              Shorten URL
            </button>
          </div>
          
          <div style={{ textAlign: 'left', marginTop: '15px' }}>
            <button 
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              style={{
                background: 'none',
                border: 'none',
                color: '#3498db',
                cursor: 'pointer',
                padding: '5px 0',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                marginBottom: showAdvanced ? '15px' : 0
              }}
            >
              {showAdvanced ? '▼' : '▶'} Advanced Options
            </button>
            
            {showAdvanced && (
              <div style={{
                padding: '15px',
                backgroundColor: '#f8f9fa',
                borderRadius: '4px',
                marginTop: '10px',
                border: '1px solid #eee'
              }}>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '5px',
                    fontWeight: 'bold',
                    fontSize: '14px',
                    color: '#555'
                  }}>
                    Custom URL (optional)
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{
                      padding: '8px 12px',
                      backgroundColor: '#f1f1f1',
                      border: '1px solid #ddd',
                      borderRight: 'none',
                      borderRadius: '4px 0 0 4px',
                      fontSize: '14px',
                      color: '#555'
                    }}>
                      {window.location.host}/
                    </span>
                    <input
                      type="text"
                      value={customCode}
                      onChange={(e) => setCustomCode(e.target.value)}
                      placeholder="custom-name"
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        fontSize: '14px',
                        border: '1px solid #ddd',
                        borderRadius: '0 4px 4px 0',
                        minWidth: '120px'
                      }}
                    />
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: '#666',
                    marginTop: '5px'
                  }}>
                    Letters, numbers, hyphens, and underscores only (4-20 chars)
                  </div>
                </div>
                
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '5px',
                    fontWeight: 'bold',
                    fontSize: '14px',
                    color: '#555'
                  }}>
                    Link Expiration
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <input
                      type="number"
                      min="1"
                      max="10080" // 1 week in minutes
                      value={expiryMinutes}
                      onChange={(e) => setExpiryMinutes(parseInt(e.target.value) || 30)}
                      style={{
                        width: '80px',
                        padding: '8px 12px',
                        fontSize: '14px',
                        border: '1px solid #ddd',
                        borderRadius: '4px 0 0 4px',
                        textAlign: 'center'
                      }}
                    />
                    <span style={{
                      padding: '8px 12px',
                      backgroundColor: '#f1f1f1',
                      border: '1px solid #ddd',
                      borderLeft: 'none',
                      borderRadius: '0 4px 4px 0',
                      fontSize: '14px',
                      color: '#555'
                    }}>
                      minutes
                    </span>
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: '#666',
                    marginTop: '5px'
                  }}>
                    Link will expire after {expiryMinutes} minutes
                  </div>
                </div>
              </div>
            )}
          </div>
        </form>
        
        {error && (
          <div style={{
            marginTop: '15px',
            padding: '10px 15px',
            backgroundColor: '#ffebee',
            color: '#c62828',
            borderRadius: '4px',
            textAlign: 'left',
            fontSize: '14px',
            borderLeft: '4px solid #c62828'
          }}>
            {error}
          </div>
        )}
        
        {shortUrl && (
          <div style={{
            marginTop: '20px',
            padding: '15px',
            backgroundColor: '#e8f5e9',
            borderRadius: '4px',
            borderLeft: '4px solid #4caf50',
            textAlign: 'left'
          }}>
            <div style={{ marginBottom: '10px', fontWeight: 'bold', color: '#2e7d32' }}>
              Success! Your shortened URL is ready:
            </div>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '10px',
              alignItems: 'center',
              marginBottom: '10px'
            }}>
              <a 
                href={shortUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{
                  flex: 1,
                  minWidth: '200px',
                  padding: '10px 15px',
                  backgroundColor: 'white',
                  borderRadius: '4px',
                  border: '1px solid #c8e6c9',
                  color: '#2e7d32',
                  textDecoration: 'none',
                  wordBreak: 'break-all',
                  fontSize: '14px'
                }}
              >
                {shortUrl}
              </a>
              <button
                onClick={() => copyToClipboard(shortUrl)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#4caf50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  fontWeight: 'bold',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#3d8b40'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#4caf50'}
              >
                Copy
              </button>
            </div>
            <div style={{
              fontSize: '13px',
              color: '#2e7d32',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              flexWrap: 'wrap'
            }}>
              <span>Expires: {new Date(new Date().getTime() + expiryMinutes * 60000).toLocaleString()}</span>
              <span>•</span>
              <span>QR Code: Coming Soon</span>
            </div>
          </div>
        )}
      </div>

      {urls.length > 0 && (
        <div id="shortened-urls" style={{ marginTop: '30px' }}>
          <h2 style={{
            color: '#2c3e50',
            marginBottom: '20px',
            paddingBottom: '10px',
            borderBottom: '1px solid #eee',
            fontSize: '1.5em'
          }}>
            Your Shortened URLs
          </h2>
          
          <div style={{
            display: 'grid',
            gap: '15px',
            marginBottom: '40px'
          }}>
            {urls.map((urlData) => {
              const expiresIn = Math.ceil((new Date(urlData.expiresAt) - new Date()) / (1000 * 60 * 60));
              const expiresText = expiresIn > 24 
                ? `Expires in ${Math.ceil(expiresIn / 24)} days`
                : expiresIn > 0 
                  ? `Expires in ${expiresIn} hours`
                  : 'Expired';
                  
              return (
                <div 
                  key={urlData.shortCode}
                  style={{
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    transition: 'transform 0.2s, box-shadow 0.2s'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                  }}
                >
                  <div style={{
                    padding: '15px 20px',
                    borderLeft: '4px solid #3498db',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}>
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '10px'
                    }}>
                      <div style={{ flex: 1, minWidth: '200px' }}>
                        <a 
                          href={`${window.location.origin}/${urlData.shortCode}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            color: '#3498db',
                            fontWeight: 'bold',
                            textDecoration: 'none',
                            wordBreak: 'break-all',
                            fontSize: '15px'
                          }}
                        >
                          {window.location.host}/{urlData.shortCode}
                        </a>
                        <div style={{
                          fontSize: '12px',
                          color: '#666',
                          marginTop: '3px',
                          wordBreak: 'break-all'
                        }}>
                          {urlData.originalUrl.length > 60 
                            ? `${urlData.originalUrl.substring(0, 60)}...` 
                            : urlData.originalUrl}
                        </div>
                      </div>
                      
                      <div style={{
                        display: 'flex',
                        gap: '8px',
                        flexWrap: 'wrap',
                        justifyContent: 'flex-end'
                      }}>
                        <button
                          onClick={() => {
                            const fullUrl = `${window.location.origin}/${urlData.shortCode}`;
                            copyToClipboard(fullUrl);
                          }}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#f0f0f0',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '13px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          <span>Copy</span>
                        </button>
                        <button
                          onClick={() => handleRedirect(urlData.shortCode)}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#3498db',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '13px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          <span>Visit</span>
                        </button>
                      </div>
                    </div>
                    
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '15px',
                      fontSize: '12px',
                      color: '#666',
                      paddingTop: '8px',
                      borderTop: '1px dashed #eee',
                      marginTop: '5px'
                    }}>
                      <div>
                        <span style={{ fontWeight: 'bold' }}>Created:</span>{' '}
                        {new Date(urlData.createdAt).toLocaleString()}
                      </div>
                      <div>
                        <span style={{ fontWeight: 'bold' }}>Expires:</span>{' '}
                        {new Date(urlData.expiresAt).toLocaleString()}
                      </div>
                      <div>
                        <span style={{ fontWeight: 'bold' }}>Clicks:</span> {urlData.clicks || 0}
                      </div>
                      <div style={{ color: expiresIn > 0 ? (expiresIn < 24 ? '#e67e22' : '#27ae60') : '#e74c3c' }}>
                        {expiresText}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      <footer style={{
        marginTop: '50px',
        padding: '20px 0',
        textAlign: 'center',
        color: '#7f8c8d',
        fontSize: '14px',
        borderTop: '1px solid #eee'
      }}>
        <p>Created for AffordMed Technical Test</p>
        <p style={{ marginTop: '5px', fontSize: '12px' }}>
          All links are stored in your browser's local storage and will expire after the specified time.
        </p>
      </footer>
    </div>
  );
}

export default App;
