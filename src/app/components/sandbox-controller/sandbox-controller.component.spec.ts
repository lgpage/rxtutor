import { cold } from 'jasmine-marbles';
import { MockComponent, MockService } from 'ng-mocks';
import { of } from 'rxjs';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { CodemirrorComponent } from '@ctrl/ngx-codemirror';
import { Example, EXAMPLE, InputStream, InputStreamLike, OutputStream, START_EXAMPLE } from '../../core';
import { ExecutorService, RuntimeService, StreamBuilderService } from '../../services';
import { StreamControllerComponent } from '../stream-controller/stream-controller.component';
import { SandboxControllerComponent } from './sandbox-controller.component';
import { HashedExampleService } from "../../services/hashed-example.service";
import { ActivatedRoute, ParamMap } from "@angular/router";
import { RouteNames, RouteParamKeys } from "app-constants";
import { ShareButtonComponent } from "../share-button/share-button.component";

describe('SandboxControllerComponent', () => {
  let component: SandboxControllerComponent;
  let fixture: ComponentFixture<SandboxControllerComponent>;

  let executorServiceSpy: jasmine.SpyObj<ExecutorService>;
  let streamBuilderServiceSpy: jasmine.SpyObj<StreamBuilderService>;
  let inputStreamSpy: jasmine.SpyObj<InputStreamLike>;
  let exampleSpy: jasmine.SpyObj<Example>;
  let hashedExampleSpy: jasmine.SpyObj<HashedExampleService>;

  beforeEach(waitForAsync(() => {
    inputStreamSpy = jasmine.createSpyObj<InputStreamLike>('InputStreamLike', ['updateNode']);
    executorServiceSpy = jasmine.createSpyObj<ExecutorService>('ExecutorService', ['getVisualizedOutput']);
    streamBuilderServiceSpy = jasmine.createSpyObj<StreamBuilderService>('StreamBuilderService', ['defaultInputStream']);
    hashedExampleSpy = jasmine.createSpyObj<HashedExampleService>('ExampleHashService', ['getExample', 'getUrl']);
    hashedExampleSpy.getUrl.and.returnValue(cold('0', ['url']));

    exampleSpy = {
      ...jasmine.createSpyObj<Example>('Example', ['getInputStreams', 'getCode']),
      name: 'MockExample',
      section: 'combination',
      links: [{ label: 'label', url: 'url' }],
    };

    exampleSpy.getCode.and.returnValue('code');
    exampleSpy.getInputStreams.and.returnValue({ large: [inputStreamSpy], small: [] });

    TestBed.configureTestingModule({
      imports: [
        MatCardModule,
        MatIconModule,
        NoopAnimationsModule,
        ReactiveFormsModule,
        RouterTestingModule,
      ],
      declarations: [
        SandboxControllerComponent,
        MockComponent(ShareButtonComponent),
        MockComponent(StreamControllerComponent),
        MockComponent(CodemirrorComponent),
      ],
      providers: [
        { provide: START_EXAMPLE, useValue: exampleSpy },
        { provide: EXAMPLE, useValue: exampleSpy, multi: true },
        { provide: ExecutorService, useValue: executorServiceSpy },
        { provide: StreamBuilderService, useValue: streamBuilderServiceSpy },
        {
          provide: RuntimeService,
          useValue: MockService(RuntimeService, {
            exampleSize$: of('large'),
            mediaSize$: of('large'),
          } as Partial<RuntimeService>),
        },
        { provide: HashedExampleService, useValue: hashedExampleSpy },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SandboxControllerComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('properties', () => {
    describe('links$', () => {
      it('should use example links', () => {
        expect(component.links$).toBeObservable(cold('0', [[
          { label: 'label', url: 'url' },
        ]]));
      });

      describe('when example links are empty', () => {
        beforeEach(() => {
          exampleSpy.links = [];
          component.ngOnInit();
        });

        it('should be undefined', () => {
          expect(component.links$).toBeObservable(cold('0', [undefined]));
        });
      });
    });

    describe('shareUrl$', () => {
      it('should be result of hashedExampleService.getUrl', () => {
        expect(component.shareUrl$).toBeObservable(cold('0', ['url']));
        expect(hashedExampleSpy.getUrl).toHaveBeenCalledWith(component.code$, component.sources$);
      });
    });

    it('should be initialized as expected', () => {
      expect(component.codeMirrorOptions).toEqual({
        lineNumbers: true,
        theme: 'material',
        mode: 'text/typescript',
      });

      expect(component.formGroup).toBeInstanceOf(FormGroup);
      expect(component.formGroup.get('code')).toBeInstanceOf(FormControl);
      expect(component.formGroup.get('code')?.value).toEqual('code');

      expect(exampleSpy.getCode).toHaveBeenCalled();
      expect(exampleSpy.getInputStreams).toHaveBeenCalled();

      expect(component.code$).toBeObservable(cold('0', ['code']));
      expect(component.output$).toBeObservable(cold('0', [null]));

      expect(component.sources$).toBeObservable(cold('0', [[inputStreamSpy]]));
      expect(component.numberOfSources$).toBeObservable(cold('0', [1]));

      expect(component.hasOptions$).toBeObservable(cold('(0|)', [true]));
      expect(component.canAddSource$).toBeObservable(cold('0', [true]));
      expect(component.canRemoveSource$).toBeObservable(cold('0', [false]));
    });
  });

  describe('addInputStream', () => {
    it('should update sources accordingly', () => {
      const defaultStream = {} as InputStream;
      streamBuilderServiceSpy.defaultInputStream.and.returnValue(defaultStream);

      expect(component.sources$).toBeObservable(cold('0', [[inputStreamSpy]]));

      // Act
      component.addInputStream();

      expect(streamBuilderServiceSpy.defaultInputStream).toHaveBeenCalled();
      expect(component.sources$).toBeObservable(cold('0', [[inputStreamSpy, defaultStream]]));
    });
  });

  describe('removeInputStream', () => {
    it('should update sources accordingly', () => {
      expect(component.sources$).toBeObservable(cold('0', [[inputStreamSpy]]));

      component.removeInputStream(0);

      expect(component.sources$).toBeObservable(cold('0', [[]]));
    });
  });

  describe('visualizeOutput', () => {
    it('should call expected methods', () => {
      const outputStream = {} as OutputStream;
      executorServiceSpy.getVisualizedOutput.and.returnValue(outputStream);

      component.visualizeOutput();

      expect(executorServiceSpy.getVisualizedOutput).toHaveBeenCalledWith(component.code$, component.sources$);
      expect(component.output$).toBeObservable(cold('0', [outputStream]));
    });
  });

  describe(`when ${RouteParamKeys.ExampleName} is "${RouteNames.SharedExample}"`, () => {
    let route: ActivatedRoute;
    let paramMapSpy: jasmine.SpyObj<ParamMap>;

    beforeEach(() => {
      route = TestBed.inject(ActivatedRoute);
      paramMapSpy = jasmine.createSpyObj<ParamMap>(['get']);
      paramMapSpy.get.and.returnValue(RouteNames.SharedExample);
      spyOnProperty(route, 'paramMap').and.returnValue(of(paramMapSpy));
    });

    describe('and HashedExampleService returns an example', () => {
      it('should use example', () => {
        const otherExample = {
          ...exampleSpy,
          getInputStreams: () => ({ large: [], small: [] }),
          getCode: () => 'otherCode',
          links: [],
        };
        hashedExampleSpy.getExample.and.returnValue(of(otherExample));

        // Re-run ngOnInit
        component.ngOnInit();
        fixture.detectChanges();

        expect(component.code$).toBeObservable(cold('0', ['otherCode']));
        expect(hashedExampleSpy.getExample).toHaveBeenCalledWith(route);
      });
    });

    describe('and HashedExampleService returns undefined', () => {
      it('should use default example', () => {
        hashedExampleSpy.getExample.and.returnValue(of(undefined));

        // Re-run ngOnInit
        component.ngOnInit();
        fixture.detectChanges();

        expect(component.code$).toBeObservable(cold('0', ['code']));
        expect(hashedExampleSpy.getExample).toHaveBeenCalledWith(route);
      });
    });
  });
});
