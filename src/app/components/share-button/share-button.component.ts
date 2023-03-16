import { Component, Inject, Input } from '@angular/core';
import { Clipboard } from '@angular/cdk/clipboard';
import { Observable, tap } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LoggerService } from '../../logger.service';
import { first, map } from "rxjs/operators";
import { DOCUMENT } from "@angular/common";

@Component({
  selector: 'app-share-button',
  template: `
    <button
      mat-icon-button
      aria-label="URL to current example"
      (click)="copyToClipboard()"
    >
      <mat-icon>share</mat-icon>
    </button>
  `,
})
export class ShareButtonComponent {
  private readonly _name = 'ShareButtonComponent';

  @Input()
  url$!: Observable<string>;

  constructor(
    @Inject(DOCUMENT) private _document: Document,
    private _clipboard: Clipboard,
    private _snackBar: MatSnackBar,
    private _logger: LoggerService,
  ) { }

  copyToClipboard() {
    this.url$.pipe(
      first(),
      map((url) => `${this._document.location.origin}${url}`),
      tap((url) => this._logger.logDebug(this._name, 'Copying URL to clipboard', { url })),
      tap((url) => this._clipboard.copy(url)),
      tap(() => this._snackBar.open(
        'Current example URL copied to clipboard',
        'Ok',
        { duration: 3000 },
      )),
    ).subscribe();
  }
}
