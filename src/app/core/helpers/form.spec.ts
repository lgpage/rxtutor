import { cold } from 'jasmine-marbles';
import { TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { getFormValue } from './form';

describe('getFormValue', () => {
  let formBuilder: FormBuilder;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule]
    });

    formBuilder = TestBed.inject(FormBuilder);
  });

  it('returns expected observable', () => {
    const formGroup = formBuilder.group({
      controlKey: formBuilder.control('initialValue'),
    });

    const result$ = getFormValue('controlKey', formGroup);
    expect(result$).toBeObservable(cold('0', ['initialValue']));

    formGroup.get('controlKey')?.setValue('nextValue');
    expect(result$).toBeObservable(cold('0', ['nextValue']));
  });
});
