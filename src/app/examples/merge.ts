import { Injectable } from '@angular/core';
import { Example, ExampleInputs, ExampleSection } from '../core';
import { StreamBuilderService } from '../services';

@Injectable()
export class MergeExample implements Example {
  name = 'merge';
  section: ExampleSection = 'combination';
  links = [
    { label: 'Learn RxJS', url: 'https://www.learnrxjs.io/learn-rxjs/operators/combination/merge' },
    { label: 'RxJS API', url: 'https://rxjs.dev/api/index/function/merge' },
  ];

  constructor(
    protected _streamBuilder: StreamBuilderService,
  ) { }

  getInputStreams(): ExampleInputs {
    return {
      small: [
        this._streamBuilder.inputStream([1, 3, 6], 7),
        this._streamBuilder.inputStream([0, 4], 5, null, 'a'),
      ],
      large: [
        this._streamBuilder.inputStream([2, 4, 8], 15),
        this._streamBuilder.inputStream([1, 5], 6, null, 'a'),
      ],
    };
  }

  getCode(): string {
    return `function visualize({ merge }, one$, two$) {
  return merge(one$, two$);
}`;
  }
}
