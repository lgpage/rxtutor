import { InjectionToken } from '@angular/core';
import { InputStream } from '../core';

export type ExampleSection = 'creation'
  | 'conditional'
  | 'combination'
  | 'filtering'
  | 'mathematical'
  | 'transformation'
  | 'utility'
  | 'other';

export interface ExampleInputs {
  small: InputStream[];
  large: InputStream[];
}

export interface Example {
  name: string;
  section: ExampleSection;
  links?: { label: string; url: string }[];

  getInputStreams: () => ExampleInputs;
  getCode: () => string;
}

export const START_EXAMPLE = new InjectionToken<Example>('Starting Example');
export const EXAMPLE = new InjectionToken<Example>('Example');
