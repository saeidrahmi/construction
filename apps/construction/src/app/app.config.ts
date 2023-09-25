import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import {
  provideRouter,
  withEnabledBlockingInitialNavigation,
} from '@angular/router';
import { appRoutes } from './app.routes';
import {
  BrowserAnimationsModule,
  provideAnimations,
} from '@angular/platform-browser/animations';
import {
  HttpClientModule,
  provideHttpClient,
  withInterceptors,
  withNoXsrfProtection,
} from '@angular/common/http';
import { httpInterceptor } from './services/httpInterceptor';
import { NgIdleKeepaliveModule } from '@ng-idle/keepalive';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { ToastrModule } from 'ngx-toastr';
import { BrowserModule } from '@angular/platform-browser';

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
    importProvidersFrom([
      NgIdleKeepaliveModule.forRoot(),
      NgbTooltipModule,
      ToastrModule.forRoot(),
    ]),
  ],
};
