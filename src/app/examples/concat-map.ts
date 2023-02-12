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
    return `function visualize({ concatMap, map }, one$, two$) {
  return one$.pipe(
    concatMap((a) => two$.pipe(
      map((b) => \`\${a}\${b}\`),
    )),
  );
}`;
  }
}
