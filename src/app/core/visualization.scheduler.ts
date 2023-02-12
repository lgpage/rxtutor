/* eslint-disable rxjs/no-internal */
import { Observable, VirtualAction, VirtualTimeScheduler } from 'rxjs';
import { animationFrameProvider } from 'rxjs/internal/scheduler/animationFrameProvider';
import { dateTimestampProvider } from 'rxjs/internal/scheduler/dateTimestampProvider';
import { immediateProvider } from 'rxjs/internal/scheduler/immediateProvider';
import { intervalProvider } from 'rxjs/internal/scheduler/intervalProvider';
import { performanceTimestampProvider } from 'rxjs/internal/scheduler/performanceTimestampProvider';
import { timeoutProvider } from 'rxjs/internal/scheduler/timeoutProvider';
import { LoggerService } from '../logger.service';
import {
  createAnimator, createCompleteNotification, createDelegates, createErrorNotification, createNextNotification,
  getMarbleNotifications,
} from './helpers';
import { StreamObservable } from './stream-observable';
import { FrameNotification } from './types';

// Code adapted from https://github.com/ReactiveX/rxjs/tree/master/src/internal/testing

const defaultMaxFrame = 750;

export interface RunHelpers {
  streamObservable: <T = string>(marbles: string, values?: any, errorValue?: unknown) => StreamObservable<T>;
  materialize: <T>(obs$: Observable<T>) => FrameNotification[],
}

export class VisualizationScheduler extends VirtualTimeScheduler {
  protected _name = 'VisualizationScheduler';
  protected _streamObservables: StreamObservable<any>[] = [];

  constructor(protected _frameSize: number, protected _logger: LoggerService) {
    super(VirtualAction, defaultMaxFrame);
  }

  protected materializeInnerObservable(obs$: Observable<any>, outerFrame: number): FrameNotification[] {
    let iter = 0;
    const startAsc = 'A'.charCodeAt(0);
    const messages: FrameNotification[] = [];

    obs$.subscribe({
      next: (value) => {
        const symbol = String.fromCharCode(startAsc + iter++);
        messages.push({ frame: this.frame - outerFrame, notification: createNextNotification(value, symbol) });
      },
      complete: () => messages.push({ frame: this.frame - outerFrame, notification: createCompleteNotification() }),
      error: (error: unknown) => messages.push({ frame: this.frame - outerFrame, notification: createErrorNotification(error) }),
    });

    return messages;
  }

  protected runSetup(): void {
    this.maxFrames = Infinity;

    const animator = createAnimator(this);
    const delegates = createDelegates(this);

    animationFrameProvider.delegate = animator.delegate;
    dateTimestampProvider.delegate = this;
    immediateProvider.delegate = delegates.immediate;
    intervalProvider.delegate = delegates.interval;
    performanceTimestampProvider.delegate = this;
    timeoutProvider.delegate = delegates.timeout;
  }

  protected runTearDown(prevMaxFrames: number): void {
    this.maxFrames = prevMaxFrames;

    animationFrameProvider.delegate = undefined;
    dateTimestampProvider.delegate = undefined;
    immediateProvider.delegate = undefined;
    intervalProvider.delegate = undefined;
    performanceTimestampProvider.delegate = undefined;
    timeoutProvider.delegate = undefined;
  }

  parseMarbles(marbles: string, values?: Record<string, any>, errorValue?: unknown): FrameNotification[] {
    return getMarbleNotifications(marbles, values, errorValue, this._frameSize);
  }

  createStreamObservable<T = string>(marbles: string, values?: any, errorValue?: unknown): StreamObservable<T> {
    this._logger.logDebug(`${this._name} >> createStreamObservable`, { marbles, values, errorValue });
    const notifications = this.parseMarbles(marbles, values, errorValue);
    const obs$ = new StreamObservable<T>(notifications, this, this._logger);

    this._streamObservables.push(obs$);

    return obs$;
  }

  materialize<T>(obs$: Observable<T>): FrameNotification[] {
    let iter = 0;
    const startAsc = 'A'.charCodeAt(0);
    const messages: FrameNotification[] = [];

    this.schedule(() => {
      obs$.subscribe({
        next: (x) => {
          const symbol = String.fromCharCode(startAsc + iter++);
          const value = x instanceof Observable ? this.materializeInnerObservable(x, this.frame) : x;
          messages.push({ frame: this.frame, notification: createNextNotification(value, symbol) });
        },
        error: (error: unknown) => messages.push({ frame: this.frame, notification: createErrorNotification(error) }),
        complete: () => messages.push({ frame: this.frame, notification: createCompleteNotification() }),
      });
    }, 0);

    return messages;
  }

  run<R>(callback: (helpers: RunHelpers) => R): R {
    const maxFrames = this.maxFrames;
    const helpers: RunHelpers = {
      materialize: <T>(obs$: Observable<T>) => this.materialize<T>(obs$),
      streamObservable: <T = string>(marbles: string, values?: any, errorValue?: unknown) =>
        this.createStreamObservable<T>(marbles, values, errorValue),
    };

    this.runSetup();

    try {
      const result = callback(helpers);
      this.flush();
      return result;
    } finally {
      this.runTearDown(maxFrames);
    }
  }
}
