import { Injectable } from '@angular/core';
import { Example, ExampleInputs, ExampleSection } from '../core';
import { StreamBuilderService } from '../services';

@Injectable()
export class StartWithExample implements Example {
  name = 'startWith';
  section: ExampleSection = 'combination';
  links = [
    { label: 'Learn RxJS', url: 'https://www.learnrxjs.io/learn-rxjs/operators/combination/startwith' },
    { label: 'RxJS API', url: 'https://rxjs.dev/api/index/function/startWith' },
  ];

  constructor(
    protected _streamBuilder: StreamBuilderService,
  ) { }

  getInputStreams(): ExampleInputs {
    return {
      large: [this._streamBuilder.inputStream({ marbles: '--1-2---3------|' })],
      small: [this._streamBuilder.inputStream({ marbles: '-1-2--3|' })],
    };
  }

  getCode(): string {
    return `function visualize({ startWith }, one$) {
  return one$.pipe(
    startWith('a'),
  );
}`;
  }
}
