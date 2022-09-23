import { MockComponent } from 'ng-mocks';
import { TestBed, waitForAsync } from '@angular/core/testing';
import { MatSidenavModule } from '@angular/material/sidenav';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { AppComponent } from './app.component';
import { SandboxControllerComponent } from './components/sandbox-controller/sandbox-controller.component';
import { SideNavComponent } from './components/side-nav/side-nav.component';

describe('AppComponent', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        MatSidenavModule,
        NoopAnimationsModule,
      ],
      declarations: [
        AppComponent,
        MockComponent(SideNavComponent),
        MockComponent(SandboxControllerComponent),
      ],
    }).compileComponents();
  }));

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
