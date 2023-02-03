import { distinctUntilChanged, tap, withLatestFrom } from 'rxjs';
import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, HostBinding, OnInit } from '@angular/core';
import { FormControl, NonNullableFormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { ColorScheme, InsightsService, LocalStorageService, RuntimeService } from './services';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
@UntilDestroy()
export class AppComponent implements OnInit {
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

  protected setColorScheme(colorScheme: ColorScheme | null, systemColorScheme: ColorScheme): void {
    const newColorScheme = colorScheme ?? systemColorScheme;

    if (newColorScheme == 'dark') {
      document.documentElement.classList.add("dark-mode");
      document.documentElement.style.setProperty('color-scheme', 'dark');
    } else {
      document.documentElement.classList.remove("dark-mode");
      document.documentElement.style.setProperty('color-scheme', 'light');
    }

    if (systemColorScheme == newColorScheme) {
      this._storageSvc.removeEntry(this._themeStorageKey);
    } else {
      this._storageSvc.saveValue(this._themeStorageKey, newColorScheme);
    }

    this.darkModeControl.setValue(newColorScheme == 'dark');
  }

  protected init(): void {
    const toggleSystemColorScheme$ = this._runtimeSvc.systemColorScheme$.pipe(
      distinctUntilChanged(),
      tap((systemColorScheme) => this.setColorScheme(
        this._storageSvc.getValue(this._themeStorageKey) as (ColorScheme | null),
        systemColorScheme
      )),
      untilDestroyed(this),
    );

    const toggleColorScheme$ = this.darkModeControl.valueChanges.pipe(
      distinctUntilChanged(),
      withLatestFrom(this._runtimeSvc.systemColorScheme$),
      tap(([darkMode, systemColorScheme]) => this.setColorScheme(darkMode ? 'dark' : 'light', systemColorScheme)),
      untilDestroyed(this),
    );

    toggleColorScheme$.subscribe();
    toggleSystemColorScheme$.subscribe();
  }

  ngOnInit(): void {
    this.init();
  }
}
