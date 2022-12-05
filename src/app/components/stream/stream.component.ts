import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { getBoundedX, InputStream, OutputStream, range, roundOff, Stream, StreamNode } from '../../core';

const isInputStream = (stream: InputStream | OutputStream | Stream | undefined): stream is InputStream =>
  !!(stream as InputStream)?.updateNode;

@Component({
  selector: 'app-stream',
  templateUrl: './stream.component.html',
  styleUrls: ['./stream.component.scss']
})
export class StreamComponent implements OnInit {
  protected _node: StreamNode | null = null;

  @Input() stream: InputStream | OutputStream | Stream | undefined;
  @Input() color: 'primary' | 'accent' = 'accent';

  @ViewChild('svg') svg: ElementRef | undefined;

  dx: number | undefined;
  dy: number | undefined;
  offset: number | undefined;
  frames: number | undefined;
  radius: number | undefined;
  streamLine: number | undefined;
  viewBox: number[] | undefined;

  nodeClass: string | undefined;

  constructor(
    protected _snackBar: MatSnackBar,
  ) { }

  protected getX(event: PointerEvent): number {
    const ctm: SVGMatrix = this.svg!.nativeElement.getScreenCTM();
    return (event.clientX - ctm.e) / ctm.a;
  }

  ngOnInit(): void {
    this.nodeClass = 'node' + (isInputStream(this.stream) ? ' hover' : '');

    if (this.stream) {
      this.dx = this.stream.dx;
      this.dy = this.stream.dy;
      this.offset = this.stream.offset;
      this.frames = this.stream.frames;
      this.radius = roundOff(0.8 * (this.dx / 2), 1);
      this.streamLine = (this.frames * this.dx) + (2 * this.offset);
      this.viewBox = [0, 3, this.streamLine + 3, 15];
    }
  }

  range(size: number): number[] {
    return range(size);
  }

  startDrag(node: StreamNode): void {
    this._node = node;
  }

  drag(event: PointerEvent): void {
    if (!!this._node && isInputStream(this.stream)) {
      event.preventDefault();
      const x = getBoundedX(this.getX(event), this.dx!, this.frames!, this.offset!);
      this.stream.updateNode({ ...this._node, x, zIndex: 99 });
    }
  }

  endDrag(): void {
    if (!!this._node && isInputStream(this.stream)) {
      this.stream.correct();
    }

    this._node = null;
  }
}
