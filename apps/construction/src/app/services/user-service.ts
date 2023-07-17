import { Injectable, Signal, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, of, tap } from 'rxjs';
import { CommonUtilityService } from './common-utility.service';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  commonUtility = inject(CommonUtilityService);
  apiService = inject(ApiService);
  isUserTokenValid(token: string): boolean {
    let tokenValid = signal<boolean>(false);
    if (!!token) {
      tokenValid.set(this.commonUtility.isTokenValid(token as string));
      if (tokenValid()) {
        tokenValid.mutate(
          toSignal(
            this.apiService.checkUserToken(token).pipe(
              tap((response) => {
                console.log('res', response);
              }),
              catchError((err) => {
                tokenValid.set(false);
                return of(false);
              })
            )
          )
        );
      } else {
        tokenValid.set(false);
      }
    } else {
      tokenValid.set(false);
    }

    return tokenValid();
  }
}
