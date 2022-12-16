import { Injectable } from '@angular/core';
import { Example, ExampleInputs, ExampleSection } from '../core';
import { StreamBuilderService } from '../services';

@Injectable()
export class TakeUntilExample implements Example {
  name = 'takeUntil';
  section: ExampleSection = 'filtering';
  links = [
    { label: 'Learn RxJS', url: 'https://www.learnrxjs.io/learn-rxjs/operators/filtering/takeuntil' },
    { label: 'RxJS API', url: 'https://rxjs.dev/api/index/function/takeUntil' },
  ];

  constructor(
    protected _streamBuilder: StreamBuilderService,
  ) { }

  getInputStreams(): ExampleInputs {
    return {
      small: [
        this._streamBuilder.inputStream([0, 2, 4, 6], 7),
        this._streamBuilder.inputStream([5], 7, null, 'a')
      ],
      large: [
        this._streamBuilder.inputStream([3, 6, 9, 12], 15),
        this._streamBuilder.inputStream([8], 15, null, 'a')
      ],
    };
  }

  getCode(): string {
    return `function visualize({ takeUntil }, one$, two$) {
  return one$.pipe(
    takeUntil(two$),
  );
}`;
  }
}
