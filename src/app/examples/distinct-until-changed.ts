import { Injectable } from '@angular/core';
import { Example, ExampleInputs, ExampleSection } from '../core';
import { StreamBuilderService } from '../services';

@Injectable()
export class DistinctUntilChangedExample implements Example {
  name = 'distinctUntilChanged';
  section: ExampleSection = 'filtering';
  links = [
    { label: 'Learn RxJS', url: 'https://www.learnrxjs.io/learn-rxjs/operators/filtering/distinctuntilchanged' },
    { label: 'RxJS API', url: 'https://rxjs.dev/api/index/function/distinctUntilChanged' },
  ];

  constructor(
    protected _streamBuilder: StreamBuilderService,
  ) { }

  getInputStreams(): ExampleInputs {
    return {
      large: [this._streamBuilder.inputStream({ marbles: '--1--2--3--4--5|' })],
      small: [this._streamBuilder.inputStream({ marbles: '1-2-3-4|' })],
    };
  }

  getCode(): string {
    return `function visualize({ distinctUntilChanged, map }, one$) {
  return one$.pipe(
    map((x) => (+x) <= 2 ? 'a' : 'b'),
    distinctUntilChanged(),
  );
}`;
  }
}
