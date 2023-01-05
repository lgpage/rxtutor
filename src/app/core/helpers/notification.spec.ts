import { PartialObserver } from 'rxjs';
import { FrameNotification, Notification, NotificationKind } from '../types';
import {
  createCompleteFrameNotification, createCompleteNotification, createErrorFrameNotification, createErrorNotification,
  createNextFrameNotification, createNextNotification, getNotificationSymbol, getStreamNodes, isCompleteNotification,
  isErrorNotification, isNextNotification, observeNotification,
} from './notification';

describe('createNextNotification', () => {
  it('should return the expected result', () => {
    expect(createNextNotification(10)).toEqual({ kind: 'N', value: 10 });
  });
});

describe('createCompleteNotification', () => {
  it('should return the expected result', () => {
    expect(createCompleteNotification()).toEqual({ kind: 'C' });
  });
});

describe('createErrorNotification', () => {
  it('should return the expected result', () => {
    const error = new Error('Whoops');
    expect(createErrorNotification(error)).toEqual({ kind: 'E', error });
  });
});

describe('observeNotification', () => {
  let observer: PartialObserver<number>;

  beforeEach(() => {
    observer = jasmine.createSpyObj<PartialObserver<number>>('observer', ['next', 'error', 'complete']);
  });

  describe('when kind is missing', () => {
    it('should throw an error', () => {
      const notification: Notification<number> = { kind: null as unknown as NotificationKind };

      expect(() => observeNotification(notification, observer)).toThrowError('Invalid notification, missing "kind"');
    });
  });

  describe('when kind is next', () => {
    it('should call the expected observer callback', () => {
      const notification: Notification<number> = { kind: 'N', value: 10 };

      observeNotification(notification, observer);

      expect(observer.next).toHaveBeenCalledWith(10);
      expect(observer.error).not.toHaveBeenCalled();
      expect(observer.complete).not.toHaveBeenCalled();
    });
  });

  describe('when kind is error', () => {
    it('should call the expected observer callback', () => {
      const error = new Error('whoops');
      const notification: Notification<number> = { kind: 'E', error };

      observeNotification(notification, observer);

      expect(observer.next).not.toHaveBeenCalled();
      expect(observer.error).toHaveBeenCalledWith(error);
      expect(observer.complete).not.toHaveBeenCalled();
    });
  });

  describe('when kind is complete', () => {
    it('should call the expected observer callback', () => {
      const notification: Notification<number> = { kind: 'C' };

      observeNotification(notification, observer);

      expect(observer.next).not.toHaveBeenCalled();
      expect(observer.error).not.toHaveBeenCalled();
      expect(observer.complete).toHaveBeenCalled();
    });
  });
});

describe('createNextFrameNotification', () => {
  it('should return the expected result', () => {
    expect(createNextFrameNotification(2, 10)).toEqual({ frame: 2, notification: { kind: 'N', value: 10 } });
  });
});

describe('createCompleteFrameNotification', () => {
  it('should return the expected result', () => {
    expect(createCompleteFrameNotification(2)).toEqual({ frame: 2, notification: { kind: 'C' } });
  });
});

describe('createErrorFrameNotification', () => {
  it('should return the expected result', () => {
    const error = new Error('Whoops');
    expect(createErrorFrameNotification(2, error)).toEqual({ frame: 2, notification: { kind: 'E', error } });
  });
});

describe('isNextNotification', () => {
  it('should return the expected result', () => {
    expect(isNextNotification({ kind: 'N' })).toBeTrue();
  });
});

describe('isCompleteNotification', () => {
  it('should return the expected result', () => {
    expect(isCompleteNotification({ kind: 'C' })).toBeTrue();
  });
});

describe('isErrorNotification', () => {
  it('should return the expected result', () => {
    expect(isErrorNotification({ kind: 'E' })).toBeTrue();
  });
});

describe('getNotificationSymbol', () => {
  describe('when kind is next', () => {
    it('should return the expected result', () => {
      expect(getNotificationSymbol({ kind: 'N' }, 'A')).toEqual('A');
    });
  });

  describe('when kind is complete', () => {
    it('should return the expected result', () => {
      expect(getNotificationSymbol({ kind: 'C' }, 'A')).toEqual('|');
    });
  });

  describe('when kind is error', () => {
    it('should return the expected result', () => {
      expect(getNotificationSymbol({ kind: 'E' }, 'A')).toEqual('#');
    });
  });
});

describe('getStreamNodes', () => {
  it('should return the expected result', () => {
    const notifications: FrameNotification[] = [
      { frame: 1, notification: { kind: 'N', value: 2 } },
      { frame: 2, notification: { kind: 'N', value: 4 } },
      { frame: 3, notification: { kind: 'C' } },
    ];

    expect(getStreamNodes(notifications, 1, 10, 3)).toEqual([
      { kind: 'N', zIndex: 0, x: 13, symbol: 'A', value: 2, id: jasmine.any(String) },
      { kind: 'N', zIndex: 1, x: 23, symbol: 'B', value: 4, id: jasmine.any(String) },
      { kind: 'C', zIndex: 2, x: 33, symbol: '|', id: jasmine.any(String) },
    ]);
  });
});
