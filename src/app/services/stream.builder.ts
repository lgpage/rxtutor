import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { v4 as guid } from 'uuid';
import { Injectable } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import {
  distribute, FrameNotification, getMarbleNotifications, getStreamNodes, indexToX, InputMarbles, InputStream,
  OutputStream, StreamNode,
} from '../core';
import { LoggerService } from '../logger.service';
import { RuntimeService } from './runtime.service';

@Injectable({ providedIn: 'root' })
@UntilDestroy()
export class StreamBuilderService {
  protected _name = 'StreamBuilderService';

  protected _framesSmall = 8;
  protected _framesLarges = 18;
  protected _frames = this._framesSmall;
  protected _frameSize = 1;

  dx = 10;
  dy = 10;
  offset = 3;

  get frames(): number {
    return this._frames;
  }

  get frameSize(): number {
    return this._frameSize;
  }

  get defaultCompleteFrame(): number {
    return this.frames === this._framesLarges ? this.frames - 3 : this.frames - 1;
  }

  constructor(
    protected _runtimeSvc: RuntimeService,
    protected _logger: LoggerService,
  ) {
    this._runtimeSvc.exampleSize$.pipe(
      tap((size) => this.setFrames(size)),
      untilDestroyed(this),
    ).subscribe();
  }

  protected isNumber(x?: number | null): x is number {
    return x !== null && x !== undefined && !isNaN(+x);
  }

  protected createNodes({ marbles, values, error }: InputMarbles): StreamNode[] {
    const notifications = getMarbleNotifications(marbles, values, error, this.frameSize);
    return getStreamNodes(notifications, this.frameSize, this.dx, this.dy);
  }

  protected indexesToNodes(
    indexes: number[],
    completeIndex?: number | null,
    errorIndex?: number | null,
    start?: string
  ): StreamNode[] {
    const startAsc = (start ?? '1').charCodeAt(0);

    const getSymbol = (x: number) => {
      const next = String.fromCharCode(startAsc + x);
      return next;
    };

    const nodes: StreamNode[] = indexes.map((ind, i) => {
      const symbol = getSymbol(i);
      return { id: guid(), zIndex: i, symbol, kind: 'N', value: symbol, x: indexToX(ind, this.dx, this.offset) };
    });

    const i = nodes.length;

    if (this.isNumber(completeIndex) && completeIndex >= 0) {
      nodes.push(({ id: guid(), zIndex: i, symbol: '|', kind: 'C', x: indexToX(completeIndex, this.dx, this.offset) }));
      return nodes;
    }

    if (this.isNumber(errorIndex) && errorIndex >= 0) {
      nodes.push(({ id: guid(), zIndex: i, symbol: '#', kind: 'E', x: indexToX(errorIndex, this.dx, this.offset) }));
      return nodes;
    }

    return nodes;
  }

  setFrames(size: 'small' | 'large'): void {
    this._frames = (size === 'small' ? this._framesSmall : this._framesLarges);
  }

  getDistributedIndexes(size: number): number[] {
    if (size === 0) {
      return [];
    }

    return distribute(0, this.defaultCompleteFrame - 1, size);
  }

  inputStream(marbles: InputMarbles): InputStream {
    const config = { dx: this.dx, dy: this.dy, offset: this.offset, frames: this.frames };
    const stream = new InputStream(config, this.createNodes(marbles), this._logger);
    return stream;
  }

  defaultInputStream(): InputStream {
    if (this.frames === this._framesLarges) {
      return this.inputStream({ marbles: '--1--2--3--4--5|' });
    }

    return this.inputStream({ marbles: '-1-2--3|' });
  }

  outputStream(updater$: Observable<FrameNotification[]>): OutputStream {
    const config = { dx: this.dx, dy: this.dy, offset: this.offset, frames: this.frames };
    const stream = new OutputStream(config, this._logger);

    stream.setNodesUpdater(updater$.pipe(
      tap((notifications) => this._logger?.logDebug(`${this._name} >> setNodesUpdater >> updater$`, { notifications })),
      map((notifications) => getStreamNodes(notifications, this.frameSize, this.dx, this.dy)),
      tap((nodes) => this._logger?.logDebug(`${this._name} >> setNodesUpdater >> updater$`, { nodes })),
    ));

    return stream;
  }

  adjustStream(stream: InputStream, indexes: number[], completeIndex?: number | null, errorIndex?: number | null, start?: string): void {
    stream.setNodes(this.indexesToNodes(indexes, completeIndex, errorIndex, start));
  }
}
