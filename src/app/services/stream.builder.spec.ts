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
        {
          provide: RuntimeService,
          useValue: MockService(RuntimeService, { exampleSize$: of('large') } as Partial<RuntimeService>)
        },
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

        expect(inputStreamSpy).toHaveBeenCalledWith({ marbles: '-1-2--3|' });
        expect(result).toBe(inputStreamMock);
      });
    });

    describe('when large', () => {
      it('should call expected methods', () => {
        service.setFrames('large');

        const result = service.defaultInputStream();

        expect(inputStreamSpy).toHaveBeenCalledWith({ marbles: '--1--2--3--4--5|' });
        expect(result).toBe(inputStreamMock);
      });
    });
  });

  describe('inputStream', () => {
    describe('marbles$', () => {
      describe('with single per frame', () => {
        describe('does not complete', () => {
          it('should return the expected observable', () => {
            const stream = service.inputStream({ marbles: '---1-23--4' });
            expect(stream.marbles$).toBeObservable(cold('0', [{
              marbles: '---1-23--4',
              values: { 1: '1', 2: '2', 3: '3', 4: '4' },
              error: null,
              canDisplayAsValue: true,
            }]));
          });
        });

        describe('completes', () => {
          it('should return the expected observable', () => {
            const stream = service.inputStream({ marbles: '---1-23|' });
            expect(stream.marbles$).toBeObservable(cold('0', [{
              marbles: '---1-23|',
              values: { 1: '1', 2: '2', 3: '3' },
              error: null,
              canDisplayAsValue: true,
            }]));
          });
        });

        describe('only completes', () => {
          it('should return the expected observable', () => {
            const stream = service.inputStream({ marbles: '-------|' });
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
            const stream = service.inputStream({ marbles: '---1-23#' });
            expect(stream.marbles$).toBeObservable(cold('0', [{
              marbles: '---1-23#',
              values: { 1: '1', 2: '2', 3: '3' },
              error: null,
              canDisplayAsValue: true,
            }]));
          });
        });

        describe('only errors', () => {
          it('should return the expected observable', () => {
            const stream = service.inputStream({ marbles: '-------#' });
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
            const stream = service.inputStream({ marbles: '--1-2(34)-5' });
            expect(stream.marbles$).toBeObservable(cold('0', [{
              marbles: '--1-2(34)-5',
              values: { 1: '1', 2: '2', 3: '3', 4: '4', 5: '5' },
              error: null,
              canDisplayAsValue: true,
            }]));
          });
        });

        describe('completes', () => {
          it('should return the expected observable', () => {
            const stream = service.inputStream({ marbles: '---1-2(3|)' });
            expect(stream.marbles$).toBeObservable(cold('0', [{
              marbles: '---1-2(3|)',
              values: { 1: '1', 2: '2', 3: '3' },
              error: null,
              canDisplayAsValue: true,
            }]));
          });
        });

        describe('errors', () => {
          it('should return the expected observable', () => {
            const stream = service.inputStream({ marbles: '---1-2(3#)' });
            expect(stream.marbles$).toBeObservable(cold('0', [{
              marbles: '---1-2(3#)',
              values: { 1: '1', 2: '2', 3: '3' },
              error: null,
              canDisplayAsValue: true,
            }]));
          });
        });
      });
    });
  });

  describe('outputStream', () => {
    it('should return expected results', () => {
      const not: FrameNotification = { frame: 2, notification: { kind: 'N', value: 10, symbol: 'A' } };

      const stream = service.outputStream(of([not]));

      expect(stream.nodes$).toBeObservable(cold('0', [[
        { kind: 'N', value: 10, zIndex: 0, x: 28, symbol: 'A', index: 2, id: jasmine.any(String) },
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
