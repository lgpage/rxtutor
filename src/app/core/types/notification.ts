export type NotificationKind = 'N' | 'E' | 'C';

export const NotificationKindText: { [key in NotificationKind]: string } = {
  N: "Next",
  E: "Error",
  C: "Complete"
};

export interface Notification<T = any> {
  kind: NotificationKind;
  symbol: string;
  error?: unknown;
  value?: T;
}

export interface NextNotification<T = any> extends Omit<Notification<T>, 'error'> {
  kind: 'N';
  symbol: string;
  value: T;
}

export interface ErrorNotification extends Omit<Notification<never>, 'value'> {
  kind: 'E';
  symbol: '#';
  error: unknown;
}

export interface CompleteNotification extends Omit<Notification<never>, 'value' | 'error'> {
  kind: 'C';
  symbol: '|';
}

export type NotificationType<T = any> = NextNotification<T> | ErrorNotification | CompleteNotification;

export interface FrameNotification<T = any> {
  frame: number;
  notification: NotificationType<T>;
}
