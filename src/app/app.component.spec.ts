import { MockComponent, MockService } from 'ng-mocks';
import { TestBed, waitForAsync } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatToolbarModule } from '@angular/material/toolbar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';
import { SandboxControllerComponent } from './components/sandbox-controller/sandbox-controller.component';
import { SideNavComponent } from './components/side-nav/side-nav.component';
import { InsightsService, RuntimeService } from './services';

describe('AppComponent', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        MatIconModule,
        MatSidenavModule,
        MatSlideToggleModule,
        MatToolbarModule,
        NoopAnimationsModule,
        ReactiveFormsModule,
        RouterTestingModule,
      ],
      declarations: [
        AppComponent,
        MockComponent(SideNavComponent),
        MockComponent(SandboxControllerComponent),
      ],
      providers: [
        FormBuilder,
        { provide: InsightsService, useValue: MockService(InsightsService) },
        { provide: RuntimeService, useValue: MockService(RuntimeService) },
      ]
    }).compileComponents();
  }));

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
