export const range = (size: number): number[] => [...Array(size).keys()].map((x) => x);

export const indexToX = (index: number, dx: number, offset: number) =>
  offset + (dx / 2) + (dx * index);

export const xToIndex = (x: number, dx: number, offset: number) =>
  Math.round((x - offset - (dx / 2)) / dx);

export const getBoundedX = (x: number, dx: number, frames: number, offset: number): number =>
  Math.max(offset + (dx / 2), Math.min((dx * (frames - 1)) + offset + (dx / 2), x));

export const getSnappedX = (x: number, dx: number, frames: number, offset: number): number =>
  getBoundedX(offset + (dx / 2) + Math.round((x - offset - (dx / 2)) / dx) * dx, dx, frames, offset);

export const linspace = (start: number, stop: number, num: number): number[] => {
  const size = Math.max(2, num);
  const div = (size - 1);
  const step = (stop - start) / div;
  return [...Array(size).keys()].map((x) => start + step * x);
};

export const distribute = (start: number, stop: number, num: number): number[] => {
  const result: number[] = [];
  const space = linspace(start, stop, num + 1);
  for (const i of range(space.length - 1)) {
    result.push((space[i] + space[i + 1]) / 2);
  }

  return result;
};

export const roundOff = (num: number, places: number) => {
  const x = Math.pow(10, places);
  return Math.round(num * x) / x;
};
