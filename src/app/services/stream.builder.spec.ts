import { cold } from 'jasmine-marbles';
import { MockService } from 'ng-mocks';
import { of } from 'rxjs';
import { TestBed } from '@angular/core/testing';
import { RuntimeService } from './runtime.service';
import { StreamBuilderService } from './stream.builder';

describe('StreamBuilder', () => {
  let service: StreamBuilderService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: RuntimeService, useValue: MockService(RuntimeService, { exampleSize$: of<'small' | 'large'>('large') }) },
      ]
    });

    service = TestBed.inject(StreamBuilderService);
  });

  describe('marbles$', () => {
    describe('with single per frame', () => {
      describe('does not complete', () => {
        it('should return the expected observable', () => {
          const stream = service.inputStream([3, 5, 6, 9]);
          expect(stream.marbles$).toBeObservable(cold('0', [{
            marbles: '---1-23--4',
            values: null,
            error: null,
            canDisplayAsValue: false,
          }]));
        });
      });

      describe('completes', () => {
        it('should return the expected observable', () => {
          const stream = service.inputStream([3, 5, 6], 7);
          expect(stream.marbles$).toBeObservable(cold('0', [{
            marbles: '---1-23|',
            values: null,
            error: null,
            canDisplayAsValue: false,
          }]));
        });
      });

      describe('only completes', () => {
        it('should return the expected observable', () => {
          const stream = service.inputStream([], 7);
          expect(stream.marbles$).toBeObservable(cold('0', [{
            marbles: '-------|',
            values: null,
            error: null,
            canDisplayAsValue: false,
          }]));
        });
      });

      describe('errors', () => {
        it('should return the expected observable', () => {
          const stream = service.inputStream([3, 5, 6], null, 7);
          expect(stream.marbles$).toBeObservable(cold('0', [{
            marbles: '---1-23#',
            values: null,
            error: null,
            canDisplayAsValue: false,
          }]));
        });
      });

      describe('only errors', () => {
        it('should return the expected observable', () => {
          const stream = service.inputStream([], null, 7);
          expect(stream.marbles$).toBeObservable(cold('0', [{
            marbles: '-------#',
            values: null,
            error: null,
            canDisplayAsValue: false,
          }]));
        });
      });
    });

    describe('with multiple per frame', () => {
      describe('does not complete', () => {
        it('should return the expected observable', () => {
          const stream = service.inputStream([2, 4, 5, 5, 7]);
          expect(stream.marbles$).toBeObservable(cold('0', [{
            marbles: '--1-2(34)-5',
            values: null,
            error: null,
            canDisplayAsValue: false,
          }]));
        });
      });

      describe('completes', () => {
        it('should return the expected observable', () => {
          const stream = service.inputStream([3, 5, 6], 6);
          expect(stream.marbles$).toBeObservable(cold('0', [{
            marbles: '---1-2(3|)',
            values: null,
            error: null,
            canDisplayAsValue: false,
          }]));
        });
      });

      describe('errors', () => {
        it('should return the expected observable', () => {
          const stream = service.inputStream([3, 5, 6], null, 6);
          expect(stream.marbles$).toBeObservable(cold('0', [{
            marbles: '---1-2(3#)',
            values: null,
            error: null,
            canDisplayAsValue: false,
          }]));
        });
      });
    });
  });
});
