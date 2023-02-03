import { MockComponent, MockService } from 'ng-mocks';
import { of } from 'rxjs';
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
import { ColorScheme, InsightsService, LocalStorageService, RuntimeService } from './services';

export class AppComponentExposed extends AppComponent {
  setColorScheme(colorScheme: ColorScheme | null, systemColorScheme: ColorScheme): void {
    return super.setColorScheme(colorScheme, systemColorScheme);
  }

  init(): void {
    return super.init();
  }
}

describe('AppComponent', () => {
  const runtimeServiceMock = MockService(RuntimeService);
  const localStorageServiceMock = MockService(LocalStorageService);

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
        AppComponentExposed,
        MockComponent(SideNavComponent),
        MockComponent(SandboxControllerComponent),
      ],
      providers: [
        FormBuilder,
        { provide: InsightsService, useValue: MockService(InsightsService) },
        { provide: RuntimeService, useValue: runtimeServiceMock },
        { provide: LocalStorageService, useValue: localStorageServiceMock },
      ]
    }).compileComponents();
  }));

  let app: AppComponent;
  let exposed: AppComponentExposed;

  beforeEach(() => {
    const fixture = TestBed.createComponent(AppComponentExposed);

    exposed = fixture.componentInstance;
    app = exposed;
  });

  it('should create the app', () => {
    expect(app).toBeTruthy();
  });

  describe('setColorScheme', () => {
    let controlSetValueSpy: jasmine.Spy;
    let storageRemoveEntrySpy: jasmine.Spy;
    let storageSaveValueSpy: jasmine.Spy;

    beforeEach(() => {
      spyOn(exposed, 'init');

      controlSetValueSpy = spyOn(exposed.darkModeControl, 'setValue');
      storageRemoveEntrySpy = spyOn(localStorageServiceMock, 'removeEntry');
      storageSaveValueSpy = spyOn(localStorageServiceMock, 'saveValue');
    });

    describe('when color scheme is dark', () => {
      it('should set the document styles accordingly', () => {
        exposed.setColorScheme(null, 'dark');

        expect(document.documentElement.classList.contains('dark-mode')).toBeTrue();
        expect(document.documentElement.style.getPropertyValue('color-scheme')).toEqual('dark');
        expect(controlSetValueSpy).toHaveBeenCalledWith(true);
      });
    });

    describe('when color scheme is light', () => {
      it('should set the document styles accordingly', () => {
        exposed.setColorScheme(null, 'light');

        expect(document.documentElement.classList.contains('dark-mode')).toBeFalse();
        expect(document.documentElement.style.getPropertyValue('color-scheme')).toEqual('light');
        expect(controlSetValueSpy).toHaveBeenCalledWith(false);
      });
    });

    describe('when color scheme matches system color scheme', () => {
      it('should remove the color scheme storage token', () => {
        exposed.setColorScheme('dark', 'dark');
        expect(storageRemoveEntrySpy).toHaveBeenCalledWith('rxTutorTheme');
      });
    });

    describe('when color scheme does not match system color scheme', () => {
      it('should add the color scheme storage token', () => {
        exposed.setColorScheme('light', 'dark');
        expect(storageSaveValueSpy).toHaveBeenCalledWith('rxTutorTheme', 'light');
      });
    });
  });

  describe('init', () => {
    let initSpy: jasmine.Spy;
    let setColorSchemeSpy: jasmine.Spy;
    let storageGetValueSpy: jasmine.Spy;

    beforeEach(() => {
      initSpy = spyOn(exposed, 'init');
      setColorSchemeSpy = spyOn(exposed, 'setColorScheme');
      storageGetValueSpy = spyOn(localStorageServiceMock, 'getValue').and.returnValue(undefined);
    });

    describe('when system color scheme changes', () => {
      it('should call expected methods', () => {
        runtimeServiceMock.systemColorScheme$ = of<ColorScheme>('dark');
        initSpy.and.callThrough();

        exposed.init();

        expect(setColorSchemeSpy).toHaveBeenCalledWith(undefined, 'dark');
      });
    });

    describe('when control color scheme changes', () => {
      it('should call expected methods', () => {
        runtimeServiceMock.systemColorScheme$ = of<ColorScheme>('dark');
        initSpy.and.callThrough();

        exposed.init();
        expect(setColorSchemeSpy).toHaveBeenCalledWith(undefined, 'dark');

        exposed.darkModeControl.setValue(false);
        expect(setColorSchemeSpy).toHaveBeenCalledWith('light', 'dark');
      });
    });
  });
});
