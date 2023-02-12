import { Injectable } from '@angular/core';
import { Example, ExampleInputs, ExampleSection } from '../core';
import { StreamBuilderService } from '../services';

@Injectable()
export class ThrottleTimeExample implements Example {
  name = 'throttleTime';
  section: ExampleSection = 'filtering';
  links = [
    { label: 'Learn RxJS', url: 'https://www.learnrxjs.io/learn-rxjs/operators/filtering/throttletime' },
    { label: 'RxJS API', url: 'https://rxjs.dev/api/index/function/throttleTime' },
  ];

  constructor(
    protected _streamBuilder: StreamBuilderService,
  ) { }

  getInputStreams(): ExampleInputs {
    return {
      large: [this._streamBuilder.inputStream({ marbles: '-1-2---345-----|' })],
      small: [this._streamBuilder.inputStream({ marbles: '12-3---|' })],
    };
  }

  getCode(): string {
    return `function visualize({ throttleTime }, one$) {
  return one$.pipe(
    throttleTime(2),
  );
}`;
  }
}
