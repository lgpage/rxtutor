import * as rx from 'rxjs';
import * as rxOp from 'rxjs/operators';
import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { SandboxService } from '../sandbox.service';

@Component({
  selector: 'app-sandbox-controller',
  templateUrl: './sandbox-controller.component.html',
})
export class SandboxControllerComponent implements OnInit {
  protected _initialCode = 'function visualize(rx, rxOp, one$) {\n  return rx.of(10);\n}';

  codeMirrorOptions = {
    lineNumbers: true,
    theme: 'material',
    mode: 'text/typescript'
  };

  sources: rx.Observable<string>[] = [rx.interval().pipe(rxOp.take(5), rxOp.map((x) => `${x}`))];

  formGroup = this._formBuilder.group({
    code: [this._initialCode]
  });

  constructor(
    protected _sandboxSvc: SandboxService,
    protected _formBuilder: FormBuilder,
  ) { }

  protected createFunction(jsCode: string): Function {
    const words = ['one$', 'two$', 'three$', 'four$', 'five$', 'six$', 'seven$', 'eight$', 'nine$', 'ten$'];
    const args = ['rx', 'rxOp', ...this.sources.map((_, i) => i > 9 ? `source${i}$` : words[i])];
    const callMethod = `return visualize(${args.join(', ')});`;
    try {
      return new Function(...args, `${jsCode}\n\n${callMethod}`);
    } catch (error: unknown) {
      return null;
    }
  }

  protected callFunction(fn: Function): rx.Observable<string> {
    if (!fn) {
      return rx.of(null);
    }

    try {
      return (fn(rx, rxOp, ...this.sources) as rx.Observable<string>).pipe(  // TODO: Check Function response type
        rxOp.catchError((err: unknown) => rx.of(null)),
      );
    } catch (error: unknown) {
      return rx.of(null);
    }
  }

  ngOnInit(): void {
    this.formGroup.get('code')?.valueChanges.pipe(  // TODO: Replace with Visualize button
      rxOp.debounceTime(600),
      rxOp.startWith(this._initialCode),
      rxOp.map((jsCode) => this.createFunction(jsCode)),
      rxOp.switchMap((fn) => this.callFunction(fn)),
      rxOp.tap((result) => console.log({ result })),  // TODO: Add LoggerService
    ).subscribe();

    // TODO: Show errors
    // TODO: Visualize source and response
    // TODO: Allow adding sources
  }
}
