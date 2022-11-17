import { BehaviorSubject, combineLatest, merge, of } from 'rxjs';
import { distinctUntilChanged, first, map, tap, withLatestFrom } from 'rxjs/operators';
import { Component, Inject, InjectionToken, OnInit, Optional } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { getFormValue, InputStream, Stream } from '../../core';
import { ExecutorService, LoggerService, RuntimeService, StreamBuilderService } from '../../services';
import { EXAMPLE, Example, START_EXAMPLE } from '../../types';

export const MAX_SOURCES = new InjectionToken<number>('Max number of sources.');

@Component({
  selector: 'app-sandbox-controller',
  templateUrl: './sandbox-controller.component.html',
  styleUrls: ['./sandbox-controller.component.scss']
})
@UntilDestroy()
export class SandboxControllerComponent implements OnInit {
  protected _name = 'SandboxControllerComponent';
  protected _maxSources = 3;

  protected _sourcesSubject$ = new BehaviorSubject<InputStream[]>([]);
  protected _outputSubject$ = new BehaviorSubject<Stream | null>(null);
  protected _linksSubject$ = new BehaviorSubject<{ label: string; url: string }[] | undefined>([]);

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
  links$ = this._linksSubject$.asObservable();

  numberOfSources$ = this.sources$.pipe(
    map((sources) => sources.length ?? 0),
    distinctUntilChanged(),
  );

  hasOptions$ = of(true);

  canRemoveSource$ = this.numberOfSources$.pipe(
    map((x) => x > 1),
    distinctUntilChanged(),
  );

  canAddSource$ = combineLatest([this.numberOfSources$, this._runtimeSvc.mediaSize$]).pipe(
    map(([x, size]) => size === 'large' && x < this._maxSources),
    distinctUntilChanged(),
  );

  constructor(
    @Inject(EXAMPLE) protected _examples: Example[],
    @Inject(START_EXAMPLE) protected _startExample: Example,
    @Inject(MAX_SOURCES) @Optional() maxSources: number | undefined,
    protected _route: ActivatedRoute,
    protected _formBuilder: FormBuilder,
    protected _executorSvc: ExecutorService,
    protected _streamBuilder: StreamBuilderService,
    protected _runtimeSvc: RuntimeService,
    protected _logger: LoggerService,
  ) {
    this._maxSources = maxSources ?? this._maxSources;
  }

  protected renderExample(): void {
    const examples = this._examples.reduce((p, c) => ({ ...p, [c.name]: c }), { [this._startExample.name]: this._startExample });

    const exampleToRender$ = this._route.paramMap.pipe(
      map((params) => params.get('exampleName') ?? this._startExample.name),
      map((name) => examples[name]),
    );

    exampleToRender$.pipe(
      withLatestFrom(this._runtimeSvc.exampleSize$),
      tap(([example, size]) => {
        const inputs = example.getInputStreams();

        this._linksSubject$.next(example.links);
        this._sourcesSubject$.next(size === 'small' ? inputs.small : inputs.large);
        this.formGroup.get('code')?.setValue(example.getCode());
      }),
      untilDestroyed(this),
    ).subscribe()
  }

  protected handleInputChanges(): void {
    merge(this.code$, this.sources$).pipe(
      tap(() => this._outputSubject$.next(null)),
      untilDestroyed(this),
    ).subscribe();
  }

  ngOnInit(): void {
    this.renderExample();
    this.handleInputChanges();
  }

  addInputStream(): void {
    this._sourcesSubject$.pipe(
      first(),
      map((sources) => [...sources, this._streamBuilder.defaultInputStream()]),
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
}
