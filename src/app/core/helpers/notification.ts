import { PartialObserver } from 'rxjs';
import { v4 as guid } from 'uuid';
import {
  CompleteNotification, ErrorNotification, FrameNotification, NextNotification, Notification, StreamNode,
} from '../types';

export const createNextNotification = <T = any>(value: T): NextNotification<T> => ({ kind: 'N', value });
export const createCompleteNotification = (): CompleteNotification => ({ kind: 'C' });
export const createErrorNotification = (error?: unknown): ErrorNotification => ({ kind: 'E', error });

export const observeNotification = <T>(notification: Notification<T>, observer: PartialObserver<T>) => {
  const { kind, value, error } = notification;
  if (typeof kind !== 'string') {
    throw new TypeError('Invalid notification, missing "kind"');
  }

  kind === 'N' ? observer.next?.(value!) : kind === 'E' ? observer.error?.(error) : observer.complete?.();
};

export const createNextFrameNotification = <T = any>(frame: number, value: T): FrameNotification<T> =>
  ({ frame, notification: createNextNotification<T>(value) });

export const createCompleteFrameNotification = (frame: number): FrameNotification =>
  ({ frame, notification: createCompleteNotification() });

export const createErrorFrameNotification = (frame: number, error?: unknown): FrameNotification =>
  ({ frame, notification: createErrorNotification(error) });

export const isNextNotification = (notification: Notification): notification is NextNotification =>
  notification.kind === 'N';

export const isCompleteNotification = (notification: Notification): notification is NextNotification =>
  notification.kind === 'C';

export const isErrorNotification = (notification: Notification): notification is NextNotification =>
  notification.kind === 'E';

export const getNotificationSymbol = (notification: Notification, display: string): string =>
  isCompleteNotification(notification) ? '|' : isErrorNotification(notification) ? '#' : display;

export const getStreamNodes = (notifications: FrameNotification[], frameSize: number, dx: number, offset: number): StreamNode[] => {
  const startAsc = 'A'.charCodeAt(0);

  return notifications.map((x, i): StreamNode => ({
    ...x.notification,
    zIndex: i,
    id: guid(),
    x: offset + (x.frame * dx / frameSize),
    symbol: getNotificationSymbol(x.notification, String.fromCharCode(startAsc + i)),
  }));
};
