import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { v4 as guid } from 'uuid';
import { Injectable } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { distribute, indexToX, InputStream, isNextNotification, OutputStream, StreamNode } from '../core';
import { LoggerService, RuntimeService } from '../services';
import { FrameNotification } from '../types';

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
      ({ id: guid(), zIndex: i, display: getText(i), kind: 'N', x: indexToX(ind, this.dx, this.offset) })
    );

    const i = nodes.length;

    if (this.isNumber(completeIndex) && completeIndex >= 0) {
      nodes.push(({ id: guid(), zIndex: i, display: '|', kind: 'C', x: indexToX(completeIndex, this.dx, this.offset) }));
      return nodes;
    }

    if (this.isNumber(errorIndex) && errorIndex >= 0) {
      nodes.push(({ id: guid(), zIndex: i, display: '#', kind: 'E', x: indexToX(errorIndex, this.dx, this.offset) }));
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
    const stream = new InputStream(config, this.createNodes(indexes, completeIndex, errorIndex, start), this._logger);
    return stream;
  }

  defaultInputStream(): InputStream {
    if (this.frames === this._framesLarges) {
      return this.inputStream([2, 5, 8, 11, 14], this.defaultCompleteFrame);
    }

    return this.inputStream([1, 3, 6], this.defaultCompleteFrame);
  }

  outputStream(updater$: Observable<FrameNotification[]>): OutputStream {
    const config = { dx: this.dx, dy: this.dy, offset: this.offset, frames: this.frames };
    const stream = new OutputStream(config, this._logger);

    stream.setNodesUpdater(updater$.pipe(
      tap((notifications) => this._logger?.logDebug(`${this._name} >> setNodesUpdater >> updater$`, { notifications })),
      map((notifications) => notifications.map((x, i): StreamNode => ({
        id: guid(),
        kind: x.notification.kind,
        zIndex: i,
        x: this.offset + x.frame,
        display: isNextNotification(x.notification) ? x.notification.value : null,
      }))),
      tap((nodes) => this._logger?.logDebug(`${this._name} >> setNodesUpdater >> updater$`, { nodes })),
    ));

    return stream;
  }

  adjustStream(stream: InputStream, indexes: number[], completeIndex?: number | null, errorIndex?: number | null, start?: string): void {
    stream.setNodes(this.createNodes(indexes, completeIndex, errorIndex, start));
  }
}
