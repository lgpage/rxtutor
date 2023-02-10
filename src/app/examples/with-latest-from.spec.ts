import { cold } from 'jasmine-marbles';
import { MockService } from 'ng-mocks';
import { first, map, of, tap } from 'rxjs';
import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { InputStreamLike } from '../core';
import { ExecutorService, RuntimeService, StreamBuilderService } from '../services';
import { WithLatestFromExample } from './with-latest-from';

describe('WithLatestFromExample', () => {
  let example: WithLatestFromExample;
  let executorSvc: ExecutorService;
  let streamBuilderSvc: StreamBuilderService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        WithLatestFromExample,
        ExecutorService,
        StreamBuilderService,
        { provide: MatSnackBar, useValue: MockService(MatSnackBar) },
        {
          provide: RuntimeService,
          useValue: MockService(RuntimeService, { exampleSize$: of('large') } as Partial<RuntimeService>)
        },
      ]
    });

    example = TestBed.inject(WithLatestFromExample);
    executorSvc = TestBed.inject(ExecutorService);
    streamBuilderSvc = TestBed.inject(StreamBuilderService);
  });

  it('should be created', () => {
    expect(example).toBeTruthy();
  });

  describe('desktop', () => {
    const one = '   --1-2---3------|';
    const two = '   a----b-|';
    const output = '--A-B---C------|';

    const outputValues = { A: '1a', B: '2a', C: '3b' };

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
          { marbles: one.trim(), values: null, error: null, canDisplayAsValue: false }
        ]));

        expect(inputStreams[1].marbles$).toBeObservable(cold('0', [
          { marbles: two.trim(), values: null, error: null, canDisplayAsValue: false }
        ]));
      });

      it('has expected source stream nodes', () => {
        const positions = inputStreams.map((stream) => stream.nodes$.pipe(
          map((nodes) => nodes.map((node) => node.x)),
        ));

        expect(positions[0]).toBeObservable(cold('0', [[28, 48, 88, 158]]));
        expect(positions[1]).toBeObservable(cold('0', [[8, 58, 78]]));
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
    const one = '   -1-2--3|';
    const two = '   a---b|';
    const output = '-A-B--C|';

    const outputValues = { A: '1a', B: '2a', C: '3b' };

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
          { marbles: one.trim(), values: null, error: null, canDisplayAsValue: false }
        ]));

        expect(inputStreams[1].marbles$).toBeObservable(cold('0', [
          { marbles: two.trim(), values: null, error: null, canDisplayAsValue: false }
        ]));
      });

      it('has expected source stream nodes', () => {
        const positions = inputStreams.map((stream) => stream.nodes$.pipe(
          map((nodes) => nodes.map((node) => node.x)),
        ));

        expect(positions[0]).toBeObservable(cold('0', [[18, 38, 68, 78]]));
        expect(positions[1]).toBeObservable(cold('0', [[8, 48, 58]]));
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
