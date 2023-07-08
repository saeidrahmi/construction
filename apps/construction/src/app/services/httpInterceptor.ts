import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { StorageService } from './storage.service';

export const httpInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const storageService = inject(StorageService);
  let token = storageService.getJwtToken();
  if (token()) {
    req = req.clone({
      setHeaders: {
        Authorization: 'bearer ' + token,
      },
    });
  }
  console.log('interceptor token', token(), 'req', req);
  // return next(req);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let erroMessage = '';
      if (error.error instanceof ErrorEvent) {
        erroMessage = `Client Side Error: ${error.error.message}`;
      } else {
        erroMessage = getErrorMessage(error);
      }
      console.log('interceptor error', erroMessage);
      return throwError(() => new Error(erroMessage));
    })
  );
};

const getErrorMessage = (error: HttpErrorResponse): string => {
  switch (error.status) {
    case 400: {
      // this.userService.logout();

      return 'Bad Request: The request was unacceptable, often due to missing a required parameter. ';
    }
    case 401: {
      // this.userService.logout();

      return (
        'Unauthorized/unauthenticated access to server. ' + error.error.message
      );

      //clean up and logout user and route to login page
    }
    case 402: {
      //  this.userService.logout();

      return (
        'Request Failed: The parameters were valid but the request failed. ' +
        error.error.message
      );

      //clean up and logout user and route to login page
    }
    case 403: {
      //this.userService.logout();

      return (
        'Forbiden access to resource: the API key does not have permissions to perform the request. ' +
        error.error.message
      );
    }
    case 404: {
      return 'Resouce not found.';
    }
    case 408: {
      return 'Request timed out ';
    }
    case 429: {
      return 'Too Many Request by user';
    }
    case 431: {
      return 'Request Header Fields Too Large ';
    }

    case 500: {
      return 'Internal server error/exception ';
    }
    case 503: {
      return 'Service Unavailable ' + error.error.message;
    }
    default: {
      console.log(error);
      return 'Unknown error ';
    }
  }
};
