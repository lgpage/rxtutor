import { Observable } from 'rxjs';
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

export interface StreamLike {
  dx: number;
  dy: number;
  offset: number;
  frames: number;

  entities$: Observable<{ [id: string]: StreamNode }>;
  nodes$: Observable<StreamNode[]>;
  next$: Observable<StreamNode[]>;
  terminate$: Observable<StreamNode | null>;
  nodesToRender$: Observable<StreamNode[]>;
  marbles$: Observable<StreamMarbles>;
}

export interface InputStreamLike extends StreamLike {
  updateNode(update: Partial<StreamNode> & { id: string }): void;
}
