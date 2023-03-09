import { BehaviorSubject, combineLatest, merge, mergeMap, of } from 'rxjs';
import { distinctUntilChanged, first, map, tap, withLatestFrom } from 'rxjs/operators';
import { Component, Inject, InjectionToken, OnInit, Optional } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Example, EXAMPLE, getFormValue, InputStreamLike, START_EXAMPLE, Stream } from '../../core';
import { LoggerService } from '../../logger.service';
import { ExecutorService, HashedExampleService, RuntimeService, StreamBuilderService } from '../../services';
import { RouteNames, RouteParamKeys } from "app-constants";

export const MAX_SOURCES = new InjectionToken<number>('Max number of sources.');

@Component({
  selector: 'app-sandbox-controller',
  templateUrl: './sandbox-controller.component.html',
  styleUrls: ['./sandbox-controller.component.scss'],
})
@UntilDestroy()
export class SandboxControllerComponent implements OnInit {
  protected _name = 'SandboxControllerComponent';
  protected _maxSources = 3;

  protected _sourcesSubject$ = new BehaviorSubject<InputStreamLike[]>([]);
  protected _outputSubject$ = new BehaviorSubject<Stream | null>(null);
  protected _linksSubject$ = new BehaviorSubject<{ label: string; url: string }[] | undefined>([]);

  codeMirrorOptions = {
    lineNumbers: true,
    theme: 'material',
    mode: 'text/typescript',
  };

  formGroup = this._formBuilder.group<{ code: FormControl<string | null> }>({
    code: this._formBuilder.control(null),
  });

  code$ = getFormValue('code', this.formGroup);

  sources$ = this._sourcesSubject$.asObservable().pipe(distinctUntilChanged());
  output$ = this._outputSubject$.asObservable().pipe(distinctUntilChanged());
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
    protected _router: Router,
    protected _formBuilder: FormBuilder,
    protected _executorSvc: ExecutorService,
    protected _streamBuilder: StreamBuilderService,
    protected _runtimeSvc: RuntimeService,
    protected _hashedExampleSvc: HashedExampleService,
    protected _logger: LoggerService,
  ) {
    this._maxSources = maxSources ?? this._maxSources;
  }

  protected renderExample(): void {
    const examples = this._examples.reduce(
      (p, c) => ({ ...p, [c.name]: c }), { [this._startExample.name]: this._startExample },
    );

    const exampleToRender$ = this._route.paramMap.pipe(
      map((params) => params.get(RouteParamKeys.ExampleName) ?? this._startExample.name),
      mergeMap((name) => name !== RouteNames.SharedExample ? of(examples[name]) : this._hashedExampleSvc.getExample(this._route)),
      map((example) => example ?? this._startExample),
    );

    exampleToRender$.pipe(
      withLatestFrom(this._runtimeSvc.exampleSize$),
      tap(([example, size]) => {
        const inputs = example.getInputStreams();
        const code = example.getCode();

        this._logger.logDebug(`${this._name} >> exampleToRender$`, { code, inputs });

        this._linksSubject$.next(example.links);
        this._sourcesSubject$.next(size === 'small' ? inputs.small : inputs.large);

        this.formGroup.get('code')?.setValue(code);
        this.formGroup.updateValueAndValidity();
      }),
      untilDestroyed(this),
    ).subscribe();
  }

  protected handleInputChanges(): void {
    merge(this.code$, this.sources$).pipe(
      tap(() => this._outputSubject$.next(null)),
      untilDestroyed(this),
    ).subscribe();
  }

  ngOnInit(): void {
    this.handleInputChanges();
    this.renderExample();
  }

  addInputStream(): void {
    this._sourcesSubject$.pipe(
      first(),
      map((sources) => [...sources, this._streamBuilder.defaultInputStream()]),
      tap((sources) => this._sourcesSubject$.next(sources)),
    ).subscribe();
  }

  removeInputStream(index: number): void {
    this._sourcesSubject$.pipe(
      first(),
      map((sources) => sources.filter((_, i) => i !== index)),
      tap((sources) => this._sourcesSubject$.next(sources)),
    ).subscribe();
  }

  visualizeOutput(): void {
    const stream = this._executorSvc.getVisualizedOutput(this.code$, this.sources$);
    this._outputSubject$.next(stream);
  }
}
