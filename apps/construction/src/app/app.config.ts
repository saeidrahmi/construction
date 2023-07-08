import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import {
  provideRouter,
  withEnabledBlockingInitialNavigation,
} from '@angular/router';
import { appRoutes } from './app.routes';
import { provideAnimations } from '@angular/platform-browser/animations';
import {
  HttpClientModule,
  provideHttpClient,
  withInterceptors,
  withNoXsrfProtection,
} from '@angular/common/http';
import { httpInterceptor } from './services/httpInterceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withInterceptors([httpInterceptor])),
    // importProvidersFrom(HttpClientModule),
    // or
    // provideHttpClient(
    //   withInterceptors([
    //     (req, next) => {
    //       console.log('Global interceptor');
    //       return next(req);
    //     },
    //   ])
    // ),
    provideRouter(appRoutes, withEnabledBlockingInitialNavigation()),
    provideAnimations(),
  ],
};
