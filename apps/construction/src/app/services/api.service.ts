import { HttpClient } from '@angular/common/http';
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
} from 'rxjs';
import { LoginCredential } from '../models/login';
import { AES } from 'crypto-js';
import { EnvironmentInfo } from '../../../../../libs/common/src/models/common';
import { UserInterface } from '../models/user';
import { StorageService } from './storage.service';
import { UserApiResponseInterface } from '../../../../../libs/common/src/models/user-response';
import { Router } from '@angular/router';
import { UserRoutingService } from './user-routing.service';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  env: EnvironmentInfo = new EnvironmentInfo();
  storageService = inject(StorageService);
  user = this.storageService.getUser();
  router = inject(Router);
  userRouting = inject(UserRoutingService);
  backendApiUrl: string = `${this.env.apiUrl()}:${this.env.apiPort()}`;
  constructor(private httpClient: HttpClient) {}
  encryptItem(item: string): string {
    const webSecretKey = this.env.webSecretKey();
    const encryptedItem = AES.encrypt(item, webSecretKey).toString();
    return encryptedItem;
  }

  encryptCredentials(userId: string, password: string): string {
    const webSecretKey = this.env.webSecretKey();
    const encryptedUsername = AES.encrypt(userId, webSecretKey).toString();
    const encryptedPassword = AES.encrypt(password, webSecretKey).toString();
    // Concatenate the encrypted username and password with a delimiter
    const encryptedCredentials = encryptedUsername + ':' + encryptedPassword;

    // return btoa(encryptedCredentials); // Encode the encrypted credentials using Base64
    return encryptedCredentials; // Encode the encrypted credentials using Base64
  }
  login(credential: LoginCredential): Observable<UserApiResponseInterface> {
    const encryptedCredentials = this.encryptCredentials(
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
        map((response: UserApiResponseInterface) => {
          this.storageService.updateStateLoginSuccessful(response);
          this.userRouting.navigateToUserMainPage();
        }),
        catchError((error) => {
          this.storageService.updateStateLoginFailure(error?.message);
          return of(error.message);
        })
      );
  }
  logout(): Observable<any> {
    if (this.user()?.userId)
      return this.httpClient
        .post(this.backendApiUrl + '/users/logout', {
          userId: this.encryptItem(this.user()?.userId as string),
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
          userId: this.encryptItem(userId as string),
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
  checkToken(token: string): Observable<true> {
    // return this.httpClient
    //   .post(
    //     this.backendApiUrl + '/users/signup',

    //     {
    //       userId: this.encryptItem(userId as string),
    //     }
    //   )
    //   .pipe(take(1), delay(300));
    return of(true);
  }
  register(
    user: UserInterface,
    userSignupToken: string
  ): Observable<UserApiResponseInterface> {
    user.userId = this.encryptItem(user.userId as string);
    user.password = this.encryptItem(user.password as string);
    let data = { user: user, userSignupToken: userSignupToken };
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
          userId: this.encryptItem(userId as string),
        }
      )
      .pipe(take(1), delay(600));
  }
}
