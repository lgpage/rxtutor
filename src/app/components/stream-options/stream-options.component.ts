import { combineLatest, merge } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, skip, tap, withLatestFrom } from 'rxjs/operators';
import { Component, Inject, Input, OnInit, Optional } from '@angular/core';
import { FormControl, NonNullableFormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { getFormValue, InputStream, range } from '../../core';
import { LoggerService, StreamBuilderService } from '../../services';

type CompleteType = 'none' | 'complete' | 'error';

interface StreamUpdate {
  indexes: number[];
  start: string;
  complete: CompleteType;
  terminateIndex: number;
}

interface StreamFormControls {
  size: FormControl<number>;
  start: FormControl<string>;
  type: FormControl<string>;
  complete: FormControl<CompleteType>;
}

interface DialogData {
  stream: InputStream;
}

@Component({
  selector: 'app-stream-options',
  templateUrl: './stream-options.component.html',
  styleUrls: ['./stream-options.component.scss']
})
@UntilDestroy()
export class StreamOptionsComponent implements OnInit {
  @Input() stream: InputStream;

  formGroup = this._formBuilder.group<StreamFormControls>({
    size: this._formBuilder.control(3, Validators.required),
    start: this._formBuilder.control('1', Validators.required),
    type: this._formBuilder.control('numeric', Validators.required),
    complete: this._formBuilder.control('complete', Validators.required),
  });

  size$ = getFormValue<number>('size', this.formGroup);
  start$ = getFormValue('start', this.formGroup);
  type$ = getFormValue('type', this.formGroup);
  complete$ = getFormValue<CompleteType>('complete', this.formGroup);

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
    @Optional() @Inject(MAT_DIALOG_DATA) data: DialogData | undefined,
    protected _streamBuilder: StreamBuilderService,
    protected _formBuilder: NonNullableFormBuilder,
    protected _logger: LoggerService,
  ) {
    this.stream = data?.stream ?? this._streamBuilder.inputStream([2, 5, 8], 10);
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
      tap((start) => this.formGroup.get('start')?.setValue(start)),
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
      tap((size) => this.formGroup.get('size')?.setValue(size, { emitEvent: false })),
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
