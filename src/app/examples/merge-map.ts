import { Injectable } from '@angular/core';
import { StreamBuilderService } from '../services';
import { Example, ExampleInputs, ExampleSection } from '../types';

@Injectable()
export class MergeMapExample implements Example {
  name = 'mergeMap';
  section: ExampleSection = 'transformation';
  links = [
    { label: 'Learn RxJS', url: 'https://www.learnrxjs.io/learn-rxjs/operators/transformation/mergemap' },
    { label: 'RxJS API', url: 'https://rxjs.dev/api/index/function/mergeMap' },
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
    return `function visualize({ mergeMap, map }, one$, two$) {
  return one$.pipe(
    mergeMap((a) => two$.pipe(
      map((b) => \`\${a}\${b}\`)
    )),
  );
}`;
  };
}
