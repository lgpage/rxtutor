import { Injectable } from '@angular/core';
import { InputStream } from '../core';
import { StreamBuilderService } from '../services';
import { Example, ExampleSection } from '../types';

@Injectable()
export class MergeMapExample implements Example {
  name = 'mergeMap';
  section: ExampleSection = 'transformation';

  constructor(
    protected _streamBuilder: StreamBuilderService,
  ) { }

  getInputStreams(): InputStream[] {
    return [
      this._streamBuilder.inputStream([2, 5, 8], 10),
      this._streamBuilder.inputStream([2, 5, 8], 10),
    ];
  };

  getCode(): string {
    return `function visualize({ mergeMap, map }, one$, two$) {
  return one$.pipe(
    mergeMap((a) => two$.pipe(
      map((b) => \`\${a}\${b}\`)
    )),
  );
}`;
  };
}
