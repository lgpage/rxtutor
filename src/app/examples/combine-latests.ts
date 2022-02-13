import { Injectable } from '@angular/core';
import { Stream } from '../stream';
import { StreamBuilder } from '../stream.builder';
import { Example, ExampleSection } from './interface';

@Injectable()
export class CombineLatestExample implements Example {
  name = 'combineLatest';
  section: ExampleSection = 'combination';

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
    return 'function visualize(rx, rxOp, one$, two$) {\n  return rx.combineLatest([one$, two$]);\n}';
  };
}
