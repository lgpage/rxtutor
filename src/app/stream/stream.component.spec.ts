import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { InputStream } from '../core/stream';
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
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StreamComponent);

    component = fixture.componentInstance;
    component.stream = new InputStream([]);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
