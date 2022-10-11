import { MockComponent, MockService } from 'ng-mocks';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CodemirrorComponent } from '@ctrl/ngx-codemirror';
import { InputStream } from '../../core';
import { ExecutorService } from '../../services';
import { Example, EXAMPLE, ExampleSection, START_EXAMPLE } from '../../types';
import { StreamControllerComponent } from '../stream-controller/stream-controller.component';
import { SandboxControllerComponent } from './sandbox-controller.component';

class MockExample implements Example {
  name = 'MockExample';
  section: ExampleSection = 'combination';

  getSources: () => InputStream[];
  getCode: () => string;
}

describe('SandboxControllerComponent', () => {
  let component: SandboxControllerComponent;
  let fixture: ComponentFixture<SandboxControllerComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        MatCardModule,
        MatIconModule,
        NoopAnimationsModule,
        ReactiveFormsModule,
      ],
      declarations: [
        SandboxControllerComponent,
        MockComponent(StreamControllerComponent),
        MockComponent(CodemirrorComponent),
      ],
      providers: [
        { provide: START_EXAMPLE, useClass: MockExample, multi: true },
        { provide: EXAMPLE, useClass: MockExample, multi: true },
        { provide: ExecutorService, useValue: MockService(ExecutorService) },
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SandboxControllerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
