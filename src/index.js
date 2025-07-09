import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import logger from './utils/logger';

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to our logging service
    logger.error('ReactErrorBoundary', 'Caught an error', { 
      error: error.toString(),
      errorInfo: errorInfo.componentStack 
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '2rem',
          maxWidth: '800px',
          margin: '0 auto',
          fontFamily: 'sans-serif',
          color: '#721c24',
          backgroundColor: '#f8d7da',
          border: '1px solid #f5c6cb',
          borderRadius: '4px',
          textAlign: 'center'
        }}>
          <h2>Something went wrong</h2>
          <p>We're sorry for the inconvenience. The error has been logged and our team has been notified.</p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              marginTop: '1rem',
              padding: '0.5rem 1rem',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Global error handler for uncaught errors
const handleGlobalError = (event) => {
  // Prevent default browser error handling
  event.preventDefault();
  
  const { error } = event;
  
  // Log the error
  logger.error('GlobalErrorHandler', 'Uncaught error', {
    message: error.message,
    stack: error.stack,
    type: error.name
  });
  
  // You could also show a notification to the user here
};

// Global unhandled promise rejection handler
const handleUnhandledRejection = (event) => {
  // Prevent default browser handling
  event.preventDefault();
  
  const reason = event.reason;
  
  logger.error('GlobalErrorHandler', 'Unhandled promise rejection', {
    message: reason?.message || 'Unknown error',
    stack: reason?.stack,
    type: 'UnhandledRejection'
  });
};

// Set up global error handlers
if (window) {
  window.addEventListener('error', handleGlobalError);
  window.addEventListener('unhandledrejection', handleUnhandledRejection);
}

// Initialize the root component
const root = ReactDOM.createRoot(document.getElementById('root'));

// Render the app with error boundary
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);

// Handle page visibility changes to flush logs when the page is being unloaded
const handleVisibilityChange = () => {
  if (document.visibilityState === 'hidden') {
    // When the page is being hidden, try to flush all pending logs
    logger.flush(1000).then(success => {
      if (!success) {
        console.warn('Not all logs were sent before page unload');
      }
    });
  }
};

document.addEventListener('visibilitychange', handleVisibilityChange, false);

// Cleanup function for when the app is unmounted
const cleanup = () => {
  if (window) {
    window.removeEventListener('error', handleGlobalError);
    window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  }
};

// Handle app unload
window.addEventListener('beforeunload', () => {
  cleanup();
  // Try to flush any remaining logs
  logger.flush(1000).catch(console.error);
});

// For module hot reloading
if (module.hot) {
  module.hot.accept();
}
