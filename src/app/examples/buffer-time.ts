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
      large: [this._streamBuilder.inputStream({ marbles: '-1-2-3-4-5-----|' })],
      small: [this._streamBuilder.inputStream({ marbles: '1-2-3-4|' })],
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
