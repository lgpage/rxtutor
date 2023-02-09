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
      large: [this._streamBuilder.inputStream({ marbles: '---1--2--3--4--|' })],
      small: [this._streamBuilder.inputStream({ marbles: '1-2-3--|' })],
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
