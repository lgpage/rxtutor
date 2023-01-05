import { cold } from 'jasmine-marbles';
import { MockService } from 'ng-mocks';
import { of } from 'rxjs';
import { TestBed } from '@angular/core/testing';
import { FrameNotification, InputStream } from '../core';
import { RuntimeService } from './runtime.service';
import { StreamBuilderService } from './stream.builder';

describe('StreamBuilderService', () => {
  let service: StreamBuilderService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: RuntimeService, useValue: MockService(RuntimeService, { exampleSize$: of<'small' | 'large'>('large') }) },
      ]
    });

    service = TestBed.inject(StreamBuilderService);
  });

  describe('setFrames', () => {
    it('should set frames accordingly', () => {
      service.setFrames('small');
      expect(service.frames).toEqual(8);

      service.setFrames('large');
      expect(service.frames).toEqual(18);
    });
  });

  describe('getDistributedIndexes', () => {
    it('should return the expected results', () => {
      expect(service.getDistributedIndexes(0)).toEqual([]);
      expect(service.getDistributedIndexes(7)).toEqual([1, 3, 5, 7, 9, 11, 13]);
    });
  });

  describe('defaultInputStream', () => {
    let inputStreamMock: InputStream;
    let inputStreamSpy: jasmine.Spy;

    beforeEach(() => {
      inputStreamMock = new InputStream({ dx: 10, dy: 10, offset: 3, frames: 10 });
      inputStreamSpy = spyOn(service, 'inputStream').and.returnValue(inputStreamMock);
    });

    describe('when small', () => {
      it('should call expected methods', () => {
        service.setFrames('small');

        const result = service.defaultInputStream();

        expect(inputStreamSpy).toHaveBeenCalledWith([1, 3, 6], service.defaultCompleteFrame);
        expect(result).toBe(inputStreamMock);
      });
    });

    describe('when large', () => {
      it('should call expected methods', () => {
        service.setFrames('large');

        const result = service.defaultInputStream();

        expect(inputStreamSpy).toHaveBeenCalledWith([2, 5, 8, 11, 14], service.defaultCompleteFrame);
        expect(result).toBe(inputStreamMock);
      });
    });
  });

  describe('inputStream', () => {
    describe('marbles$', () => {
      describe('with single per frame', () => {
        describe('does not complete', () => {
          it('should return the expected observable', () => {
            const stream = service.inputStream([3, 5, 6, 9]);
            expect(stream.marbles$).toBeObservable(cold('0', [{
              marbles: '---1-23--4',
              values: null,
              error: null,
              canDisplayAsValue: false,
            }]));
          });
        });

        describe('completes', () => {
          it('should return the expected observable', () => {
            const stream = service.inputStream([3, 5, 6], 7);
            expect(stream.marbles$).toBeObservable(cold('0', [{
              marbles: '---1-23|',
              values: null,
              error: null,
              canDisplayAsValue: false,
            }]));
          });
        });

        describe('only completes', () => {
          it('should return the expected observable', () => {
            const stream = service.inputStream([], 7);
            expect(stream.marbles$).toBeObservable(cold('0', [{
              marbles: '-------|',
              values: null,
              error: null,
              canDisplayAsValue: false,
            }]));
          });
        });

        describe('errors', () => {
          it('should return the expected observable', () => {
            const stream = service.inputStream([3, 5, 6], null, 7);
            expect(stream.marbles$).toBeObservable(cold('0', [{
              marbles: '---1-23#',
              values: null,
              error: null,
              canDisplayAsValue: false,
            }]));
          });
        });

        describe('only errors', () => {
          it('should return the expected observable', () => {
            const stream = service.inputStream([], null, 7);
            expect(stream.marbles$).toBeObservable(cold('0', [{
              marbles: '-------#',
              values: null,
              error: null,
              canDisplayAsValue: false,
            }]));
          });
        });
      });

      describe('with multiple per frame', () => {
        describe('does not complete', () => {
          it('should return the expected observable', () => {
            const stream = service.inputStream([2, 4, 5, 5, 7]);
            expect(stream.marbles$).toBeObservable(cold('0', [{
              marbles: '--1-2(34)-5',
              values: null,
              error: null,
              canDisplayAsValue: false,
            }]));
          });
        });

        describe('completes', () => {
          it('should return the expected observable', () => {
            const stream = service.inputStream([3, 5, 6], 6);
            expect(stream.marbles$).toBeObservable(cold('0', [{
              marbles: '---1-2(3|)',
              values: null,
              error: null,
              canDisplayAsValue: false,
            }]));
          });
        });

        describe('errors', () => {
          it('should return the expected observable', () => {
            const stream = service.inputStream([3, 5, 6], null, 6);
            expect(stream.marbles$).toBeObservable(cold('0', [{
              marbles: '---1-2(3#)',
              values: null,
              error: null,
              canDisplayAsValue: false,
            }]));
          });
        });
      });
    });
  });

  describe('outputStream', () => {
    it('should return expected results', () => {
      const not: FrameNotification = { frame: 2, notification: { kind: 'N', value: 10 } };

      const stream = service.outputStream(of([not]), 10);

      expect(stream.nodes$).toBeObservable(cold('0', [[
        { kind: 'N', value: 10, zIndex: 0, x: 8, symbol: 'A', index: 0, id: jasmine.any(String) },
      ]]));
    });
  });

  describe('adjustStream', () => {
    it('should call expected methods', () => {
      const streamSpy = jasmine.createSpyObj<InputStream>('InputStream', ['setNodes']);

      service.adjustStream(streamSpy, []);

      expect(streamSpy.setNodes).toHaveBeenCalledWith([]);
    });
  });
});
