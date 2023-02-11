import { cold } from 'jasmine-marbles';
import { filterTruthy } from './observable';

describe('filterTruthy', () => {
  it('returns the expected result', () => {
    const result$ = cold('012345', [0, false, null, undefined, '', 'solo']).pipe(
      filterTruthy(),
    );

    expect(result$).toBeObservable(cold('-----0', ['solo']));
  });
});
