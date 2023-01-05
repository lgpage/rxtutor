import { environment } from 'src/environments/environment';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AngularPlugin } from '@microsoft/applicationinsights-angularplugin-js';
import { ApplicationInsights } from '@microsoft/applicationinsights-web';

@Injectable({ providedIn: 'root' })
export class InsightsService {
  protected _appInsights: ApplicationInsights | undefined;

  protected createInsights(router: Router): ApplicationInsights {
    const angularPlugin = new AngularPlugin();

    return new ApplicationInsights({
      config: {
        connectionString: environment.appInsightsConnectionString,
        extensions: [angularPlugin],
        extensionConfig: { [angularPlugin.identifier]: { router } }
      }
    });
  }

  init(router: Router): void {
    this._appInsights = this.createInsights(router);
    this._appInsights.loadAppInsights();
  }

  startTrackPage(name?: string): void {
    this._appInsights?.startTrackPage(name);
  }

  stopTrackPage(name?: string, url?: string, customProperties?: { [key: string]: any }, measurements?: { [key: string]: number }): void {
    this._appInsights?.stopTrackPage(name, url, customProperties, measurements);
  }

  startTrackEvent(name?: string): void {
    this._appInsights?.startTrackEvent(name);
  }

  stopTrackEvent(name: string, properties?: { [key: string]: string }, measurements?: { [key: string]: number }): void {
    this._appInsights?.stopTrackEvent(name, properties, measurements);
  }
}
