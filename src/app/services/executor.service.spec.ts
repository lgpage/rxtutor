/* eslint-disable @typescript-eslint/ban-types */
import { cold } from 'jasmine-marbles';
import * as rx from 'rxjs';
import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { InputStreamLike, OutputStream } from '../core';
import { LoggerService } from '../logger.service';
import { ExecutorService } from './executor.service';

@Injectable()
class ExecutorServiceExposed extends ExecutorService {
  logError(message: string, error: unknown): void {
    return super.logError(message, error);
  }

  createCallable(jsCode: string, size: number): Function | null {
    return super.createCallable(jsCode, size);
  }

  invoke(callable: Function | null, sources: rx.Observable<string>[]): rx.Observable<any | null> {
    return super.invoke(callable, sources);
  }
}

describe('ExecutorService', () => {
  let matSnackBarSpy: jasmine.SpyObj<MatSnackBar>;
  let loggerServiceSpy: jasmine.SpyObj<LoggerService>;

  let exposed: ExecutorServiceExposed;
  let service: ExecutorService;

  beforeEach(() => {
    loggerServiceSpy = jasmine.createSpyObj<LoggerService>('LoggerService', ['logError', 'logDebug']);
    matSnackBarSpy = jasmine.createSpyObj<MatSnackBar>('MatSnackBar', ['open']);

    TestBed.configureTestingModule({
      providers: [
        ExecutorServiceExposed,
        { provide: MatSnackBar, useValue: matSnackBarSpy },
        { provide: LoggerService, useValue: loggerServiceSpy },
      ]
    });

    exposed = TestBed.inject(ExecutorServiceExposed);
    service = exposed;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('logError', () => {
    it('calls expected methods', () => {
      const error = new Error('Err');
      exposed.logError('Whoops', error);

      expect(loggerServiceSpy.logError).toHaveBeenCalledWith('Whoops', { error });
      expect(matSnackBarSpy.open).toHaveBeenCalledWith(
        'Something went wrong, please see browser console for more details.',
        'Ok',
        { politeness: 'assertive', duration: 3000 }
      );
    });
  });

  describe('invoke', () => {
    it('returns the expected result', () => {
      const obs$ = exposed.invoke(() => rx.of(10), []);
      expect(obs$).toBeObservable(cold('(0|)', [10]));
    });

    describe('when callable is null', () => {
      it('returns the expected result', () => {
        const obs$ = exposed.invoke(null, []);
        expect(obs$).toBeObservable(cold('(0|)', [null]));
      });
    });

    describe('when response is not an observable', () => {
      it('returns the expected result', () => {
        const obs$ = exposed.invoke(() => 10, []);

        expect(obs$).toBeObservable(cold('(0|)', [null]));
        expect(loggerServiceSpy.logError).toHaveBeenCalledWith(
          'Failed to invoke function or invalid response type.',
          { error: jasmine.any(TypeError) }
        );
      });
    });

    describe('when response observable throws an error', () => {
      it('returns the expected result', () => {
        const error = new Error('Whoops');
        const obs$ = exposed.invoke(() => rx.of(10).pipe(
          rx.tap(() => {
            throw error;
          }),
        ), []);

        expect(obs$).toBeObservable(cold('(0|)', [null]));
        expect(loggerServiceSpy.logError).toHaveBeenCalledWith('Pipe threw an unexpected error.', { error });
      });
    });
  });

  describe('getFunctionResult', () => {
    it('calls expected methods', () => {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      const fn = () => { };
      const ret$ = rx.of(10);

      const createCallableSpy = spyOn(exposed, 'createCallable').and.returnValue(fn);
      const invokeSpy = spyOn(exposed, 'invoke').and.returnValue(ret$);

      const obs$ = service.getFunctionResult('', []);

      expect(createCallableSpy).toHaveBeenCalledWith('', 0);
      expect(invokeSpy).toHaveBeenCalledWith(fn, []);
      expect(obs$).toBe(ret$);
    });
  });

  describe('getVisualizedNodesUpdater', () => {
    it('should return the expected observable', (done) => {
      const code$: rx.Observable<string> = rx.of('');
      const sources$: rx.Observable<InputStreamLike[]> = rx.of<InputStreamLike[]>([
        { marbles$: rx.of({ marbles: 'a', values: { a: 1 } }) } as unknown as InputStreamLike,
      ]);

      const obs$ = service.getVisualizedNodesUpdater(code$, sources$);

      obs$.pipe(
        rx.first(),
        rx.tap((notifications) => {
          expect(notifications).toEqual([
            { frame: 0, notification: { kind: 'N', value: null, symbol: 'A' } },
            { frame: 0, notification: { kind: 'C', symbol: '|' } },
          ]);
        }),
      ).subscribe(() => done());
    });
  });

  describe('getVisualizedOutput', () => {
    it('calls expected methods', () => {
      const ret$ = rx.of([]);
      const code$ = rx.of('');
      const sources$ = rx.of([]);

      const getVisualizedNodesUpdaterSpy = spyOn(service, 'getVisualizedNodesUpdater').and.returnValue(ret$);

      const result = service.getVisualizedOutput(code$, sources$);

      expect(getVisualizedNodesUpdaterSpy).toHaveBeenCalledWith(code$, sources$);
      expect(result).toBeInstanceOf(OutputStream);
    });
  });
});
