import { tap } from 'rxjs';
import { MediaMatcher } from '@angular/cdk/layout';
import { OverlayContainer } from '@angular/cdk/overlay';
import { ChangeDetectorRef, Component, HostBinding, OnDestroy, OnInit } from '@angular/core';
import { FormControl, NonNullableFormBuilder } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { LocalStorageService } from './services';

type Theme = 'light' | 'dark';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
@UntilDestroy()
export class AppComponent implements OnInit, OnDestroy {
  protected _defaultTheme: Theme = 'light';
  protected _themeStorageKey = 'rxTutorTheme';
  protected _mobileQueryListener: () => void;

  mobileQuery: MediaQueryList;
  darkModeControl: FormControl<boolean> = this._formBuilder.control(false);

  @HostBinding('class.dark-mode') get darkMode(): boolean {
    return this.darkModeControl.value;
  };

  constructor(
    protected _mediaMatcher: MediaMatcher,
    protected _overlayContainer: OverlayContainer,
    protected _changeDetectorRef: ChangeDetectorRef,
    protected _storageSvc: LocalStorageService,
    protected _formBuilder: NonNullableFormBuilder,
  ) {
    this._mobileQueryListener = () => this._changeDetectorRef.detectChanges();
    this.mobileQuery = this._mediaMatcher.matchMedia('(max-width: 600px)');
    this.mobileQuery.addEventListener('change', this._mobileQueryListener);
  }

  ngOnInit(): void {
    this.darkModeControl.valueChanges.pipe(
      tap((darkMode) => {
        const theme: Theme = darkMode ? 'dark' : 'light';
        this._storageSvc.saveValue(this._themeStorageKey, theme);
        if (darkMode) {
          this._overlayContainer.getContainerElement().classList.add('dark-mode');
        } else {
          this._overlayContainer.getContainerElement().classList.remove('dark-mode');
        }
      }),
      untilDestroyed(this),
    ).subscribe();

    const theme = this._storageSvc.getValue(this._themeStorageKey) as Theme;
    this.darkModeControl.setValue(theme === 'dark');
  }

  ngOnDestroy(): void {
    this.mobileQuery.removeEventListener('change', this._mobileQueryListener);
  }
}
