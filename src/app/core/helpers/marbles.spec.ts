import { getMarbleNotifications } from './marbles';
import {
  createCompleteFrameNotification, createErrorFrameNotification, createNextFrameNotification,
} from './notification';

describe('getMarbleNotifications', () => {
  describe('where observable completes', () => {
    describe('without any values', () => {
      it('returns expected notifications', () => {
        const marbles = '-0--a-2|';
        var result = getMarbleNotifications(marbles);

        expect(result).toEqual([
          createNextFrameNotification(10, '0'),
          createNextFrameNotification(40, 'a'),
          createNextFrameNotification(60, '2'),
          createCompleteFrameNotification(70),
        ]);
      });
    });

    describe('with constant values', () => {
      it('returns expected notifications', () => {
        const marbles = '-0--1-2|';
        const values = 10;

        var result = getMarbleNotifications(marbles, values);

        expect(result).toEqual([
          createNextFrameNotification(10, 10),
          createNextFrameNotification(40, 10),
          createNextFrameNotification(60, 10),
          createCompleteFrameNotification(70),
        ]);
      });
    });

    describe('with array values', () => {
      it('returns expected notifications', () => {
        const marbles = '-0--1-2|';
        const values = ['a', 'b', 'c'];

        var result = getMarbleNotifications(marbles, values);

        expect(result).toEqual([
          createNextFrameNotification(10, 'a'),
          createNextFrameNotification(40, 'b'),
          createNextFrameNotification(60, 'c'),
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

        var result = getMarbleNotifications(marbles, values);

        expect(result).toEqual([
          createNextFrameNotification(10, 'A'),
          createNextFrameNotification(40, 'B'),
          createNextFrameNotification(60, 'C'),
          createCompleteFrameNotification(70),
        ]);
      });
    });

    describe('with time progression', () => {
      it('returns expected notifications', () => {
        const marbles = '-a 200ms b-c|';

        var result = getMarbleNotifications(marbles);

        expect(result).toEqual([
          createNextFrameNotification(10, 'a'),
          createNextFrameNotification(220, 'b'),
          createNextFrameNotification(240, 'c'),
          createCompleteFrameNotification(250),
        ]);
      });
    });

    describe('with grouping', () => {
      it('returns expected notifications', () => {
        const marbles = '-a-(bc)-(d|)';

        var result = getMarbleNotifications(marbles);

        expect(result).toEqual([
          createNextFrameNotification(10, 'a'),
          createNextFrameNotification(30, 'b'),
          createNextFrameNotification(30, 'c'),
          createNextFrameNotification(50, 'd'),
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

        var result = getMarbleNotifications(marbles, null, error);

        expect(result).toEqual([
          createNextFrameNotification(10, 'a'),
          createNextFrameNotification(40, 'b'),
          createErrorFrameNotification(60, error),
        ]);
      });
    });

    describe('without error value', () => {
      it('returns expected notifications', () => {
        const marbles = '-a--b-#';

        var result = getMarbleNotifications(marbles);

        expect(result).toEqual([
          createNextFrameNotification(10, 'a'),
          createNextFrameNotification(40, 'b'),
          createErrorFrameNotification(60),
        ]);
      });
    });

    describe('with grouping', () => {
      it('returns expected notifications', () => {
        const marbles = '-a-(bc)-(d#)';

        var result = getMarbleNotifications(marbles);

        expect(result).toEqual([
          createNextFrameNotification(10, 'a'),
          createNextFrameNotification(30, 'b'),
          createNextFrameNotification(30, 'c'),
          createNextFrameNotification(50, 'd'),
          createErrorFrameNotification(50),
        ]);
      });
    });
  });

  describe('with specified frame size', () => {
    it('returns expected notifications', () => {
        const marbles = '-0--1-2|';
        const values = ['a', 'b', 'c'];

        var result = getMarbleNotifications(marbles, values, null, 1);

        expect(result).toEqual([
          createNextFrameNotification(1, 'a'),
          createNextFrameNotification(4, 'b'),
          createNextFrameNotification(6, 'c'),
          createCompleteFrameNotification(7),
        ]);
    });
  });
});
