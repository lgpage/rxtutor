import { Provider } from '@angular/core';
import { CombineLatestExample } from './examples/combine-latest';
import { MergeMapExample } from './examples/merge-map';
import { SandboxExample } from './examples/sandbox';
import { EXAMPLE, START_EXAMPLE } from './types';

export {
  SandboxExample,
  CombineLatestExample,
  MergeMapExample,
};

export const exampleProviders: Provider[] = [
  { provide: START_EXAMPLE, useClass: SandboxExample },
  { provide: EXAMPLE, useClass: CombineLatestExample, multi: true },
  { provide: EXAMPLE, useClass: MergeMapExample, multi: true },
];
