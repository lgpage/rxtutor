import { indexToX, xToIndex } from './helpers';

describe('helpers', () => {
  describe('indexToX', () => {
    it('should return the expected value', () => {
      expect(indexToX(0)).toEqual(15);
      expect(indexToX(1)).toEqual(25);
      expect(indexToX(2)).toEqual(35);
    });
  });

  describe('xToIndex', () => {
    it('should return the expected value', () => {
      expect(xToIndex(15)).toEqual(0);
      expect(xToIndex(25)).toEqual(1);
      expect(xToIndex(35)).toEqual(2);
    });
  });
});
