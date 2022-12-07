import { Injectable } from '@angular/core';
import { Example, ExampleInputs, ExampleSection } from '../core';
import { StreamBuilderService } from '../services';

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
        this._streamBuilder.inputStream([1, 4], 7),
        this._streamBuilder.inputStream([0, 2], 3, null, 'a'),
      ],
      large: [
        this._streamBuilder.inputStream([1, 5, 6], 15),
        this._streamBuilder.inputStream([0, 2], 3, null, 'a'),
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
