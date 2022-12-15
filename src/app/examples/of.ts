import { Injectable } from '@angular/core';
import { Example, ExampleInputs, ExampleSection } from '../core';
import { StreamBuilderService } from '../services';

@Injectable()
export class OfExample implements Example {
  name = 'of';
  section: ExampleSection = 'creation';
  links = [
    { label: 'Learn RxJS', url: 'https://www.learnrxjs.io/learn-rxjs/operators/creation/of' },
    { label: 'RxJS API', url: 'https://rxjs.dev/api/index/function/of' },
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
    return `function visualize({ of }) {
  return of('a', 'b', 'c', 'd');
}`;
  }
}
