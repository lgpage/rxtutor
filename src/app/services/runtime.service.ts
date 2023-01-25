import { combineLatest, distinctUntilChanged, map, shareReplay, tap } from 'rxjs';
import { BreakpointObserver } from '@angular/cdk/layout';
import { Injectable } from '@angular/core';
import { LoggerService } from '../logger.service';

export interface SimpleLayoutMatch {
  mediaSize: 'small' | 'large';  // < 800px - small; else large
  exampleSize: 'small' | 'large';  // < 1024 - small; else large
  orientation: 'portrait' | 'landscape';
}

export type ColorScheme = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class RuntimeService {
  protected _name = 'RuntimeService';
  protected _size$ = this._breakpointObserver.observe('(max-width: 799px)');
  protected _orientation$ = this._breakpointObserver.observe('(orientation: landscape)');
  protected _exampleSize$ = this._breakpointObserver.observe('(max-width: 1023px)');
  protected _darkScheme$ = this._breakpointObserver.observe('(prefers-color-scheme: dark)');

  layoutMatch$ = combineLatest([this._size$, this._orientation$, this._exampleSize$]).pipe(
    map(([size, orientation, exampleSize]): SimpleLayoutMatch => {
      return {
        mediaSize: size.matches ? 'small' : 'large',
        orientation: orientation.matches ? 'landscape' : 'portrait',
        exampleSize: exampleSize.matches ? 'small' : 'large',
      };
    }),
    distinctUntilChanged((p, c) =>
      p.mediaSize === c.mediaSize
      && p.orientation === c.orientation
      && p.exampleSize === c.exampleSize
    ),
    tap((layout) => this._logger.logDebug(`${this._name} >> layoutMatch$`, { layout })),
    shareReplay({ refCount: true, bufferSize: 1 }),
  );

  mediaSize$ = this.layoutMatch$.pipe(map((layout) => layout.mediaSize));
  orientation$ = this.layoutMatch$.pipe(map((layout) => layout.orientation));
  exampleSize$ = this.layoutMatch$.pipe(map((layout) => layout.exampleSize));

  systemColorScheme$ = this._darkScheme$.pipe(
    map((darkScheme): ColorScheme => darkScheme.matches ? 'dark' : 'light'),
    distinctUntilChanged(),
    shareReplay({ refCount: true, bufferSize: 1 }),
  );

  constructor(
    protected _breakpointObserver: BreakpointObserver,
    protected _logger: LoggerService,
  ) { }
}
