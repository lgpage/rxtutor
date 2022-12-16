import { Injectable } from '@angular/core';
import { Example, ExampleInputs, ExampleSection } from '../core';
import { StreamBuilderService } from '../services';

@Injectable()
export class FinalizeExample implements Example {
  name = 'finalize';
  section: ExampleSection = 'utility';
  links = [
    { label: 'Learn RxJS', url: 'https://www.learnrxjs.io/learn-rxjs/operators/utility/finalize' },
    { label: 'RxJS API', url: 'https://rxjs.dev/api/index/function/finalize' },
  ];

  constructor(
    protected _streamBuilder: StreamBuilderService,
  ) { }

  getInputStreams(): ExampleInputs {
    return {
      small: [this._streamBuilder.inputStream([0, 2, 4], 7)],
      large: [this._streamBuilder.inputStream([3, 6, 9, 12], 15)],
    };
  }

  getCode(): string {
    return `function visualize({ finalize, tap }, one$) {
  return one$.pipe(
    tap((x) => console.log({ x })),
    finalize(() => console.log('Done!')),
  );
}`;
  }
}
