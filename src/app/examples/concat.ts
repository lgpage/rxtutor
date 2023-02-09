import { Injectable } from '@angular/core';
import { Example, ExampleInputs, ExampleSection } from '../core';
import { StreamBuilderService } from '../services';

@Injectable()
export class ConcatExample implements Example {
  name = 'concat';
  section: ExampleSection = 'combination';
  links = [
    { label: 'Learn RxJS', url: 'https://www.learnrxjs.io/learn-rxjs/operators/combination/concat' },
    { label: 'RxJS API', url: 'https://rxjs.dev/api/index/function/concat' },
  ];

  constructor(
    protected _streamBuilder: StreamBuilderService,
  ) { }

  getInputStreams(): ExampleInputs {
    return {
      large: [
        this._streamBuilder.inputStream({ marbles: '-1-2|' }),
        this._streamBuilder.inputStream({ marbles: '--ab-|' }),
        this._streamBuilder.inputStream({ marbles: '345|' }),
      ],
      small: [
        this._streamBuilder.inputStream({ marbles: '1-2|' }),
        this._streamBuilder.inputStream({ marbles: 'a-|' }),
        this._streamBuilder.inputStream({ marbles: '34|' }),
      ],
    };
  }

  getCode(): string {
    return `function visualize({ concat }, one$, two$, three$) {
  return concat(one$, two$, three$);
}`;
  }
}
