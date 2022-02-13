import { Injectable } from '@angular/core';
import { Example } from './examples/interface';

@Injectable({ providedIn: 'root' })
export class SandboxService {

  renderExample(example: Example): void {
    throw new Error('Method not implemented.');
  }
}
