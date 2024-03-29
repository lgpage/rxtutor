import { getMarbleNotifications } from './marble';
import {
  createCompleteFrameNotification, createErrorFrameNotification, createNextFrameNotification,
} from './notification';

describe('getMarbleNotifications', () => {
  describe('where observable completes', () => {
    describe('without any values', () => {
      it('returns expected notifications', () => {
        const marbles = '-0--a-2|';
        const result = getMarbleNotifications(marbles);

        expect(result).toEqual([
          createNextFrameNotification(10, '0', '0'),
          createNextFrameNotification(40, 'a', 'a'),
          createNextFrameNotification(60, '2', '2'),
          createCompleteFrameNotification(70),
        ]);
      });
    });

    describe('with constant values', () => {
      it('returns expected notifications', () => {
        const marbles = '-0--1-2|';
        const values = 10;

        const result = getMarbleNotifications(marbles, values);

        expect(result).toEqual([
          createNextFrameNotification(10, 10, '0'),
          createNextFrameNotification(40, 10, '1'),
          createNextFrameNotification(60, 10, '2'),
          createCompleteFrameNotification(70),
        ]);
      });
    });

    describe('with array values', () => {
      it('returns expected notifications', () => {
        const marbles = '-0--1-2|';
        const values = ['a', 'b', 'c'];

        const result = getMarbleNotifications(marbles, values);

        expect(result).toEqual([
          createNextFrameNotification(10, 'a', '0'),
          createNextFrameNotification(40, 'b', '1'),
          createNextFrameNotification(60, 'c', '2'),
          createCompleteFrameNotification(70),
        ]);
      });
    });

    describe('with object values', () => {
      it('returns expected notifications', () => {
        const marbles = '-a--b-c|';
        const values = {
          a: 'A',
          b: 'B',
          c: 'C',
        };

        const result = getMarbleNotifications(marbles, values);

        expect(result).toEqual([
          createNextFrameNotification(10, 'A', 'a'),
          createNextFrameNotification(40, 'B', 'b'),
          createNextFrameNotification(60, 'C', 'c'),
          createCompleteFrameNotification(70),
        ]);
      });
    });

    describe('with ms time progression', () => {
      it('returns expected notifications', () => {
        const marbles = '-a 200ms b-c|';

        const result = getMarbleNotifications(marbles);

        expect(result).toEqual([
          createNextFrameNotification(10, 'a', 'a'),
          createNextFrameNotification(220, 'b', 'b'),
          createNextFrameNotification(240, 'c', 'c'),
          createCompleteFrameNotification(250),
        ]);
      });
    });

    describe('with s time progression', () => {
      it('returns expected notifications', () => {
        const marbles = '-a 2s b-c|';

        const result = getMarbleNotifications(marbles);

        expect(result).toEqual([
          createNextFrameNotification(10, 'a', 'a'),
          createNextFrameNotification(2020, 'b', 'b'),
          createNextFrameNotification(2040, 'c', 'c'),
          createCompleteFrameNotification(2050),
        ]);
      });
    });

    describe('with m time progression', () => {
      it('returns expected notifications', () => {
        const marbles = '-a 2m b-c|';

        const result = getMarbleNotifications(marbles);

        expect(result).toEqual([
          createNextFrameNotification(10, 'a', 'a'),
          createNextFrameNotification((60 * 2000) + 20, 'b', 'b'),
          createNextFrameNotification((60 * 2000) + 40, 'c', 'c'),
          createCompleteFrameNotification((60 * 2000) + 50),
        ]);
      });
    });

    describe('with grouping', () => {
      it('returns expected notifications', () => {
        const marbles = '-a-(bc)-(d|)';

        const result = getMarbleNotifications(marbles);

        expect(result).toEqual([
          createNextFrameNotification(10, 'a', 'a'),
          createNextFrameNotification(30, 'b', 'b'),
          createNextFrameNotification(30, 'c', 'c'),
          createNextFrameNotification(50, 'd', 'd'),
          createCompleteFrameNotification(50),
        ]);
      });
    });
  });

  describe('where observable errors', () => {
    describe('with error value', () => {
      it('returns expected notifications', () => {
        const marbles = '-a--b-#';
        const error = new Error('whoops');

        const result = getMarbleNotifications(marbles, null, error);

        expect(result).toEqual([
          createNextFrameNotification(10, 'a', 'a'),
          createNextFrameNotification(40, 'b', 'b'),
          createErrorFrameNotification(60, error),
        ]);
      });
    });

    describe('without error value', () => {
      it('returns expected notifications', () => {
        const marbles = '-a--b-#';

        const result = getMarbleNotifications(marbles);

        expect(result).toEqual([
          createNextFrameNotification(10, 'a', 'a'),
          createNextFrameNotification(40, 'b', 'b'),
          createErrorFrameNotification(60),
        ]);
      });
    });

    describe('with grouping', () => {
      it('returns expected notifications', () => {
        const marbles = '-a-(bc)-(d#)';

        const result = getMarbleNotifications(marbles);

        expect(result).toEqual([
          createNextFrameNotification(10, 'a', 'a'),
          createNextFrameNotification(30, 'b', 'b'),
          createNextFrameNotification(30, 'c', 'c'),
          createNextFrameNotification(50, 'd', 'd'),
          createErrorFrameNotification(50),
        ]);
      });
    });
  });

  describe('with specified frame size', () => {
    it('returns expected notifications', () => {
        const marbles = '-0--1-2|';
        const values = ['a', 'b', 'c'];

        const result = getMarbleNotifications(marbles, values, null, 1);

        expect(result).toEqual([
          createNextFrameNotification(1, 'a', '0'),
          createNextFrameNotification(4, 'b', '1'),
          createNextFrameNotification(6, 'c', '2'),
          createCompleteFrameNotification(7),
        ]);
    });
  });
});
