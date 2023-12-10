import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError, pipe } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { StorageService } from './storage.service';
import { ApiService } from './api.service';

@Injectable()
export class AppHttpInterceptor implements HttpInterceptor {
  constructor(
    private storageService: StorageService,
    private apiService: ApiService
  ) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    let token = this.storageService.getJwtToken();

    if (token) {
      req = req.clone({
        setHeaders: {
          Authorization: 'Bearer ' + token(),
        },
      });
    }

    return next.handle(req).pipe(
      catchError((error: any) => {
        if (error instanceof HttpErrorResponse && error.status === 401) {
          return this.handle401Error(req, next);
        } else {
          const errorMessage = this.getErrorMessage(error);
          return throwError(errorMessage);
        }
      })
    );
  }

  private handle401Error(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return this.apiService.refreshToken().pipe(
      switchMap((response: any) => {
        const newAccessToken = response;
        this.storageService.updateJwtToken(newAccessToken); // Set the new access token

        request = request.clone({
          setHeaders: {
            Authorization: 'Bearer ' + newAccessToken,
          },
        });

        return next.handle(request);
      }),
      catchError((error: any) => {
        // Handle refresh token error or logout user
        this.apiService.logout().subscribe();
        return throwError(error);
      })
    );
  }

  private getErrorMessage(error: HttpErrorResponse): string {
    switch (error.status) {
      case 400: {
        return (
          'Bad Request: The request was unacceptable. ' +
          error.error.errorMessage
        );
      }
      case 401: {
        return 'Unauthorized access. ' + error.error.errorMessage;
      }
      case 402: {
        return 'Request Failed. ' + error.error.errorMessage;
      }
      case 403: {
        return 'Forbidden access to resource: ' + error.error.errorMessage;
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
  }
}
