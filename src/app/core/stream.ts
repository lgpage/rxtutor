import { BehaviorSubject, Observable } from 'rxjs';
import { distinctUntilChanged, first, map, shareReplay, tap } from 'rxjs/operators';
import { LoggerService } from '../services';
import { filterTruthy, getSnappedX, range, xToIndex } from './helpers';

export interface StreamNode {
  id: string;
  type: 'next' | 'complete' | 'error'
  x: number;
  index: number;
  text: string;
  payload?: string;
}

export interface StreamConfig {
  dx: number;
  dy: number;
  offset: number;
  frames: { small: number; large: number };
}

export type Config = Omit<StreamConfig, 'frames'> & { frames: number };

export interface IStream {
  dx: number;
  dy: number;
  offset: number;
  frames: number;

  entities$: Observable<{ [id: string]: StreamNode }>;
  nodes$: Observable<StreamNode[]>;
  next$: Observable<StreamNode[]>;
  terminate$: Observable<StreamNode | null>;
  nodesToRender$: Observable<StreamNode[]>;
  marbles$: Observable<string>;
}

const getStreamValues = (nodes: StreamNode[]): (string | null)[] => {
  let maxIndex = 0;
  const nodesDict: { [index: number]: StreamNode[] } = {};
  for (const n of nodes) {
    maxIndex = Math.max(maxIndex, n.index);
    nodesDict[n.index] = [...(nodesDict[n.index] ?? []), n];
  }

  const values: (string | null)[] = [];
  for (const i of range(maxIndex + 1)) {
    const frameNodes = nodesDict[i];
    if (!!frameNodes) {
      values.push((frameNodes ?? []).map((n) => n.text).join(','));
    } else {
      values.push(null);
    }
  }

  return values;
}

const getStreamMarbles = (nodes: StreamNode[]): string => {
  const values = getStreamValues(nodes);
  const stream = values.map((val) => {
    if (!val) {
      return '-';
    }

    const marbles = val.split(',');
    return marbles.length > 1 ? `(${marbles.join('')})` : marbles[0];
  }).join('');

  return stream
}

export class Stream implements IStream {
  dx: number;
  dy: number;
  offset: number;
  frames: number;

  entities$: Observable<{ [id: string]: StreamNode }>;
  nodes$: Observable<StreamNode[]>;
  next$: Observable<StreamNode[]>;
  terminate$: Observable<StreamNode | null>;
  nodesToRender$: Observable<StreamNode[]>;
  marbles$: Observable<string>;

  constructor(config: Config, entities$: Observable<{ [id: string]: StreamNode }>) {
    this.entities$ = entities$;

    this.dx = config.dx;
    this.dy = config.dy;
    this.offset = config.offset;
    this.frames = config.frames;

    this.nodes$ = this.entities$.pipe(
      map((entities) => Object.values(entities).sort((a, b) => a.x - b.x)),
      shareReplay({ refCount: true, bufferSize: 1 }),
    );

    this.next$ = this.nodes$.pipe(
      map((nodes) => nodes.filter((n) => n.type === 'next')),
      shareReplay({ refCount: true, bufferSize: 1 }),
    );

    this.terminate$ = this.nodes$.pipe(
      map((nodes) => nodes[nodes.length - 1]),
      map((node) => node.type === 'next' ? null : node),
    );

    this.nodesToRender$ = this.entities$.pipe(
      map((entities) => Object.values(entities).sort((a, b) => a.index - b.index)),
      shareReplay({ refCount: true, bufferSize: 1 }),
    );

    this.marbles$ = this.nodes$.pipe(
      map((nodes) => getStreamMarbles(nodes)),
      distinctUntilChanged(),
      shareReplay({ refCount: true, bufferSize: 1 }),
    );
  }
}

export class InputStream implements IStream {
  protected _name = 'InputStream';
  protected _stream: Stream;
  protected _nodesSubject$ = new BehaviorSubject<{ [id: string]: StreamNode } | null>(null);
  protected _logger: LoggerService | undefined;

  dx: number;
  dy: number;
  offset: number;
  frames: number;

  entities$ = this._nodesSubject$.asObservable().pipe(filterTruthy());

  nodes$: Observable<StreamNode[]>;
  next$: Observable<StreamNode[]>;
  terminate$: Observable<StreamNode | null>;
  nodesToRender$: Observable<StreamNode[]>;
  marbles$: Observable<string>;

  constructor(config: Config, nodes: StreamNode[], logger?: LoggerService) {
    this._stream = new Stream(config, this.entities$);
    this._logger = logger;

    this.dx = this._stream.dx;
    this.dy = this._stream.dy;
    this.offset = this._stream.offset;
    this.frames = this._stream.frames;

    this.nodes$ = this._stream.nodes$;
    this.next$ = this._stream.next$;
    this.terminate$ = this._stream.terminate$;
    this.nodesToRender$ = this._stream.nodesToRender$;
    this.marbles$ = this._stream.marbles$;

    this.setNodes(nodes);
  }

  protected excludeNodesAfterComplete(nodes: StreamNode[]): StreamNode[] {
    const filteredNodes: StreamNode[] = [];
    for (const node of nodes) {
      filteredNodes.push(node);

      if (node.type === 'complete' || node.type === 'error') {
        return filteredNodes;
      }
    }

    return filteredNodes;
  }

  protected snapNodesToNearestFrame(nodes: StreamNode[]): StreamNode[] {
    return nodes.map((n) => {
      const x = getSnappedX(n.x, this.dx, this.frames, this.offset);
      return ({ ...n, x, index: xToIndex(n.x, this.dx, this.offset) });
    });
  }

  setNodes(nodes: StreamNode[]): void {
    this._nodesSubject$.next(nodes.reduce((p, c) => ({ ...p, [c.id]: c }), {}));
    this.correct();
  }

  updateNode(update: Partial<StreamNode> & { id: string }): void {
    this._nodesSubject$.pipe(
      first(),
      map((nodes) => ({ ...nodes, [update.id]: { ...(nodes ?? {})[update.id], ...update } })),
      tap((nodes) => this._nodesSubject$.next(nodes)),
    ).subscribe();
  }

  correct(): void {
    this.nodes$.pipe(
      first(),
      map((nodes) => this.excludeNodesAfterComplete(nodes)),
      map((nodes) => this.snapNodesToNearestFrame(nodes)),
      tap((nodes) => this._logger?.logDebug(`${this._name} >> correct`, { nodes })),
      tap((nodes) => this._nodesSubject$.next(nodes.reduce((p, c) => ({ ...p, [c.id]: c }), {}))),
    ).subscribe();
  }
}
