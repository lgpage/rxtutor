import { Notification } from './notification';

export interface StreamMarbles {
  marbles: string;
  values?: any;
  error?: unknown;
  canDisplayAsValue?: boolean;
}

export interface StreamNode extends Notification<string> {
  id: string;
  x: number;
  zIndex: number;
  symbol: string;
}

export interface StreamConfig {
  dx: number;
  dy: number;
  offset: number;
  frames: { small: number; large: number };
}
