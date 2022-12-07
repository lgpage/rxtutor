import { cold } from 'jasmine-marbles';
import { MockService } from 'ng-mocks';
import { first, map, of, tap } from 'rxjs';
import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ExecutorService, RuntimeService, StreamBuilderService } from '../services';
import { MergeMapExample } from './merge-map';

describe('MergeMapExample', () => {
  let example: MergeMapExample;
  let executorSvc: ExecutorService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        MergeMapExample,
        ExecutorService,
        StreamBuilderService,
        { provide: MatSnackBar, useValue: MockService(MatSnackBar) },
        { provide: RuntimeService, useValue: MockService(RuntimeService, { exampleSize$: of<'small' | 'large'>('large') }) },
      ]
    });

    example = TestBed.inject(MergeMapExample);
    executorSvc = TestBed.inject(ExecutorService);
  });

  it('should be created', () => {
    expect(example).toBeTruthy();
  });

  describe('example', () => {
    it('has expected source stream marbles', () => {
      const streams = example.getInputStreams();

      expect(streams.large[0].marbles$).toBeObservable(cold('0', [{
        marbles: '-1---23--------|',
        values: null,
        error: null,
        canDisplayAsValue: false,
      }]))

      expect(streams.large[1].marbles$).toBeObservable(cold('0', [{
        marbles: 'a-b|',
        values: null,
        error: null,
        canDisplayAsValue: false,
      }]))
    });

    it('has expected source stream nodes', () => {
      const streams = example.getInputStreams();
      const positions = streams.large.map((stream) => stream.nodes$.pipe(
        map((nodes) => nodes.map((node) => node.x)),
      ));

      expect(positions[0]).toBeObservable(cold('0', [[18, 58, 68, 158]]))
      expect(positions[1]).toBeObservable(cold('0', [[8, 28, 38]]))
    });

    it('returns expected observable', () => {
      const code = example.getCode();
      const streams = [
        cold('-1---23--------|'),
        cold('a-b|'),
      ]

      const result$ = executorSvc.getFunctionResult(code, streams as any);

      expect(result$).toBeObservable(cold('-A-B-CDEF------|', {
        A: '1a',
        B: '1b',
        C: '2a',
        D: '3a',
        E: '2b',
        F: '3b',
      }));
    });
  });

  describe('output stream', () => {
    it('returns the expected observable', (done) => {
      const code = example.getCode();
      const inputStreams = example.getInputStreams();
      const result = executorSvc.getVisualizedOutput(of(code), of(inputStreams.large));

      result.marbles$.pipe(
        first(),
        tap(({ marbles, values }) => {
          expect(marbles).toEqual('-A-B-CDEF------|');
          expect(values).toEqual({
            A: '1a',
            B: '1b',
            C: '2a',
            D: '3a',
            E: '2b',
            F: '3b',
          })
        }),
      ).subscribe(() => done())
    });
  });
});
