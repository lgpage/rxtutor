import { Provider } from '@angular/core';
import { EXAMPLE, START_EXAMPLE } from './core';
import { CombineLatestExample } from './examples/combine-latest';
import { ConcatExample } from './examples/concat';
import { DebounceTimeExample } from './examples/debounce-time';
import { MergeExample } from './examples/merge';
import { MergeMapExample } from './examples/merge-map';
import { SandboxExample } from './examples/sandbox';
import { ThrottleTimeExample } from './examples/throttle-time';

export {
  CombineLatestExample,
  ConcatExample,
  DebounceTimeExample,
  MergeExample,
  MergeMapExample,
  SandboxExample,
  ThrottleTimeExample,
};

export const exampleProviders: Provider[] = [
  { provide: START_EXAMPLE, useClass: SandboxExample },

  { provide: EXAMPLE, useClass: CombineLatestExample, multi: true },
  { provide: EXAMPLE, useClass: ConcatExample, multi: true },
  { provide: EXAMPLE, useClass: DebounceTimeExample, multi: true },
  { provide: EXAMPLE, useClass: MergeExample, multi: true },
  { provide: EXAMPLE, useClass: MergeMapExample, multi: true },
  { provide: EXAMPLE, useClass: ThrottleTimeExample, multi: true },
];
