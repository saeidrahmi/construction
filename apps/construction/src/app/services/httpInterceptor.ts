// import {
//   HttpInterceptorFn,
//   HttpRequest,
//   HttpHandlerFn,
//   HttpEvent,
//   HttpErrorResponse,
//   HttpHandler,
// } from '@angular/common/http';
// import { inject } from '@angular/core';
// import { Observable, catchError, switchMap, throwError } from 'rxjs';
// import { StorageService } from './storage.service';
// import { ApiService } from './api.service';

// export const httpInterceptor: HttpInterceptorFn = (
//   req: HttpRequest<unknown>,
//   next: HttpHandlerFn
// ): Observable<HttpEvent<unknown>> => {
//   const storageService = inject(StorageService);
//   const apiService = inject(ApiService);
//   let token = storageService.getJwtToken();
//   if (!!token()) {
//     req = req.clone({
//       setHeaders: {
//         Authorization: 'bearer ' + token(),
//       },
//     });
//   }

//   return next(req).pipe(
//     catchError((error: HttpErrorResponse) => {
//       let errorMessage = '';
//       if (error.error instanceof ErrorEvent) {
//         errorMessage = `Client Side Error: ${error.error.message}`;
//       } else {
//         errorMessage = getErrorMessage(error);
//         if (error.status == 401) apiService.logout().subscribe();
//       }
//       console.log('interceptor error', errorMessage);
//       return throwError(() => new Error(errorMessage));
//     })
//   );
// };

// const getErrorMessage = (error: HttpErrorResponse): string => {
//   switch (error.status) {
//     case 400: {
//       return (
//         'Bad Request: The request was unacceptable. ' + error.error.errorMessage
//       );
//     }
//     case 401: {
//       return (
//         'Unauthorized/unauthenticated access to server. ' +
//         error.error.errorMessage
//       );
//     }
//     case 402: {
//       return 'Request Failed: The parameters were valid but the request failed. ';
//     }
//     case 403: {
//       return 'Forbiden access to resource: the API key does not have permissions to perform the request. ';
//     }
//     case 404: {
//       return 'Resource not found.';
//     }
//     case 408: {
//       return 'Request timed out ';
//     }
//     case 429: {
//       return 'Too Many Request by user';
//     }
//     case 431: {
//       return 'Request Header Fields Too Large ';
//     }

//     case 500: {
//       return 'Internal server error/exception ';
//     }
//     case 503: {
//       return 'Service Unavailable ';
//     }
//     default: {
//       return 'Unknown error ';
//     }
//   }
// };

// export function handle401Error(
//   interceptor: httpInterceptor,
//   request: HttpRequest<any>,
//   next: HttpHandler
// ): Observable<HttpEvent<any>> {
//   return interceptor.apiService.refreshToken().pipe(
//     switchMap((response: any) => {
//       const newAccessToken = response.accessToken;
//       interceptor.storageService.setJwtToken(newAccessToken); // Set the new access token

//       request = request.clone({
//         setHeaders: {
//           Authorization: 'Bearer ' + newAccessToken,
//         },
//       });

//       return next.handle(request);
//     }),
//     catchError((error: any) => {
//       // Handle refresh token error or logout user
//       interceptor.apiService.logout().subscribe();
//       return throwError('Unauthorized Access');
//     })
//   );
// }
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
          let errorMessage = this.getErrorMessage(error);
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
        return throwError('Unauthorized Access');
      })
    );
  }

  private getErrorMessage(error: HttpErrorResponse): string {
    switch (error.status) {
      // Define error messages based on status codes
      // ...
      default:
        return 'Unknown error';
    }
  }
}
