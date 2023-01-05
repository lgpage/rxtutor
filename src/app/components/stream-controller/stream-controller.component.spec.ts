import { cold } from 'jasmine-marbles';
import { MockComponent, MockService } from 'ng-mocks';
import { of, shareReplay } from 'rxjs';
import { Clipboard } from '@angular/cdk/clipboard';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { StreamLike } from '../../core';
import { InsightsService, RuntimeService } from '../../services';
import { StreamOptionsComponent } from '../stream-options/stream-options.component';
import { StreamComponent } from '../stream/stream.component';
import { StreamControllerComponent } from './stream-controller.component';

describe('StreamControllerComponent', () => {
  let component: StreamControllerComponent;
  let fixture: ComponentFixture<StreamControllerComponent>;

  let streamMock: StreamLike;

  let matDialogSpy: jasmine.SpyObj<MatDialog>;
  let matSnackBarSpy: jasmine.SpyObj<MatSnackBar>;
  let clipboardSpy: jasmine.SpyObj<Clipboard>;
  let insightsServiceSpy: jasmine.SpyObj<InsightsService>;

  beforeEach(waitForAsync(() => {
    matDialogSpy = jasmine.createSpyObj<MatDialog>('MatDialog', ['open']);
    matSnackBarSpy = jasmine.createSpyObj<MatSnackBar>('MatSnackBar', ['open']);
    clipboardSpy = jasmine.createSpyObj<Clipboard>('Clipboard', ['copy']);
    insightsServiceSpy = jasmine.createSpyObj<InsightsService>('InsightsService', ['startTrackPage', 'stopTrackPage']);

    TestBed.configureTestingModule({
      imports: [
        MatDialogModule,
        MatIconModule,
        MatSnackBarModule,
        MatTooltipModule,
        NoopAnimationsModule,
      ],
      declarations: [
        StreamControllerComponent,
        MockComponent(StreamComponent),
        MockComponent(StreamOptionsComponent),
      ],
      providers: [
        { provide: MatDialog, useValue: matDialogSpy },
        { provide: MatSnackBar, useValue: matSnackBarSpy },
        { provide: Clipboard, useValue: clipboardSpy },
        { provide: InsightsService, useValue: insightsServiceSpy },
        { provide: RuntimeService, useValue: MockService(RuntimeService, { mediaSize$: of<'small' | 'large'>('large') }) },
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StreamControllerComponent);

    streamMock = { marbles$: of({ marbles: 'a', values: { a: 10 } }) } as StreamLike;
    component = fixture.componentInstance;
    component.stream = streamMock;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('properties', () => {
    it('should be initialized as expected', () => {
      expect(component.marblesString$).toBeObservable(cold('(0|)', ['a']));
    });
  });

  describe('openSnackBar', () => {
    it('calls expected methods', () => {
      component.openSnackBar('message', 'action');
      expect(matSnackBarSpy.open).toHaveBeenCalledWith('message', 'action', { duration: 3000 });
    });
  });

  describe('copyMarblesToClipboard', () => {
    it('calls expected methods', () => {
      component.copyMarblesToClipboard();

      expect(clipboardSpy.copy).toHaveBeenCalledWith('\'a\',\n{\n  "a": 10\n}');
      expect(matSnackBarSpy.open).toHaveBeenCalledWith(
        'Marbles copied to the clipboard',
        'Ok',
        { duration: 3000 });
    });
  });

  describe('showOptions', () => {
    it('calls expected methods', () => {
      const dialogSpy = jasmine.createSpyObj<MatDialogRef<StreamOptionsComponent, any>>('StreamOptionsModal', ['afterClosed']);

      dialogSpy.afterClosed.and.returnValue(of(null));
      matDialogSpy.open.and.returnValue(dialogSpy);

      // Act
      component.showOptions();

      expect(insightsServiceSpy.startTrackPage).toHaveBeenCalledWith('Stream Options');
      expect(matDialogSpy.open).toHaveBeenCalledWith(StreamOptionsComponent, { data: { stream: streamMock } });
      expect(insightsServiceSpy.stopTrackPage).toHaveBeenCalledWith('Stream Options');
    });
  });

  describe('remove', () => {
    it('emits expected value', () => {
      const lastRemovedStream$ = component.removeStream.pipe(
        shareReplay({ refCount: true, bufferSize: 1 }),
      );

      const sub = lastRemovedStream$.subscribe();

      // Act
      component.remove();

      expect(lastRemovedStream$).toBeObservable(cold('0', [component]));

      sub.unsubscribe();
    });
  });
});
