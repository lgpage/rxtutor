import { Injectable } from '@angular/core';
import { Example, ExampleInputs, ExampleSection } from '../core';
import { StreamBuilderService } from '../services';

@Injectable()
export class ScanExample implements Example {
  name = 'scan';
  section: ExampleSection = 'transformation';
  links = [
    { label: 'Learn RxJS', url: 'https://www.learnrxjs.io/learn-rxjs/operators/transformation/scan' },
    { label: 'RxJS API', url: 'https://rxjs.dev/api/index/function/scan' },
  ];

  constructor(
    protected _streamBuilder: StreamBuilderService,
  ) { }

  getInputStreams(): ExampleInputs {
    return {
      large: [this._streamBuilder.inputStream({ marbles: '---1--2--3--4--|' })],
      small: [this._streamBuilder.inputStream({ marbles: '1-2-3-4|' })],
    };
  }

  getCode(): string {
    return `function visualize({ scan }, one$) {
  return one$.pipe(
    scan((acc, curr) => acc + (+curr), 0),
  );
}`;
  }
}
