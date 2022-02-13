import { combineLatest, merge, Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, first, map, skip, takeUntil, tap, withLatestFrom } from 'rxjs/operators';
import { Clipboard } from '@angular/cdk/clipboard';
import { Component, Input, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { getFormValue, range } from '../helpers';
import { StreamBuilder } from '../stream.builder';

type CompleteType = 'none' | 'complete' | 'error';

interface StreamUpdate {
  indexes: number[];
  start: string;
  complete: CompleteType;
  terminateIndex: number;
}

@Component({
  selector: 'app-stream-controller',
  templateUrl: './stream-controller.component.html',
  styleUrls: ['./stream-controller.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class StreamControllerComponent implements OnInit, OnDestroy {
  protected _onDestroySubject$ = new Subject<boolean>();

  @Input() stream = this._streamBuilder.create([2, 5, 8], 10);

  formGroup = this._formBuilder.group({
    size: [3, Validators.required],
    start: ['1', Validators.required],
    type: ['numeric', Validators.required],
    complete: ['complete', Validators.required],
  });

  size$ = this.getFormValue<number>('size');
  start$ = this.getFormValue('start');
  type$ = this.getFormValue('type');
  complete$ = this.getFormValue<CompleteType>('complete');

  startOptions$ = this.type$.pipe(
    withLatestFrom(this.size$),
    map(([type, size]) => {
      if (type === 'numeric') {
        return range(10 - size + 1).map((x) => `${x}`);
      }

      return range(10).map((x) => String.fromCharCode(65 + x));
    }),
  );

  constructor(
    protected _clipboard: Clipboard,
    protected _snackBar: MatSnackBar,
    protected _formBuilder: FormBuilder,
    protected _streamBuilder: StreamBuilder,
  ) { }

  protected getFormValue<T = string>(key: string): Observable<T> {
    return getFormValue<T>(key, this.formGroup);
  }

  protected handleFormControlChanges(): void {
    const sizeChange$ = this.size$.pipe(
      skip(1),
      withLatestFrom(this.start$, this.complete$),
      map(([size, start, complete]): StreamUpdate => ({
        indexes: this._streamBuilder.getDistributedIndexes(size),
        start,
        complete,
        terminateIndex: 9,
      })),
    );

    const startOrCompleteChange$ = combineLatest([this.start$, this.complete$]).pipe(
      skip(1),
      withLatestFrom(this.stream.next$, this.stream.terminate$),
      map(([[start, complete], next, terminate]): StreamUpdate => ({
        indexes: next.map((n) => n.index),
        start,
        complete,
        terminateIndex: terminate?.index ?? 9,
      })),
    );

    const adjustStartControlValue$ = this.type$.pipe(
      skip(1),
      distinctUntilChanged(),
      map((type) => type === 'numeric' ? '1' : 'A'),
      tap((start) => this.formGroup.get('start').setValue(start)),
      takeUntil(this._onDestroySubject$),
    );

    const adjustStream$ = merge(sizeChange$, startOrCompleteChange$).pipe(
      tap(({ indexes, start, complete, terminateIndex }) => {
        const completeIndex = complete === 'complete' ? terminateIndex : null;
        const errorIndex = complete === 'error' ? terminateIndex : null;
        this._streamBuilder.adjustStream(this.stream, indexes, completeIndex, errorIndex, start);
      }),
      takeUntil(this._onDestroySubject$),
    );

    adjustStartControlValue$.subscribe();
    adjustStream$.subscribe();
  }

  protected handleStreamChanges(): void {
    const setControlSize$ = this.stream.next$.pipe(
      debounceTime(300),
      map((nodes) => nodes.length),
      distinctUntilChanged(),
      tap((size) => this.formGroup.get('size').setValue(size, { emitEvent: false })),
      takeUntil(this._onDestroySubject$),
    );

    setControlSize$.subscribe();
  }

  ngOnInit(): void {
    this.handleFormControlChanges();
    this.handleStreamChanges();
  }

  range(size: number): number[] {
    return range(size);
  }

  openSnackBar(message: string, action?: string) {
    this._snackBar.open(message, action, { duration: 3000 });
  }

  copyMarblesToClipboard(): void {
    this.stream.marbles$.pipe(
      first(),
      tap((marbles) => this._clipboard.copy(marbles)),
      tap(() => this.openSnackBar('Marbles copied to the clipboard', 'Ok')),
    ).subscribe();
  }

  ngOnDestroy(): void {
    this._onDestroySubject$.next(true);
  }
}
