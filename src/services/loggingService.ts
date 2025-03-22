import CryptoJS from 'crypto-js';

// Define log levels
export enum LogLevel {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  DEBUG = 'DEBUG'
}

// Define log event types
export enum LogEventType {
  USER_ACTION = 'USER_ACTION',
  SYSTEM_EVENT = 'SYSTEM_EVENT',
  AUTH_EVENT = 'AUTH_EVENT',
  DATA_CHANGE = 'DATA_CHANGE',
  PERFORMANCE = 'PERFORMANCE'
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  eventType: LogEventType;
  message: string;
  userId?: string;
  data?: any;
}

class SecureLogger {
  private encryptionKey: string;
  private logs: LogEntry[] = [];
  private maxLogSize: number = 100;

  constructor() {
    // In a real app, this would be an environment variable or securely fetched
    // For demo purposes, we generate a key
    this.encryptionKey = this.generateEncryptionKey();
  }

  private generateEncryptionKey(): string {
    // Generate a random encryption key for this session
    return CryptoJS.lib.WordArray.random(16).toString();
  }

  private encrypt(data: string): string {
    // Encrypt using AES-256
    return CryptoJS.AES.encrypt(data, this.encryptionKey).toString();
  }

  private decrypt(encryptedData: string): string {
    // Decrypt data
    const bytes = CryptoJS.AES.decrypt(encryptedData, this.encryptionKey);
    return bytes.toString(CryptoJS.enc.Utf8);
  }

  private sanitizeData(data: any): any {
    if (!data) return data;
    
    // Create a copy of the data to avoid modifying the original
    const sanitized = { ...data };
    
    // Remove sensitive fields
    const sensitiveFields = ['password', 'token', 'credit_card', 'ssn', 'private_key'];
    
    Object.keys(sanitized).forEach(key => {
      const lowerKey = key.toLowerCase();
      if (sensitiveFields.some(field => lowerKey.includes(field))) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
        sanitized[key] = this.sanitizeData(sanitized[key]);
      }
    });
    
    return sanitized;
  }

  private createLogEntry(level: LogLevel, eventType: LogEventType, message: string, data?: any): LogEntry {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const userId = currentUser.id;
    
    return {
      timestamp: new Date().toISOString(),
      level,
      eventType,
      message,
      userId,
      data: this.sanitizeData(data)
    };
  }

  // Store logs securely
  private storeLog(entry: LogEntry): void {
    // Add to in-memory storage
    this.logs.push(entry);
    
    // Keep logs within size limit (FIFO)
    if (this.logs.length > this.maxLogSize) {
      this.logs.shift();
    }
    
    // Encrypt log for storage
    const encryptedLog = this.encrypt(JSON.stringify(entry));
    
    // In a real app, we would send this to a secure server
    // For demo, we store in localStorage temporarily
    const existingLogs = JSON.parse(localStorage.getItem('secure_logs') || '[]');
    existingLogs.push(encryptedLog);
    
    // Keep local storage logs within size limit
    if (existingLogs.length > this.maxLogSize) {
      existingLogs.shift();
    }
    
    localStorage.setItem('secure_logs', JSON.stringify(existingLogs));
    
    // Log to console in development (would be disabled in production)
    if (process.env.NODE_ENV === 'development') {
      console.log(`[${entry.level}] ${entry.message}`, entry.data || '');
    }
  }

  // Public logging methods
  public info(message: string, eventType: LogEventType = LogEventType.SYSTEM_EVENT, data?: any): void {
    const entry = this.createLogEntry(LogLevel.INFO, eventType, message, data);
    this.storeLog(entry);
  }

  public warn(message: string, eventType: LogEventType = LogEventType.SYSTEM_EVENT, data?: any): void {
    const entry = this.createLogEntry(LogLevel.WARNING, eventType, message, data);
    this.storeLog(entry);
  }

  public error(message: string, eventType: LogEventType = LogEventType.SYSTEM_EVENT, data?: any): void {
    const entry = this.createLogEntry(LogLevel.ERROR, eventType, message, data);
    this.storeLog(entry);
  }

  public debug(message: string, eventType: LogEventType = LogEventType.SYSTEM_EVENT, data?: any): void {
    // Only log debug in development
    if (process.env.NODE_ENV === 'development') {
      const entry = this.createLogEntry(LogLevel.DEBUG, eventType, message, data);
      this.storeLog(entry);
    }
  }

  public logUserAction(action: string, data?: any): void {
    this.info(action, LogEventType.USER_ACTION, data);
  }

  public logDataChange(entity: string, action: string, data?: any): void {
    this.info(`${entity} ${action}`, LogEventType.DATA_CHANGE, data);
  }

  // Method to retrieve logs (would be restricted to admin users in a real app)
  public getLogs(): LogEntry[] {
    return this.logs;
  }
}

// Create singleton instance
const secureLogger = new SecureLogger();
export default secureLogger;
