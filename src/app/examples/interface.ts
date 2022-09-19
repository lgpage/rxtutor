import { InjectionToken } from '@angular/core';
import { InputStream } from '../internal/stream';

export type ExampleSection = 'creation'
  | 'conditional'
  | 'combination'
  | 'filtering'
  | 'mathematical'
  | 'transformation'
  | 'utility'
  | 'other';

export interface Example {
  name: string;
  section: ExampleSection;

  getSources: () => InputStream[];
  getCode: () => string;
}

export const START_EXAMPLE = new InjectionToken<Example>('Starting Example');
export const EXAMPLE = new InjectionToken<Example>('Example');
