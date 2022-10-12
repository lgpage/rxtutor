import { Observable } from 'rxjs';
import { distinctUntilChanged, map, shareReplay, startWith } from 'rxjs/operators';
import { AbstractControl, FormGroup } from '@angular/forms';

export const range = (size: number): number[] => [...Array(size).keys()].map((x) => x);

export const indexToX = (index: number) => 15 + (10 * index);
export const xToIndex = (x: number) => Math.round((x - 15) / 10);

export const getBoundedX = (x: number): number => Math.max(15, Math.min(105, x));
export const getSnappedX = (x: number): number => getBoundedX(15 + Math.round((x - 15) / 10) * 10);

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
  return formGroup.get(key).valueChanges.pipe(
    startWith(formGroup.get(key).value),
    distinctUntilChanged(),
    shareReplay({ refCount: true, bufferSize: 1 }),
  );
}
