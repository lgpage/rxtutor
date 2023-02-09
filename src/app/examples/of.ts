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
      large: [this._streamBuilder.inputStream({ marbles: '--1--2--3--4--5|' })],
      small: [this._streamBuilder.inputStream({ marbles: '-1-2--3|' })],
    };
  }

  getCode(): string {
    return `function visualize({ of }) {
  return of('a', 'b', 'c', 'd');
}`;
  }
}
