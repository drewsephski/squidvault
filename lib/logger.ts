/**
 * Structured logging utility
 * Provides consistent log formatting and levels
 */

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  error?: Error | unknown;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const currentLogLevel = (process.env.LOG_LEVEL || "info") as LogLevel;

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[currentLogLevel];
}

function formatLogEntry(entry: LogEntry): string {
  const base = `[${entry.timestamp}] ${entry.level.toUpperCase()}: ${entry.message}`;

  if (entry.context && Object.keys(entry.context).length > 0) {
    return `${base} ${JSON.stringify(entry.context)}`;
  }

  return base;
}

function createLogEntry(
  level: LogLevel,
  message: string,
  context?: Record<string, unknown>,
  error?: Error | unknown
): LogEntry {
  return {
    timestamp: new Date().toISOString(),
    level,
    message,
    context,
    error,
  };
}

export const logger = {
  debug: (message: string, context?: Record<string, unknown>) => {
    if (shouldLog("debug")) {
      const entry = createLogEntry("debug", message, context);
      console.debug(formatLogEntry(entry));
    }
  },

  info: (message: string, context?: Record<string, unknown>) => {
    if (shouldLog("info")) {
      const entry = createLogEntry("info", message, context);
      console.info(formatLogEntry(entry));
    }
  },

  warn: (message: string, context?: Record<string, unknown>, error?: Error | unknown) => {
    if (shouldLog("warn")) {
      const entry = createLogEntry("warn", message, context, error);
      console.warn(formatLogEntry(entry));
      if (error && error instanceof Error) {
        console.warn(error.stack);
      }
    }
  },

  error: (message: string, context?: Record<string, unknown>, error?: Error | unknown) => {
    if (shouldLog("error")) {
      const entry = createLogEntry("error", message, context, error);
      console.error(formatLogEntry(entry));
      if (error && error instanceof Error) {
        console.error(error.stack);
      }
    }
  },

  // For webhook logging with consistent format
  webhook: (event: string, data: Record<string, unknown>) => {
    logger.info(`Webhook: ${event}`, {
      type: "webhook",
      event,
      ...data,
    });
  },

  // For API request logging
  request: (method: string, path: string, status: number, duration: number, userId?: string) => {
    logger.info(`API ${method} ${path}`, {
      type: "request",
      method,
      path,
      status,
      duration,
      userId,
    });
  },
};
