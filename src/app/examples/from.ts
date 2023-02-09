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
      large: [this._streamBuilder.inputStream({ marbles: '--1--2--3--4--5|' })],
      small: [this._streamBuilder.inputStream({ marbles: '-1-2--3|' })],
    };
  }

  getCode(): string {
    return `function visualize({ from }) {
  return from(['a', 'b', 'c', 'd']);
}`;
  }
}
