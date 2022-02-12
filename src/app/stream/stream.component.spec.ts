import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Stream } from '../stream';
import { StreamComponent } from './stream.component';

describe('StreamComponent', () => {
  let component: StreamComponent;
  let fixture: ComponentFixture<StreamComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [StreamComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StreamComponent);

    component = fixture.componentInstance;
    component.stream = new Stream([]);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
