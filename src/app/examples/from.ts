import { Injectable } from '@angular/core';
import { Example, ExampleInputs, ExampleSection } from '../core';
import { StreamBuilderService } from '../services';

@Injectable()
export class FromExample implements Example {
  name = 'from';
  section: ExampleSection = 'creation';
  links = [
    { label: 'Learn RxJS', url: 'https://www.learnrxjs.io/learn-rxjs/operators/creation/from' },
    { label: 'RxJS API', url: 'https://rxjs.dev/api/index/function/from' },
  ];

  constructor(
    protected _streamBuilder: StreamBuilderService,
  ) { }

  getInputStreams(): ExampleInputs {
    return {
      small: [this._streamBuilder.inputStream([1, 3, 6], 7)],
      large: [this._streamBuilder.inputStream([3, 6, 9, 12], 15)],
    };
  }

  getCode(): string {
    return `function visualize({ from }) {
  return from(['a', 'b', 'c', 'd']);
}`;
  }
}
