import { BehaviorSubject, Observable } from 'rxjs';
import { filter, first, map, shareReplay, tap } from 'rxjs/operators';

export interface StreamNode {
  id: string;
  type: 'next' | 'complete' | 'error'
  x: number;
  index: number;
  text: string;
}

export class Stream {
  protected _nodesSubject$ = new BehaviorSubject<{ [id: string]: StreamNode }>(null);

  entities$ = this._nodesSubject$.asObservable().pipe(filter((x) => !!x));

  nodes$: Observable<StreamNode[]> = this.entities$.pipe(
    map((entities) => Object.values(entities).sort((a, b) => a.x - b.x)),
    shareReplay({ refCount: true, bufferSize: 1 }),
  );

  nodesToRender$: Observable<StreamNode[]> = this.entities$.pipe(
    map((entities) => Object.values(entities).sort((a, b) => a.index - b.index)),
    shareReplay({ refCount: true, bufferSize: 1 }),
  );

  constructor(nodes: StreamNode[]) {
    this._nodesSubject$.next(nodes.reduce((p, c) => ({ ...p, [c.id]: c }), {}));
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
      tap((nodes) => this._nodesSubject$.next(nodes.reduce((p, c) => ({ ...p, [c.id]: c }), {}))),
    ).subscribe();
  }
}
