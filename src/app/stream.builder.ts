import { v4 as guid } from 'uuid';
import { Injectable } from '@angular/core';
import { Stream, StreamNode } from './stream';

@Injectable({ providedIn: 'root' })
export class StreamBuilder {
  protected isNumber(x?: number): boolean {
    return x !== null && x !== undefined && !isNaN(+x);
  }

  protected createNodes(indexes: number[], completeIndex?: number, errorIndex?: number, prefix?: string): StreamNode[] {
    const getPrefix = (x: number) => `${(prefix ?? "")[0] ?? ""}${x + 1}`;

    const nodes: StreamNode[] = indexes.map((pos, i) =>
      ({ id: guid(), index: i, text: getPrefix(i), type: 'next', x: 15 + (10 * pos) })
    );

    const i = nodes.length;

    if (this.isNumber(completeIndex) && completeIndex >= 0) {
      nodes.push(({ id: guid(), index: i, text: 'C', type: 'complete', x: 15 + (10 * completeIndex) }));
      return nodes;
    }

    if (this.isNumber(errorIndex) && errorIndex >= 0) {
      nodes.push(({ id: guid(), index: i, text: 'E', type: 'error', x: 15 + (10 * errorIndex) }));
      return nodes;
    }

    return nodes;
  }

  create(indexes: number[], completeIndex?: number, errorIndex?: number, prefix?: string): Stream {
    const stream = new Stream(this.createNodes(indexes, completeIndex, errorIndex, prefix));
    stream.correct();

    return stream;
  }
}
