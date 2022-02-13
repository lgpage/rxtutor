import { Provider } from '@angular/core';
import { CombineLatestExample } from './examples/combine-latests';
import { EXAMPLE } from './examples/interface';
import { MergeMapExample } from './examples/merge-map';

export {
  CombineLatestExample,
  MergeMapExample,
};

export const exampleProviders: Provider[] = [
  { provide: EXAMPLE, useClass: CombineLatestExample, multi: true },
  { provide: EXAMPLE, useClass: MergeMapExample, multi: true },
];
