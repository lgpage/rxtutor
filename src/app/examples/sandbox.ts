import { Injectable } from '@angular/core';
import { Example, ExampleInputs, ExampleSection } from '../core';
import { StreamBuilderService } from '../services';

@Injectable()
export class SandboxExample implements Example {
  name = 'sandbox';
  section: ExampleSection = 'other';

  constructor(
    protected _streamBuilder: StreamBuilderService,
  ) { }

  getInputStreams(): ExampleInputs {
    return {
      small: [this._streamBuilder.inputStream([1, 3, 6], 7)],
      large: [this._streamBuilder.inputStream([3, 6, 9, 12], 15)],
    };
  }

  getCode(): string {
    return `function visualize({ map }, one$) {
  return one$.pipe(
    map((x) => x * 2),
  );
}`;
  }
}
