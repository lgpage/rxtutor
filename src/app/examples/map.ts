import { Injectable } from '@angular/core';
import { Example, ExampleInputs, ExampleSection } from '../core';
import { StreamBuilderService } from '../services';

@Injectable()
export class MapExample implements Example {
  name = 'map';
  section: ExampleSection = 'transformation';
  links = [
    { label: 'Learn RxJS', url: 'https://www.learnrxjs.io/learn-rxjs/operators/transformation/map' },
    { label: 'RxJS API', url: 'https://rxjs.dev/api/index/function/map' },
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
    return `function visualize({ map }, one$) {
  return one$.pipe(
    map((x) => 2 * x),
  );
}`;
  }
}
