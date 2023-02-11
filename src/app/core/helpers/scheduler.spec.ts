/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable rxjs/no-internal */
import { Scheduler, SchedulerAction, SchedulerLike, Subscription } from 'rxjs';
import { Action } from 'rxjs/internal/scheduler/Action';
import { Animator, createAnimator, createDelegates, Delegates } from './scheduler';

class TestAction<T = unknown> extends Action<T> {
  constructor(protected scheduler: Scheduler, protected work: (this: SchedulerAction<T>, state?: T) => void) {
    super(scheduler, work);
  }

  execute(): any {
    this.work();
  }
}

describe('createAnimator', () => {
  let schedulerSpy: jasmine.SpyObj<SchedulerLike>;
  let animator: Animator;

  beforeEach(() => {
    schedulerSpy = jasmine.createSpyObj<SchedulerLike>('SchedulerLike', ['schedule', 'now']);
    animator = createAnimator(schedulerSpy);
  });

  it('should create animator', () => {
    const { animate, delegate } = animator;

    expect(animate).toBeTruthy();
    expect(delegate).toBeTruthy();
  });

  describe('animate', () => {
    describe('marbles complete or error', () => {
      it('should throw an error', () => {
        const { animate } = animator;

        expect(() => animate('|')).toThrowError('animate() must not complete or error');
        expect(() => animate('#')).toThrowError('animate() must not complete or error');
      });
    });

    it('should create new map', () => {
      const { animate, delegate } = animator;
      const callbackSpy1 = jasmine.createSpy('callback1');
      const callbackSpy2 = jasmine.createSpy('callback2');

      const map1 = animate('A');
      delegate.requestAnimationFrame(callbackSpy1);

      const map2 = animate('B');
      delegate.requestAnimationFrame(callbackSpy2);

      expect(map1).not.toBe(map2);
      expect(map1.get(1)).toEqual(callbackSpy1);
      expect(map2.get(2)).toEqual(callbackSpy2);
    });

    it('should schedule callbacks', () => {
      const { animate, delegate } = animator;

      schedulerSpy.now.and.returnValue(12);
      schedulerSpy.schedule.and.callFake((work: (this: SchedulerAction<unknown>, state?: unknown) => void) => {
        const action = new TestAction(schedulerSpy as unknown as Scheduler, work);

        const callbackSpy = jasmine.createSpy('callback');
        delegate.requestAnimationFrame(callbackSpy);

        action.execute();
        expect(schedulerSpy.now).toHaveBeenCalled();
        expect(callbackSpy).toHaveBeenCalledWith(12);

        return action.schedule();
      });

      animate('-A-');

      expect(schedulerSpy.schedule).toHaveBeenCalledWith(jasmine.any(Function), 10);
    });
  });

  describe('delegate', () => {
    let map: Map<number, FrameRequestCallback>;

    beforeEach(() => {
      const { animate } = animator;
      map = animate('-A-');
    });

    describe('requestAnimationFrame', () => {
      it('should set handler', () => {
        const { delegate } = animator;

        // Act 1/2
        const callback1: FrameRequestCallback = () => { };
        let result = delegate.requestAnimationFrame(callback1);

        expect(result).toEqual(1);
        expect(map.get(1)).toBe(callback1);

        // Act 2/2
        const callback2: FrameRequestCallback = () => { };
        result = delegate.requestAnimationFrame(callback2);

        expect(result).toEqual(2);
        expect(map.get(2)).toBe(callback2);
      });
    });

    describe('requestAnimationFrame', () => {
      it('should remove handler', () => {
        const callback: FrameRequestCallback = () => { };
        const { delegate } = animator;

        delegate.requestAnimationFrame(callback);
        delegate.requestAnimationFrame(callback);
        delegate.requestAnimationFrame(callback);

        // Act
        delegate.cancelAnimationFrame(2);

        expect(map.get(1)).toBe(callback);
        expect(map.get(2)).toBeUndefined();
        expect(map.get(3)).toBe(callback);
      });
    });
  });
});

describe('createDelegates', () => {
  let schedulerSpy: jasmine.SpyObj<SchedulerLike>;
  let delegates: Delegates;

  beforeEach(() => {
    schedulerSpy = jasmine.createSpyObj<SchedulerLike>('SchedulerLike', ['schedule', 'now']);
    delegates = createDelegates(schedulerSpy);
  });

  it('should create delegates', () => {
    const { immediate, interval, timeout } = delegates;

    expect(immediate).toBeTruthy();
    expect(interval).toBeTruthy();
    expect(timeout).toBeTruthy();
  });

  describe('immediate', () => {
    describe('setImmediate', () => {
      it('should set handle', () => {
        const handler = () => { };
        const { immediate, scheduleLookup, run } = delegates;
        const subscription = new Subscription();

        schedulerSpy.now.and.returnValue(12);
        schedulerSpy.schedule.and.returnValue(subscription);

        // Act 1/2
        let result = immediate.setImmediate(handler);

        expect(result).toEqual(1);
        expect(schedulerSpy.now).toHaveBeenCalled();
        expect(schedulerSpy.schedule).toHaveBeenCalledWith(run, 0);

        let lookup = scheduleLookup.get(1);
        expect(lookup?.due).toEqual(12);
        expect(lookup?.duration).toEqual(0);
        expect(lookup?.handle).toEqual(1);
        expect(lookup?.handler).toBe(handler);
        expect(lookup?.subscription).toBe(subscription);
        expect(lookup?.type).toEqual('immediate');

        // Act 2/2
        result = immediate.setImmediate(handler);

        expect(result).toEqual(2);

        lookup = scheduleLookup.get(2);
        expect(lookup?.handle).toEqual(2);
      });
    });

    describe('clearImmediate', () => {
      it('should clear handle', () => {
        const handler = () => { };
        const { immediate, scheduleLookup } = delegates;
        const subscriptionMock = jasmine.createSpyObj<Subscription>('Subscription', ['unsubscribe']);

        schedulerSpy.now.and.returnValue(12);
        schedulerSpy.schedule.and.returnValue(subscriptionMock);

        immediate.setImmediate(handler);
        immediate.setImmediate(handler);

        expect(scheduleLookup.get(2)).toBeTruthy();

        // Act
        immediate.clearImmediate(2);

        expect(subscriptionMock.unsubscribe).toHaveBeenCalled();
        expect(scheduleLookup.get(2)).toBeUndefined();
      });
    });
  });

  describe('interval', () => {
    describe('setInterval', () => {
      it('should set handle', () => {
        const handler = () => { };
        const { interval, scheduleLookup, run } = delegates;
        const subscription = new Subscription();

        schedulerSpy.now.and.returnValue(12);
        schedulerSpy.schedule.and.returnValue(subscription);

        // Act 1/2
        let result = interval.setInterval(handler, 8);

        expect(result).toEqual(1);
        expect(schedulerSpy.now).toHaveBeenCalled();
        expect(schedulerSpy.schedule).toHaveBeenCalledWith(run, 8);

        let lookup = scheduleLookup.get(1);
        expect(lookup?.due).toEqual(20);
        expect(lookup?.duration).toEqual(8);
        expect(lookup?.handle).toEqual(1);
        expect(lookup?.handler).toBe(handler);
        expect(lookup?.subscription).toBe(subscription);
        expect(lookup?.type).toEqual('interval');

        // Act 2/2
        result = interval.setInterval(handler, 9);

        expect(result).toEqual(2);

        lookup = scheduleLookup.get(2);
        expect(lookup?.handle).toEqual(2);
        expect(lookup?.duration).toEqual(9);
      });
    });

    describe('clearInterval', () => {
      it('should clear handle', () => {
        const handler = () => { };
        const { interval, scheduleLookup } = delegates;
        const subscriptionMock = jasmine.createSpyObj<Subscription>('Subscription', ['unsubscribe']);

        schedulerSpy.now.and.returnValue(12);
        schedulerSpy.schedule.and.returnValue(subscriptionMock);

        interval.setInterval(handler);
        interval.setInterval(handler);

        expect(scheduleLookup.get(2)).toBeTruthy();

        // Act
        interval.clearInterval(2);

        expect(subscriptionMock.unsubscribe).toHaveBeenCalled();
        expect(scheduleLookup.get(2)).toBeUndefined();
      });
    });
  });

  describe('timeout', () => {
    describe('setTimeout', () => {
      it('should set handle', () => {
        const handler = () => { };
        const { timeout, scheduleLookup, run } = delegates;
        const subscription = new Subscription();

        schedulerSpy.now.and.returnValue(12);
        schedulerSpy.schedule.and.returnValue(subscription);

        // Act 1/2
        let result = timeout.setTimeout(handler, 8);

        expect(result).toEqual(1);
        expect(schedulerSpy.now).toHaveBeenCalled();
        expect(schedulerSpy.schedule).toHaveBeenCalledWith(run, 8);

        let lookup = scheduleLookup.get(1);
        expect(lookup?.due).toEqual(20);
        expect(lookup?.duration).toEqual(8);
        expect(lookup?.handle).toEqual(1);
        expect(lookup?.handler).toBe(handler);
        expect(lookup?.subscription).toBe(subscription);
        expect(lookup?.type).toEqual('timeout');

        // Act 2/2
        result = timeout.setTimeout(handler, 9);

        expect(result).toEqual(2);

        lookup = scheduleLookup.get(2);
        expect(lookup?.handle).toEqual(2);
        expect(lookup?.duration).toEqual(9);
      });
    });

    describe('clearTimeout', () => {
      it('should clear handle', () => {
        const handler = () => { };
        const { timeout, scheduleLookup } = delegates;
        const subscriptionMock = jasmine.createSpyObj<Subscription>('Subscription', ['unsubscribe']);

        schedulerSpy.now.and.returnValue(12);
        schedulerSpy.schedule.and.returnValue(subscriptionMock);

        timeout.setTimeout(handler);
        timeout.setTimeout(handler);

        expect(scheduleLookup.get(2)).toBeTruthy();

        // Act
        timeout.clearTimeout(2);

        expect(subscriptionMock.unsubscribe).toHaveBeenCalled();
        expect(scheduleLookup.get(2)).toBeUndefined();
      });
    });
  });

  describe('run', () => {
    let handlerSpy: jasmine.Spy;

    beforeEach(() => {
      handlerSpy = jasmine.createSpy('handler');
      schedulerSpy.now.and.returnValue(12);
    });

    describe('with no delegates', () => {
      it('should throw an error', () => {
        const { run } = delegates;
        expect(() => run()).toThrowError('Expected a due immediate or interval');
      });
    });

    describe('with immediate delegates', () => {
      it('should call expected methods', () => {
        const { immediate, scheduleLookup, run } = delegates;

        immediate.setImmediate(handlerSpy);
        expect(scheduleLookup.get(1)).toBeTruthy();

        // Act
        run();

        expect(scheduleLookup.get(1)).toBeUndefined();
        expect(handlerSpy).toHaveBeenCalled();
      });
    });

    describe('with interval delegates', () => {
      it('should call expected methods', () => {
        const { interval, scheduleLookup, run } = delegates;
        const subscription = new Subscription();

        schedulerSpy.schedule.and.returnValue(subscription);

        interval.setInterval(handlerSpy, 8);
        interval.setInterval(handlerSpy, 9);

        expect(scheduleLookup.get(1)).toBeTruthy();
        expect(scheduleLookup.get(2)).toBeTruthy();

        schedulerSpy.now.and.returnValue(30);

        // Act
        run();

        expect(handlerSpy).toHaveBeenCalledTimes(1);
        expect(schedulerSpy.schedule).toHaveBeenCalledWith(run, 8);

        const firstDueInterval = scheduleLookup.get(1);
        expect(firstDueInterval?.due).toEqual(38);
        expect(firstDueInterval?.subscription).toBe(subscription);
      });
    });

    describe('with timeout delegates', () => {
      it('should call expected methods', () => {
        const { timeout, scheduleLookup, run } = delegates;

        timeout.setTimeout(handlerSpy);
        expect(scheduleLookup.get(1)).toBeTruthy();

        // Act
        run();

        expect(scheduleLookup.get(1)).toBeUndefined();
        expect(handlerSpy).toHaveBeenCalled();
      });
    });
  });
});
