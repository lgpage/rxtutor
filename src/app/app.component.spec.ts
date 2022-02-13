import { MockComponent } from 'ng-mocks';
import { TestBed, waitForAsync } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatSidenavModule } from '@angular/material/sidenav';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { AppComponent } from './app.component';
import { SideNavComponent } from './side-nav/side-nav.component';
import { StreamControllerComponent } from './stream-controller/stream-controller.component';

describe('AppComponent', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        MatCardModule,
        MatSidenavModule,
        NoopAnimationsModule,
        ReactiveFormsModule,
      ],
      declarations: [
        AppComponent,
        MockComponent(SideNavComponent),
        MockComponent(StreamControllerComponent),
      ],
    }).compileComponents();
  }));

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
