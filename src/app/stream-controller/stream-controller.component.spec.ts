import { MockComponent } from 'ng-mocks';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { StreamComponent } from '../stream/stream.component';
import { StreamControllerComponent } from './stream-controller.component';

describe('StreamControllerComponent', () => {
  let component: StreamControllerComponent;
  let fixture: ComponentFixture<StreamControllerComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        StreamControllerComponent,
        MockComponent(StreamComponent),
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
