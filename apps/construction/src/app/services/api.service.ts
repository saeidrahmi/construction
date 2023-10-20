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
import { AdminSettingsInterface } from 'libs/common/src/models/admin-settings';
import { PlanInterface } from '../models/plan';
import { NgxSpinnerService } from 'ngx-spinner';
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
  constructor(
    private httpClient: HttpClient,
    private spinner: NgxSpinnerService
  ) {}

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
          this.spinner.hide();
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
    if (this.user()?.userId) {
      this.spinner.show();
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
            this.spinner.hide();
            this.storageService.updateStateLogoutSuccessful();
            this.router.navigate(['/login']);
          })
        );
    } else return of(null);
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
          this.spinner.hide();
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
  registerFreePlan(
    user: UserInterface,
    plan: PlanInterface,
    userSignupToken: string
  ): Observable<UserApiResponseInterface> {
    user.userId = this.encryptionService.encryptItem(user.userId as string);
    user.password = this.encryptionService.encryptItem(user.password as string);
    const data = { user: user, plan: plan, userSignupToken: userSignupToken };
    return this.httpClient
      .post<UserApiResponseInterface>(
        this.backendApiUrl + '/users/register-free',
        data
      )
      .pipe(
        take(1),
        finalize(() => {
          this.spinner.hide();
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
    this.spinner.show();
    return this.httpClient
      .post<any>(this.backendApiUrl + '/users/edit-user-profile', data)
      .pipe(
        take(1),
        delay(300),
        timeout(5000),
        finalize(() => {
          this.spinner.hide();
        }),
        tap((response: UserApiResponseInterface) => {
          this.storageService.updateStateProfileSuccessful(response);
        })
      );
  }
  getUserProfile(userId: string): Observable<UserApiResponseInterface> {
    const userIdEncrypted = this.encryptionService.encryptItem(userId);
    this.spinner.show();
    return this.httpClient
      .post<any>(this.backendApiUrl + '/users/get-user-profile', {
        userId: userIdEncrypted,
      })
      .pipe(
        take(1),
        delay(300),
        finalize(() => {
          this.spinner.hide();
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
    this.spinner.show();
    return this.httpClient
      .post<any>(this.backendApiUrl + '/users/list-user-services', {
        userId: userIdEncrypted,
      })
      .pipe(
        take(1),
        delay(300),
        finalize(() => {
          this.spinner.hide();
        })
      );
  }
  addUserServices(
    userId: string,
    service: string
  ): Observable<UserApiResponseInterface> {
    const userIdEncrypted = this.encryptionService.encryptItem(userId);
    this.spinner.show();
    return this.httpClient
      .post<any>(this.backendApiUrl + '/users/add-user-services', {
        userId: userIdEncrypted,
        service: service,
      })
      .pipe(
        take(1),
        delay(300),
        finalize(() => {
          this.spinner.hide();
        })
      );
  }
  removeUserServices(
    userId: string,
    service: string
  ): Observable<UserApiResponseInterface> {
    const userIdEncrypted = this.encryptionService.encryptItem(userId);
    this.spinner.show();
    return this.httpClient
      .post<any>(this.backendApiUrl + '/users/remove-user-services', {
        userId: userIdEncrypted,
        service: service,
      })
      .pipe(
        take(1),
        delay(300),
        finalize(() => {
          this.spinner.hide();
        })
      );
  }
  getUsers(
    userId: string,
    isSAdmin: boolean
  ): Observable<UserApiResponseInterface[]> {
    const userIdEncrypted = this.encryptionService.encryptItem(userId);
    this.spinner.show();
    return this.httpClient
      .post<UserApiResponseInterface[]>(this.backendApiUrl + '/users/users', {
        userId: userIdEncrypted,
        isSAdmin: isSAdmin,
      })
      .pipe(
        take(1),
        delay(300),
        finalize(() => {
          this.spinner.hide();
        })
      );
  }
  deleteUser(
    userId: string,
    flag: boolean,
    isSAdmin: boolean
  ): Observable<UserApiResponseInterface[]> {
    const userIdEncrypted = this.encryptionService.encryptItem(userId);
    this.spinner.show();
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
          this.spinner.hide();
        })
      );
  }
  updateUserActivationStatus(
    userId: string,
    activate: boolean,
    isSAdmin: boolean
  ): Observable<UserApiResponseInterface[]> {
    const userIdEncrypted = this.encryptionService.encryptItem(userId);
    this.spinner.show();
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
          this.spinner.hide();
        })
      );
  }
  updateAdminSettings(
    setting: AdminSettingsInterface
  ): Observable<AdminSettingsInterface> {
    this.spinner.show();
    return this.httpClient
      .post<AdminSettingsInterface>(
        this.backendApiUrl + '/admin/update-admin-settings',
        {
          setting: setting,
        }
      )
      .pipe(
        take(1),
        delay(300),
        finalize(() => {
          this.spinner.hide();
        })
      );
  }
  getAdminSettings(): Observable<AdminSettingsInterface> {
    this.spinner.show();
    return this.httpClient
      .get<AdminSettingsInterface>(
        this.backendApiUrl + '/admin/list-admin-settings'
      )
      .pipe(
        take(1),
        delay(300),
        finalize(() => {
          this.spinner.hide();
        })
      );
  }
  createNewPlan(plan: PlanInterface): Observable<PlanInterface> {
    this.spinner.show();
    return this.httpClient
      .post<PlanInterface>(this.backendApiUrl + '/admin/create-new-plan', {
        plan: plan,
      })
      .pipe(
        take(1),
        delay(300),
        finalize(() => {
          this.spinner.hide();
        })
      );
  }
  getAdminPlans(): Observable<any> {
    this.spinner.show();
    return this.httpClient
      .get<any>(this.backendApiUrl + '/admin/list-plans')
      .pipe(
        take(1),
        delay(300),
        finalize(() => {
          this.spinner.hide();
        })
      );
  }
  getAllActivePlans(): Observable<any> {
    this.spinner.show();
    return this.httpClient
      .get<any>(this.backendApiUrl + '/public/list-plans')
      .pipe(
        take(1),
        delay(300),
        finalize(() => {
          this.spinner.hide();
        })
      );
  }
  getAllActiveNonFreePlans(): Observable<any> {
    this.spinner.show();
    return this.httpClient
      .get<any>(this.backendApiUrl + '/public/list-paid-plans')
      .pipe(
        take(1),
        delay(300),
        finalize(() => {
          this.spinner.hide();
        })
      );
  }
  updatePlanActivationStatus(
    planId: string,
    activate: boolean
  ): Observable<any> {
    this.spinner.show();
    return this.httpClient
      .post<any>(this.backendApiUrl + '/admin/update-plan-status', {
        planId: planId,
        flag: activate,
      })
      .pipe(
        take(1),
        delay(300),
        finalize(() => {
          this.spinner.hide();
        })
      );
  }
  deletePlan(planId: string): Observable<any> {
    this.spinner.show();
    return this.httpClient
      .post<any>(this.backendApiUrl + '/admin/delete-plan', {
        planId: planId,
      })
      .pipe(
        take(1),
        delay(300),
        finalize(() => {
          this.spinner.hide();
        })
      );
  }
  getDashboardInfo(): Observable<any> {
    this.spinner.show();
    return this.httpClient
      .get<any>(this.backendApiUrl + '/admin/dashboard')
      .pipe(
        take(1),
        delay(300),
        finalize(() => {
          this.spinner.hide();
        })
      );
  }
  getFreeTrialInfo(): Observable<any> {
    this.spinner.show();
    return this.httpClient
      .get<any>(this.backendApiUrl + '/public/get-free-trial-info')
      .pipe(
        take(1),
        delay(300),
        finalize(() => {
          this.spinner.hide();
        })
      );
  }
  getTax(): Observable<any> {
    this.spinner.show();
    return this.httpClient
      .get<any>(this.backendApiUrl + '/public/get-tax')
      .pipe(
        take(1),
        delay(300),
        finalize(() => {
          this.spinner.hide();
        })
      );
  }
  purchasePlan(
    userId: string,
    plan: PlanInterface,
    payment: any
  ): Observable<any> {
    this.spinner.show();

    return this.httpClient
      .post<any>(this.backendApiUrl + '/users/purchase-plan', {
        plan: plan,
        userId: userId,
        paymentInfo: payment,
      })
      .pipe(
        take(1),
        delay(300),
        finalize(() => {
          this.spinner.hide();
        })
      );
  }

  registerPaidPlan(
    user: UserInterface,
    plan: PlanInterface,
    payment: any,
    userSignupToken: string
  ): Observable<UserApiResponseInterface> {
    this.spinner.show();
    user.userId = this.encryptionService.encryptItem(user.userId as string);
    user.password = this.encryptionService.encryptItem(user.password as string);
    const data = {
      user: user,
      plan: plan,
      userSignupToken: userSignupToken,
      payment: payment,
    };
    return this.httpClient
      .post<UserApiResponseInterface>(
        this.backendApiUrl + '/users/register-paid',
        data
      )
      .pipe(
        take(1),
        delay(300),
        finalize(() => {
          this.spinner.hide();
        })
      );
  }
  getUserPlans(userId: string): Observable<any> {
    this.spinner.show();
    return this.httpClient
      .post<any>(this.backendApiUrl + '/users/list-user-plans', {
        userId: userId,
      })
      .pipe(
        take(1),
        delay(300),
        finalize(() => {
          this.spinner.hide();
        })
      );
  }
  updateUserServiceLocationType(userId: string, type: string): Observable<any> {
    this.spinner.show();
    return this.httpClient
      .post<any>(
        this.backendApiUrl + '/users/update-user-service-location-type',
        {
          userId: userId,
          type: type,
        }
      )
      .pipe(
        take(1),
        delay(300),
        finalize(() => {
          this.spinner.hide();
        })
      );
  }
  updateUserServiceProvinces(
    userId: string,
    provinces: string[]
  ): Observable<any> {
    this.spinner.show();
    return this.httpClient
      .post<any>(this.backendApiUrl + '/users/update-user-service-provinces', {
        userId: userId,
        provinces: provinces,
        type: 'province',
      })
      .pipe(
        take(1),
        delay(300),
        finalize(() => {
          this.spinner.hide();
        })
      );
  }
  updateUserServiceCities(userId: string, locations: any[]): Observable<any> {
    this.spinner.show();
    return this.httpClient
      .post<any>(this.backendApiUrl + '/users/update-user-service-cities', {
        userId: userId,
        locations: locations,
        type: 'city',
      })
      .pipe(
        take(1),
        delay(300),
        finalize(() => {
          this.spinner.hide();
        })
      );
  }
}
