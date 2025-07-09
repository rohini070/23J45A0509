// Utility functions for URL operations
export const generateShortCode = (length = 6) => {
  return Math.random().toString(36).substring(2, 2 + length);
};

export const validateUrl = (url) => {
  try {
    // Add https:// if no protocol is specified
    if (!url.match(/^https?:\/\//i)) {
      url = 'https://' + url;
    }
    new URL(url);
    return { isValid: true, url };
  } catch (e) {
    return { isValid: false, error: 'Please enter a valid URL' };
  }
};

export const saveUrlToStorage = (urlData) => {
  localStorage.setItem(`url_${urlData.shortCode}`, JSON.stringify(urlData));
};

export const getUrlsFromStorage = () => {
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
  return savedUrls;
};
