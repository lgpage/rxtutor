import { Inject, Injectable, InjectionToken, Optional } from '@angular/core';

export enum LogLevel {
  Trace,
  Debug,
  Information,
  Warning,
  Error,
}

export const LOG_LEVEL = new InjectionToken<LogLevel>('Minimum log level');

@Injectable({ providedIn: 'root' })
export class LoggerService {
  protected _logLevel: LogLevel = LogLevel.Warning;

  constructor(
    @Inject(LOG_LEVEL) @Optional() logLevel: LogLevel | undefined,
  ) {
    this._logLevel = logLevel ?? this._logLevel;
  }

  protected shouldLog(messageLogLevel: LogLevel): boolean {
    return messageLogLevel >= this._logLevel;
  }

  protected logWith(
    messageLogLevel: LogLevel,
    logger: (message?: any, ...optionalParams: any[]) => void,
    message?: any,
    ...optionalParams: any[]
  ): void {
    if (this.shouldLog(messageLogLevel)) {
      logger(message, ...optionalParams);
    }
  }

  logTrace(message?: any, ...optionalParams: any[]): void {
    this.logWith(LogLevel.Trace, console.debug, message, ...optionalParams);
  }

  logDebug(message?: any, ...optionalParams: any[]): void {
    this.logWith(LogLevel.Debug, console.debug, message, ...optionalParams);
  }

  logInfo(message?: any, ...optionalParams: any[]): void {
    this.logWith(LogLevel.Information, console.info, message, ...optionalParams);
  }

  logWarning(message?: any, ...optionalParams: any[]): void {
    this.logWith(LogLevel.Warning, console.warn, message, ...optionalParams);
  }

  logError(message?: any, ...optionalParams: any[]): void {
    this.logWith(LogLevel.Error, console.error, message, ...optionalParams);
  }
}
