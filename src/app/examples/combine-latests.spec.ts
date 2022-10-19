import { cold } from 'jasmine-marbles';
import { MockService } from 'ng-mocks';
import { map, Observable } from 'rxjs';
import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ExecutorService, STREAM_CONFIG, StreamBuilderService } from '../services';
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
        { provide: STREAM_CONFIG, useValue: { dx: 10, dy: 10, offset: 5, frames: 10 } }
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

      expect(streams[0].marbles$).toBeObservable(cold('0', ['--1--2--3-|']))
      expect(streams[1].marbles$).toBeObservable(cold('0', ['--a--b--c-|']))
    });

    it('has expected source stream nodes', () => {
      const streams = example.getInputStreams();
      const indexes = streams.map((stream) => stream.nodes$.pipe(
        map((nodes) => nodes.map((node) => node.index)),
      ));
      const positions = streams.map((stream) => stream.nodes$.pipe(
        map((nodes) => nodes.map((node) => node.x)),
      ));

      expect(indexes[0]).toBeObservable(cold('0', [[2, 5, 8, 10]]))
      expect(indexes[1]).toBeObservable(cold('0', [[2, 5, 8, 10]]))

      expect(positions[0]).toBeObservable(cold('0', [[30, 60, 90, 100]]))
      expect(positions[1]).toBeObservable(cold('0', [[30, 60, 90, 100]]))
    });

    it('returns expected observable', () => {
      const a = '--a--b----c----|';
      const b = '--a--b----c----|';
      const r = '--a--(bc)-(de)-|';

      const code = example.getCode();
      const streams$: Observable<string>[] = [
        cold(a, { a: 1, b: 2, c: 3 }),
        cold(b, { a: 'a', b: 'b', c: 'c' }),
      ];

      const result$ = executorSvc.getFunctionResult(code, streams$);

      expect(result$).toBeObservable(cold(r, { a: [1, 'a'], b: [2, 'a'], c: [2, 'b'], d: [3, 'b'], e: [3, 'c'] }));
    });
  });

  xdescribe('output stream', () => {
    it('returns the expected observable', () => {
      const code = example.getCode();
      const inputStreams = example.getInputStreams();
      const result$ = executorSvc.getFunctionResult(code, inputStreams.map((x) => x.source$));
      const outputStream = streamBuilder.outputStream(result$);

      expect(outputStream.marbles$).toBeObservable(cold('---a--b--c|', { a: 1, b: 1, c: 1 }));
    });
  });
});
