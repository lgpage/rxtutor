import { cold } from 'jasmine-marbles';
import { of } from 'rxjs';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { InputStream, StreamNode } from '../../core';
import { StreamComponent } from './stream.component';

class StreamComponentExposed extends StreamComponent {
  _node: StreamNode | null = null;
}

describe('StreamComponent', () => {
  let exposed: StreamComponentExposed;
  let component: StreamComponent;
  let fixture: ComponentFixture<StreamComponentExposed>;

  let inputStreamSpy: jasmine.SpyObj<InputStream>;

  beforeEach(waitForAsync(() => {
    inputStreamSpy = {
      ...jasmine.createSpyObj<InputStream>('InputStream', ['updateNode', 'correct']),
      dx: 10,
      dy: 10,
      offset: 3,
      frames: 10,
      marbles$: of({ canDisplayAsValue: true }),
    } as jasmine.SpyObj<InputStream>;

    TestBed.configureTestingModule({
      imports: [
        MatIconModule,
        MatTooltipModule,
      ],
      declarations: [StreamComponentExposed],
      providers: [
        { provide: MatSnackBar, useValue: {} },
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StreamComponentExposed);

    exposed = fixture.componentInstance;
    component = exposed;

    component.stream = inputStreamSpy;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('properties', () => {
    it('should be initialized as expected', () => {
      expect(component.color).toEqual('accent');

      expect(component.dx).toEqual(10);
      expect(component.dy).toEqual(10);
      expect(component.offset).toEqual(3);
      expect(component.frames).toEqual(10);

      expect(component.radius).toEqual(4);
      expect(component.streamLine).toEqual(106);
      expect(component.viewBox).toEqual([0, 3, 109, 15]);

      expect(component.nodeClass).toEqual('node hover');

      expect(component.displayValues$).toBeObservable(cold('(0|)', [true]));
    });
  });

  describe('range', () => {
    it('returns expected results', () => {
      expect(component.range(4)).toEqual([0, 1, 2, 3]);
    });
  });

  let nodeMock: StreamNode;

  beforeEach(() => {
    nodeMock = {} as StreamNode;
  });

  describe('startDrag', () => {
    it('sets state as expected', () => {
      component.startDrag(nodeMock);
      expect(exposed._node).toBe(nodeMock);
    });
  });

  describe('drag', () => {
    let eventSpy: jasmine.SpyObj<PointerEvent>;

    beforeEach(() => {
      eventSpy = jasmine.createSpyObj<PointerEvent>('PointerEvent', ['preventDefault']);
      spyOn(component.svg?.nativeElement, 'getScreenCTM').and.returnValue({ e: 12, a: 5 });
    });

    it('calls expected methods', () => {
      component.startDrag(nodeMock);

      // Act
      component.drag({ ...eventSpy, clientX: 20 });

      expect(eventSpy.preventDefault).toHaveBeenCalled();
      expect(inputStreamSpy.updateNode).toHaveBeenCalledWith({ ...nodeMock, x: 8, zIndex: 99 });
    });

    describe('when node not set (startDrag not called)', () => {
      it('does not call any methods', () => {
        component.drag({ ...eventSpy, clientX: 20 });

        expect(eventSpy.preventDefault).not.toHaveBeenCalled();
        expect(inputStreamSpy.updateNode).not.toHaveBeenCalled();
      });
    });
  });

  describe('endDrag', () => {
    it('calls expected methods', () => {
      component.startDrag(nodeMock);
      expect(exposed._node).toBe(nodeMock);

      component.endDrag();

      expect(inputStreamSpy.correct).toHaveBeenCalled();
      expect(exposed._node).toBeNull();
    });

    describe('when node not set (startDrag not called)', () => {
      it('does not call any methods', () => {
      component.endDrag();

      expect(inputStreamSpy.correct).not.toHaveBeenCalled();
      expect(exposed._node).toBeNull();
      });
    });
  });
});
