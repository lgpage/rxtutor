import { Observable } from 'rxjs';
import { bufferTime, map, shareReplay, tap } from 'rxjs/operators';
import { v4 as guid } from 'uuid';
import { Inject, Injectable, InjectionToken } from '@angular/core';
import { distribute, indexToX, InputStream, Stream, StreamNode } from '../core';
import { LoggerService } from '../services';
import { StreamConfig } from '../types';

export const STREAM_CONFIG = new InjectionToken<StreamConfig>('Stream config');

@Injectable({ providedIn: 'root' })
export class StreamBuilderService {
  private _name = 'StreamBuilderService';

  dx = this._config.dx;
  dy = this._config.dy;
  offset = this._config.offset;
  frames = this._config.frames;

  constructor(
    @Inject(STREAM_CONFIG) private _config: StreamConfig,
    private _logger: LoggerService,
  ) { }

  protected isNumber(x?: number | null): x is number {
    return x !== null && x !== undefined && !isNaN(+x);
  }

  protected createNodes(indexes: number[], completeIndex?: number | null, errorIndex?: number | null, start?: string): StreamNode[] {
    const getText = (x: number) => {
      const asc = (start ?? '1').charCodeAt(0);
      const next = String.fromCharCode(asc + x);
      return next;
    };

    const nodes: StreamNode[] = indexes.map((ind, i) =>
      ({ id: guid(), index: i, text: getText(i), type: 'next', x: indexToX(ind, this.dx, this.offset) })
    );

    const i = nodes.length;

    if (this.isNumber(completeIndex) && completeIndex >= 0) {
      nodes.push(({ id: guid(), index: i, text: '|', type: 'complete', x: indexToX(completeIndex, this.dx, this.offset) }));
      return nodes;
    }

    if (this.isNumber(errorIndex) && errorIndex >= 0) {
      nodes.push(({ id: guid(), index: i, text: '#', type: 'error', x: indexToX(errorIndex, this.dx, this.offset) }));
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

  inputStream(indexes: number[], completeIndex?: number | null, errorIndex?: number | null, start?: string): InputStream {
    const stream = new InputStream(this.createNodes(indexes, completeIndex, errorIndex, start), this._config);
    return stream;
  }

  outputStream(output$: Observable<string | null>): Stream {
    const nodes$ = output$.pipe(
      tap((output) => this._logger.logDebug(`${this._name} >> outputStream`, { output })),
      bufferTime(100),
      tap((outputs) => this._logger.logDebug(`${this._name} >> outputStream`, { outputs })),
      map((outputs) => outputs.map<StreamNode>((x, i) => ({
        id: guid(),
        index: i,
        text: x ?? '-',
        type: x === '|' ? 'complete' : x === '#' ? 'error' : 'next',
        x: indexToX(i, this.dx, this.offset),
      }))),
      tap((nodes) => this._logger.logDebug(`${this._name} >> outputStream`, { nodes })),
      map((nodes) => nodes.reduce((p, c) => ({ ...p, [c.id]: c }), {})),
      shareReplay({ refCount: true, bufferSize: 1 }),
    );

    return new Stream(nodes$);
  }

  adjustStream(stream: InputStream, indexes: number[], completeIndex?: number | null, errorIndex?: number | null, start?: string): void {
    stream.setNodes(this.createNodes(indexes, completeIndex, errorIndex, start));
  }
}
