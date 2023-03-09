import { TestBed } from '@angular/core/testing';
import { HashedExampleService } from './hashed-example.service';
import { InputStreamLike } from "../core/types/stream";
import { noop, Observable, of, tap } from "rxjs";
import { ActivatedRoute, Router, UrlTree } from "@angular/router";
import { StreamBuilderService } from "./stream.builder";
import { InputStream } from "../core/stream";
import { Example } from "../core/types/example";
import { RouterTestingModule } from "@angular/router/testing";
import { map } from "rxjs/operators";
import { RouteNames } from "app-constants";

describe('HashedExampleService', () => {
  let service: HashedExampleService;
  let streamBuilderSpy: jasmine.SpyObj<StreamBuilderService>;
  let router: Router;

  beforeEach(() => {
    streamBuilderSpy = jasmine.createSpyObj<StreamBuilderService>(['inputStream']);

    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        { provide: StreamBuilderService, useValue: streamBuilderSpy },
      ],
    });

    service = TestBed.inject(HashedExampleService);
    router = TestBed.inject(Router);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getUrl', () => {
    it('should return a serialized url tree', (done) => {
      const code$ = of('code');
      const streams$ = of([
        { marbles$: of({ marbles: 'marbles1', values: 'ignored' }) } as InputStreamLike,
        { marbles$: of({ marbles: 'marbles2' }) } as InputStreamLike,
      ] as InputStreamLike[]);
      const routerUrlTreeSpy = spyOn(router, 'createUrlTree').and.returnValue({ queryParams: {} } as UrlTree);
      const routerSerializeUrlSpy = spyOn(router, 'serializeUrl').and.returnValue('url');

      service.getUrl(code$, streams$).subscribe((url) => {
        expect(url).toEqual('url');
        const expectedQueryParams ={
          marbles: btoa(JSON.stringify([{ marbles: 'marbles1' }, { marbles: 'marbles2' }])),
          code: btoa('code'),
        };
        expect(routerUrlTreeSpy).toHaveBeenCalledWith([`/${RouteNames.SharedExample}`], { queryParams: expectedQueryParams });
        expect(routerSerializeUrlSpy).toHaveBeenCalledWith({ queryParams: {} } as UrlTree);
        done();
      });
    });
  });

  describe('getExample', () => {
    describe('when there is no query params', () => {
      it('should return undefined', (done) => {
        const route = jasmine.createSpyObj<ActivatedRoute>([], {
          // eslint-disable-next-line rxjs/finnish
          queryParams: undefined,
        });

        service.getExample(route).subscribe((example) => {
          expect(example).toBeUndefined();
          done();
        });
      });
    });

    describe('when query params does not have code', () => {
      it('should return undefined', (done) => {
        const marbles = 'marble-hash-goes-here';
        const route = jasmine.createSpyObj<ActivatedRoute>([], {
          // eslint-disable-next-line rxjs/finnish
          queryParams: of({ marbles }),
        });

        service.getExample(route).subscribe((example) => {
          expect(example).toBeUndefined();
          done();
        });
      });
    });

    describe('when query params does not have marbles', () => {
      it('should return undefined', (done) => {
        const code = 'code';
        const route = jasmine.createSpyObj<ActivatedRoute>([], {
          // eslint-disable-next-line rxjs/finnish
          queryParams: of({ code }),
        });

        service.getExample(route).subscribe((example) => {
          expect(example).toBeUndefined();
          done();
        });
      });
    });
  });

  describe('Example from getExample', () => {
    let example$: Observable<Example>;
    let fakeInputStream: InputStream;
    let originalCode: string;

    beforeEach(() => {
      const marbles = btoa(JSON.stringify([{ marbles: 'marbles1' }, { marbles: 'marbles2' }]));
      originalCode = 'code';
      const code = btoa(originalCode);
      const route = jasmine.createSpyObj<ActivatedRoute>([], {
        // eslint-disable-next-line rxjs/finnish
        queryParams: of({ marbles, code }),
      });
      fakeInputStream = { offset: 1 } as InputStream;
      streamBuilderSpy.inputStream.and.returnValue(fakeInputStream);

      example$ = service.getExample(route).pipe(
        tap((example) => !example ? fail('example is undefined') : noop()),
        map((example) => example as Example),
      );
    });

    describe('getInputStream', () => {
      it('should return input streams from the query params', (done) => {
        example$.subscribe((example) => {
          expect(example).toBeDefined();
          const inputStreams = example.getInputStreams();
          expect(inputStreams).toEqual({
            large: [fakeInputStream, fakeInputStream],
            small: [fakeInputStream, fakeInputStream],
          });
          expect(streamBuilderSpy.inputStream).toHaveBeenCalledTimes(2);
          expect(streamBuilderSpy.inputStream).toHaveBeenCalledWith({ marbles: 'marbles1' });
          expect(streamBuilderSpy.inputStream).toHaveBeenCalledWith({ marbles: 'marbles2' });
          done();
        });
      });
    });

    describe('getCode', () => {
      it('should return code from the query params', (done) => {
        example$.subscribe((example) => {
          const code = example.getCode();
          expect(code).toEqual(originalCode);
          done();
        });
      });
    });

    describe('links', () => {
      it('should return an empty array', (done) => {
        example$.subscribe((example) => {
          const links = example.links;
          expect(links).toEqual([]);
          done();
        });
      });
    });
  });
});
