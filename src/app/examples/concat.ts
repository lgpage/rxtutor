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
      small: [
        this._streamBuilder.inputStream([0, 2], 3),
        this._streamBuilder.inputStream([0], 2, null, 'a'),
        this._streamBuilder.inputStream([0, 1], 2, null, '3'),
      ],
      large: [
        this._streamBuilder.inputStream([1, 3], 4),
        this._streamBuilder.inputStream([2, 3], 5, null, 'a'),
        this._streamBuilder.inputStream([0, 1, 2], 3, null, '3'),
      ],
    };
  };

  getCode(): string {
    return `function visualize({ concat }, one$, two$, three$) {
  return concat(one$, two$, three$);
}`;
  };
}
