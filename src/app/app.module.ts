import { LayoutModule } from '@angular/cdk/layout';
import { ErrorHandler, NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatOptionModule } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS, MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { CodemirrorModule } from '@ctrl/ngx-codemirror';
import { ApplicationinsightsAngularpluginErrorService } from '@microsoft/applicationinsights-angularplugin-js';
import { environment } from '../environments/environment';
import { AppComponent } from './app.component';
import {
  FaqComponent, SandboxControllerComponent, SideNavComponent, StreamComponent, StreamControllerComponent,
  StreamOptionsComponent,
} from './components';
import { exampleProviders } from './examples';
import { routes } from './routes';
import { LOG_LEVEL, LogLevel } from './services/logger.service';

@NgModule({
  imports: [
    BrowserAnimationsModule,
    BrowserModule,
    CodemirrorModule,
    LayoutModule,
    MatButtonModule,
    MatCardModule,
    MatDialogModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatIconModule,
    MatMenuModule,
    MatOptionModule,
    MatRadioModule,
    MatSelectModule,
    MatSidenavModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatToolbarModule,
    MatTooltipModule,
    ReactiveFormsModule,
    RouterModule.forRoot(routes),
  ],
  declarations: [
    AppComponent,
    FaqComponent,
    SandboxControllerComponent,
    SideNavComponent,
    StreamComponent,
    StreamControllerComponent,
    StreamOptionsComponent,
  ],
  providers: [
    ...exampleProviders,
    { provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { appearance: 'outline' } },
    { provide: ErrorHandler, useClass: ApplicationinsightsAngularpluginErrorService },
    { provide: LOG_LEVEL, useValue: environment.production ? LogLevel.Warning : LogLevel.Debug },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
