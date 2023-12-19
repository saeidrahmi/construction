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
    path: 'user-advertisements',
    loadComponent: () =>
      import(
        './public/user-advertisements/user-advertisements-list.component'
      ).then((com) => com.UserAdvertisementsListComponent),
  },
  {
    path: 'user-ratings-details',
    loadComponent: () =>
      import('./public/view-reviews/view-reviews.component').then(
        (com) => com.ViewReviewsComponent
      ),
  },
  {
    path: 'top-add-info',
    loadComponent: () =>
      import('./public/top-ad-info/top-ad-info.component').then(
        (com) => com.TopAdInfoComponent
      ),
  },
  {
    path: 'map-location',
    loadComponent: () =>
      import('./public/select-map-location/select-map-location.component').then(
        (com) => com.SelectMapLocationComponent
      ),
  },
  {
    path: 'view-advertisement-details',
    loadComponent: () =>
      import(
        './common-components/advertisement/advertisement-details-view/advertisement-details-view.component'
      ).then((com) => com.AdvertisementDetailsViewComponent),
  },
  {
    path: 'rfps',
    loadComponent: () =>
      import('./public/rfp-list/rfp-list.component').then(
        (com) => com.RfpListComponent
      ),
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
    path: 'rfps',
    loadComponent: () =>
      import('./public/rfps/rfps.component').then((com) => com.RfpsComponent),
  },
  {
    path: 'contact-us',
    loadComponent: () =>
      import('./public/contact-us/contact-us.component').then(
        (com) => com.ContactUsComponent
      ),
  },
  {
    path: 'faqs',
    loadComponent: () =>
      import('./public/faq/faq.component').then((com) => com.FaqComponent),
  },
  {
    path: 'terms-conditions',
    loadComponent: () =>
      import('./public/terms-conditions/terms-conditions.component').then(
        (com) => com.TermsConditionsComponent
      ),
  },
  {
    path: 'about-us',
    loadComponent: () =>
      import('./public/about-us/about-us.component').then(
        (com) => com.AboutUsComponent
      ),
  },
  {
    path: 'cookie-policy',
    loadComponent: () =>
      import('./public/cookie-policy/cookie-policy.component').then(
        (com) => com.CookiePolicyComponent
      ),
  },
  {
    path: '**',
    component: PageNotFoundComponent,
  },
];
