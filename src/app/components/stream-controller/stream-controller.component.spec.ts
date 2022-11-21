import { MockComponent, MockService } from 'ng-mocks';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacySnackBarModule as MatSnackBarModule } from '@angular/material/legacy-snack-bar';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { InsightsService } from '../../services';
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
