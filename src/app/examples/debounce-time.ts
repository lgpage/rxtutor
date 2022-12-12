import { Injectable } from '@angular/core';
import { Example, ExampleInputs, ExampleSection } from '../core';
import { StreamBuilderService } from '../services';

@Injectable()
export class DebounceTimeExample implements Example {
  name = 'debounceTime';
  section: ExampleSection = 'filtering';
  links = [
    { label: 'Learn RxJS', url: 'https://www.learnrxjs.io/learn-rxjs/operators/filtering/debouncetime' },
    { label: 'RxJS API', url: 'https://rxjs.dev/api/index/function/debounceTime' },
  ];

  constructor(
    protected _streamBuilder: StreamBuilderService,
  ) { }

  getInputStreams(): ExampleInputs {
    return {
      small: [
        this._streamBuilder.inputStream([0, 1, 3], 7),
      ],
      large: [
        this._streamBuilder.inputStream([1, 3, 7, 8, 9], 15),
      ],
    };
  };

  getCode(): string {
    return `function visualize({ debounceTime }, one$) {
  return one$.pipe(
    debounceTime(2),
  );
}`;
  };
}
