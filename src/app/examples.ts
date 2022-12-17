import { Provider } from '@angular/core';
import { EXAMPLE, START_EXAMPLE } from './core';
import { CatchErrorExample } from './examples/catch-error';
import { CombineLatestExample } from './examples/combine-latest';
import { ConcatExample } from './examples/concat';
import { ConcatMapExample } from './examples/concat-map';
import { DebounceTimeExample } from './examples/debounce-time';
import { DelayExample } from './examples/delay';
import { DistinctUntilChangedExample } from './examples/distinct-until-changed';
import { FilterExample } from './examples/filter';
import { FinalizeExample } from './examples/finalize';
import { FromExample } from './examples/from';
import { MapExample } from './examples/map';
import { MergeExample } from './examples/merge';
import { MergeMapExample } from './examples/merge-map';
import { OfExample } from './examples/of';
import { SandboxExample } from './examples/sandbox';
import { ScanExample } from './examples/scan';
import { StartWithExample } from './examples/start-with';
import { SwitchMapExample } from './examples/switch-map';
import { TakeExample } from './examples/take';
import { TakeUntilExample } from './examples/take-until';
import { TapExample } from './examples/tap';
import { ThrottleTimeExample } from './examples/throttle-time';
import { WithLatestFromExample } from './examples/with-latest-from';

export {
  SandboxExample,

  CatchErrorExample,
  CombineLatestExample,
  ConcatExample,
  ConcatMapExample,
  DebounceTimeExample,
  DelayExample,
  DistinctUntilChangedExample,
  FilterExample,
  FinalizeExample,
  FromExample,
  MapExample,
  MergeExample,
  MergeMapExample,
  OfExample,
  ScanExample,
  StartWithExample,
  SwitchMapExample,
  TakeExample,
  TakeUntilExample,
  TapExample,
  ThrottleTimeExample,
  WithLatestFromExample,
};

export const exampleProviders: Provider[] = [
  { provide: START_EXAMPLE, useClass: SandboxExample },

  { provide: EXAMPLE, useClass: CatchErrorExample, multi: true },
  { provide: EXAMPLE, useClass: CombineLatestExample, multi: true },
  { provide: EXAMPLE, useClass: ConcatExample, multi: true },
  { provide: EXAMPLE, useClass: ConcatMapExample, multi: true },
  { provide: EXAMPLE, useClass: DebounceTimeExample, multi: true },
  { provide: EXAMPLE, useClass: DelayExample, multi: true },
  { provide: EXAMPLE, useClass: DistinctUntilChangedExample, multi: true },
  { provide: EXAMPLE, useClass: FilterExample, multi: true },
  { provide: EXAMPLE, useClass: FinalizeExample, multi: true },
  { provide: EXAMPLE, useClass: FromExample, multi: true },
  { provide: EXAMPLE, useClass: MapExample, multi: true },
  { provide: EXAMPLE, useClass: MergeExample, multi: true },
  { provide: EXAMPLE, useClass: MergeMapExample, multi: true },
  { provide: EXAMPLE, useClass: OfExample, multi: true },
  { provide: EXAMPLE, useClass: ScanExample, multi: true },
  { provide: EXAMPLE, useClass: StartWithExample, multi: true },
  { provide: EXAMPLE, useClass: SwitchMapExample, multi: true },
  { provide: EXAMPLE, useClass: TakeExample, multi: true },
  { provide: EXAMPLE, useClass: TakeUntilExample, multi: true },
  { provide: EXAMPLE, useClass: TapExample, multi: true },
  { provide: EXAMPLE, useClass: ThrottleTimeExample, multi: true },
  { provide: EXAMPLE, useClass: WithLatestFromExample, multi: true },
];
