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
      large: [
        this._streamBuilder.inputStream({ marbles: '--1--2----3----|' }),
        this._streamBuilder.inputStream({ marbles: '-a---b-----c---|' }),
      ],
      small: [
        this._streamBuilder.inputStream({ marbles: '-1-2--3|' }),
        this._streamBuilder.inputStream({ marbles: 'a---b--|' }),
      ],
    };
  }

  getCode(): string {
    return `function visualize({ combineLatest, map }, one$, two$) {
  return combineLatest([one$, two$]).pipe(
    map(([a, b]) => \`\${a}\${b}\`),
  );
}`;
  }
}
