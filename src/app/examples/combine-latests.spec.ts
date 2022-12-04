import { cold } from 'jasmine-marbles';
import { MockService } from 'ng-mocks';
import { map, Observable, of } from 'rxjs';
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

      expect(streams.large[0].marbles$).toBeObservable(cold('0', ['---1--2--3-----|']))
      expect(streams.large[1].marbles$).toBeObservable(cold('0', ['-A----B----C---|']))
    });

    it('has expected source stream nodes', () => {
      const streams = example.getInputStreams();
      const indexes = streams.large.map((stream) => stream.nodes$.pipe(
        map((nodes) => nodes.map((node) => node.index)),
      ));
      const positions = streams.large.map((stream) => stream.nodes$.pipe(
        map((nodes) => nodes.map((node) => node.x)),
      ));

      expect(indexes[0]).toBeObservable(cold('0', [[3, 6, 9, 15]]))
      expect(indexes[1]).toBeObservable(cold('0', [[1, 6, 11, 15]]))

      expect(positions[0]).toBeObservable(cold('0', [[38, 68, 98, 158]]))
      expect(positions[1]).toBeObservable(cold('0', [[18, 68, 118, 158]]))
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
      const result$ = executorSvc.getFunctionResult(code, inputStreams.large.map((x) => x.marbles$));
      const outputStream = streamBuilder.outputStream(result$);

      expect(outputStream.marbles$).toBeObservable(cold('---a--b--c|', { a: 1, b: 1, c: 1 }));
    });
  });
});
