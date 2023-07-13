import { Route } from '@angular/router';
import { isUserAdmin } from './services/user-gaurds';

export const appRoutes: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('./public/home/home.component').then((com) => com.HomeComponent),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./public/login/login.component').then(
        (com) => com.LoginComponent
      ),
  },
  {
    path: 'signup',
    loadComponent: () =>
      import('./public/signup/signup.component').then(
        (com) => com.SignupComponent
      ),
  },
  {
    path: 'register/:token',
    loadComponent: () =>
      import('./public/register/register.component').then(
        (com) => com.RegisterComponent
      ),
  },
  {
    path: 'admin',
    canActivate: [isUserAdmin],
    loadChildren: () =>
      import('./admin/admin.module').then((mod) => mod.AdminModule),
  },
];
