import { cold } from 'jasmine-marbles';
import { MockService } from 'ng-mocks';
import { first, map, of, tap } from 'rxjs';
import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { InputStream } from '../core';
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
        { provide: RuntimeService, useValue: MockService(RuntimeService, { exampleSize$: of<'small' | 'large'>('large') }) },
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
    const one = '       -1---23--------|';
    const two = '       a-b|';
    const output = '    -A-B-CDEF------|';

    const outputValues = {
      A: '1a',
      B: '1b',
      C: '2a',
      D: '3a',
      E: '2b',
      F: '3b',
    };

    let code: string;
    let inputStreams: InputStream[];

    beforeEach(() => {
      streamBuilderSvc.setFrames('large');

      code = example.getCode();
      inputStreams = example.getInputStreams().large;
    })

    describe('example', () => {
      it('has expected source stream marbles', () => {
        expect(inputStreams[0].marbles$).toBeObservable(cold('0', [
          { marbles: one.trim(), values: null, error: null, canDisplayAsValue: false }
        ]))

        expect(inputStreams[1].marbles$).toBeObservable(cold('0', [
          { marbles: two.trim(), values: null, error: null, canDisplayAsValue: false }
        ]))
      });

      it('has expected source stream nodes', () => {
        const positions = inputStreams.map((stream) => stream.nodes$.pipe(
          map((nodes) => nodes.map((node) => node.x)),
        ));

        expect(positions[0]).toBeObservable(cold('0', [[18, 58, 68, 158]]))
        expect(positions[1]).toBeObservable(cold('0', [[8, 28, 38]]))
      });

      it('returns expected observable', () => {
        const result$ = executorSvc.getFunctionResult(code, [cold(one), cold(two)] as any);

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
            expect(values).toEqual(outputValues)
          }),
        ).subscribe(() => done())
      });
    });
  });

  describe('mobile', () => {
    const one = '       -1--2--|';
    const two = '       a-b|';
    const output = '    -A-BC-D|';

    const values = {
      A: '1a',
      B: '1b',
      C: '2a',
      D: '2b',
    };

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
        ]))

        expect(inputStreams[1].marbles$).toBeObservable(cold('0', [
          { marbles: two.trim(), values: null, error: null, canDisplayAsValue: false }
        ]))
      });

      it('has expected source stream nodes', () => {
        const positions = inputStreams.map((stream) => stream.nodes$.pipe(
          map((nodes) => nodes.map((node) => node.x)),
        ));

        expect(positions[0]).toBeObservable(cold('0', [[18, 48, 78]]))
        expect(positions[1]).toBeObservable(cold('0', [[8, 28, 38]]))
      });

      it('returns expected observable', () => {
        const result$ = executorSvc.getFunctionResult(code, [cold(one), cold(two)] as any);

        expect(result$).toBeObservable(cold(output, values));
      });
    });

    describe('output stream', () => {
      it('returns the expected observable', (done) => {
        const result = executorSvc.getVisualizedOutput(of(code), of(inputStreams));

        result.marbles$.pipe(
          first(),
          tap(({ marbles, values }) => {
            expect(marbles).toEqual(output.trim());
            expect(values).toEqual(values)
          }),
        ).subscribe(() => done())
      });
    });
  });
});
