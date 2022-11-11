import { STREAM_CONFIG } from 'src/app/services';
import { StreamConfig } from 'src/app/types';
import { Component, ElementRef, Inject, Input, OnInit, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { getBoundedX, InputStream, range, roundOff, Stream, StreamNode } from '../../core';

const isInputStream = (stream: Stream | InputStream | undefined): stream is InputStream => !!(stream as InputStream)?.correct;

@Component({
  selector: 'app-stream',
  templateUrl: './stream.component.html',
  styleUrls: ['./stream.component.scss']
})
export class StreamComponent implements OnInit {
  protected _node: StreamNode | null = null;

  @Input() stream: Stream | InputStream | undefined;
  @Input() color: 'primary' | 'accent' = 'accent';

  @ViewChild('svg') svg: ElementRef | undefined;

  nodeClass: string | undefined;

  dx = this._config.dx;
  dy = this._config.dy;
  offset = this._config.offset;
  frames = this._config.frames;
  radius = roundOff(0.8 * (this.dx / 2), 1);
  streamLine = (this.frames * this.dx) + (2 * this.offset);
  viewBox = [0, 2, this.streamLine + 3, 15];

  constructor(
    @Inject(STREAM_CONFIG) private _config: StreamConfig,
    protected _snackBar: MatSnackBar,
  ) { }

  protected getX(event: PointerEvent): number {
    const ctm: SVGMatrix = this.svg!.nativeElement.getScreenCTM();
    return (event.clientX - ctm.e) / ctm.a;
  }

  ngOnInit(): void {
    this.nodeClass = 'node' + (isInputStream(this.stream) ? ' hover' : '');
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
      const x = getBoundedX(this.getX(event), this.dx, this.frames, this.offset);
      this.stream.updateNode({ ...this._node, x, index: 99 });
    }
  }

  endDrag(): void {
    if (!!this._node && isInputStream(this.stream)) {
      this.stream.correct();
    }

    this._node = null;
  }
}
