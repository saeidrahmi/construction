import { Route } from '@angular/router';
import { isUserAdmin } from './services/user-gaurds';
import { PrivacyPolicyComponent } from './public/privacy-policy/privacy-policy.component';
import { PageNotFoundComponent } from './public/page-not-found/page-not-found.component';

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
      import('./register/register.component').then(
        (com) => com.RegisterComponent
      ),
  },
  {
    path: 'admin',
    canActivate: [isUserAdmin],
    loadChildren: () =>
      import('./admin/admin.module').then((mod) => mod.AdminModule),
  },
  {
    path: 'privacy-policy',
    component: PrivacyPolicyComponent,
  },
  {
    path: '**',
    component: PageNotFoundComponent,
  },
];
