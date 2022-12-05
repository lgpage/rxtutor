import { Notification } from './notification';

export interface StreamNode extends Notification<string> {
  id: string;
  x: number;
  zIndex: number;
  display: string;
}

export interface StreamConfig {
  dx: number;
  dy: number;
  offset: number;
  frames: { small: number; large: number };
}
