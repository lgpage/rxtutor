import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { getBoundedX, range } from '../helpers';
import { Stream, StreamNode } from '../stream';

@Component({
  selector: 'app-stream',
  templateUrl: './stream.component.html',
  styleUrls: ['./stream.component.scss']
})
export class StreamComponent {
  protected _node: StreamNode = null;

  @Input() stream: Stream;
  @Input() color = "rgb(62, 161, 203)";

  @ViewChild('svg') svg: ElementRef;

  protected getX(event: PointerEvent): number {
    const ctm: SVGMatrix = this.svg.nativeElement.getScreenCTM();
    return (event.clientX - ctm.e) / ctm.a;
  }

  range(size: number): number[] {
    return range(size);
  }

  startDrag(node: StreamNode): void {
    this._node = node;
  }

  drag(event: PointerEvent): void {
    if (!!this._node) {
      event.preventDefault();
      const x = getBoundedX(this.getX(event));
      this.stream.updateNode({ ...this._node, x, index: 99 });
    }
  }

  endDrag(): void {
    if (!!this._node) {
      this.stream.correct();
    }

    this._node = null;
  }
}
