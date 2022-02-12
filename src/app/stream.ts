import { BehaviorSubject, Observable, of, timer } from 'rxjs';
import { distinctUntilChanged, filter, first, map, mergeMap, shareReplay, take, takeWhile, tap } from 'rxjs/operators';
import { getSnappedX, range, xToIndex } from './helpers';

export interface StreamNode {
  id: string;
  type: 'next' | 'complete' | 'error'
  x: number;
  index: number;
  text: string;
}

const getStreamValues = (nodes: StreamNode[]): string[] => {
  let maxIndex = 0;
  const nodesDict: { [index: number]: StreamNode[] } = {};
  for (const n of nodes) {
    maxIndex = Math.max(maxIndex, n.index);
    nodesDict[n.index] = [...(nodesDict[n.index] ?? []), n];
  }

  const values: string[] = [];
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

const getStreamSource = (nodes: StreamNode[]): Observable<string> => {
  const values = getStreamValues(nodes);
  return timer(0, 1).pipe(
    take(values.length),
    mergeMap((i) => {
      const val = values[i];
      return !!val ? of(...val.split(',')) : of(null);
    }),
    filter((x) => !!x),
    tap((x) => {
      if (x === '#') {
        throw 'error';
      }
    }),
  );
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

export class Stream {
  protected _nodesSubject$ = new BehaviorSubject<{ [id: string]: StreamNode }>(null);

  entities$ = this._nodesSubject$.asObservable().pipe(filter((x) => !!x));

  nodes$: Observable<StreamNode[]> = this.entities$.pipe(
    map((entities) => Object.values(entities).sort((a, b) => a.x - b.x)),
    shareReplay({ refCount: true, bufferSize: 1 }),
  );

  next$: Observable<StreamNode[]> = this.nodes$.pipe(
    map((nodes) => nodes.filter((n) => n.type === 'next')),
    shareReplay({ refCount: true, bufferSize: 1 }),
  );

  terminate$: Observable<StreamNode> = this.nodes$.pipe(
    map((nodes) => nodes[nodes.length - 1]),
    map((node) => node.type === 'next' ? null : node),
  );

  nodesToRender$: Observable<StreamNode[]> = this.entities$.pipe(
    map((entities) => Object.values(entities).sort((a, b) => a.index - b.index)),
    shareReplay({ refCount: true, bufferSize: 1 }),
  );

  source$ = this.nodes$.pipe(
    mergeMap((nodes) => getStreamSource(nodes)),
    takeWhile((v) => v !== '|'),
    shareReplay({ refCount: true, bufferSize: 1 }),
  );

  marbles$ = this.nodes$.pipe(
    map((nodes) => getStreamMarbles(nodes)),
    distinctUntilChanged(),
    shareReplay({ refCount: true, bufferSize: 1 }),
  );

  constructor(nodes: StreamNode[]) {
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
      const x = getSnappedX(n.x);
      return ({ ...n, x, index: xToIndex(n.x) });
    });
  }

  setNodes(nodes: StreamNode[]): void {
    this._nodesSubject$.next(nodes.reduce((p, c) => ({ ...p, [c.id]: c }), {}));
    this.correct();
  }

  updateNode(update: Partial<StreamNode> & { id: string }): void {
    this._nodesSubject$.pipe(
      first(),
      tap((nodes) => this._nodesSubject$.next({ ...nodes, [update.id]: { ...nodes[update.id], ...update } })),
    ).subscribe();
  }

  correct(): void {
    this.nodes$.pipe(
      first(),
      map((nodes) => this.excludeNodesAfterComplete(nodes)),
      map((nodes) => this.snapNodesToNearestFrame(nodes)),
      tap((nodes) => this._nodesSubject$.next(nodes.reduce((p, c) => ({ ...p, [c.id]: c }), {}))),
    ).subscribe();
  }
}
