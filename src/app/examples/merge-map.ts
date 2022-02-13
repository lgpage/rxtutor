import { Injectable } from '@angular/core';
import { Stream } from '../stream';
import { Example, ExampleSection } from './interface';

@Injectable()
export class MergeMapExample implements Example {
  name = 'mergeMap';
  section: ExampleSection = 'transformation';

  getSources(): Stream[] {
    return [
    ];
  };

  getCode(): string {
    return null;
  };
}
