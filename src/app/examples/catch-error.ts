import { Injectable } from '@angular/core';
import { Example, ExampleInputs, ExampleSection } from '../core';
import { StreamBuilderService } from '../services';

@Injectable()
export class CatchErrorExample implements Example {
  name = 'catchError';
  section: ExampleSection = 'error';
  links = [
    { label: 'Learn RxJS', url: 'https://www.learnrxjs.io/learn-rxjs/operators/error_handling/catch' },
    { label: 'RxJS API', url: 'https://rxjs.dev/api/index/function/catchError' },
  ];

  constructor(
    protected _streamBuilder: StreamBuilderService,
  ) { }

  getInputStreams(): ExampleInputs {
    return {
      small: [this._streamBuilder.inputStream([0, 2, 4, 6], 7)],
      large: [this._streamBuilder.inputStream([3, 6, 9, 12], 15)],
    };
  }

  getCode(): string {
    return `function visualize({ catchError, tap, of }, one$) {
      return one$.pipe(
        tap((x) => {
          if (x === '3') {
            throw new Error('three!');
          }
        }),
        catchError((error) => {
          return of('a');
        }),
      );
}`;
  }
}
