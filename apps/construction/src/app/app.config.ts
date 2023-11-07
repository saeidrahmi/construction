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
  HTTP_INTERCEPTORS,
  HttpClientModule,
  provideHttpClient,
  withInterceptors,
  withNoXsrfProtection,
} from '@angular/common/http';
import { AppHttpInterceptor } from './services/httpInterceptor';
import { NgIdleKeepaliveModule } from '@ng-idle/keepalive';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { ToastrModule } from 'ngx-toastr';
import { IConfig, provideEnvironmentNgxMask } from 'ngx-mask';

export const appConfig: ApplicationConfig = {
  providers: [
    //provideHttpClient(withInterceptors([httpInterceptor])),

    { provide: HTTP_INTERCEPTORS, useClass: AppHttpInterceptor, multi: true },
    provideRouter(appRoutes, withEnabledBlockingInitialNavigation()),
    provideAnimations(),
    provideEnvironmentNgxMask(),
    importProvidersFrom([
      HttpClientModule,
      NgIdleKeepaliveModule.forRoot(),
      NgbTooltipModule,
      ToastrModule.forRoot(),
    ]),
  ],
};
