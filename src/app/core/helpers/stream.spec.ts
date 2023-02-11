import { StreamNode } from '../types';
import { getStreamMarbles } from './stream';

describe('getStreamMarbles', () => {
  describe('without grouping', () => {
    it('should return expected results', () => {
      const streamNodes: StreamNode[] = [
        { id: 'id1', kind: 'N', symbol: 'A', x: 8, zIndex: 1 },
        { id: 'id2', kind: 'N', symbol: 'B', x: 28, zIndex: 2 },
        { id: 'id3', kind: 'N', symbol: 'C', x: 38, zIndex: 3 },
        { id: 'id4', kind: 'C', symbol: '|', x: 58, zIndex: 4 },
      ];

      const result = getStreamMarbles(streamNodes, 10, 3);

      expect(result).toEqual({
        marbles: 'A-BC-|',
        values: null,
        error: null,
        canDisplayAsValue: false,
      });
    });
  });

  describe('with grouping', () => {
    it('should return expected results', () => {
      const streamNodes: StreamNode[] = [
        { id: 'id1', kind: 'N', symbol: 'A', x: 8, zIndex: 1 },
        { id: 'id2', kind: 'N', symbol: 'B', x: 28, zIndex: 2 },
        { id: 'id3', kind: 'N', symbol: 'C', x: 28, zIndex: 3 },
        { id: 'id4', kind: 'C', symbol: '|', x: 48, zIndex: 4 },
      ];

      const result = getStreamMarbles(streamNodes, 10, 3);

      expect(result).toEqual({
        marbles: 'A-(BC)-|',
        values: null,
        error: null,
        canDisplayAsValue: false,
      });
    });
  });
});
