import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, finalize, map, of, tap } from 'rxjs';
import { LoginCredential } from '../models/login';
import { AES } from 'crypto-js';
import { EnvironmentInfo } from '../../../../../libs/common/src/models/common';
import { UserInterface } from '../models/user';
import { StorageService } from './storage.service';
import { UserApiResponseInterface } from '../../../../../libs/common/src/models/user-response';
import { Router } from '@angular/router';
@Injectable({
  providedIn: 'root',
})
export class ApiService {
  env: EnvironmentInfo = new EnvironmentInfo();
  storageService = inject(StorageService);
  router = inject(Router);
  backendApiUrl: string = `${this.env.apiUrl()}:${this.env.apiPort()}`;
  constructor(private httpClient: HttpClient) {}
  encryptItem(item: string): string {
    const secretKey = this.env.secretKey();
    const encryptedItem = AES.encrypt(item, secretKey).toString();
    return encryptedItem;
  }

  encryptCredentials(userId: string, password: string): string {
    const secretKey = this.env.secretKey();
    const encryptedUsername = AES.encrypt(userId, secretKey).toString();
    const encryptedPassword = AES.encrypt(password, secretKey).toString();
    // Concatenate the encrypted username and password with a delimiter
    const encryptedCredentials = encryptedUsername + ':' + encryptedPassword;

    return btoa(encryptedCredentials); // Encode the encrypted credentials using Base64
  }
  login(credential: LoginCredential): Observable<UserApiResponseInterface> {
    console.log(credential, 'login');
    const encryptedCredentials = this.encryptCredentials(
      credential?.userId,
      credential?.password
    );
    console.log(encryptedCredentials, 'encrypted');
    return this.httpClient
      .post(
        this.backendApiUrl + '/users/login',

        { credentials: encryptedCredentials }
      )
      .pipe(
        tap(() => {
          //spinner service show
        }),
        finalize(() => {
          // spinner service hide
        }),
        map((response: UserApiResponseInterface) => {
          this.storageService.updateStateLoginSuccessful(response);
        }),
        catchError((error) => {
          this.storageService.updateStateLoginFailure(error?.message);
          return of(error);
        })
      );
  }
  logout(userId: string): Observable<any> {
    // const encryptedCredentials = this.encryptCredentials(
    //   credential?.userId,
    //   credential?.password
    // );

    return this.httpClient
      .post(
        this.backendApiUrl + '/users/logout',

        { userID: userId }
      )
      .pipe(
        tap(() => {
          //spinner service show
        }),
        finalize(() => {
          // spinner service hide
          this.storageService.updateStateLogoutSuccessful();
          this.router.navigate(['/login']);
        })
      );
  }
}
