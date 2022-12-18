import { InjectionToken } from '@angular/core';
import { InputStreamLike } from './stream';

export type ExampleSection = 'combination'
  | 'conditional'
  | 'creation'
  | 'error'
  | 'filtering'
  | 'multicast'
  | 'other'
  | 'transformation'
  | 'utility';

export interface ExampleInputs {
  small: InputStreamLike[];
  large: InputStreamLike[];
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
