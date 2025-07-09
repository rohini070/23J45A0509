import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { incrementClickCount, getURLByShortcode } from '../utils/storage';
import logger from '../utils/logger';

export default function RedirectHandler() {
  const { shortcode } = useParams();
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const redirect = async () => {
      try {
        const urlData = getURLByShortcode(shortcode);

        if (urlData && urlData.originalUrl) {
          // Log the redirect
          await logger.info('RedirectHandler', `Redirecting to ${urlData.originalUrl}`, {
            shortCode: shortcode,
            timestamp: new Date().toISOString()
          });
          
          // Increment click count
          incrementClickCount(shortcode);
          
          // Redirect to the original URL
          window.location.href = urlData.originalUrl;
        } else {
          throw new Error('URL not found');
        }
      } catch (error) {
        console.error('Redirect error:', error);
        await logger.error('RedirectHandler', 'Failed to redirect', {
          shortCode: shortcode,
          error: error.message
        });
        
        setError('Invalid or expired short URL');
        
        // Redirect to home after 3 seconds
        setTimeout(() => {
          navigate('/');
        }, 3000);
      }
    };

    redirect();
  }, [shortcode, navigate]);

  if (error) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        textAlign: 'center',
        padding: '20px',
        backgroundColor: '#f8f9fa'
      }}>
        <h2 style={{ color: '#dc3545', marginBottom: '20px' }}>Error: {error}</h2>
        <p>Redirecting you to the homepage...</p>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      textAlign: 'center',
      padding: '20px',
      backgroundColor: '#f8f9fa'
    }}>
      <div style={{
        width: '50px',
        height: '50px',
        border: '5px solid #f3f3f3',
        borderTop: '5px solid #007bff',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        marginBottom: '20px'
      }}></div>
      <h2 style={{ color: '#2c3e50', marginBottom: '10px' }}>Redirecting...</h2>
      <p style={{ color: '#6c757d' }}>Please wait while we take you to your destination</p>
      
      <style>{
        `@keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }`
      }</style>
    </div>
  );
}
