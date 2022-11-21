import * as rx from 'rxjs';
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { range } from '../core';
import { LoggerService } from './logger.service';

@Injectable({ providedIn: 'root' })
export class ExecutorService {
  protected _name = 'ExecutorService';

  constructor(
    protected _snackBar: MatSnackBar,
    protected _logger: LoggerService,
  ) { }

  protected logError(message: string, error: unknown) {
    this._logger.logError(message, { error });
    this._snackBar.open(
      'Something went wrong, please see browser console for more details.',
      'Ok',
      { politeness: 'assertive', duration: 3000 }
    );
  }

  protected createCallable(jsCode: string, size: number): Function | null {
    const words = ['one$', 'two$', 'three$', 'four$', 'five$', 'six$', 'seven$', 'eight$', 'nine$', 'ten$'];
    const args = ['rx', ...range(size).map((i) => i > 9 ? `source${i}$` : words[i])];
    const callMethod = `return visualize(${args.join(', ')});`;

    this._logger.logDebug(`${this._name} >> createCallable`, { jsCode, callMethod });

    try {
      return new Function(...args, `${jsCode}\n\n${callMethod}`);
    } catch (error: unknown) {
      this.logError('Failed to create function.', error);
      return null;
    }
  }

  protected invoke(callable: Function | null, sources: rx.Observable<string>[]): rx.Observable<string | null> {
    this._logger.logDebug(`${this._name} >> invoke`, { callable, sources });

    if (!callable) {
      return rx.of(null);
    }

    try {
      return (callable(rx, ...sources) as rx.Observable<string>).pipe(
        rx.catchError((error: unknown) => {
          this.logError('Pipe threw an unexpected error.', error);
          return rx.of(null);
        }),
      );
    } catch (error: unknown) {
      this.logError('Failed to invoke function or invalid response type.', error);
      return rx.of(null);
    }
  }

  getFunctionResult(jsCode: string, sources: rx.Observable<string>[]): rx.Observable<string | null> {
    return this.invoke(this.createCallable(jsCode, sources.length), sources).pipe(
      rx.tap((result) => this._logger.logDebug(`${this._name} >> getFunctionResult`, { result })),
      rx.shareReplay({ refCount: true, bufferSize: 1 }),
    );
  }
}
