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
      small: [
        this._streamBuilder.inputStream([0, 2, 4, 6], 7)
      ],
      large: [
        this._streamBuilder.inputStream([3, 6, 9, 12], 15)
      ],
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
