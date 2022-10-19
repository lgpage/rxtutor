import { Observable, OperatorFunction } from 'rxjs';
import { distinctUntilChanged, filter, shareReplay, startWith } from 'rxjs/operators';
import { AbstractControl, FormGroup } from '@angular/forms';

export const range = (size: number): number[] => [...Array(size).keys()].map((x) => x);

export const indexToX = (index: number, dx: number, offset: number) =>
  offset + (dx / 2) + (dx * index);

export const xToIndex = (x: number, dx: number, offset: number) =>
  Math.round((x - offset - (dx / 2)) / dx);

export const getBoundedX = (x: number, dx: number, frames: number, offset: number): number =>
  Math.max(offset + (dx / 2), Math.min((dx * (frames - 1)) + offset + (dx / 2), x));

export const getSnappedX = (x: number, dx: number, frames: number, offset: number): number =>
  getBoundedX(offset + (dx / 2) + Math.round((x - offset - (dx / 2)) / dx) * dx, dx, frames, offset);

export const linspace = (start: number, stop: number, num: number, endpoint = true): number[] => {
  const size = Math.max(2, num);
  const div = endpoint ? (size - 1) : size;
  const step = (stop - start) / div;
  return [...Array(size).keys()].map((x) => start + step * x);
}

export const distribute = (start: number, stop: number, num: number): number[] => {
  const result: number[] = [];
  const space = linspace(start, stop, num + 1);
  for (const i of range(space.length - 1)) {
    result.push((space[i] + space[i + 1]) / 2);
  }

  return result;
}

export const getFormValue = <TValue = string, TControl extends { [K in keyof TControl]: AbstractControl<any> } = any>(
  key: string,
  formGroup: FormGroup<TControl>
): Observable<TValue> => {
  return formGroup.get(key)!.valueChanges.pipe(
    startWith(formGroup.get(key)!.value),
    distinctUntilChanged(),
    shareReplay({ refCount: true, bufferSize: 1 }),
  );
}

export const filterTruthy = <T>(): OperatorFunction<T, NonNullable<T>> =>
  filter((x) => !!x) as OperatorFunction<T, NonNullable<T>>;

export const roundOff = (num: number, places: number) => {
  const x = Math.pow(10, places);
  return Math.round(num * x) / x;
}
