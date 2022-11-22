import { Observable } from 'rxjs';
import { bufferTime, map, shareReplay, tap } from 'rxjs/operators';
import { v4 as guid } from 'uuid';
import { Injectable } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { distribute, indexToX, InputStream, Stream, StreamNode } from '../core';
import { LoggerService, RuntimeService } from '../services';

@Injectable({ providedIn: 'root' })
@UntilDestroy()
export class StreamBuilderService {
  protected _name = 'StreamBuilderService';

  protected _framesSmall = 8;
  protected _framesLarges = 18;
  protected _frames = this._framesSmall;

  dx = 10;
  dy = 10;
  offset = 3;

  get frames(): number {
    return this._frames;
  }

  get defaultCompleteFrame(): number {
    return this.frames === this._framesLarges ? this.frames - 3 : this.frames - 1;
  }

  constructor(
    protected _runtimeSvc: RuntimeService,
    protected _logger: LoggerService,
  ) {
    this._runtimeSvc.exampleSize$.pipe(
      tap((size) => this._frames = (size === 'small' ? this._framesSmall : this._framesLarges)),
      untilDestroyed(this),
    ).subscribe();
  }

  protected isNumber(x?: number | null): x is number {
    return x !== null && x !== undefined && !isNaN(+x);
  }

  protected createNodes(indexes: number[], completeIndex?: number | null, errorIndex?: number | null, start?: string): StreamNode[] {
    const startAsc = (start ?? '1').charCodeAt(0);

    const getText = (x: number) => {
      const next = String.fromCharCode(startAsc + x);
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

    return distribute(0, this.defaultCompleteFrame - 1, size);
  }

  inputStream(indexes: number[], completeIndex?: number | null, errorIndex?: number | null, start?: string): InputStream {
    const config = { dx: this.dx, dy: this.dy, offset: this.offset, frames: this.frames };
    const stream = new InputStream(config, this.createNodes(indexes, completeIndex, errorIndex, start));
    return stream;
  }

  defaultInputStream(): InputStream {
    if (this.frames === this._framesLarges) {
      return this.inputStream([2, 5, 8, 11, 14], this.defaultCompleteFrame);
    }

    return this.inputStream([1, 3, 6], this.defaultCompleteFrame);
  }

  outputStream(output$: Observable<any | null>): Stream {
    const nodes$ = output$.pipe(
      tap((output) => this._logger.logDebug(`${this._name} >> outputStream`, { output })),
      bufferTime(100),
      tap((outputs) => this._logger.logDebug(`${this._name} >> outputStream`, { outputs })),
      map((outputs) => outputs.map<StreamNode>((x, i) => {
        const value = `${x}`;
        const node: StreamNode = {
          id: guid(),
          index: i,
          text: value ?? '-',
          type: value === '|' ? 'complete' : value === '#' ? 'error' : 'next',
          x: indexToX(i, this.dx, this.offset),
        }

        if (value.length > 3) {
          node.text = `${i + 1}`;
          node.payload = value;
        }

        return node;
      })),
      tap((nodes) => this._logger.logDebug(`${this._name} >> outputStream`, { nodes })),
      map((nodes) => nodes.reduce((p, c) => ({ ...p, [c.id]: c }), {})),
      shareReplay({ refCount: true, bufferSize: 1 }),
    );

    const config = { dx: this.dx, dy: this.dy, offset: this.offset, frames: this.frames };
    return new Stream(config, nodes$);
  }

  adjustStream(stream: InputStream, indexes: number[], completeIndex?: number | null, errorIndex?: number | null, start?: string): void {
    stream.setNodes(this.createNodes(indexes, completeIndex, errorIndex, start));
  }
}
