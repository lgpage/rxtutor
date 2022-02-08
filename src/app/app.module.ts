import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { CodemirrorModule } from '@ctrl/ngx-codemirror';
import { AppComponent } from './app.component';
import { StreamComponent } from './stream/stream.component';

@NgModule({
  imports: [
    BrowserModule,
    CodemirrorModule,
    ReactiveFormsModule,
  ],
  declarations: [
    AppComponent,
    StreamComponent
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
