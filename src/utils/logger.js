import apiService from '../apiService';
import config from '../config';

// Log levels
const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
};

class Logger {
  constructor() {
    this.logQueue = [];
    this.initialized = false;
    this.maxRetries = 3;
    this.retryDelay = 1000; // 1 second
    this.batchSize = 10; // Number of logs to send in a single batch
    this.batchTimeout = 2000; // Max time to wait before sending a batch (ms)
    this.batchTimer = null;
    this.isProcessingBatch = false;
    
    // Set log level based on environment
    this.logLevel = config.app.environment === 'production' 
      ? LOG_LEVELS.INFO 
      : LOG_LEVELS.DEBUG;
  }

  async initialize() {
    try {
      this.initialized = await apiService.initialize();
      if (this.initialized) {
        await this.processQueue();
      } else {
        throw new Error('Failed to initialize API service');
      }
    } catch (error) {
      console.error('Logger initialization failed, will retry:', error);
      // Exponential backoff for retries
      setTimeout(() => this.initialize(), this.retryDelay * Math.pow(2, this.retryCount || 1));
      this.retryCount = (this.retryCount || 0) + 1;
    }
  }

  async processQueue() {
    if (this.isProcessingBatch || this.logQueue.length === 0) {
      return;
    }

    this.isProcessingBatch = true;
    
    try {
      // Process logs in batches
      while (this.logQueue.length > 0) {
        const batch = this.logQueue.splice(0, this.batchSize);
        
        try {
          // Send the batch as a single request
          await this.sendBatch(batch);
        } catch (error) {
          console.error('Failed to process log batch:', error);
          // Re-add the failed batch to the front of the queue
          this.logQueue.unshift(...batch);
          break;
        }
      }
    } finally {
      this.isProcessingBatch = false;
      
      // If there are remaining logs, schedule the next batch
      if (this.logQueue.length > 0) {
        setTimeout(() => this.processQueue(), this.batchTimeout);
      }
    }
  }
  
  async sendBatch(batch) {
    try {
      await apiService.post('/logs/batch', { logs: batch });
      // Reset retry count on successful send
      this.retryCount = 0;
    } catch (error) {
      console.error('Failed to send log batch:', error);
      throw error;
    }
  }

  async log(level, source, message, data = {}) {
    // Skip if log level is too low
    if (LOG_LEVELS[level] === undefined || LOG_LEVELS[level] > this.logLevel) {
      return;
    }

    const logEntry = {
      timestamp: new Date().toISOString(),
      level: level.toUpperCase(),
      source: source,
      message: message,
      data: data,
      environment: config.app.environment,
      version: config.app.version
    };

      // In development, always log to console
    if (config.app.environment !== 'production') {
      const logMethod = console[level] || console.log;
      logMethod(`[${logEntry.level}] ${logEntry.source}: ${logEntry.message}`, data);
    }

    // Add to queue
    this.logQueue.push(logEntry);
    
    // Initialize if not already done
    if (!this.initialized) {
      if (this.logQueue.length === 1) {
        await this.initialize();
      }
      return;
    }
    
    // Process queue if we've reached batch size or after timeout
    if (this.logQueue.length >= this.batchSize) {
      this.processQueue();
    } else if (!this.batchTimer) {
      this.batchTimer = setTimeout(() => {
        this.batchTimer = null;
        this.processQueue();
      }, this.batchTimeout);
    }
  }

  async sendLog(logEntry, retryCount = 0) {
    try {
      await apiService.post('/logs', logEntry);
      // Reset retry count on successful send
      this.retryCount = 0;
    } catch (error) {
      console.error(`Failed to send log (Attempt ${retryCount + 1}/${this.maxRetries}):`, error);
      if (retryCount < this.maxRetries) {
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, this.retryDelay * Math.pow(2, retryCount)));
        return this.sendLog(logEntry, retryCount + 1);
      }
      
      // If we've exhausted all retries, rethrow the error
      throw error;
    }
  }

  error(source, message, data = {}) {
    return this.log('error', source, message, data);
  }

  warn(source, message, data = {}) {
    return this.log('warn', source, message, data);
  }

  info(source, message, data = {}) {
    return this.log('info', source, message, data);
  }

  debug(source, message, data = {}) {
    return this.log('debug', source, message, data);
  }

  static createLogger(source) {
    return {
      error: (message, data) => logger.error(source, message, data),
      warn: (message, data) => logger.warn(source, message, data),
      info: (message, data) => logger.info(source, message, data),
      debug: (message, data) => logger.debug(source, message, data)
    };
  }
  
  /**
   * Ensures all pending logs are processed
   * @param {number} timeout - Maximum time to wait for logs to be processed (in ms)
   * @returns {Promise<boolean>} - True if all logs were processed, false otherwise
   */
  async flush(timeout = 5000) {
    if (this.logQueue.length === 0) {
      return true;
    }
    
    // Process any pending logs
    this.processQueue();
    
    // Wait for logs to be processed or timeout
    return new Promise((resolve) => {
      const checkInterval = 100;
      const maxChecks = Math.ceil(timeout / checkInterval);
      let checks = 0;
      
      const interval = setInterval(() => {
        checks++;
        
        if (this.logQueue.length === 0 || checks >= maxChecks) {
          clearInterval(interval);
          resolve(this.logQueue.length === 0);
        }
      }, checkInterval);
    });
  }
}

// Create a singleton instance
const logger = new Logger();

// Start initialization
logger.initialize().catch(error => {
  console.error('Failed to initialize logger:', error);
});

export default logger;
