import { Observable } from 'rxjs';
import { bufferTime, map, shareReplay, tap } from 'rxjs/operators';
import { v4 as guid } from 'uuid';
import { Injectable } from '@angular/core';
import { distribute, indexToX } from '../core/helpers';
import { InputStream, Stream, StreamNode } from '../core/stream';
import { LoggerService } from '../services';

@Injectable({ providedIn: 'root' })
export class StreamBuilderService {
  private _name = 'StreamBuilderService';

  constructor(
    private _logger: LoggerService,
  ) { }

  protected isNumber(x?: number): boolean {
    return x !== null && x !== undefined && !isNaN(+x);
  }

  protected createNodes(indexes: number[], completeIndex?: number, errorIndex?: number, start?: string): StreamNode[] {
    const getText = (x: number) => {
      const asc = (start ?? '1').charCodeAt(0);
      const next = String.fromCharCode(asc + x);
      return next;
    };

    const nodes: StreamNode[] = indexes.map((ind, i) =>
      ({ id: guid(), index: i, text: getText(i), type: 'next', x: indexToX(ind) })
    );

    const i = nodes.length;

    if (this.isNumber(completeIndex) && completeIndex >= 0) {
      nodes.push(({ id: guid(), index: i, text: '|', type: 'complete', x: indexToX(completeIndex) }));
      return nodes;
    }

    if (this.isNumber(errorIndex) && errorIndex >= 0) {
      nodes.push(({ id: guid(), index: i, text: '#', type: 'error', x: indexToX(errorIndex) }));
      return nodes;
    }

    return nodes;
  }

  getDistributedIndexes(size: number): number[] {
    if (size === 0) {
      return [];
    }

    return distribute(0, 9, size);
  }

  inputStream(indexes: number[], completeIndex?: number, errorIndex?: number, start?: string): InputStream {
    const stream = new InputStream(this.createNodes(indexes, completeIndex, errorIndex, start));
    return stream;
  }

  outputStream(output$: Observable<string>): Stream {
    const nodes$ = output$.pipe(
      tap((output) => this._logger.logDebug(`${this._name} >> outputStream`, { output })),
      bufferTime(100),
      tap((outputs) => this._logger.logDebug(`${this._name} >> outputStream`, { outputs })),
      map((outputs) => outputs.map<StreamNode>((x, i) => ({
        id: guid(),
        index: i,
        text: x,
        type: x === '|' ? 'complete' : x === '#' ? 'error' : 'next',
        x: indexToX(i),
      }))),
      tap((nodes) => this._logger.logDebug(`${this._name} >> outputStream`, { nodes })),
      map((nodes) => nodes.reduce((p, c) => ({ ...p, [c.id]: c }), {})),
      shareReplay({ refCount: true, bufferSize: 1 }),
    );

    return new Stream(nodes$);
  }

  adjustStream(stream: InputStream, indexes: number[], completeIndex?: number, errorIndex?: number, start?: string): void {
    stream.setNodes(this.createNodes(indexes, completeIndex, errorIndex, start));
  }
}
