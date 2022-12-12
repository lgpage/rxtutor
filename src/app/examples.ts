import { Provider } from '@angular/core';
import { EXAMPLE, START_EXAMPLE } from './core';
import { CombineLatestExample } from './examples/combine-latest';
import { DebounceTimeExample } from './examples/debounce-time';
import { MergeMapExample } from './examples/merge-map';
import { SandboxExample } from './examples/sandbox';

export {
  CombineLatestExample,
  DebounceTimeExample,
  MergeMapExample,
  SandboxExample,
};

export const exampleProviders: Provider[] = [
  { provide: START_EXAMPLE, useClass: SandboxExample },

  { provide: EXAMPLE, useClass: CombineLatestExample, multi: true },
  { provide: EXAMPLE, useClass: DebounceTimeExample, multi: true },
  { provide: EXAMPLE, useClass: MergeMapExample, multi: true },
];
