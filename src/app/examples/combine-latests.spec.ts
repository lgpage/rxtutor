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
  let streamBuilder: StreamBuilderService;

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
    streamBuilder = TestBed.inject(StreamBuilderService);
  });

  it('should be created', () => {
    expect(example).toBeTruthy();
  });

  describe('example', () => {
    it('has expected source stream marbles', () => {
      const streams = example.getInputStreams();

      expect(streams.large[0].marbles$).toBeObservable(cold('0', ['--1--2----3----|']))
      expect(streams.large[1].marbles$).toBeObservable(cold('0', ['-A---B-----C---|']))
    });

    it('has expected source stream nodes', () => {
      const streams = example.getInputStreams();
      const indexes = streams.large.map((stream) => stream.nodes$.pipe(
        map((nodes) => nodes.map((node) => node.zIndex)),
      ));
      const positions = streams.large.map((stream) => stream.nodes$.pipe(
        map((nodes) => nodes.map((node) => node.x)),
      ));

      expect(indexes[0]).toBeObservable(cold('0', [[2, 5, 10, 15]]))
      expect(indexes[1]).toBeObservable(cold('0', [[1, 5, 11, 15]]))

      expect(positions[0]).toBeObservable(cold('0', [[28, 58, 108, 158]]))
      expect(positions[1]).toBeObservable(cold('0', [[18, 58, 118, 158]]))
    });

    it('returns expected observable', () => {
      const code = example.getCode();
      const streams = [
        cold('--1--2----3----|'),
        cold('-A---B-----C---|'),
      ]

      const result$ = executorSvc.getFunctionResult(code, streams as any);

      expect(result$).toBeObservable(cold('--a--(bc)-de---|', {
        a: ['1', 'A'],
        b: ['2', 'A'],
        c: ['2', 'B'],
        d: ['3', 'B'],
        e: ['3', 'C'],
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
        tap((marbles) => expect(marbles).toEqual('--(1A)--(2A2B)----(3C)(3D)---|')),
      ).subscribe(() => done())
    });
  });
});
