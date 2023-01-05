/* eslint-disable rxjs/no-internal */
import { SchedulerLike, Subscription } from 'rxjs';
import { TimerHandle } from 'rxjs/internal/scheduler/timerHandle';
import { getMarbleNotifications } from './marble';

// Code adapted from https://github.com/ReactiveX/rxjs/tree/master/src/internal/testing

export type SetHandler = (handler: () => void, timeout?: number, ...args: any[]) => TimerHandle;
export type ClearHandler = (handle: TimerHandle) => void;
export type ScheduleLookupType = 'immediate' | 'interval' | 'timeout';

export interface AnimatorDelegate {
  requestAnimationFrame: (callback: FrameRequestCallback) => number;
  cancelAnimationFrame: (handle: number) => void;
}

export interface Animator {
  animate: (marbles: string) => Map<number, FrameRequestCallback>;
  delegate: AnimatorDelegate;
}

export interface ImmediateDelegate {
  setImmediate: (handler: () => void) => number;
  clearImmediate: ClearHandler;
}

export interface TimeoutDelegate {
  setTimeout: SetHandler;
  clearTimeout: ClearHandler;
}

export interface IntervalDelegate {
  setInterval: SetHandler;
  clearInterval: ClearHandler;
}

export interface ScheduleLookup {
  due: number;
  duration: number;
  handle: TimerHandle;
  handler: () => void;
  subscription: Subscription;
  type: ScheduleLookupType;
}

export interface Delegates {
  immediate: ImmediateDelegate;
  interval: IntervalDelegate;
  timeout: TimeoutDelegate;
  scheduleLookup: Map<TimerHandle, ScheduleLookup>;
  run: () => void;
}

export const createAnimator = (scheduler: SchedulerLike): Animator => {
  let lastHandle = 0;
  let map: Map<number, FrameRequestCallback>;

  const animate = (marbles: string): Map<number, FrameRequestCallback> => {
    if (/[|#]/.test(marbles)) {
      throw new Error('animate() must not complete or error');
    }

    map = new Map<number, FrameRequestCallback>();
    const messages = getMarbleNotifications(marbles);

    for (const message of messages) {
      scheduler.schedule(() => {
        const now = scheduler.now();
        const callbacks = Array.from(map.values());

        map.clear();
        for (const callback of callbacks) {
          callback(now);
        }
      }, message.frame);
    }

    return map;
  };

  const delegate: AnimatorDelegate = {
    requestAnimationFrame(callback: FrameRequestCallback): number {
      const handle = ++lastHandle;
      map.set(handle, callback);
      return handle;
    },
    cancelAnimationFrame(handle: number): void {
      map.delete(handle);
    },
  };

  return { animate, delegate };
};

export const createDelegates = (scheduler: SchedulerLike): Delegates => {
  const scheduleLookup = new Map<TimerHandle, ScheduleLookup>();

  const run = () => {
    const now = scheduler.now();
    const scheduledRecords = Array.from(scheduleLookup.values());
    const scheduledRecordsDue = scheduledRecords.filter(({ due }) => due <= now);
    const dueImmediate = scheduledRecordsDue.filter(({ type }) => type === 'immediate');

    if (dueImmediate.length > 0) {
      const { handle, handler } = dueImmediate[0];

      scheduleLookup.delete(handle);
      handler();

      return;
    }

    const dueIntervals = scheduledRecordsDue.filter(({ type }) => type === 'interval');
    if (dueIntervals.length > 0) {
      const firstDueInterval = dueIntervals[0];
      const { duration, handler } = firstDueInterval;

      firstDueInterval.due = now + duration;
      firstDueInterval.subscription = scheduler.schedule(run, duration);
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

  let lastHandle = 0;

  const immediate: ImmediateDelegate = {
    setImmediate: (handler: () => void): number => {
      const handle = ++lastHandle;

      scheduleLookup.set(handle, {
        due: scheduler.now(),
        duration: 0,
        handle,
        handler,
        subscription: scheduler.schedule(run, 0),
        type: 'immediate',
      });

      return handle;
    },
    clearImmediate: (handle: TimerHandle): void => {
      const value = scheduleLookup.get(handle);

      if (value) {
        value.subscription.unsubscribe();
        scheduleLookup.delete(handle);
      }
    },
  };

  const interval: IntervalDelegate = {
    setInterval: (handler: () => void, duration = 0) => {
      const handle = ++lastHandle;

      scheduleLookup.set(handle, {
        due: scheduler.now() + duration,
        duration,
        handle,
        handler,
        subscription: scheduler.schedule(run, duration),
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

  const timeout: TimeoutDelegate = {
    setTimeout: (handler: () => void, duration = 0) => {
      const handle = ++lastHandle;

      scheduleLookup.set(handle, {
        due: scheduler.now() + duration,
        duration,
        handle,
        handler,
        subscription: scheduler.schedule(run, duration),
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

  return { immediate, interval, timeout, scheduleLookup, run };
};
