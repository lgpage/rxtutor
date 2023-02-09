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
      large: [
        this._streamBuilder.inputStream({ marbles: '--1-2---3------|' }),
        this._streamBuilder.inputStream({ marbles: 'a----b-|' }),
      ],
      small: [
        this._streamBuilder.inputStream({ marbles: '-1-2--3|' }),
        this._streamBuilder.inputStream({ marbles: 'a---b|' }),
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
