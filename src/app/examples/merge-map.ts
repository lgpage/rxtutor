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
      large: [
        this._streamBuilder.inputStream({ marbles: '-12----34------|' }),
        this._streamBuilder.inputStream({ marbles: 'a-b|' }),
      ],
      small: [
        this._streamBuilder.inputStream({ marbles: '-12----|' }),
        this._streamBuilder.inputStream({ marbles: 'a-b|' }),
      ],
    };
  }

  getCode(): string {
    return `function visualize({ mergeMap, map }, one$, two$) {
  return one$.pipe(
    mergeMap((a) => two$.pipe(
      map((b) => \`\${a}\${b}\`),
    )),
  );
}`;
  }
}
