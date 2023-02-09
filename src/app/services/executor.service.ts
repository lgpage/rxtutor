/* eslint-disable @typescript-eslint/ban-types */
import * as rx from 'rxjs';
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FrameNotification, InputStreamLike, OutputStream, range, VisualizationScheduler } from '../core';
import { LoggerService } from '../logger.service';
import { StreamBuilderService } from './stream.builder';

@Injectable({ providedIn: 'root' })
export class ExecutorService {
  protected _name = 'ExecutorService';

  constructor(
    protected _snackBar: MatSnackBar,
    protected _streamBuilder: StreamBuilderService,
    protected _logger: LoggerService,
  ) { }

  protected logError(message: string, error: unknown): void {
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

  getVisualizedNodesUpdater(code$: rx.Observable<string>, sources$: rx.Observable<InputStreamLike[]>): rx.Observable<FrameNotification[]> {
    return rx.combineLatest([code$, sources$]).pipe(
      rx.first(),
      rx.mergeMap(([code, sources]) => rx.combineLatest(sources.map((x) => x.marbles$)).pipe(
        rx.map((marbles) => ({ code, streamMarbles: marbles })),
      )),
      rx.tap(({ code, streamMarbles }) => this._logger.logDebug(`${this._name} >> getVisualizedOutput`, { code, marbles: streamMarbles })),
      rx.map(({ code, streamMarbles }) => {
        const frameSize = this._streamBuilder.frameSize;
        const scheduler = new VisualizationScheduler(frameSize, this._logger);

        return scheduler.run(({ streamObservable, materialize }) => {
          const streams = streamMarbles.map(({ marbles, values, error }) => streamObservable(marbles, values, error));
          const notifications = materialize(this.getFunctionResult(code, streams).pipe(
            rx.tap((output) => this._logger.logDebug(`${this._name} >> getVisualizedOutput >> output$`, { output })),
          ));

          this._logger.logDebug(`${this._name} >> getVisualizedOutput`, { streams, notifications });
          return notifications;
        });
      }),
    );
  }

  getVisualizedOutput(code$: rx.Observable<string>, sources$: rx.Observable<InputStreamLike[]>): OutputStream {
    const nodesUpdater$ = this.getVisualizedNodesUpdater(code$, sources$);
    return this._streamBuilder.outputStream(nodesUpdater$);
  }
}
