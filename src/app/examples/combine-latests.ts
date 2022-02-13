import { Injectable } from '@angular/core';
import { Stream } from '../stream';
import { Example, ExampleSection } from './interface';

@Injectable()
export class CombineLatestExample implements Example {
  name = 'combineLatest';
  section: ExampleSection = 'combination';

  getSources(): Stream[] {
    return [
    ];
  };

  getCode(): string {
    return null;
  };
}
