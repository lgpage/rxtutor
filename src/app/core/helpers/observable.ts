import { filter, OperatorFunction } from 'rxjs';

export const filterTruthy = <T>(): OperatorFunction<T, NonNullable<T>> =>
  filter((x) => !!x) as OperatorFunction<T, NonNullable<T>>;
