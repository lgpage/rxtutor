import { cold } from 'jasmine-marbles';
import { TestScheduler } from 'rxjs/testing';
import { TestBed } from '@angular/core/testing';
import { StreamBuilderService } from './stream.builder';

describe('StreamBuilder', () => {
  let testScheduler: TestScheduler;
  let service: StreamBuilderService;

  beforeEach(() => {
    testScheduler = new TestScheduler((actual, expected) => {
      expect(actual).toEqual(expected);
    });

    TestBed.configureTestingModule({
      providers: []
    });

    service = TestBed.inject(StreamBuilderService);
  });

  describe('marbles$', () => {
    describe('with single per frame', () => {
      describe('does not complete', () => {
        it('should return the expected observable', () => {
          const stream = service.inputStream([3, 5, 6, 9]);
          expect(stream.marbles$).toBeObservable(cold('0', ['---1-23--4']));
        });
      });

      describe('completes', () => {
        it('should return the expected observable', () => {
          const stream = service.inputStream([3, 5, 6], 7);
          expect(stream.marbles$).toBeObservable(cold('0', ['---1-23|']));
        });
      });

      describe('only completes', () => {
        it('should return the expected observable', () => {
          const stream = service.inputStream([], 7);
          expect(stream.marbles$).toBeObservable(cold('0', ['-------|']));
        });
      });

      describe('errors', () => {
        it('should return the expected observable', () => {
          const stream = service.inputStream([3, 5, 6], null, 7);
          expect(stream.marbles$).toBeObservable(cold('0', ['---1-23#']));
        });
      });

      describe('only errors', () => {
        it('should return the expected observable', () => {
          const stream = service.inputStream([], null, 7);
          expect(stream.marbles$).toBeObservable(cold('0', ['-------#']));
        });
      });
    });

    describe('with multiple per frame', () => {
      describe('does not complete', () => {
        it('should return the expected observable', () => {
          const stream = service.inputStream([2, 4, 5, 5, 7]);
          expect(stream.marbles$).toBeObservable(cold('0', ['--1-2(34)-5']));
        });
      });

      describe('completes', () => {
        it('should return the expected observable', () => {
          const stream = service.inputStream([3, 5, 6], 6);
          expect(stream.marbles$).toBeObservable(cold('0', ['---1-2(3|)']));
        });
      });

      describe('errors', () => {
        it('should return the expected observable', () => {
          const stream = service.inputStream([3, 5, 6], null, 6);
          expect(stream.marbles$).toBeObservable(cold('0', ['---1-2(3#)']));
        });
      });
    });
  });
});
