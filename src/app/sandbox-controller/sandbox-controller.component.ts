import * as rx from 'rxjs';
import * as rxOp from 'rxjs/operators';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { getFormValue } from '../helpers';
import { SandboxService } from '../sandbox.service';
import { Stream } from '../stream';

@Component({
  selector: 'app-sandbox-controller',
  templateUrl: './sandbox-controller.component.html',
})
export class SandboxControllerComponent implements OnInit, OnDestroy {
  protected _onDestroySubject$ = new rx.Subject<boolean>();
  protected _sourcesSubject$ = new rx.BehaviorSubject<Stream[]>(null);

  codeMirrorOptions = {
    lineNumbers: true,
    theme: 'material',
    mode: 'text/typescript'
  };

  formGroup = this._formBuilder.group({ code: [null] });

  sources$ = this._sourcesSubject$.asObservable().pipe(rxOp.filter((x) => !!x))
  code$ = this.getFormValue('code');

  constructor(
    protected _sandboxSvc: SandboxService,
    protected _formBuilder: FormBuilder,
  ) { }

  protected getFormValue<T = string>(key: string): rx.Observable<T> {
    return getFormValue<T>(key, this.formGroup);
  }

  protected handleSandboxServiceChanges(): void {
    this._sandboxSvc.exampleToRender$.pipe(
      rxOp.tap((example) => {
        this._sourcesSubject$.next(example.getSources());
        this.formGroup.get('code').setValue(example.getCode());
      }),
      rxOp.takeUntil(this._onDestroySubject$),
    ).subscribe()
  }

  protected createFunction(jsCode: string, sources: rx.Observable<string>[]): Function {
    const words = ['one$', 'two$', 'three$', 'four$', 'five$', 'six$', 'seven$', 'eight$', 'nine$', 'ten$'];
    const args = ['rx', 'rxOp', ...sources.map((_, i) => i > 9 ? `source${i}$` : words[i])];
    const callMethod = `return visualize(${args.join(', ')});`;
    try {
      return new Function(...args, `${jsCode}\n\n${callMethod}`);
    } catch (error: unknown) {
      return null;
    }
  }

  protected callFunction(fn: Function, sources: rx.Observable<string>[]): rx.Observable<string> {
    if (!fn) {
      return rx.of(null);
    }

    try {
      return (fn(rx, rxOp, ...sources) as rx.Observable<string>).pipe(  // TODO: Check Function response type
        rxOp.catchError((err: unknown) => rx.of(null)),
      );
    } catch (error: unknown) {
      return rx.of(null);
    }
  }

  ngOnInit(): void {
    this.handleSandboxServiceChanges();

    // this.formGroup.get('code')?.valueChanges.pipe(  // TODO: Replace with Visualize button
    //   rxOp.debounceTime(600),
    //   rxOp.map((jsCode) => this.createFunction(jsCode)),
    //   rxOp.switchMap((fn) => this.callFunction(fn)),
    //   rxOp.tap((result) => console.log({ result })),  // TODO: Add LoggerService
    // ).subscribe();

    // TODO: Show errors
    // TODO: Visualize response
    // TODO: Allow adding sources
  }

  ngOnDestroy(): void {
    this._onDestroySubject$.next(true);
  }
}
