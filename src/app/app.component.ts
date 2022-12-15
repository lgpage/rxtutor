import { tap } from 'rxjs';
import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, HostBinding, OnInit } from '@angular/core';
import { FormControl, NonNullableFormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { InsightsService, LocalStorageService, RuntimeService } from './services';

type Theme = 'light' | 'dark';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
@UntilDestroy()
export class AppComponent implements OnInit {
  protected _defaultTheme: Theme = 'light';
  protected _themeStorageKey = 'rxTutorTheme';

  darkModeControl: FormControl<boolean> = this._formBuilder.control(false);
  mediaSize$ = this._runtimeSvc.mediaSize$;

  @HostBinding('class.dark-mode') get darkMode(): boolean {
    return this.darkModeControl.value;
  }

  constructor(
    protected _router: Router,
    protected _overlayContainer: OverlayContainer,
    protected _formBuilder: NonNullableFormBuilder,
    protected _storageSvc: LocalStorageService,
    protected _insightsSvc: InsightsService,
    protected _runtimeSvc: RuntimeService,
  ) {
    this._insightsSvc.init(this._router);
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
}
