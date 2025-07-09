const STORAGE_KEY = 'shortenedUrls';

export function saveURL(data) {
  try {
    const urls = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    urls.push({
      originalUrl: data.originalUrl,
      shortCode: data.shortCode,
      createdAt: new Date().toISOString(),
      clicks: 0
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(urls));
    return true;
  } catch (error) {
    console.error('Error saving URL:', error);
    return false;
  }
}

export function getAllURLs() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch (error) {
    console.error('Error getting URLs:', error);
    return [];
  }
}

export function getURLByShortcode(shortCode) {
  try {
    const urls = getAllURLs();
    return urls.find((url) => url.shortCode === shortCode);
  } catch (error) {
    console.error('Error finding URL by shortcode:', error);
    return null;
  }
}

export function incrementClickCount(shortCode) {
  try {
    let urls = getAllURLs();
    urls = urls.map((url) => {
      if (url.shortCode === shortCode) {
        return { ...url, clicks: (url.clicks || 0) + 1 };
      }
      return url;
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(urls));
    return true;
  } catch (error) {
    console.error('Error incrementing click count:', error);
    return false;
  }
}
