/* eslint-disable rxjs/no-internal */
import { Observable, Subscription, VirtualAction, VirtualTimeScheduler } from 'rxjs';
import { animationFrameProvider } from 'rxjs/internal/scheduler/animationFrameProvider';
import { dateTimestampProvider } from 'rxjs/internal/scheduler/dateTimestampProvider';
import { immediateProvider } from 'rxjs/internal/scheduler/immediateProvider';
import { intervalProvider } from 'rxjs/internal/scheduler/intervalProvider';
import { performanceTimestampProvider } from 'rxjs/internal/scheduler/performanceTimestampProvider';
import { timeoutProvider } from 'rxjs/internal/scheduler/timeoutProvider';
import { TimerHandle } from 'rxjs/internal/scheduler/timerHandle';
import { LoggerService } from '../services';
import { FrameNotification } from '../types';
import {
  createCompleteNotification, createErrorNotification, createNextNotification, getMarbleNotifications,
} from './helpers';
import { StreamObservable } from './stream-observable';

const defaultMaxFrame: number = 750;

export interface RunHelpers {
  streamObservable: <T = string>(marbles: string, values?: any, errorValue?: unknown) => StreamObservable<T>;
  materialize: <T>(obs$: Observable<T>) => FrameNotification[],
}

export class VisualizationScheduler extends VirtualTimeScheduler {
  protected _streamObservables: StreamObservable<any>[] = [];

  constructor(protected _logger: LoggerService) {
    super(VirtualAction, defaultMaxFrame);
  }

  private materializeInnerObservable(obs$: Observable<any>, outerFrame: number): FrameNotification[] {
    const messages: FrameNotification[] = [];

    obs$.subscribe({
      next: (value) => messages.push({ frame: this.frame - outerFrame, notification: createNextNotification(value) }),
      error: (error: unknown) => messages.push({ frame: this.frame - outerFrame, notification: createErrorNotification(error) }),
      complete: () => messages.push({ frame: this.frame - outerFrame, notification: createCompleteNotification() }),
    });

    return messages;
  }

  private createAnimator() {
    // The TestScheduler assigns a delegate to the provider that's used for
    // requestAnimationFrame (rAF). The delegate works in conjunction with the
    // animate run helper to coordinate the invocation of any rAF callbacks,
    // that are effected within tests, with the animation frames specified by
    // the test's author - in the marbles that are passed to the animate run
    // helper. This allows the test's author to write deterministic tests and
    // gives the author full control over when - or if - animation frames are
    // 'painted'.

    let lastHandle = 0;
    let map: Map<number, FrameRequestCallback> | undefined;

    const delegate = {
      requestAnimationFrame(callback: FrameRequestCallback) {
        if (!map) {
          throw new Error('animate() was not called within run()');
        }
        const handle = ++lastHandle;
        map.set(handle, callback);
        return handle;
      },
      cancelAnimationFrame(handle: number) {
        if (!map) {
          throw new Error('animate() was not called within run()');
        }
        map.delete(handle);
      },
    };

    const animate = (marbles: string) => {
      if (map) {
        throw new Error('animate() must not be called more than once within run()');
      }
      if (/[|#]/.test(marbles)) {
        throw new Error('animate() must not complete or error');
      }
      map = new Map<number, FrameRequestCallback>();
      const messages = VisualizationScheduler.parseMarbles(marbles);
      for (const message of messages) {
        this.schedule(() => {
          const now = this.now();
          // Capture the callbacks within the queue and clear the queue
          // before enumerating the callbacks, as callbacks might
          // reschedule themselves. (And, yeah, we're using a Map to represent
          // the queue, but the values are guaranteed to be returned in
          // insertion order, so it's all good. Trust me, I've read the docs.)
          const callbacks = Array.from(map!.values());
          map!.clear();
          for (const callback of callbacks) {
            callback(now);
          }
        }, message.frame);
      }
    };

    return { animate, delegate };
  }

  private createDelegates() {
    // When in run mode, the TestScheduler provides alternate implementations
    // of set/clearImmediate and set/clearInterval. These implementations are
    // consumed by the scheduler implementations via the providers. This is
    // done to effect deterministic asap and async scheduler behavior so that
    // all of the schedulers are testable in 'run mode'. Prior to v7,
    // delegation occurred at the scheduler level. That is, the asap and
    // animation frame schedulers were identical in behavior to the async
    // scheduler. Now, when in run mode, asap actions are prioritized over
    // async actions and animation frame actions are coordinated using the
    // animate run helper.

    let lastHandle = 0;
    const scheduleLookup = new Map<
      TimerHandle,
      {
        due: number;
        duration: number;
        handle: TimerHandle;
        handler: () => void;
        subscription: Subscription;
        type: 'immediate' | 'interval' | 'timeout';
      }
    >();

    const run = () => {
      // Whenever a scheduled run is executed, it must run a single immediate
      // or interval action - with immediate actions being prioritized over
      // interval and timeout actions.
      const now = this.now();
      const scheduledRecords = Array.from(scheduleLookup.values());
      const scheduledRecordsDue = scheduledRecords.filter(({ due }) => due <= now);
      const dueImmediates = scheduledRecordsDue.filter(({ type }) => type === 'immediate');
      if (dueImmediates.length > 0) {
        const { handle, handler } = dueImmediates[0];
        scheduleLookup.delete(handle);
        handler();
        return;
      }
      const dueIntervals = scheduledRecordsDue.filter(({ type }) => type === 'interval');
      if (dueIntervals.length > 0) {
        const firstDueInterval = dueIntervals[0];
        const { duration, handler } = firstDueInterval;
        firstDueInterval.due = now + duration;
        // The interval delegate must behave like setInterval, so run needs to
        // be rescheduled. This will continue until the clearInterval delegate
        // unsubscribes and deletes the handle from the map.
        firstDueInterval.subscription = this.schedule(run, duration);
        handler();
        return;
      }
      const dueTimeouts = scheduledRecordsDue.filter(({ type }) => type === 'timeout');
      if (dueTimeouts.length > 0) {
        const { handle, handler } = dueTimeouts[0];
        scheduleLookup.delete(handle);
        handler();
        return;
      }
      throw new Error('Expected a due immediate or interval');
    };

    // The following objects are the delegates that replace conventional
    // runtime implementations with TestScheduler implementations.
    //
    // The immediate delegate is depended upon by the asapScheduler.
    //
    // The interval delegate is depended upon by the asyncScheduler.
    //
    // The timeout delegate is not depended upon by any scheduler, but it's
    // included here because the onUnhandledError and onStoppedNotification
    // configuration points use setTimeout to avoid producer interference. It's
    // inclusion allows for the testing of these configuration points.

    const immediate = {
      setImmediate: (handler: () => void) => {
        const handle = ++lastHandle;
        scheduleLookup.set(handle, {
          due: this.now(),
          duration: 0,
          handle,
          handler,
          subscription: this.schedule(run, 0),
          type: 'immediate',
        });
        return handle;
      },
      clearImmediate: (handle: TimerHandle) => {
        const value = scheduleLookup.get(handle);
        if (value) {
          value.subscription.unsubscribe();
          scheduleLookup.delete(handle);
        }
      },
    };

    const interval = {
      setInterval: (handler: () => void, duration = 0) => {
        const handle = ++lastHandle;
        scheduleLookup.set(handle, {
          due: this.now() + duration,
          duration,
          handle,
          handler,
          subscription: this.schedule(run, duration),
          type: 'interval',
        });
        return handle;
      },
      clearInterval: (handle: TimerHandle) => {
        const value = scheduleLookup.get(handle);
        if (value) {
          value.subscription.unsubscribe();
          scheduleLookup.delete(handle);
        }
      },
    };

    const timeout = {
      setTimeout: (handler: () => void, duration = 0) => {
        const handle = ++lastHandle;
        scheduleLookup.set(handle, {
          due: this.now() + duration,
          duration,
          handle,
          handler,
          subscription: this.schedule(run, duration),
          type: 'timeout',
        });
        return handle;
      },
      clearTimeout: (handle: TimerHandle) => {
        const value = scheduleLookup.get(handle);
        if (value) {
          value.subscription.unsubscribe();
          scheduleLookup.delete(handle);
        }
      },
    };

    return { immediate, interval, timeout };
  }

  static parseMarbles(marbles: string, values?: Record<string, any>, errorValue?: unknown): FrameNotification[] {
    return getMarbleNotifications(marbles, values, errorValue);
  }

  createStreamObservable<T = string>(marbles: string, values?: any, errorValue?: unknown): StreamObservable<T> {
    const notifications = VisualizationScheduler.parseMarbles(marbles, values, errorValue);
    const obs$ = new StreamObservable<T>(notifications, this, this._logger);

    this._streamObservables.push(obs$);

    return obs$;
  }

  materialize<T>(obs$: Observable<T>): FrameNotification[] {
    const messages: FrameNotification[] = [];

    this.schedule(() => {
      obs$.subscribe({
        next: (x) => {
          const value = x instanceof Observable ? this.materializeInnerObservable(x, this.frame) : x;
          messages.push({ frame: this.frame, notification: createNextNotification(value) });
        },
        error: (error: unknown) => messages.push({ frame: this.frame, notification: createErrorNotification(error) }),
        complete: () => messages.push({ frame: this.frame, notification: createCompleteNotification() }),
      });
    }, 0);

    return messages;
  }

  run<T>(callback: (helpers: RunHelpers) => T): T {
    const prevMaxFrames = this.maxFrames;

    this.maxFrames = Infinity;

    const animator = this.createAnimator();
    const delegates = this.createDelegates();

    animationFrameProvider.delegate = animator.delegate;
    dateTimestampProvider.delegate = this;
    immediateProvider.delegate = delegates.immediate;
    intervalProvider.delegate = delegates.interval;
    performanceTimestampProvider.delegate = this;
    timeoutProvider.delegate = delegates.timeout;

    const helpers: RunHelpers = {
      streamObservable: <T = string>(marbles: string, values?: any, errorValue?: unknown) =>
        this.createStreamObservable<T>(marbles, values, errorValue),
      materialize: <T>(obs$: Observable<T>) => this.materialize<T>(obs$),
    }

    try {
      const result = callback(helpers);
      this.flush();
      return result;
    } finally {
      this.maxFrames = prevMaxFrames;

      animationFrameProvider.delegate = undefined;
      dateTimestampProvider.delegate = undefined;
      immediateProvider.delegate = undefined;
      intervalProvider.delegate = undefined;
      performanceTimestampProvider.delegate = undefined;
      timeoutProvider.delegate = undefined;
    }
  }
}
