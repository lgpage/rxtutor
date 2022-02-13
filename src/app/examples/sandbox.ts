import { Injectable } from '@angular/core';
import { Stream } from '../stream';
import { StreamBuilder } from '../stream.builder';
import { Example, ExampleSection } from './interface';

@Injectable()
export class SandboxExample implements Example {
  name = 'sandbox';
  section: ExampleSection = 'other';

  constructor(
    protected _streamBuilder: StreamBuilder,
  ) { }

  getSources(): Stream[] {
    return [this._streamBuilder.create([2, 5, 8], 10)];
  };

  getCode(): string {
    return 'function visualize(rx, rxOp, one$) {\n  return rx.of(10);\n}';
  };
}
