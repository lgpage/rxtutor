import { cold } from 'jasmine-marbles';
import { MockService } from 'ng-mocks';
import { first, map, of, tap } from 'rxjs';
import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { InputStreamLike } from '../core';
import { ExecutorService, RuntimeService, StreamBuilderService } from '../services';
import { MergeMapExample } from './merge-map';

describe('MergeMapExample', () => {
  let example: MergeMapExample;
  let executorSvc: ExecutorService;
  let streamBuilderSvc: StreamBuilderService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        MergeMapExample,
        ExecutorService,
        StreamBuilderService,
        { provide: MatSnackBar, useValue: MockService(MatSnackBar) },
        {
          provide: RuntimeService,
          useValue: MockService(RuntimeService, { exampleSize$: of('large') } as Partial<RuntimeService>)
        },
      ]
    });

    example = TestBed.inject(MergeMapExample);
    executorSvc = TestBed.inject(ExecutorService);
    streamBuilderSvc = TestBed.inject(StreamBuilderService);
  });

  it('should be created', () => {
    expect(example).toBeTruthy();
  });

  describe('desktop', () => {
    const one = '   -12----34------|';
    const two = '   a-b|';
    const output = '-ABCD--EFGH----|';

    const outputValues = { A: '1a', B: '2a', C: '1b', D: '2b', E: '3a', F: '4a', G: '3b', H: '4b' };

    let code: string;
    let inputStreams: InputStreamLike[];

    beforeEach(() => {
      streamBuilderSvc.setFrames('large');

      code = example.getCode();
      inputStreams = example.getInputStreams().large;
    });

    describe('example', () => {
      it('has expected source stream marbles', () => {
        expect(inputStreams[0].marbles$).toBeObservable(cold('0', [
          { marbles: one.trim(), values: { 1: '1', 2: '2', 3: '3', 4: '4' }, error: null, canDisplayAsValue: true }
        ]));

        expect(inputStreams[1].marbles$).toBeObservable(cold('0', [
          { marbles: two.trim(), values: { a: 'a', b: 'b' }, error: null, canDisplayAsValue: true }
        ]));
      });

      it('has expected source stream nodes', () => {
        const positions = inputStreams.map((stream) => stream.nodes$.pipe(
          map((nodes) => nodes.map((node) => node.x)),
        ));

        expect(positions[0]).toBeObservable(cold('0', [[18, 28, 78, 88, 158]]));
        expect(positions[1]).toBeObservable(cold('0', [[8, 28, 38]]));
      });

      it('returns expected observable', () => {
        const result$ = executorSvc.getFunctionResult(code, [cold(one), cold(two)]);
        expect(result$).toBeObservable(cold(output, outputValues));
      });
    });

    describe('output stream', () => {
      it('returns the expected observable', (done) => {
        const result = executorSvc.getVisualizedOutput(of(code), of(inputStreams));

        result.marbles$.pipe(
          first(),
          tap(({ marbles, values }) => {
            expect(marbles).toEqual(output.trim());
            expect(values).toEqual(outputValues);
          }),
        ).subscribe(() => done());
      });
    });
  });

  describe('mobile', () => {
    const one = '   -12----|';
    const two = '   a-b|';
    const output = '-ABCD--|';

    const outputValues = { A: '1a', B: '2a', C: '1b', D: '2b' };

    let code: string;
    let inputStreams: InputStreamLike[];

    beforeEach(() => {
      streamBuilderSvc.setFrames('small');

      code = example.getCode();
      inputStreams = example.getInputStreams().small;
    });

    describe('example', () => {
      it('has expected source stream marbles', () => {
        expect(inputStreams[0].marbles$).toBeObservable(cold('0', [
          { marbles: one.trim(), values: { 1: '1', 2: '2' }, error: null, canDisplayAsValue: true }
        ]));

        expect(inputStreams[1].marbles$).toBeObservable(cold('0', [
          { marbles: two.trim(), values: { a: 'a', b: 'b' }, error: null, canDisplayAsValue: true }
        ]));
      });

      it('has expected source stream nodes', () => {
        const positions = inputStreams.map((stream) => stream.nodes$.pipe(
          map((nodes) => nodes.map((node) => node.x)),
        ));

        expect(positions[0]).toBeObservable(cold('0', [[18, 28, 78]]));
        expect(positions[1]).toBeObservable(cold('0', [[8, 28, 38]]));
      });

      it('returns expected observable', () => {
        const result$ = executorSvc.getFunctionResult(code, [cold(one), cold(two)]);
        expect(result$).toBeObservable(cold(output, outputValues));
      });
    });

    describe('output stream', () => {
      it('returns the expected observable', (done) => {
        const result = executorSvc.getVisualizedOutput(of(code), of(inputStreams));

        result.marbles$.pipe(
          first(),
          tap(({ marbles, values }) => {
            expect(marbles).toEqual(output.trim());
            expect(values).toEqual(outputValues);
          }),
        ).subscribe(() => done());
      });
    });
  });
});
