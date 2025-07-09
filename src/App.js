import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useParams } from 'react-router-dom';
import URLForm from './Components/URLForm';
import URLList from './Components/URLList';
import { getURLByShortcode, incrementClickCount } from './utils/storage';

// Simple Redirect Component
function RedirectHandler() {
  const { shortCode } = useParams();

  React.useEffect(() => {
    const urlData = getURLByShortcode(shortCode);
    
    if (urlData && urlData.originalUrl) {
      incrementClickCount(shortCode);
      window.location.href = urlData.originalUrl.startsWith('http')
        ? urlData.originalUrl
        : `http://${urlData.originalUrl}`;
    } else {
      window.location.href = '/';
    }
  }, [shortCode]);

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      flexDirection: 'column'
    }}>
      <h2>Redirecting...</h2>
      <p>Please wait while we take you to your destination</p>
    </div>
  );
}

function App() {
  const [shortenedUrl, setShortenedUrl] = useState('');

  return (
    <Router>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '20px',
        fontFamily: 'Arial, sans-serif'
      }}>
        <h1 style={{
          color: '#2c3e50',
          textAlign: 'center',
          marginBottom: '30px'
        }}>
          URL Shortener
        </h1>
        
        <Routes>
          <Route path="/:shortCode" element={<RedirectHandler />} />
          <Route path="/" element={
            <div style={{
              background: '#f8f9fa',
              padding: '30px',
              borderRadius: '8px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
            }}>
              <URLForm onShorten={setShortenedUrl} />
              {shortenedUrl && (
                <div style={{
                  marginTop: '20px',
                  padding: '15px',
                  background: '#e8f4fd',
                  borderRadius: '4px',
                  wordBreak: 'break-all'
                }}>
                  <p>Shortened URL: <a href={shortenedUrl} target="_blank" rel="noopener noreferrer">{shortenedUrl}</a></p>
                </div>
              )}
            </div>
          } />
          <Route path="/shortened" element={<URLList />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
