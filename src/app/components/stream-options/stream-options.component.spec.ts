import { cold } from 'jasmine-marbles';
import { MockService } from 'ng-mocks';
import { of } from 'rxjs';
import { RuntimeService } from 'src/app/services';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { InputStream } from '../../core';
import { StreamOptionsComponent } from './stream-options.component';

describe('StreamOptionsComponent', () => {
  let component: StreamOptionsComponent;
  let fixture: ComponentFixture<StreamOptionsComponent>;
  let stream: InputStream;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        MatDialogModule,
        MatFormFieldModule,
        MatSelectModule,
        NoopAnimationsModule,
        ReactiveFormsModule,
      ],
      declarations: [
        StreamOptionsComponent,
      ],
      providers: [
        {
          provide: RuntimeService,
          useValue: MockService(RuntimeService, { exampleSize$: of('large') } as Partial<RuntimeService>)
        },
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StreamOptionsComponent);

    component = fixture.componentInstance;
    stream = component.stream;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(stream).toBeTruthy();
  });

  describe('properties', () => {
    it('should be initialized as expected', () => {
      expect(component.maxNumberOfNodes).toEqual([1, 2, 3, 4, 5, 6, 7]);

      expect(component.formGroup).toBeInstanceOf(FormGroup);
      for (const label of ['size', 'start', 'type', 'complete']) {
        expect(component.formGroup?.get(label)).toBeInstanceOf(FormControl);
      }

      expect(component.formGroup?.get('size')?.value).toEqual(5);
      expect(component.formGroup?.get('start')?.value).toEqual('1');
      expect(component.formGroup?.get('type')?.value).toEqual('numeric');
      expect(component.formGroup?.get('complete')?.value).toEqual('C');

      expect(component.size$).toBeObservable(cold('0', [5]));
      expect(component.start$).toBeObservable(cold('0', ['1']));
      expect(component.type$).toBeObservable(cold('0', ['numeric']));
      expect(component.complete$).toBeObservable(cold('0', ['C']));

      expect(component.startOptions$).toBeObservable(cold('0', [['1', '2', '3']]));
    });
  });

  describe('initial stream', () => {
    it('has expected values', () => {
      expect(stream.nodes$).toBeObservable(cold('0', [[
        { id: jasmine.any(String), zIndex: 0, symbol: '1', kind: 'N', x: 28, index: 2 },
        { id: jasmine.any(String), zIndex: 1, symbol: '2', kind: 'N', x: 58, index: 5 },
        { id: jasmine.any(String), zIndex: 2, symbol: '3', kind: 'N', x: 88, index: 8 },
        { id: jasmine.any(String), zIndex: 3, symbol: '4', kind: 'N', x: 118, index: 11 },
        { id: jasmine.any(String), zIndex: 4, symbol: '5', kind: 'N', x: 148, index: 14 },
        { id: jasmine.any(String), zIndex: 5, symbol: '|', kind: 'C', x: 158, index: 15 },
      ]]));
    });
  });

  describe('inputs', () => {
    describe('when size changes', () => {
      it('should update the stream as expected', () => {
        component.formGroup?.get('size')?.setValue(3);
        fixture.detectChanges();

        expect(stream.nodes$).toBeObservable(cold('0', [[
          { id: jasmine.any(String), zIndex: 0, symbol: '1', kind: 'N', x: 28, index: 2 },
          { id: jasmine.any(String), zIndex: 1, symbol: '2', kind: 'N', x: 78, index: 7 },
          { id: jasmine.any(String), zIndex: 2, symbol: '3', kind: 'N', x: 128, index: 12 },
          { id: jasmine.any(String), zIndex: 3, symbol: '|', kind: 'C', x: 158, index: 15 },
        ]]));
      });
    });

    describe('when start changes', () => {
      it('should update the stream as expected', () => {
        component.formGroup?.get('start')?.setValue('3');
        fixture.detectChanges();

        expect(stream.nodes$).toBeObservable(cold('0', [[
          { id: jasmine.any(String), zIndex: 0, symbol: '3', kind: 'N', x: 28, index: 2 },
          { id: jasmine.any(String), zIndex: 1, symbol: '4', kind: 'N', x: 58, index: 5 },
          { id: jasmine.any(String), zIndex: 2, symbol: '5', kind: 'N', x: 88, index: 8 },
          { id: jasmine.any(String), zIndex: 3, symbol: '6', kind: 'N', x: 118, index: 11 },
          { id: jasmine.any(String), zIndex: 4, symbol: '7', kind: 'N', x: 148, index: 14 },
          { id: jasmine.any(String), zIndex: 5, symbol: '|', kind: 'C', x: 158, index: 15 },
        ]]));
      });
    });

    describe('when type changes', () => {
      it('should update the stream as expected', () => {
        component.formGroup?.get('type')?.setValue('alpha');
        fixture.detectChanges();

        expect(stream.nodes$).toBeObservable(cold('0', [[
          { id: jasmine.any(String), zIndex: 0, symbol: 'a', kind: 'N', x: 28, index: 2 },
          { id: jasmine.any(String), zIndex: 1, symbol: 'b', kind: 'N', x: 58, index: 5 },
          { id: jasmine.any(String), zIndex: 2, symbol: 'c', kind: 'N', x: 88, index: 8 },
          { id: jasmine.any(String), zIndex: 3, symbol: 'd', kind: 'N', x: 118, index: 11 },
          { id: jasmine.any(String), zIndex: 4, symbol: 'e', kind: 'N', x: 148, index: 14 },
          { id: jasmine.any(String), zIndex: 5, symbol: '|', kind: 'C', x: 158, index: 15 },
        ]]));
      });
    });

    describe('when complete changes', () => {
      it('should update the stream as expected', () => {
        component.formGroup?.get('complete')?.setValue('E');
        fixture.detectChanges();

        expect(stream.nodes$).toBeObservable(cold('0', [[
          { id: jasmine.any(String), zIndex: 0, symbol: '1', kind: 'N', x: 28, index: 2 },
          { id: jasmine.any(String), zIndex: 1, symbol: '2', kind: 'N', x: 58, index: 5 },
          { id: jasmine.any(String), zIndex: 2, symbol: '3', kind: 'N', x: 88, index: 8 },
          { id: jasmine.any(String), zIndex: 3, symbol: '4', kind: 'N', x: 118, index: 11 },
          { id: jasmine.any(String), zIndex: 4, symbol: '5', kind: 'N', x: 148, index: 14 },
          { id: jasmine.any(String), zIndex: 5, symbol: '#', kind: 'E', x: 158, index: 15 },
        ]]));
      });
    });
  });
});
