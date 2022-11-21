import { first, of, tap } from 'rxjs';
import { Clipboard } from '@angular/cdk/clipboard';
import { Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { Stream } from '../../core';
import { InsightsService, LoggerService, RuntimeService, StreamBuilderService } from '../../services';
import { StreamOptionsComponent } from '../stream-options/stream-options.component';

@Component({
  selector: 'app-stream-controller',
  templateUrl: './stream-controller.component.html',
  styleUrls: ['./stream-controller.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class StreamControllerComponent {
  @Input() stream: Stream = this._streamBuilder.defaultInputStream();
  @Input() canRemoveSource$ = of(false);
  @Input() hasOptions$ = of(false);

  @Output() removeStream = new EventEmitter<StreamControllerComponent>();

  mediaSize$ = this._runtimeSvc.mediaSize$;

  constructor(
    protected _streamBuilder: StreamBuilderService,
    protected _clipboard: Clipboard,
    protected _snackBar: MatSnackBar,
    protected _dialog: MatDialog,
    protected _insightsSvc: InsightsService,
    protected _runtimeSvc: RuntimeService,
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
    this._insightsSvc.startTrackPage('Stream Options');
    const dialog = this._dialog.open(StreamOptionsComponent, { data: { stream: this.stream } });

    dialog.afterClosed().pipe(
      first(),
      tap(() => this._insightsSvc.stopTrackPage('Stream Options')),
    ).subscribe();
  }

  remove(): void {
    this.removeStream.next(this);
  }
}
