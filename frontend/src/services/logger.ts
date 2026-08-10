type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'TX';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
}

class LoggerService {
  private logs: LogEntry[] = [];

  public log(level: LogLevel, message: string, context?: Record<string, any>) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
    };
    this.logs.unshift(entry);
    if (this.logs.length > 200) {
      this.logs.pop();
    }

    const consoleMethod = level === 'ERROR' ? console.error : level === 'WARN' ? console.warn : console.log;
    consoleMethod(`[${entry.timestamp}] [${level}] ${message}`, context || '');
  }

  public info(message: string, context?: Record<string, any>) {
    this.log('INFO', message, context);
  }

  public warn(message: string, context?: Record<string, any>) {
    this.log('WARN', message, context);
  }

  public error(message: string, context?: Record<string, any>) {
    this.log('ERROR', message, context);
  }

  public tx(message: string, context?: Record<string, any>) {
    this.log('TX', message, context);
  }

  public getLogs(): LogEntry[] {
    return [...this.logs];
  }
}

export const logger = new LoggerService();
