import { cold } from 'jasmine-marbles';
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
            expectObservable(stream.source$).toBe('---1-23--4');
          });
        });
      });

      describe('completes', () => {
        it('should return the expected observable', () => {
          const stream = new StreamBuilder().create([3, 5, 6], 7);

          testScheduler.run(({ expectObservable }) => {
            expectObservable(stream.source$).toBe('---1-23|');
          });
        });
      });

      describe('only completes', () => {
        it('should return the expected observable', () => {
          const stream = new StreamBuilder().create([], 7);

          testScheduler.run(({ expectObservable }) => {
            expectObservable(stream.source$).toBe('-------|');
          });
        });
      });

      describe('errors', () => {
        it('should return the expected observable', () => {
          const stream = new StreamBuilder().create([3, 5, 6], null, 7);

          testScheduler.run(({ expectObservable }) => {
            expectObservable(stream.source$).toBe('---1-23#');
          });
        });
      });

      describe('only errors', () => {
        it('should return the expected observable', () => {
          const stream = new StreamBuilder().create([], null, 7);

          testScheduler.run(({ expectObservable }) => {
            expectObservable(stream.source$).toBe('-------#');
          });
        });
      });
    });

    describe('with multiple per frame', () => {
      describe('does not complete', () => {
        it('should return the expected observable', () => {
          const stream = new StreamBuilder().create([2, 4, 5, 5, 10]);

          testScheduler.run(({ expectObservable }) => {
            expectObservable(stream.source$).toBe('--1-2(34)-5');
          });
        });
      });

      describe('completes', () => {
        it('should return the expected observable', () => {
          const stream = new StreamBuilder().create([3, 5, 6], 6);

          testScheduler.run(({ expectObservable }) => {
            expectObservable(stream.source$).toBe('---1-2(3|)');
          });
        });
      });

      describe('errors', () => {
        it('should return the expected observable', () => {
          const stream = new StreamBuilder().create([3, 5, 6], null, 6);

          testScheduler.run(({ expectObservable }) => {
            expectObservable(stream.source$).toBe('---1-2(3#)');
          });
        });
      });
    });
  });

  describe('marbles$', () => {
    describe('with single per frame', () => {
      describe('does not complete', () => {
        it('should return the expected observable', () => {
          const stream = new StreamBuilder().create([3, 5, 6, 9]);
          expect(stream.marbles$).toBeObservable(cold('0', ['---1-23--4']));
        });
      });

      describe('completes', () => {
        it('should return the expected observable', () => {
          const stream = new StreamBuilder().create([3, 5, 6], 7);
          expect(stream.marbles$).toBeObservable(cold('0', ['---1-23|']));
        });
      });

      describe('only completes', () => {
        it('should return the expected observable', () => {
          const stream = new StreamBuilder().create([], 7);
          expect(stream.marbles$).toBeObservable(cold('0', ['-------|']));
        });
      });

      describe('errors', () => {
        it('should return the expected observable', () => {
          const stream = new StreamBuilder().create([3, 5, 6], null, 7);
          expect(stream.marbles$).toBeObservable(cold('0', ['---1-23#']));
        });
      });

      describe('only errors', () => {
        it('should return the expected observable', () => {
          const stream = new StreamBuilder().create([], null, 7);
          expect(stream.marbles$).toBeObservable(cold('0', ['-------#']));
        });
      });
    });

    describe('with multiple per frame', () => {
      describe('does not complete', () => {
        it('should return the expected observable', () => {
          const stream = new StreamBuilder().create([2, 4, 5, 5, 7]);
          expect(stream.marbles$).toBeObservable(cold('0', ['--1-2(34)-5']));
        });
      });

      describe('completes', () => {
        it('should return the expected observable', () => {
          const stream = new StreamBuilder().create([3, 5, 6], 6);
          expect(stream.marbles$).toBeObservable(cold('0', ['---1-2(3|)']));
        });
      });

      describe('errors', () => {
        it('should return the expected observable', () => {
          const stream = new StreamBuilder().create([3, 5, 6], null, 6);
          expect(stream.marbles$).toBeObservable(cold('0', ['---1-2(3#)']));
        });
      });
    });
  });
});
