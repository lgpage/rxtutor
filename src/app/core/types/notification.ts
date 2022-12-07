export type NotificationKind = 'N' | 'E' | 'C';

export const NotificationKindText: { [key in NotificationKind]: string } = {
  N: "Next",
  E: "Error",
  C: "Complete"
};

export interface Notification<T = any> {
  kind: NotificationKind;
  error?: unknown;
  value?: T;
}

export interface NextNotification<T = any> extends Omit<Notification<T>, 'error'> {
  kind: 'N';
  value: T;
}

export interface ErrorNotification extends Omit<Notification<never>, 'value'> {
  kind: 'E';
  error: unknown;
}

export interface CompleteNotification extends Omit<Notification<never>, 'value' | 'error'> {
  kind: 'C';
}

export type NotificationType<T = any> = NextNotification<T> | ErrorNotification | CompleteNotification;

export interface FrameNotification<T = any> {
  frame: number;
  notification: NotificationType<T>;
}
