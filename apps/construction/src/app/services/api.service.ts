import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import {
  Observable,
  catchError,
  delay,
  finalize,
  map,
  of,
  take,
  tap,
  timeout,
} from 'rxjs';
import { LoginCredential } from '../models/login';

import { EnvironmentInfo } from '../../../../../libs/common/src/models/common';
import { UserInterface } from '../models/user';
import { StorageService } from './storage.service';
import { UserApiResponseInterface } from '../../../../../libs/common/src/models/user-response';
import { Router } from '@angular/router';
import { UserRoutingService } from './user-routing.service';
import { ToastrService } from 'ngx-toastr';
import { EncryptionService } from './encryption-service';
@Injectable({
  providedIn: 'root',
})
export class ApiService {
  env: EnvironmentInfo = new EnvironmentInfo();
  apiTimeoutValue = this.env.apiTimeoutValue();
  storageService = inject(StorageService);
  toastService = inject(ToastrService);
  encryptionService = inject(EncryptionService);
  user = this.storageService.getUser();
  router = inject(Router);
  userRouting = inject(UserRoutingService);
  backendApiUrl: string = `${this.env.apiUrl()}:${this.env.apiPort()}`;
  constructor(private httpClient: HttpClient) {}

  login(credential: LoginCredential): Observable<UserApiResponseInterface> {
    const encryptedCredentials = this.encryptionService.encryptCredentials(
      credential?.userId,
      credential?.password
    );

    return this.httpClient
      .post(this.backendApiUrl + '/users/login', {
        credentials: encryptedCredentials,
      })
      .pipe(
        take(1),
        delay(400),
        finalize(() => {
          this.storageService.updateIsLoading(false);
        }),
        tap((response: UserApiResponseInterface) => {
          this.storageService.updateStateLoginSuccessful(response);
          this.userRouting.navigateToUserMainPage();
        }),
        catchError((error) => {
          this.toastService.error(error.message, 'Login Failed', {
            timeOut: 3000,
            positionClass: 'toast-top-right',
            closeButton: true,
            progressBar: true,
          }); // Display an error toast
          this.storageService.updateStateLoginFailure(error?.message);
          return of(error.message);
        })
      );
  }
  logout(): Observable<any> {
    if (this.user()?.userId)
      return this.httpClient
        .post(this.backendApiUrl + '/users/logout', {
          userId: this.encryptionService.encryptItem(
            this.user()?.userId as string
          ),
        })
        .pipe(
          take(1),
          delay(400),
          finalize(() => {
            this.storageService.updateIsLoading(false);
            this.storageService.updateStateLogoutSuccessful();
            this.router.navigate(['/login']);
          })
        );
    else return of(null);
  }
  signup(userId: string): Observable<any> {
    return this.httpClient
      .post(
        this.backendApiUrl + '/users/signup',

        {
          userId: this.encryptionService.encryptItem(userId as string),
        }
      )
      .pipe(
        take(1),
        delay(600),
        finalize(() => {
          this.storageService.updateIsLoading(false);
        })
      );
  }
  checkUserToken(token: string): Observable<boolean> {
    return this.httpClient
      .post<boolean>(this.backendApiUrl + '/users/checkUserToken', {
        token: token,
      })
      .pipe(take(1), delay(300));
  }
  register(
    user: UserInterface,
    userSignupToken: string
  ): Observable<UserApiResponseInterface> {
    user.userId = this.encryptionService.encryptItem(user.userId as string);
    user.password = this.encryptionService.encryptItem(user.password as string);
    const data = { user: user, userSignupToken: userSignupToken };
    return this.httpClient
      .post<UserApiResponseInterface>(
        this.backendApiUrl + '/users/register',
        data
      )
      .pipe(
        take(1),
        finalize(() => {
          this.storageService.updateIsLoading(false);
        }),
        delay(300)
      );
  }
  resetPassword(userId: string): Observable<any> {
    return this.httpClient
      .post(
        this.backendApiUrl + '/users/reset-password',

        {
          userId: this.encryptionService.encryptItem(userId as string),
        }
      )
      .pipe(take(1), delay(600));
  }
  completeResetPassword(data: any): Observable<any> {
    data.userId = this.encryptionService.encryptItem(data.userId as string);
    data.password = this.encryptionService.encryptItem(data.password as string);

    const headers = new HttpHeaders({
      Authorization: 'bearer ' + data.token, // Replace 'yourAccessToken' with the actual access token
      'Content-Type': 'application/json',
    });
    return this.httpClient
      .post<any>(this.backendApiUrl + '/users/complete-reset-password', data, {
        headers,
      })
      .pipe(take(1), delay(300));
  }

  editUserProfile(data: FormData): Observable<UserApiResponseInterface> {
    return this.httpClient
      .post<any>(this.backendApiUrl + '/users/edit-user-profile', data)
      .pipe(
        take(1),
        delay(300),
        timeout(5000),
        finalize(() => {
          this.storageService.updateIsLoading(false);
        }),
        tap((response: UserApiResponseInterface) => {
          this.storageService.updateStateProfileSuccessful(response);
        })
      );
  }
  getUserProfile(userId: string): Observable<UserApiResponseInterface> {
    const userIdEncrypted = this.encryptionService.encryptItem(userId);
    return this.httpClient
      .post<any>(this.backendApiUrl + '/users/get-user-profile', {
        userId: userIdEncrypted,
      })
      .pipe(
        take(1),
        delay(300),
        finalize(() => {
          this.storageService.updateIsLoading(false);
        })
      );
  }
  changePassword(data: any): Observable<any> {
    data.userId = this.encryptionService.encryptItem(data.userId as string);
    data.password = this.encryptionService.encryptItem(data.password as string);
    data.currentPassword = this.encryptionService.encryptItem(
      data.currentPassword as string
    );
    return this.httpClient
      .post<any>(this.backendApiUrl + '/users/change-password', data)
      .pipe(take(1), timeout(this.apiTimeoutValue), delay(300));
  }
  getUserServices(userId: string): Observable<any> {
    const userIdEncrypted = this.encryptionService.encryptItem(userId);
    return this.httpClient
      .post<any>(this.backendApiUrl + '/users/list-user-services', {
        userId: userIdEncrypted,
      })
      .pipe(
        take(1),
        delay(300),
        finalize(() => {
          this.storageService.updateIsLoading(false);
        })
      );
  }
  addUserServices(
    userId: string,
    service: string
  ): Observable<UserApiResponseInterface> {
    const userIdEncrypted = this.encryptionService.encryptItem(userId);
    console.log('here', userId, service);
    return this.httpClient
      .post<any>(this.backendApiUrl + '/users/add-user-services', {
        userId: userIdEncrypted,
        service: service,
      })
      .pipe(
        take(1),
        delay(300),
        finalize(() => {
          this.storageService.updateIsLoading(false);
        })
      );
  }
  removeUserServices(
    userId: string,
    service: string
  ): Observable<UserApiResponseInterface> {
    const userIdEncrypted = this.encryptionService.encryptItem(userId);
    return this.httpClient
      .post<any>(this.backendApiUrl + '/users/remove-user-services', {
        userId: userIdEncrypted,
        service: service,
      })
      .pipe(
        take(1),
        delay(300),
        finalize(() => {
          this.storageService.updateIsLoading(false);
        })
      );
  }
  getUsers(
    userId: string,
    isSAdmin: boolean
  ): Observable<UserApiResponseInterface[]> {
    const userIdEncrypted = this.encryptionService.encryptItem(userId);
    return this.httpClient
      .post<UserApiResponseInterface[]>(this.backendApiUrl + '/users/users', {
        userId: userIdEncrypted,
        isSAdmin: isSAdmin,
      })
      .pipe(
        take(1),
        delay(300),
        finalize(() => {
          this.storageService.updateIsLoading(false);
        })
      );
  }
  deleteUser(
    userId: string,
    flag: boolean,
    isSAdmin: boolean
  ): Observable<UserApiResponseInterface[]> {
    const userIdEncrypted = this.encryptionService.encryptItem(userId);
    return this.httpClient
      .post<UserApiResponseInterface[]>(
        this.backendApiUrl + '/users/delete-user',
        {
          userId: userIdEncrypted,
          flag: flag,
          isSAdmin: isSAdmin,
        }
      )
      .pipe(
        take(1),
        delay(300),
        finalize(() => {
          this.storageService.updateIsLoading(false);
        })
      );
  }
  updateUserActivationStatus(
    userId: string,
    activate: boolean,
    isSAdmin: boolean
  ): Observable<UserApiResponseInterface[]> {
    const userIdEncrypted = this.encryptionService.encryptItem(userId);
    return this.httpClient
      .post<UserApiResponseInterface[]>(
        this.backendApiUrl + '/users/update-user-activation-status',
        {
          userId: userIdEncrypted,
          flag: activate,
          isSAdmin: isSAdmin,
        }
      )
      .pipe(
        take(1),
        delay(300),
        finalize(() => {
          this.storageService.updateIsLoading(false);
        })
      );
  }
}
