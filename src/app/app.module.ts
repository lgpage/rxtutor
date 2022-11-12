import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatOptionModule } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
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
import { AppComponent } from './app.component';
import {
  FaqComponent, SandboxControllerComponent, SideNavComponent, StreamComponent, StreamControllerComponent,
  StreamOptionsComponent,
} from './components';
import { exampleProviders } from './examples';
import { routes } from './routes';
import { STREAM_CONFIG } from './services';
import { StreamConfig } from './types';

const DEFAULT_STREAM_CONFIG: StreamConfig = {
  dx: 10,
  dy: 10,
  offset: 3,
  frames: 15,
}

@NgModule({
  imports: [
    BrowserAnimationsModule,
    BrowserModule,
    CodemirrorModule,
    RouterModule.forRoot(routes),
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
    { provide: STREAM_CONFIG, useValue: DEFAULT_STREAM_CONFIG },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
