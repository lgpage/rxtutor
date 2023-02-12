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
      large: [
        this._streamBuilder.inputStream({ marbles: '--1-2---3------|' }),
        this._streamBuilder.inputStream({ marbles: '-a---b|' }),
      ],
      small: [
        this._streamBuilder.inputStream({ marbles: '-1-2--3|' }),
        this._streamBuilder.inputStream({ marbles: 'a---b|' }),
      ],
    };
  }

  getCode(): string {
    return `function visualize({ merge }, one$, two$) {
  return merge(one$, two$);
}`;
  }
}
