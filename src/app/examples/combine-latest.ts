import { Injectable } from '@angular/core';
import { Example, ExampleInputs, ExampleSection } from '../core';
import { StreamBuilderService } from '../services';

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
        this._streamBuilder.inputStream([0, 4], 7, null, 'a'),
      ],
      large: [
        this._streamBuilder.inputStream([2, 5, 10], 15),
        this._streamBuilder.inputStream([1, 5, 11], 15, null, 'a'),
      ],
    };
  };

  getCode(): string {
    return `function visualize({ combineLatest, map }, one$, two$) {
  return combineLatest([one$, two$]).pipe(
    map(([a, b]) => \`\${a}\${b}\`),
  );
}`;
  };
}
