import { TestScheduler } from 'rxjs/testing';
import { StreamBuilder } from './stream.builder';

describe('Stream', () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler((actual, expected) => {
      expect(actual).toEqual(expected);
    });
  });

  describe('source$', () => {
    describe('with single per frame', () => {
      describe('does not complete', () => {
        it('should return the expected observable', () => {
          const stream = new StreamBuilder().create([3, 5, 6, 9]);

          testScheduler.run(({ expectObservable }) => {
            expectObservable(stream.source$).toBe('---0-12--3', ['1', '2', '3', '4']);
          });
        });
      });

      describe('completes', () => {
        it('should return the expected observable', () => {
          const stream = new StreamBuilder().create([3, 5, 6], 7);

          testScheduler.run(({ expectObservable }) => {
            expectObservable(stream.source$).toBe('---0-12|', ['1', '2', '3']);
          });
        });
      });

      describe('only completes', () => {
        it('should return the expected observable', () => {
          const stream = new StreamBuilder().create([], 7);

          testScheduler.run(({ expectObservable }) => {
            expectObservable(stream.source$).toBe('-------|', []);
          });
        });
      });

      describe('errors', () => {
        it('should return the expected observable', () => {
          const stream = new StreamBuilder().create([3, 5, 6], null, 7);

          testScheduler.run(({ expectObservable }) => {
            expectObservable(stream.source$).toBe('---0-12#', ['1', '2', '3'], 'E');
          });
        });
      });

      describe('only errors', () => {
        it('should return the expected observable', () => {
          const stream = new StreamBuilder().create([], null, 7);

          testScheduler.run(({ expectObservable }) => {
            expectObservable(stream.source$).toBe('-------#', [], 'E');
          });
        });
      });
    });

    describe('with multiple per frame', () => {
      describe('does not complete', () => {
        it('should return the expected observable', () => {
          const stream = new StreamBuilder().create([2, 4, 5, 5, 10]);

          testScheduler.run(({ expectObservable }) => {
            expectObservable(stream.source$).toBe('--0-1(23)-4', ['1', '2', '3', '4', '5']);
          });
        });
      });

      describe('completes', () => {
        it('should return the expected observable', () => {
          const stream = new StreamBuilder().create([3, 5, 6], 6);

          testScheduler.run(({ expectObservable }) => {
            expectObservable(stream.source$).toBe('---0-1(2|)', ['1', '2', '3']);
          });
        });
      });

      describe('errors', () => {
        fit('should return the expected observable', () => {
          const stream = new StreamBuilder().create([3, 5, 6], null, 6);

          testScheduler.run(({ expectObservable }) => {
            expectObservable(stream.source$).toBe('---0-1(2#)', ['1', '2', '3'], 'E');
          });
        });
      });
    });
  });
});
