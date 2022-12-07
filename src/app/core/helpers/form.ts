import { distinctUntilChanged, Observable, shareReplay, startWith } from 'rxjs';
import { AbstractControl, FormGroup } from '@angular/forms';

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
