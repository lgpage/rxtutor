import { BehaviorSubject, combineLatest, merge, of } from 'rxjs';
import { distinctUntilChanged, first, map, tap } from 'rxjs/operators';
import { Component, Inject, InjectionToken, OnDestroy, OnInit, Optional } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { getFormValue, InputStream, Stream } from '../../core';
import { ExecutorService, InsightsService, LoggerService, SandboxService, StreamBuilderService } from '../../services';
import { Example } from '../../types';

export const MAX_SOURCES = new InjectionToken<number>('Max number of sources.');

@Component({
  selector: 'app-sandbox-controller',
  templateUrl: './sandbox-controller.component.html',
  styleUrls: ['./sandbox-controller.component.scss']
})
@UntilDestroy()
export class SandboxControllerComponent implements OnInit, OnDestroy {
  protected _name = 'SandboxControllerComponent';
  protected _maxSources = 3;
  protected _currentExample: Example | undefined;
  protected _sourcesSubject$ = new BehaviorSubject<InputStream[]>([]);
  protected _outputSubject$ = new BehaviorSubject<Stream | null>(null);

  codeMirrorOptions = {
    lineNumbers: true,
    theme: 'material',
    mode: 'text/typescript'
  };

  formGroup = this._formBuilder.group<{ code: FormControl<string | null> }>({
    code: this._formBuilder.control(null),
  });

  sources$ = this._sourcesSubject$.asObservable().pipe(distinctUntilChanged())
  output$ = this._outputSubject$.asObservable().pipe(distinctUntilChanged());
  code$ = getFormValue('code', this.formGroup);

  numberOfSources$ = this.sources$.pipe(
    map((sources) => sources.length ?? 0),
    distinctUntilChanged(),
  );

  hasOptions$ = of(true);

  canRemoveSource$ = this.numberOfSources$.pipe(
    map((x) => x > 1),
    distinctUntilChanged(),
  );

  canAddSource$ = this.numberOfSources$.pipe(
    map((x) => x < this._maxSources),
    distinctUntilChanged(),
  );

  constructor(
    @Inject(MAX_SOURCES) @Optional() maxSources: number | undefined,
    protected _sandboxSvc: SandboxService,
    protected _executorSvc: ExecutorService,
    protected _streamBuilder: StreamBuilderService,
    protected _formBuilder: FormBuilder,
    protected _insightsSvc: InsightsService,
    protected _logger: LoggerService,
  ) {
    this._maxSources = maxSources ?? this._maxSources;
  }

  protected handleSandboxServiceChanges(): void {
    this._sandboxSvc.exampleToRender$.pipe(
      tap((example) => {
        if (this._currentExample) {
          this._insightsSvc.stopTrackPage(`${this._currentExample.name} Example`);
        }

        this._currentExample = example;
        this._insightsSvc.startTrackPage(`${this._currentExample.name} Example`);

        this._sourcesSubject$.next(example.getInputStreams());
        this.formGroup.get('code')?.setValue(example.getCode());
      }),
      untilDestroyed(this),
    ).subscribe()
  }

  protected handleInputChanges(): void {
    merge(this.code$, this.sources$).pipe(
      tap(() => this._outputSubject$.next(null)),
    ).subscribe();
  }

  ngOnInit(): void {
    this.handleInputChanges();
    this.handleSandboxServiceChanges();
  }

  addInputStream(): void {
    this._sourcesSubject$.pipe(
      first(),
      map((sources) => [...sources, this._streamBuilder.inputStream([2, 5, 8], 10)]),
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
    combineLatest([this.code$, this.sources$]).pipe(
      first(),
      map(([code, sources]) => ({ code, sources: sources.map((s) => s.source$) })),
      map(({ code, sources }) => this._executorSvc.getFunctionResult(code, sources)),
      map((output$) => this._streamBuilder.outputStream(output$)),
      tap((stream) => this._outputSubject$.next(stream)),
    ).subscribe();
  }

  ngOnDestroy(): void {
    if (this._currentExample) {
      this._insightsSvc.stopTrackPage(`${this._currentExample.name} Example`);
    }
  }
}
