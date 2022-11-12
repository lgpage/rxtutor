import { MockComponent, MockService } from 'ng-mocks';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { InsightsService, STREAM_CONFIG } from '../../services';
import { StreamOptionsComponent } from '../stream-options/stream-options.component';
import { StreamComponent } from '../stream/stream.component';
import { StreamControllerComponent } from './stream-controller.component';

describe('StreamControllerComponent', () => {
  let component: StreamControllerComponent;
  let fixture: ComponentFixture<StreamControllerComponent>;

  beforeEach(waitForAsync(() => {
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
        { provide: STREAM_CONFIG, useValue: { dx: 10, dy: 10, offset: 5, frames: 10 } },
        { provide: InsightsService, useValue: MockService(InsightsService) },
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StreamControllerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
