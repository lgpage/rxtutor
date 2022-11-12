import { Routes } from '@angular/router';
import { FaqComponent, SandboxControllerComponent } from './components';

export const routes: Routes = [
  { path: '', component: SandboxControllerComponent },
  { path: 'faq', component: FaqComponent },
  { path: '**', redirectTo: '' },
];
