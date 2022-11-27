import { PartialObserver } from 'rxjs';
import {
  CompleteNotification, ErrorNotification, FrameNotification, NextNotification, Notification,
} from '../../types';

export const createNextNotification = <T = any>(value: T): NextNotification<T> => ({ kind: 'N', value });
export const createCompleteNotification = (): CompleteNotification => ({ kind: 'C' });
export const createErrorNotification = (error?: unknown): ErrorNotification => ({ kind: 'E', error });

export const observeNotification = <T>(notification: Notification<T>, observer: PartialObserver<T>) => {
  const { kind, value, error } = notification;
  if (typeof kind !== 'string') {
    throw new TypeError('Invalid notification, missing "kind"');
  }

  kind === 'N' ? observer.next?.(value!) : kind === 'E' ? observer.error?.(error) : observer.complete?.();
}

export const createNextFrameNotification = <T = any>(frame: number, value: T): FrameNotification<T> =>
  ({ frame, notification: createNextNotification<T>(value) });

export const createCompleteFrameNotification = (frame: number): FrameNotification =>
  ({ frame, notification: createCompleteNotification() });

export const createErrorFrameNotification = (frame: number, error?: unknown): FrameNotification =>
  ({ frame, notification: createErrorNotification(error) });
