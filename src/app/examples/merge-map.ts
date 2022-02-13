import { Injectable } from '@angular/core';
import { Stream } from '../stream';
import { StreamBuilder } from '../stream.builder';
import { Example, ExampleSection } from './interface';

@Injectable()
export class MergeMapExample implements Example {
  name = 'mergeMap';
  section: ExampleSection = 'transformation';

  constructor(
    protected _streamBuilder: StreamBuilder,
  ) { }

  getSources(): Stream[] {
    return [
      this._streamBuilder.create([2, 5, 8], 10),
      this._streamBuilder.create([2, 5, 8], 10),
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
