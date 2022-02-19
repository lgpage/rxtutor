import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { distinctUntilChanged, filter, first, map, takeUntil, tap } from 'rxjs/operators';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { getFormValue } from '../helpers';
import { SandboxService } from '../sandbox.service';
import { InputStream, Stream } from '../stream';
import { StreamBuilder } from '../stream.builder';

@Component({
  selector: 'app-sandbox-controller',
  templateUrl: './sandbox-controller.component.html',
  styleUrls: ['./sandbox-controller.component.scss']
})
export class SandboxControllerComponent implements OnInit, OnDestroy {
  protected _onDestroySubject$ = new Subject<boolean>();
  protected _sourcesSubject$ = new BehaviorSubject<InputStream[]>(null);
  protected _outputSubject$ = new BehaviorSubject<Stream>(null);

  codeMirrorOptions = {
    lineNumbers: true,
    theme: 'material',
    mode: 'text/typescript'
  };

  formGroup = this._formBuilder.group({ code: [null] });

  sources$ = this._sourcesSubject$.asObservable().pipe(filter((x) => !!x))
  output$ = this._outputSubject$.asObservable().pipe(distinctUntilChanged())
  code$ = this.getFormValue('code');

  constructor(
    protected _sandboxSvc: SandboxService,
    protected _streamBuilder: StreamBuilder,
    protected _formBuilder: FormBuilder,
  ) { }

  protected getFormValue<T = string>(key: string): Observable<T> {
    return getFormValue<T>(key, this.formGroup);
  }

  protected handleSandboxServiceChanges(): void {
    this._sandboxSvc.exampleToRender$.pipe(
      tap((example) => {
        this._sourcesSubject$.next(example.getSources());
        this.formGroup.get('code').setValue(example.getCode());
      }),
      takeUntil(this._onDestroySubject$),
    ).subscribe()
  }

  protected handleCodeChange(): void {
    this.code$.pipe(
      tap(() => this._outputSubject$.next(null)),
      takeUntil(this._onDestroySubject$),
    ).subscribe;
  }

  ngOnInit(): void {
    this.handleSandboxServiceChanges();
    this.handleCodeChange();
  }

  addInputStream(): void {
    this._sourcesSubject$.pipe(
      first(),
      map((sources) => [...sources, this._streamBuilder.create([2, 5, 8], 10)]),
      tap((sources) => this._sourcesSubject$.next(sources)),
    ).subscribe()
  }

  removeInputStream(index: number): void {
    this._sourcesSubject$.pipe(
      first(),
      map((sources) => sources.filter((_, i) => i !== index)),
      tap((sources) => this._sourcesSubject$.next(sources)),
    ).subscribe()
  }

  visualizeOutput(): void {
  }

  ngOnDestroy(): void {
    this._onDestroySubject$.next(true);
  }
}
