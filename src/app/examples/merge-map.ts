import { Injectable } from '@angular/core';
import { InputStream } from '../core/stream';
import { StreamBuilder } from '../core/stream.builder';
import { Example, ExampleSection } from './interface';

@Injectable()
export class MergeMapExample implements Example {
  name = 'mergeMap';
  section: ExampleSection = 'transformation';

  constructor(
    protected _streamBuilder: StreamBuilder,
  ) { }

  getSources(): InputStream[] {
    return [
      this._streamBuilder.inputStream([2, 5, 8], 10),
      this._streamBuilder.inputStream([2, 5, 8], 10),
    ];
  };

  getCode(): string {
    return `function visualize(rx, rxOp, one$, two$) {
  return one$.pipe(
    rxOp.mergeMap((a) => two$.pipe(
      rxOp.map((b) => \`\${a}\${b}\`)
    )),
  );
}`;
  };
}
