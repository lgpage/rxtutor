import { combineLatest, merge, Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, skip, tap, withLatestFrom } from 'rxjs/operators';
import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { getFormValue, range } from '../../core/helpers';
import { StreamBuilderService } from '../../services/stream.builder';

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
@UntilDestroy()
export class StreamControllerComponent implements OnInit {
  @Input() stream = this._streamBuilder.inputStream([2, 5, 8], 10);

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
    protected _formBuilder: UntypedFormBuilder,
    protected _streamBuilder: StreamBuilderService,
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
      untilDestroyed(this),
    );

    const adjustStream$ = merge(sizeChange$, startOrCompleteChange$).pipe(
      tap(({ indexes, start, complete, terminateIndex }) => {
        const completeIndex = complete === 'complete' ? terminateIndex : null;
        const errorIndex = complete === 'error' ? terminateIndex : null;
        this._streamBuilder.adjustStream(this.stream, indexes, completeIndex, errorIndex, start);
      }),
      untilDestroyed(this),
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
      untilDestroyed(this),
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
}