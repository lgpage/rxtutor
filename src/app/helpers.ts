export const range = (size: number): number[] => [...Array(size).keys()].map((x) => x);

export const indexToX = (index: number) => 15 + (10 * index);
export const xToIndex = (x: number) => Math.round((x - 15) / 10);

export const getBoundedX = (x: number): number => Math.max(15, Math.min(105, x));
export const getSnappedX = (x: number): number => getBoundedX(15 + Math.round((x - 15) / 10) * 10);
