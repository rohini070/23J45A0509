import React, { useState, useEffect } from 'react';
import { saveUrlToStorage, getUrlsFromStorage } from './utils/urlUtils';
import UrlForm from './components/UrlForm';
import UrlList from './components/UrlList';
import './App.css';

function App() {
  const [urls, setUrls] = useState([]);
  const [error, setError] = useState('');

  // Load saved URLs on component mount
  useEffect(() => {
    try {
      setUrls(getUrlsFromStorage());
    } catch (err) {
      setError('Failed to load saved URLs');
      console.error('Error loading URLs:', err);
    }
  }, []);

  const handleShortenUrl = (urlData) => {
    try {
      // Save to localStorage
      saveUrlToStorage(urlData);
      
      // Update state
      setUrls(prevUrls => [urlData, ...prevUrls]);
      setError('');
    } catch (err) {
      setError('Failed to shorten URL. Please try again.');
      console.error('Error saving URL:', err);
    }
  };

  return (
    <div className="App">
      <header>
        <h1>URL Shortener</h1>
        <p>Create short, memorable links in seconds</p>
      </header>

      <main>
        <div className="container">
          <div className="url-form-container">
            <UrlForm onShortenUrl={handleShortenUrl} />
            {error && <div className="error-message">{error}</div>}
          </div>
          
          <UrlList urls={urls} setUrls={setUrls} />
        </div>
      </main>
      
      <footer>
        <p>© {new Date().getFullYear()} URL Shortener</p>
      </footer>
    </div>
  );
}

export default App;
