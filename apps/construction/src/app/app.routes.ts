import { Route } from '@angular/router';
import { isUserAdmin } from './services/user-gaurds';

export const appRoutes: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('./home/home.component').then((com) => com.HomeComponent),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./login/login.component').then((com) => com.LoginComponent),
  },
  {
    path: 'admin',
    canActivate: [isUserAdmin],
    loadChildren: () =>
      import('./admin/admin.module').then((mod) => mod.AdminModule),
  },
];
