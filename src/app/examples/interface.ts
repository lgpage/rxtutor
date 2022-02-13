import { InjectionToken } from '@angular/core';
import { Stream } from '../stream';

export const EXAMPLE = new InjectionToken('Example');

export type ExampleSection = 'creation'
  | 'conditional'
  | 'combination'
  | 'filtering'
  | 'mathematical'
  | 'transformation'
  | 'utility';

export interface Example {
  name: string;
  section: ExampleSection;

  getSources: () => Stream[];
  getCode: () => string;
}
