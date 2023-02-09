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
      large: [this._streamBuilder.inputStream({ marbles: '-1-2---345-----|' })],
      small: [this._streamBuilder.inputStream({ marbles: '12-3---|' })],
    };
  }

  getCode(): string {
    return `function visualize({ debounceTime }, one$) {
  return one$.pipe(
    debounceTime(2),
  );
}`;
  }
}
