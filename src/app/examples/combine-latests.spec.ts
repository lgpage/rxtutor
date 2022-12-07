import { cold } from 'jasmine-marbles';
import { MockService } from 'ng-mocks';
import { first, map, of, tap } from 'rxjs';
import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ExecutorService, RuntimeService, StreamBuilderService } from '../services';
import { CombineLatestExample } from './combine-latest';

describe('CombineLatestExample', () => {
  let example: CombineLatestExample;
  let executorSvc: ExecutorService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CombineLatestExample,
        ExecutorService,
        StreamBuilderService,
        { provide: MatSnackBar, useValue: MockService(MatSnackBar) },
        { provide: RuntimeService, useValue: MockService(RuntimeService, { exampleSize$: of<'small' | 'large'>('large') }) },
      ]
    });

    example = TestBed.inject(CombineLatestExample);
    executorSvc = TestBed.inject(ExecutorService);
  });

  it('should be created', () => {
    expect(example).toBeTruthy();
  });

  describe('example', () => {
    it('has expected source stream marbles', () => {
      const streams = example.getInputStreams();

      expect(streams.large[0].marbles$).toBeObservable(cold('0', [{
        marbles: '--1--2----3----|',
        values: null,
        error: null,
        canDisplayAsValue: false,
      }]))

      expect(streams.large[1].marbles$).toBeObservable(cold('0', [{
        marbles: '-a---b-----c---|',
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

      expect(positions[0]).toBeObservable(cold('0', [[28, 58, 108, 158]]))
      expect(positions[1]).toBeObservable(cold('0', [[18, 58, 118, 158]]))
    });

    it('returns expected observable', () => {
      const code = example.getCode();
      const streams = [
        cold('--1--2----3----|'),
        cold('-a---b-----c---|'),
      ]

      const result$ = executorSvc.getFunctionResult(code, streams as any);

      expect(result$).toBeObservable(cold('--A--(BC)-DE---|', {
        A: '1a',
        B: '2a',
        C: '2b',
        D: '3b',
        E: '3c',
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
          expect(marbles).toEqual('--A--(BC)----DE---|');
          expect(values).toEqual({
            A: '1a',
            B: '2a',
            C: '2b',
            D: '3b',
            E: '3c',
          })
        }),
      ).subscribe(() => done())
    });
  });
});
