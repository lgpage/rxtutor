import { cold } from 'jasmine-marbles';
import { MockService } from 'ng-mocks';
import { first, of, tap } from 'rxjs';
import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { InputStreamLike } from '../core';
import { ExecutorService, RuntimeService, StreamBuilderService } from '../services';
import { FromExample } from './from';

describe('FromExample', () => {
  let example: FromExample;
  let executorSvc: ExecutorService;
  let streamBuilderSvc: StreamBuilderService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        FromExample,
        ExecutorService,
        StreamBuilderService,
        { provide: MatSnackBar, useValue: MockService(MatSnackBar) },
        {
          provide: RuntimeService,
          useValue: MockService(RuntimeService, { exampleSize$: of('large') } as Partial<RuntimeService>)
        },
      ]
    });

    example = TestBed.inject(FromExample);
    executorSvc = TestBed.inject(ExecutorService);
    streamBuilderSvc = TestBed.inject(StreamBuilderService);
  });

  it('should be created', () => {
    expect(example).toBeTruthy();
  });

  describe('desktop or mobile', () => {
    const output = '(ABCD|)';
    const outputValues = { A: 'a', B: 'b', C: 'c', D: 'd' };

    let code: string;
    let inputStreams: InputStreamLike[];

    beforeEach(() => {
      streamBuilderSvc.setFrames('large');

      code = example.getCode();
      inputStreams = example.getInputStreams().large;
    });

    describe('example', () => {
      it('returns expected observable', () => {
        const result$ = executorSvc.getFunctionResult(code, []);
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
