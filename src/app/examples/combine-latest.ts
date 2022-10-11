import { Injectable } from '@angular/core';
import { InputStream } from '../core/stream';
import { StreamBuilderService } from '../services/stream.builder';
import { Example, ExampleSection } from '../types';

@Injectable()
export class CombineLatestExample implements Example {
  name = 'combineLatest';
  section: ExampleSection = 'combination';

  constructor(
    protected _streamBuilder: StreamBuilderService,
  ) { }

  getSources(): InputStream[] {
    return [
      this._streamBuilder.inputStream([2, 5, 8], 10),
      this._streamBuilder.inputStream([2, 5, 8], 10),
    ];
  };

  getCode(): string {
    return 'function visualize({ combineLatest }, one$, two$) {\n  return combineLatest([one$, two$]);\n}';
  };
}
