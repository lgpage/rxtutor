import { BehaviorSubject, Observable, Subscription } from 'rxjs';
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
  protected _name = 'Stream';
  protected _logger: LoggerService | undefined;
  protected _nodesSubject$ = new BehaviorSubject<{ [id: string]: StreamNode } | null>(null);

  dx: number;
  dy: number;
  offset: number;
  frames: number;

  entities$ = this._nodesSubject$.asObservable().pipe(filterTruthy());

  nodes$ = this.entities$.pipe(
    map((entities) => Object.values(entities).sort((a, b) => a.x - b.x)),
    shareReplay({ refCount: true, bufferSize: 1 }),
  );

  next$ = this.nodes$.pipe(
    map((nodes) => nodes.filter((n) => n.type === 'next')),
    shareReplay({ refCount: true, bufferSize: 1 }),
  );

  terminate$ = this.nodes$.pipe(
    map((nodes) => nodes[nodes.length - 1]),
    map((node) => node.type === 'next' ? null : node),
  );

  nodesToRender$ = this.entities$.pipe(
    map((entities) => Object.values(entities).sort((a, b) => a.index - b.index)),
    shareReplay({ refCount: true, bufferSize: 1 }),
  );

  marbles$ = this.nodes$.pipe(
    map((nodes) => getStreamMarbles(nodes)),
    distinctUntilChanged(),
    shareReplay({ refCount: true, bufferSize: 1 }),
  );

  constructor(config: Config, logger?: LoggerService) {
    this.dx = config.dx;
    this.dy = config.dy;
    this.offset = config.offset;
    this.frames = config.frames;

    this._logger = logger;
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

  setNodes(nodes?: StreamNode[]): void {
    this._nodesSubject$.next((nodes ?? []).reduce((p, c) => ({ ...p, [c.id]: c }), {}));
    this.correct();
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

export class InputStream extends Stream implements IStream {
  protected _name = 'InputStream';
  protected _logger: LoggerService | undefined;

  constructor(config: Config, nodes?: StreamNode[], logger?: LoggerService) {
    super(config, logger);

    this._logger = logger;

    this.setNodes(nodes);
  }

  updateNode(update: Partial<StreamNode> & { id: string }): void {
    this._nodesSubject$.pipe(
      first(),
      map((nodes) => ({ ...nodes, [update.id]: { ...(nodes ?? {})[update.id], ...update } })),
      tap((nodes) => this._nodesSubject$.next(nodes)),
    ).subscribe();
  }
}

export class OutputStream extends Stream implements IStream {
  protected _updateSub: Subscription | undefined;

  constructor(config: Config, logger?: LoggerService) {
    super(config, logger);
  }

  setNodesUpdater(updater$: Observable<StreamNode[]>): void {
    this.dispose();

    this._updateSub = updater$.pipe(
      tap((nodes) => super.setNodes(nodes)),
    ).subscribe();
  }

  dispose(): void {
    this._updateSub?.unsubscribe();
  }
}
