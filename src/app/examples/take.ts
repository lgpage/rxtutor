import { Injectable } from '@angular/core';
import { Example, ExampleInputs, ExampleSection } from '../core';
import { StreamBuilderService } from '../services';

@Injectable()
export class TakeExample implements Example {
  name = 'take';
  section: ExampleSection = 'filtering';
  links = [
    { label: 'Learn RxJS', url: 'https://www.learnrxjs.io/learn-rxjs/operators/filtering/take' },
    { label: 'RxJS API', url: 'https://rxjs.dev/api/index/function/take' },
  ];

  constructor(
    protected _streamBuilder: StreamBuilderService,
  ) { }

  getInputStreams(): ExampleInputs {
    return {
      small: [this._streamBuilder.inputStream([0, 2, 4, 6], 7)],
      large: [this._streamBuilder.inputStream([3, 6, 9, 12], 15)],
    };
  }

  getCode(): string {
    return `function visualize({ take }, one$) {
  return one$.pipe(
    take(3),
  );
}`;
  }
}
