import { Injectable } from '@angular/core';
import { Example, ExampleInputs, ExampleSection } from '../core';
import { StreamBuilderService } from '../services';

@Injectable()
export class BufferTimeExample implements Example {
  name = 'bufferTime';
  section: ExampleSection = 'transformation';
  links = [
    { label: 'Learn RxJS', url: 'https://www.learnrxjs.io/learn-rxjs/operators/transformation/buffertime' },
    { label: 'RxJS API', url: 'https://rxjs.dev/api/index/function/bufferTime' },
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
        this._streamBuilder.inputStream([1, 3, 5, 7, 9], 15)
      ],
    };
  }

  getCode(): string {
    return `function visualize({ bufferTime }, one$) {
  return one$.pipe(
    bufferTime(3),
  );
}`;
  }
}
