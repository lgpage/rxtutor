import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { LoggerService, LogLevel } from './logger.service';

@Injectable()
class LoggerServiceExposed extends LoggerService {
  _logLevel: LogLevel = LogLevel.Warning;

  shouldLog(messageLogLevel: LogLevel): boolean {
    return super.shouldLog(messageLogLevel);
  }

  logWith(
    messageLogLevel: LogLevel,
    logger: (message?: any, ...optionalParams: any[]) => void,
    message?: any,
    ...optionalParams: any[]
  ): void {
    return super.logWith(messageLogLevel, logger, message, ...optionalParams);
  }
}

describe('LoggerService', () => {
  let exposed: LoggerServiceExposed;
  let service: LoggerService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [LoggerServiceExposed] });

    exposed = TestBed.inject(LoggerServiceExposed);
    service = exposed;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('shouldLog', () => {
    it('returns the expected result', () => {
      exposed._logLevel = LogLevel.Warning;

      expect(exposed.shouldLog(LogLevel.Trace)).toBeFalse();
      expect(exposed.shouldLog(LogLevel.Debug)).toBeFalse();
      expect(exposed.shouldLog(LogLevel.Information)).toBeFalse();
      expect(exposed.shouldLog(LogLevel.Warning)).toBeTrue();
      expect(exposed.shouldLog(LogLevel.Error)).toBeTrue();
    });
  });

  describe('logWith', () => {
    it('calls expected methods', () => {
      const loggerSpy = jasmine.createSpy('logger');

      exposed.logWith(LogLevel.Warning, loggerSpy, 'message', 'param');

      expect(loggerSpy).toHaveBeenCalledWith('message', 'param');
    });
  });

  describe('log methods', () => {
    it('wrap logWith as expected', () => {
      const logWithSpy = spyOn(exposed, 'logWith');

      service.logTrace('message', 'param');
      expect(logWithSpy).toHaveBeenCalledWith(LogLevel.Trace, console.debug, 'message', 'param');

      service.logDebug('message', 'param');
      expect(logWithSpy).toHaveBeenCalledWith(LogLevel.Debug, console.debug, 'message', 'param');

      service.logInfo('message', 'param');
      expect(logWithSpy).toHaveBeenCalledWith(LogLevel.Information, console.info, 'message', 'param');

      service.logWarning('message', 'param');
      expect(logWithSpy).toHaveBeenCalledWith(LogLevel.Warning, console.warn, 'message', 'param');

      service.logError('message', 'param');
      expect(logWithSpy).toHaveBeenCalledWith(LogLevel.Error, console.error, 'message', 'param');
    });
  });
});
