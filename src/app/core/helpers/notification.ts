import { PartialObserver } from 'rxjs';
import { v4 as guid } from 'uuid';
import {
  CompleteNotification, ErrorNotification, FrameNotification, NextNotification, Notification, StreamNode,
} from '../types';
import { frameToX } from './numerical';

export const createNextNotification = <T = any>(value: T, symbol: string): NextNotification<T> => ({ kind: 'N', symbol, value });
export const createCompleteNotification = (): CompleteNotification => ({ kind: 'C', symbol: '|' });
export const createErrorNotification = (error?: unknown): ErrorNotification => ({ kind: 'E', symbol: '#', error });

export const observeNotification = <T>(notification: Notification<T>, observer: PartialObserver<T>): void => {
  const { kind, value, error } = notification;
  if (typeof kind !== 'string') {
    throw new TypeError('Invalid notification, missing "kind"');
  }

  kind === 'N' ? observer.next?.(value!) : kind === 'E' ? observer.error?.(error) : observer.complete?.();
};

export const createNextFrameNotification = <T = any>(frame: number, value: T, symbol: string): FrameNotification<T> =>
  ({ frame, notification: createNextNotification<T>(value, symbol) });

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

export const getStreamNodes = <T = any>(notifications: FrameNotification[], frameSize: number, dx: number, offset: number): StreamNode<T>[] => {
  return notifications.map((x, i): StreamNode<T> => ({
    ...x.notification,
    zIndex: i,
    id: guid(),
    x: frameToX(x.frame, dx, offset, frameSize),
  }));
};
