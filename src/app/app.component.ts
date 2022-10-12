import { tap } from 'rxjs';
import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, HostBinding, OnInit } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { LocalStorageService } from './services';

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

  @HostBinding('class.darkMode') get darkMode(): boolean {
    return this.darkModeControl.value;
  };

  constructor(
    protected _overlay: OverlayContainer,
    protected _storageSvc: LocalStorageService,
    protected _formBuilder: FormBuilder,
  ) { }

  ngOnInit(): void {
    this.darkModeControl.valueChanges.pipe(
      tap((darkMode) => {
        const theme: Theme = darkMode ? 'dark' : 'light';
        this._storageSvc.saveValue(this._themeStorageKey, theme);
        if (darkMode) {
          this._overlay.getContainerElement().classList.add('darkMode');
        } else {
          this._overlay.getContainerElement().classList.remove('darkMode');
        }
      }),
      untilDestroyed(this),
    ).subscribe();

    const theme = this._storageSvc.getValue(this._themeStorageKey) as Theme;
    this.darkModeControl.setValue(theme === 'dark');
  }
}
