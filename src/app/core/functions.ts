import * as rx from 'rxjs';
import { LoggerService } from '../services';
import { range } from './helpers';

export const createFunction = (jsCode: string, size: number): Function => {
  const words = ['one$', 'two$', 'three$', 'four$', 'five$', 'six$', 'seven$', 'eight$', 'nine$', 'ten$'];
  const args = ['rx', 'rxOp', ...range(size).map((i) => i > 9 ? `source${i}$` : words[i])];
  const callMethod = `return visualize(${args.join(', ')});`;

  try {
    return new Function(...args, `${jsCode}\n\n${callMethod}`);
  } catch (error: unknown) {
    return null;
  }
};

export const callFunction = (fn: Function, sources: rx.Observable<string>[]): rx.Observable<string> => {
  if (!fn) {
    return rx.of(null);
  }

  try {
    return (fn(rx, ...sources) as rx.Observable<string>).pipe(  // TODO: Check Function response type
      rx.catchError((err: unknown) => rx.of(null)),
    );
  } catch (error: unknown) {
    return rx.of(null);
  }
};

export const getFunctionResult = (jsCode: string, sources: rx.Observable<string>[], logger?: LoggerService): rx.Observable<string> => {
  return callFunction(createFunction(jsCode, sources.length), sources).pipe(
    rx.tap((result) => logger?.logDebug('getFunctionResult', { result })),
    rx.shareReplay({ refCount: true, bufferSize: 1 }),
  );
};
