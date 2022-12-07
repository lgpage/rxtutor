import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { distinctUntilKeyChanged, first, map, shareReplay, tap } from 'rxjs/operators';
import { LoggerService } from '../services';
import { filterTruthy, getSnappedX, getStreamMarbles, xToIndex } from './helpers';
import { StreamConfig, StreamMarbles, StreamNode } from './types';

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
  marbles$: Observable<StreamMarbles>;
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
    map((nodes) => nodes.filter((n) => n.kind === 'N')),
    shareReplay({ refCount: true, bufferSize: 1 }),
  );

  terminate$ = this.nodes$.pipe(
    map((nodes) => nodes[nodes.length - 1]),
    map((node) => node.kind === 'N' ? null : node),
  );

  nodesToRender$ = this.entities$.pipe(
    map((entities) => Object.values(entities).sort((a, b) => a.zIndex - b.zIndex)),
    shareReplay({ refCount: true, bufferSize: 1 }),
  );

  marbles$ = this.nodes$.pipe(
    map((nodes) => getStreamMarbles(nodes, this.dx, this.offset)),
    distinctUntilKeyChanged('marbles'),
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

      if (node.kind === 'C' || node.kind === 'E') {
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
