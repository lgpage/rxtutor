import { Injectable } from '@angular/core';
import { Example, ExampleInputs, ExampleSection } from '../core';
import { StreamBuilderService } from '../services';

@Injectable()
export class TakeUntilExample implements Example {
  name = 'takeUntil';
  section: ExampleSection = 'filtering';
  links = [
    { label: 'Learn RxJS', url: 'https://www.learnrxjs.io/learn-rxjs/operators/filtering/takeuntil' },
    { label: 'RxJS API', url: 'https://rxjs.dev/api/index/function/takeUntil' },
  ];

  constructor(
    protected _streamBuilder: StreamBuilderService,
  ) { }

  getInputStreams(): ExampleInputs {
    return {
      large: [
        this._streamBuilder.inputStream({ marbles: '---1--2--3--4--|' }),
        this._streamBuilder.inputStream({ marbles: '--------a------|' })
      ],
      small: [
        this._streamBuilder.inputStream({ marbles: '1-2-3-4|' }),
        this._streamBuilder.inputStream({ marbles: '-----a-|' })
      ],
    };
  }

  getCode(): string {
    return `function visualize({ takeUntil }, one$, two$) {
  return one$.pipe(
    takeUntil(two$),
  );
}`;
  }
}
