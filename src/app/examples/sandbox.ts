import { Injectable } from '@angular/core';
import { InputStream } from '../core/stream';
import { StreamBuilderService } from '../services/stream.builder';
import { Example, ExampleSection } from '../types';

@Injectable()
export class SandboxExample implements Example {
  name = 'sandbox';
  section: ExampleSection = 'other';

  constructor(
    protected _streamBuilder: StreamBuilderService,
  ) { }

  getInputStreams(): InputStream[] {
    return [this._streamBuilder.inputStream([2, 5, 8], 10)];
  };

  getCode(): string {
    return `function visualize({ of, map }, one$) {
  return of(10).pipe(
    map((x) => x * 2),
  );
}`;
  };
}
