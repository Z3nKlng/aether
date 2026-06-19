/**
 * Logger utility — console-based logging with levels
 */

import type { LogLevel } from '../types';

const COLORS: Record<LogLevel, string> = {
  debug: '\x1b[90m',  // grey
  info: '\x1b[36m',   // cyan
  warn: '\x1b[33m',   // yellow
  error: '\x1b[31m',  // red
};

const RESET = '\x1b[0m';

export class Logger {
  private name: string;
  private level: LogLevel;

  constructor(name: string, level: LogLevel = 'info') {
    this.name = name;
    this.level = level;
  }

  setLevel(level: LogLevel): void {
    this.level = level;
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    return levels.indexOf(level) >= levels.indexOf(this.level);
  }

  private format(level: LogLevel, message: string, data?: unknown): string {
    const ts = new Date().toISOString();
    const prefix = `${COLORS[level]}[${ts}] [${level.toUpperCase()}] [${this.name}]${RESET}`;
    const suffix = data ? ` ${typeof data === 'string' ? data : JSON.stringify(data)}` : '';
    return `${prefix} ${message}${suffix}`;
  }

  debug(message: string, data?: unknown): void {
    if (this.shouldLog('debug')) console.debug(this.format('debug', message, data));
  }
  info(message: string, data?: unknown): void {
    if (this.shouldLog('info')) console.info(this.format('info', message, data));
  }
  warn(message: string, data?: unknown): void {
    if (this.shouldLog('warn')) console.warn(this.format('warn', message, data));
  }
  error(message: string, data?: unknown): void {
    if (this.shouldLog('error')) console.error(this.format('error', message, data));
  }
}