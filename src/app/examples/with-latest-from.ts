import { Injectable } from '@angular/core';
import { Example, ExampleInputs, ExampleSection } from '../core';
import { StreamBuilderService } from '../services';

@Injectable()
export class WithLatestFromExample implements Example {
  name = 'withLatestFrom';
  section: ExampleSection = 'combination';
  links = [
    { label: 'Learn RxJS', url: 'https://www.learnrxjs.io/learn-rxjs/operators/combination/withlatestfrom' },
    { label: 'RxJS API', url: 'https://rxjs.dev/api/index/function/withLatestFrom' },
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
        this._streamBuilder.inputStream([0, 5], 7, null, 'a'),
      ],
    };
  }

  getCode(): string {
    return `function visualize({ withLatestFrom, map }, one$, two$) {
  return one$.pipe(
    withLatestFrom(two$),
    map(([a, b]) => \`\${a}\${b}\`),
  );
}`;
  }
}
