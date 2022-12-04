import * as rx from 'rxjs';
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { InputStream, OutputStream, range, VisualizationScheduler } from '../core';
import { LoggerService } from './logger.service';
import { StreamBuilderService } from './stream.builder';

@Injectable({ providedIn: 'root' })
export class ExecutorService {
  protected _name = 'ExecutorService';

  constructor(
    protected _snackBar: MatSnackBar,
    protected _streamBuilder: StreamBuilderService,
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

  protected invoke(callable: Function | null, sources: rx.Observable<string>[]): rx.Observable<any | null> {
    this._logger.logDebug(`${this._name} >> invoke`, { callable, sources });

    if (!callable) {
      return rx.of(null);
    }

    try {
      return (callable(rx, ...sources) as rx.Observable<any>).pipe(
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

  getFunctionResult(jsCode: string, sources: rx.Observable<string>[]): rx.Observable<any | null> {
    return this.invoke(this.createCallable(jsCode, sources.length), sources);
  }

  getVisualizedOutput(code$: rx.Observable<string>, sources$: rx.Observable<InputStream[]>): OutputStream {
    const nodesUpdater$ = rx.combineLatest([code$, sources$]).pipe(
      rx.first(),
      rx.mergeMap(([code, sources]) => rx.combineLatest(sources.map((x) => x.marbles$)).pipe(
        rx.map((marbles) => ({ code, marbles })),
      )),
      rx.tap(({ code, marbles }) => this._logger.logDebug(`${this._name} >> getVisualizedOutput`, { code, marbles })),
      rx.map(({ code, marbles }) => {
        const scheduler = new VisualizationScheduler(this._streamBuilder.dx, this._logger);

        return scheduler.run(({ streamObservable, materialize }) => {
          const streams = marbles.map((m) => streamObservable(m))
          const output = materialize(this.getFunctionResult(code, streams).pipe(
            rx.tap((output) => this._logger.logDebug(`${this._name} >> getVisualizedOutput >> output$`, { output })),
          ));

          this._logger.logDebug(`${this._name} >> getVisualizedOutput`, { streams, output });
          return output;
        });
      }),
    )

    return this._streamBuilder.outputStream(nodesUpdater$);
  }
}
