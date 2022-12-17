import { Injectable } from '@angular/core';
import { Example, ExampleInputs, ExampleSection } from '../core';
import { StreamBuilderService } from '../services';

@Injectable()
export class SwitchMapExample implements Example {
  name = 'switchMap';
  section: ExampleSection = 'transformation';
  links = [
    { label: 'Learn RxJS', url: 'https://www.learnrxjs.io/learn-rxjs/operators/transformation/switchmap' },
    { label: 'RxJS API', url: 'https://rxjs.dev/api/index/function/switchMap' },
  ];

  constructor(
    protected _streamBuilder: StreamBuilderService,
  ) { }

  getInputStreams(): ExampleInputs {
    return {
      small: [
        this._streamBuilder.inputStream([1, 2, 4], 7),
        this._streamBuilder.inputStream([0, 2], 3, null, 'a'),
      ],
      large: [
        this._streamBuilder.inputStream([1, 2, 7, 8], 15),
        this._streamBuilder.inputStream([0, 2], 3, null, 'a'),
      ],
    };
  }

  getCode(): string {
    return `function visualize({ switchMap, map }, one$, two$) {
  return one$.pipe(
    switchMap((a) => two$.pipe(
      map((b) => \`\${a}\${b}\`),
    )),
  );
}`;
  }
}
