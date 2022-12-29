import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { InsightsService, RuntimeService } from './services';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  mediaSize$ = this._runtimeSvc.mediaSize$;

  constructor(
    protected _router: Router,
    protected _insightsSvc: InsightsService,
    protected _runtimeSvc: RuntimeService,
  ) {
    this._insightsSvc.init(this._router);
  }
}
