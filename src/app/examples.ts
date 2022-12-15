import { Provider } from '@angular/core';
import { EXAMPLE, START_EXAMPLE } from './core';
import { CombineLatestExample } from './examples/combine-latest';
import { ConcatExample } from './examples/concat';
import { DebounceTimeExample } from './examples/debounce-time';
import { MergeMapExample } from './examples/merge-map';
import { SandboxExample } from './examples/sandbox';
import { ThrottleTimeExample } from './examples/throttle-time';
import { WithLatestFromExample } from './examples/with-latest-from';

export {
  CombineLatestExample,
  ConcatExample,
  DebounceTimeExample,
  MergeMapExample,
  SandboxExample,
  ThrottleTimeExample,
  WithLatestFromExample,
};

export const exampleProviders: Provider[] = [
  { provide: START_EXAMPLE, useClass: SandboxExample },

  { provide: EXAMPLE, useClass: CombineLatestExample, multi: true },
  { provide: EXAMPLE, useClass: ConcatExample, multi: true },
  { provide: EXAMPLE, useClass: DebounceTimeExample, multi: true },
  { provide: EXAMPLE, useClass: MergeMapExample, multi: true },
  { provide: EXAMPLE, useClass: ThrottleTimeExample, multi: true },
  { provide: EXAMPLE, useClass: WithLatestFromExample, multi: true },
];
