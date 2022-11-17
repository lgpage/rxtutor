import { Injectable } from '@angular/core';
import { StreamBuilderService } from '../services';
import { Example, ExampleInputs, ExampleSection } from '../types';

@Injectable()
export class CombineLatestExample implements Example {
  name = 'combineLatest';
  section: ExampleSection = 'combination';
  links = [
    { label: 'Learn RxJS', url: 'https://www.learnrxjs.io/learn-rxjs/operators/combination/combinelatest' },
    { label: 'RxJS API', url: 'https://rxjs.dev/api/index/function/combineLatest' },
  ];

  constructor(
    protected _streamBuilder: StreamBuilderService,
  ) { }

  getInputStreams(): ExampleInputs {
    return {
      small: [
        this._streamBuilder.inputStream([1, 3, 6], 7),
        this._streamBuilder.inputStream([0, 4], 7, null, 'A'),
      ],
      large: [
        this._streamBuilder.inputStream([3, 6, 9], 15),
        this._streamBuilder.inputStream([1, 6, 11], 15, null, 'A'),
      ],
    };
  };

  getCode(): string {
    return `function visualize({ combineLatest }, one$, two$) {
  return combineLatest([one$, two$]);
}`;
  };
}
