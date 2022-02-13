import { BehaviorSubject } from 'rxjs';
import { Inject, Injectable } from '@angular/core';
import { Example, START_EXAMPLE } from './examples/interface';

@Injectable({ providedIn: 'root' })
export class SandboxService {
  protected _exampleToRenderSubject$ = new BehaviorSubject<Example>(this._startExample);

  exampleToRender$ = this._exampleToRenderSubject$.asObservable();

  constructor(
    @Inject(START_EXAMPLE) protected _startExample: Example,
  ) { }

  renderExample(example: Example): void {
    this._exampleToRenderSubject$.next(example);
  }
}
