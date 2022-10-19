import { first, of, tap } from 'rxjs';
import { LoggerService } from 'src/app/services';
import { Clipboard } from '@angular/cdk/clipboard';
import { Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { StreamBuilderService } from '../../services/stream.builder';
import { StreamOptionsComponent } from '../stream-options/stream-options.component';

@Component({
  selector: 'app-stream-controller',
  templateUrl: './stream-controller.component.html',
  styleUrls: ['./stream-controller.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class StreamControllerComponent {
  @Input() stream = this._streamBuilder.inputStream([2, 5, 8], 10);
  @Input() canRemoveSource$ = of(true);

  @Output() removeStream = new EventEmitter<StreamControllerComponent>();

  constructor(
    protected _streamBuilder: StreamBuilderService,
    protected _clipboard: Clipboard,
    protected _snackBar: MatSnackBar,
    protected _dialog: MatDialog,
    protected _logger: LoggerService,
  ) { }

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

  showOptions(): void {
    this._dialog.open(StreamOptionsComponent, { data: { stream: this.stream } });
  }

  remove(): void {
    this.removeStream.next(this);
  }
}
