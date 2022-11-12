import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { InputStream } from '../../core';
import { STREAM_CONFIG } from '../../services';
import { StreamComponent } from './stream.component';

describe('StreamComponent', () => {
  let component: StreamComponent;
  let fixture: ComponentFixture<StreamComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        MatIconModule,
        MatTooltipModule,
      ],
      declarations: [StreamComponent],
      providers: [
        { provide: MatSnackBar, useValue: {} },
        { provide: STREAM_CONFIG, useValue: { dx: 10, dy: 10, offset: 5, frames: 10 } }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StreamComponent);

    component = fixture.componentInstance;
    component.stream = new InputStream([], { dx: 10, dy: 10, offset: 3, frames: 10 });

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
