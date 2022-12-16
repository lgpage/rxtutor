import { Provider } from '@angular/core';
import { EXAMPLE, START_EXAMPLE } from './core';
import { CatchErrorExample } from './examples/catch-error';
import { CombineLatestExample } from './examples/combine-latest';
import { ConcatExample } from './examples/concat';
import { DebounceTimeExample } from './examples/debounce-time';
import { FilterExample } from './examples/filter';
import { FromExample } from './examples/from';
import { MergeExample } from './examples/merge';
import { MergeMapExample } from './examples/merge-map';
import { OfExample } from './examples/of';
import { SandboxExample } from './examples/sandbox';
import { StartWithExample } from './examples/start-with';
import { ThrottleTimeExample } from './examples/throttle-time';
import { WithLatestFromExample } from './examples/with-latest-from';

export {
  SandboxExample,

  CatchErrorExample,
  CombineLatestExample,
  ConcatExample,
  DebounceTimeExample,
  FilterExample,
  FromExample,
  MergeExample,
  MergeMapExample,
  OfExample,
  StartWithExample,
  ThrottleTimeExample,
  WithLatestFromExample,
};

export const exampleProviders: Provider[] = [
  { provide: START_EXAMPLE, useClass: SandboxExample },

  { provide: EXAMPLE, useClass: CatchErrorExample, multi: true },
  { provide: EXAMPLE, useClass: CombineLatestExample, multi: true },
  { provide: EXAMPLE, useClass: ConcatExample, multi: true },
  { provide: EXAMPLE, useClass: DebounceTimeExample, multi: true },
  { provide: EXAMPLE, useClass: FilterExample, multi: true },
  { provide: EXAMPLE, useClass: FromExample, multi: true },
  { provide: EXAMPLE, useClass: MergeExample, multi: true },
  { provide: EXAMPLE, useClass: MergeMapExample, multi: true },
  { provide: EXAMPLE, useClass: OfExample, multi: true },
  { provide: EXAMPLE, useClass: StartWithExample, multi: true },
  { provide: EXAMPLE, useClass: ThrottleTimeExample, multi: true },
  { provide: EXAMPLE, useClass: WithLatestFromExample, multi: true },
];
