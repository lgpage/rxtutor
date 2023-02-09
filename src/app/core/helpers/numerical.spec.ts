import {
  distribute, frameToX, getBoundedX, getSnappedX, indexToX, linspace, range, roundOff, xToFrame, xToIndex,
} from './numerical';

describe('range', () => {
  it('returns expected result', () => {
    const result = range(5);
    expect(result).toEqual([0, 1, 2, 3, 4]);
  });
});

describe('linspace', () => {
  it('returns expected result', () => {
    const result = linspace(1, 10, 4);
    expect(result).toEqual([1, 4, 7, 10]);
  });
});

describe('distribute', () => {
  it('returns expected result', () => {
    const result = distribute(1, 11, 5);
    expect(result).toEqual([2, 4, 6, 8, 10]);
  });
});

describe('roundOff', () => {
  it('returns expected result', () => {
    let result = roundOff(2.12345678, 4);
    expect(result).toEqual(2.1235);

    result = roundOff(2.12345678, 2);
    expect(result).toEqual(2.12);
  });
});

describe('indexToX', () => {
  it('returns expected result', () => {
    let result = indexToX(5, 10, 0);
    expect(result).toEqual(55);

    result = indexToX(5, 10, 5);
    expect(result).toEqual(60);
  });
});

describe('xToIndex', () => {
  it('returns expected result', () => {
    let result = xToIndex(55, 10, 0);
    expect(result).toEqual(5);

    result = xToIndex(60, 10, 5);
    expect(result).toEqual(5);
  });
});

describe('frameToX', () => {
  it('returns expected result', () => {
    let result = frameToX(5, 10, 0, 1);
    expect(result).toEqual(50);

    result = frameToX(5, 10, 5, 1);
    expect(result).toEqual(55);
  });
});

describe('xToFrame', () => {
  it('returns expected result', () => {
    let result = xToFrame(55, 10, 0, 1);
    expect(result).toEqual(6);

    result = xToFrame(60, 10, 5, 1);
    expect(result).toEqual(6);
  });
});

describe('getBoundedX', () => {
  it('returns expected result', () => {
    let result = getBoundedX(500, 10, 10, 0);
    expect(result).toEqual(95);

    result = getBoundedX(500, 10, 10, 5);
    expect(result).toEqual(100);
  });
});

describe('getSnappedX', () => {
  it('returns expected result', () => {
    let result = getSnappedX(51, 10, 10, 0);
    expect(result).toEqual(55);

    result = getSnappedX(51, 10, 10, 5);
    expect(result).toEqual(50);
  });
});
