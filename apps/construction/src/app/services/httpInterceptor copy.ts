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
import { ApiService } from './api.service';

export const httpInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const storageService = inject(StorageService);
  const apiService = inject(ApiService);
  let token = storageService.getJwtToken();
  if (!!token()) {
    req = req.clone({
      setHeaders: {
        Authorization: 'bearer ' + token(),
      },
    });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = '';
      if (error.error instanceof ErrorEvent) {
        errorMessage = `Client Side Error: ${error.error.message}`;
      } else {
        errorMessage = getErrorMessage(error);
        if (error.status == 401) apiService.logout().subscribe();
      }

      return throwError(() => new Error(errorMessage));
    })
  );
};

const getErrorMessage = (error: HttpErrorResponse): string => {
  switch (error.status) {
    case 400: {
      return (
        'Bad Request: The request was unacceptable. ' + error.error.errorMessage
      );
    }
    case 401: {
      return 'Unauthorized access. ' + error.error.errorMessage;
    }
    case 402: {
      return 'Request Failed: The parameters were valid but the request failed. ';
    }
    case 403: {
      return 'Forbidden access to resource: the API key does not have permissions to perform the request. ';
    }
    case 404: {
      return 'Resource not found.';
    }
    case 408: {
      return 'Request timed out. ';
    }
    case 429: {
      return 'Too Many Request by user.';
    }
    case 431: {
      return 'Request Header Fields Too Large. ';
    }

    case 500: {
      return 'Internal server error/exception. . ' + error.error.errorMessage;
    }
    case 503: {
      return 'Service is Unavailable. ';
    }
    default: {
      return 'Unknown error. ';
    }
  }
};
