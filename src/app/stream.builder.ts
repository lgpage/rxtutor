import { v4 as guid } from 'uuid';
import { Injectable } from '@angular/core';
import { distribute, indexToX } from './helpers';
import { InputStream, StreamNode } from './stream';

@Injectable({ providedIn: 'root' })
export class StreamBuilder {
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

  create(indexes: number[], completeIndex?: number, errorIndex?: number, start?: string): InputStream {
    const stream = new InputStream(this.createNodes(indexes, completeIndex, errorIndex, start));
    return stream;
  }

  getDistributedIndexes(size: number): number[] {
    if (size === 0) {
      return [];
    }

    return distribute(0, 9, size);
  }

  adjustStream(stream: InputStream, indexes: number[], completeIndex?: number, errorIndex?: number, start?: string): void {
    stream.setNodes(this.createNodes(indexes, completeIndex, errorIndex, start));
  }
}
