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
      large: [this._streamBuilder.inputStream({ marbles: '--1--2--3--4--5|' })],
      small: [this._streamBuilder.inputStream({ marbles: '-1-2--3|' })],
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
