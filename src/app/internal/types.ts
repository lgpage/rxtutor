export type NotificationKind = 'N' | 'E' | 'C';

export interface NextNotification<T = any> {
  kind: 'N';
  value: T;
}

export interface ErrorNotification {
  kind: 'E';
  error: unknown;
}

export interface CompleteNotification {
  kind: 'C';
}

export type Notification<T = any> = NextNotification<T> | ErrorNotification | CompleteNotification;

export interface FrameNotification<T = any> {
  frame: number;
  notification: Notification<T>;
}
