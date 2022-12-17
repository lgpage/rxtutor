import { cold } from 'jasmine-marbles';
import { MockService } from 'ng-mocks';
import { first, map, of, tap } from 'rxjs';
import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { InputStream } from '../core';
import { ExecutorService, RuntimeService, StreamBuilderService } from '../services';
import { ScanExample } from './scan';

describe('ScanExample', () => {
  let example: ScanExample;
  let executorSvc: ExecutorService;
  let streamBuilderSvc: StreamBuilderService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ScanExample,
        ExecutorService,
        StreamBuilderService,
        { provide: MatSnackBar, useValue: MockService(MatSnackBar) },
        { provide: RuntimeService, useValue: MockService(RuntimeService, { exampleSize$: of<'small' | 'large'>('large') }) },
      ]
    });

    example = TestBed.inject(ScanExample);
    executorSvc = TestBed.inject(ExecutorService);
    streamBuilderSvc = TestBed.inject(StreamBuilderService);
  });

  it('should be created', () => {
    expect(example).toBeTruthy();
  });

  describe('desktop', () => {
    const one = '   ---1--2--3--4--|';
    const output = '---A--B--C--D--|';
    const outputValues = { A: 1, B: 3, C: 6, D: 10 };

    let code: string;
    let inputStreams: InputStream[];

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
      });

      it('has expected source stream nodes', () => {
        const positions = inputStreams.map((stream) => stream.nodes$.pipe(
          map((nodes) => nodes.map((node) => node.x)),
        ));

        expect(positions[0]).toBeObservable(cold('0', [[38, 68, 98, 128, 158]]));
      });

      it('returns expected observable', () => {
        const result$ = executorSvc.getFunctionResult(code, [cold(one)]);
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
    const one = '   1-2-3-4|';
    const output = 'A-B-C-D|';
    const outputValues = { A: 1, B: 3, C: 6, D: 10 };

    let code: string;
    let inputStreams: InputStream[];

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
      });

      it('has expected source stream nodes', () => {
        const positions = inputStreams.map((stream) => stream.nodes$.pipe(
          map((nodes) => nodes.map((node) => node.x)),
        ));

        expect(positions[0]).toBeObservable(cold('0', [[8, 28, 48, 68, 78]]));
      });

      it('returns expected observable', () => {
        const result$ = executorSvc.getFunctionResult(code, [cold(one)]);
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
