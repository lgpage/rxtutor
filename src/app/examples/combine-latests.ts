import { Injectable } from '@angular/core';
import { InputStream } from '../stream';
import { StreamBuilder } from '../stream.builder';
import { Example, ExampleSection } from './interface';

@Injectable()
export class CombineLatestExample implements Example {
  name = 'combineLatest';
  section: ExampleSection = 'combination';

  constructor(
    protected _streamBuilder: StreamBuilder,
  ) { }

  getSources(): InputStream[] {
    return [
      this._streamBuilder.create([2, 5, 8], 10),
      this._streamBuilder.create([2, 5, 8], 10),
    ];
  };

  getCode(): string {
    return 'function visualize({ combineLatest }, rxOp, one$, two$) {\n  return combineLatest([one$, two$]);\n}';
  };
}
