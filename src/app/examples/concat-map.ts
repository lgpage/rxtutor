import { Injectable } from '@angular/core';
import { Example, ExampleInputs, ExampleSection } from '../core';
import { StreamBuilderService } from '../services';

@Injectable()
export class ConcatMapExample implements Example {
  name = 'concatMap';
  section: ExampleSection = 'transformation';
  links = [
    { label: 'Learn RxJS', url: 'https://www.learnrxjs.io/learn-rxjs/operators/transformation/concatmap' },
    { label: 'RxJS API', url: 'https://rxjs.dev/api/index/function/concatMap' },
  ];

  constructor(
    protected _streamBuilder: StreamBuilderService,
  ) { }

  getInputStreams(): ExampleInputs {
    return {
      small: [
        this._streamBuilder.inputStream([1, 2], 7),
        this._streamBuilder.inputStream([0, 2], 3, null, 'a'),
      ],
      large: [
        this._streamBuilder.inputStream([1, 2, 7, 8], 15),
        this._streamBuilder.inputStream([0, 2], 3, null, 'a'),
      ],
    };
  }

  getCode(): string {
    return `function visualize({ concatMap, map }, one$, two$) {
  return one$.pipe(
    concatMap((a) => two$.pipe(
      map((b) => \`\${a}\${b}\`),
    )),
  );
}`;
  }
}
