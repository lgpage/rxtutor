import { Component, ElementRef, Input, ViewChild } from '@angular/core';
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

  protected getBoundedX(x: number): number {
    return Math.max(15, Math.min(105, x));
  }

  range(size: number): number[] {
    return [...Array(size).keys()].map((x) => x);
  }

  startDrag(node: StreamNode): void {
    this._node = node;
  }

  drag(event: PointerEvent): void {
    if (!!this._node) {
      event.preventDefault();
      const x = this.getBoundedX(this.getX(event));
      this.stream.updateNode({ ...this._node, x, index: 99 });
    }
  }

  endDrag(event: PointerEvent): void {
    if (!!this._node) {
      const x = this.getBoundedX(15 + Math.round((this.getX(event) - 15) / 10) * 10);
      this.stream.updateNode({ ...this._node, x });
      this.stream.correct();
    }

    this._node = null;
  }
}
