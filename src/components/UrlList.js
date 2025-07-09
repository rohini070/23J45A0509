import React from 'react';
import UrlItem from './UrlItem';
import { saveUrlToStorage } from '../utils/urlUtils';

const UrlList = ({ urls, setUrls }) => {
  const handleDelete = (shortCode) => {
    localStorage.removeItem(`url_${shortCode}`);
    setUrls(urls.filter(url => url.shortCode !== shortCode));
  };

  const handleUrlClick = (shortCode) => {
    // Update click count
    const updatedUrls = urls.map(url => {
      if (url.shortCode === shortCode) {
        const updatedUrl = {
          ...url,
          clicks: (url.clicks || 0) + 1
        };
        saveUrlToStorage(updatedUrl);
        return updatedUrl;
      }
      return url;
    });
    setUrls(updatedUrls);
  };

  if (urls.length === 0) {
    return (
      <div className="empty-state">
        <p>No URLs shortened yet. Add one above!</p>
      </div>
    );
  }

  return (
    <div className="url-list">
      <h3>Your Shortened URLs</h3>
      {urls.map((urlData) => (
        <UrlItem 
          key={urlData.shortCode} 
          urlData={urlData} 
          onDelete={handleDelete}
          onClick={() => handleUrlClick(urlData.shortCode)}
        />
      ))}
    </div>
  );
};

export default UrlList;
