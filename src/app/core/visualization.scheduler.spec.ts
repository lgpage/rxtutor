import { MockService } from 'ng-mocks';
import { Observable, of, tap } from 'rxjs';
import { LoggerService } from '../logger.service';
import { FrameNotification } from './types';
import { VisualizationScheduler } from './visualization.scheduler';

class VisualizationSchedulerExposed extends VisualizationScheduler {
  materializeInnerObservable(obs$: Observable<any>, outerFrame: number): FrameNotification[] {
    return super.materializeInnerObservable(obs$, outerFrame);
  }

  runSetup(): void {
    return super.runSetup();
  }

  runTearDown(prevMaxFrames: number): void {
    return super.runTearDown(prevMaxFrames);
  }
}

describe('VisualizationScheduler', () => {
  let exposed: VisualizationSchedulerExposed;
  let scheduler: VisualizationScheduler;

  beforeEach(() => {
    exposed = new VisualizationSchedulerExposed(1, MockService(LoggerService));
    scheduler = exposed;
  });

  it('should be created', () => {
    expect(scheduler).toBeTruthy();
  });

  describe('materializeInnerObservable', () => {
    it('returns expected messages', () => {
      scheduler.frame = 5;

      const result = exposed.materializeInnerObservable(of(10), 2);

      expect(result).toEqual([
        { frame: 3, notification: { kind: 'N', value: 10 } },
        { frame: 3, notification: { kind: 'C' } },
      ]);
    });

    describe('when observable throws an error', () => {
      it('returns expected messages', () => {
        scheduler.frame = 5;

        const error = new Error('Whoops');
        const obs$ = of(10).pipe(
          tap(() => {
            throw error;
          }),
        );

        const result = exposed.materializeInnerObservable(obs$, 2);

        expect(result).toEqual([{ frame: 3, notification: { kind: 'E', error } }]);
      });
    });
  });

  describe('createStreamObservable', () => {
    it('returns expected result', () => {
      const result$ = scheduler.createStreamObservable('-A-BC', { A: 1, B: 2, C: 3 });

      expect(result$.messages).toEqual([
        { frame: 1, notification: { kind: 'N', value: 1 } },
        { frame: 3, notification: { kind: 'N', value: 2 } },
        { frame: 4, notification: { kind: 'N', value: 3 } },
      ]);
    });
  });

  describe('materialize', () => {
    it('returns expected result', () => {
      scheduler.frame = 5;

      const result = scheduler.materialize(of(10));
      scheduler.flush();

      expect(result).toEqual([
        { frame: 5, notification: { kind: 'N', value: 10 } },
        { frame: 5, notification: { kind: 'C' } },
      ]);
    });

    describe('when observable throws an error', () => {
      it('returns expected messages', () => {
        scheduler.frame = 5;

        const error = new Error('Whoops');
        const obs$ = of(10).pipe(
          tap(() => {
            throw error;
          }),
        );

        const result = exposed.materialize(obs$);
        scheduler.flush();

        expect(result).toEqual([{ frame: 5, notification: { kind: 'E', error } }]);
      });
    });
  });

  describe('run', () => {
    let setupSpy: jasmine.Spy;
    let tearDownSpy: jasmine.Spy;
    let flushSpy: jasmine.Spy;
    let materializeSpy: jasmine.Spy;
    let createStreamObservableSpy: jasmine.Spy;

    beforeEach(() => {
      setupSpy = spyOn(exposed, 'runSetup');
      tearDownSpy = spyOn(exposed, 'runTearDown');
      flushSpy = spyOn(scheduler, 'flush');
      materializeSpy = spyOn(scheduler, 'materialize');
      createStreamObservableSpy = spyOn(scheduler, 'createStreamObservable');
    });

    it('should call expected methods', () => {
      scheduler.run(({ streamObservable, materialize }) => {
        const obs$ = of(1);

        expect(setupSpy).toHaveBeenCalled();
        expect(streamObservable).toBeTruthy();
        expect(materialize).toBeTruthy();

        streamObservable('a', { a: 1 });
        materialize(obs$);

        expect(createStreamObservableSpy).toHaveBeenCalledWith('a', { a: 1 }, undefined);
        expect(materializeSpy).toHaveBeenCalledWith(obs$);
      });

      expect(flushSpy).toHaveBeenCalled();
      expect(tearDownSpy).toHaveBeenCalledWith(750);
    });
  });
});
