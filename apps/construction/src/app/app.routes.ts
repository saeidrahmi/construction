import { Route } from '@angular/router';
import { LoginComponent } from './login/login.component';

export const appRoutes: Route[] = [
  {
    path: 'login',
    loadComponent: () =>
      import('./login/login.component').then((mod) => mod.LoginComponent),
  },
];
