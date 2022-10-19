import { indexToX, xToIndex } from './helpers';

describe('helpers', () => {
  describe('indexToX', () => {
    it('should return the expected value', () => {
      expect(indexToX(0, 10, 5)).toEqual(10);
      expect(indexToX(1, 10, 5)).toEqual(20);
      expect(indexToX(2, 10, 5)).toEqual(30);
    });
  });

  describe('xToIndex', () => {
    it('should return the expected value', () => {
      expect(xToIndex(10, 10, 5)).toEqual(0);
      expect(xToIndex(20, 10, 5)).toEqual(1);
      expect(xToIndex(30, 10, 5)).toEqual(2);
    });
  });
});
