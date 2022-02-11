import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StreamControllerComponent } from './stream-controller.component';

describe('StreamControllerComponent', () => {
  let component: StreamControllerComponent;
  let fixture: ComponentFixture<StreamControllerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StreamControllerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StreamControllerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
