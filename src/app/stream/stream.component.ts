import { first, tap } from 'rxjs/operators';
import { Clipboard } from '@angular/cdk/clipboard';
import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { getBoundedX, range } from '../helpers';
import { InputStream, Stream, StreamNode } from '../stream';

const isInputStream = (stream: Stream | InputStream): stream is InputStream => !!(stream as InputStream)?.correct;

@Component({
  selector: 'app-stream',
  templateUrl: './stream.component.html',
  styleUrls: ['./stream.component.scss']
})
export class StreamComponent implements OnInit {
  protected _node: StreamNode = null;

  @Input() stream: Stream | InputStream;
  @Input() color = "rgb(62, 161, 203)";

  @ViewChild('svg') svg: ElementRef;

  nodeClass: string;

  constructor(
    protected _clipboard: Clipboard,
    protected _snackBar: MatSnackBar,
  ) { }

  protected getX(event: PointerEvent): number {
    const ctm: SVGMatrix = this.svg.nativeElement.getScreenCTM();
    return (event.clientX - ctm.e) / ctm.a;
  }

  ngOnInit(): void {
    this.nodeClass = 'node' + (isInputStream(this.stream) ? ' hover' : '');
  }

  range(size: number): number[] {
    return range(size);
  }

  openSnackBar(message: string, action?: string) {
    this._snackBar.open(message, action, { duration: 3000 });
  }

  copyMarblesToClipboard(): void {
    this.stream.marbles$.pipe(
      first(),
      tap((marbles) => this._clipboard.copy(marbles)),
      tap(() => this.openSnackBar('Marbles copied to the clipboard', 'Ok')),
    ).subscribe();
  }

  startDrag(node: StreamNode): void {
    this._node = node;
  }

  drag(event: PointerEvent): void {
    if (!!this._node && isInputStream(this.stream)) {
      event.preventDefault();
      const x = getBoundedX(this.getX(event));
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
