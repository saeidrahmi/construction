import { ListPlansComponent } from './sadmin/plans/list-plans/list-plans.component';
import { Route } from '@angular/router';
import {
  isGeneralUser,
  isUserAdmin,
  isUserLoggedIn,
  isUserPasswordResetRequired,
} from './services/user-gaurds';
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
    path: 'reset-password',
    loadComponent: () =>
      import('./public/reset-password/reset-password.component').then(
        (com) => com.ResetPasswordComponent
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
    path: 'complete-reset-password/:token',
    loadComponent: () =>
      import(
        './public/complete-reset-password/complete-reset-password.component'
      ).then((com) => com.CompleteResetPasswordComponent),
  },

  {
    path: 'advertisements',
    loadComponent: () =>
      import('./public/advertisements-list/advertisements-list.component').then(
        (com) => com.AdvertisementsListComponent
      ),
  },
  {
    path: 'view-advertisement-details',
    loadComponent: () =>
      import(
        './common-components/advertisement-details-view/advertisement-details-view.component'
      ).then((com) => com.AdvertisementDetailsViewComponent),
  },

  {
    path: 'reset-expired-password',
    canActivate: [isUserPasswordResetRequired],
    loadComponent: () =>
      import(
        './public/reset-expired-password/reset-expired-password.component'
      ).then((com) => com.ResetExpiredPasswordComponent),
  },
  // {
  //   path: 'admin',
  //   canActivate: [isUserAdmin],
  //   loadChildren: () =>
  //     import('./admin/admin.module').then((mod) => mod.AdminModule),
  // },
  {
    path: 'admin',
    canActivate: [isUserAdmin],
    loadChildren: () =>
      import('./sadmin/sadmin.module').then((mod) => mod.AdminModule),
  },
  {
    path: 'general',
    canActivate: [isGeneralUser],
    loadChildren: () =>
      import('./generalUser/general.module').then((mod) => mod.GeneralModule),
  },
  {
    path: 'privacy-policy',
    component: PrivacyPolicyComponent,
  },
  {
    path: 'plans',
    loadComponent: () =>
      import('./public/list-plans/list-plans.component').then(
        (com) => com.ListPlansComponent
      ),
  },

  {
    path: '**',
    component: PageNotFoundComponent,
  },
];
