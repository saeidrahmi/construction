import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import {
  Observable,
  catchError,
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
import * as moment from 'moment';
@Injectable({
  providedIn: 'root',
})
export class ApiService {
  env: EnvironmentInfo = new EnvironmentInfo();
  apiTimeoutValue = this.env.apiTimeoutValue();
  apiLongSearchTimeoutValue = this.env.apiLongSearchTimeoutValue();
  toastrTimeoutValue = this.env.toastrTimeoutValue();
  storageService = inject(StorageService);
  toastService = inject(ToastrService);
  encryptionService = inject(EncryptionService);
  user = this.storageService.getUser();
  jwtRefreshToken = this.storageService.getRefreshToken();
  router = inject(Router);
  userRouting = inject(UserRoutingService);
  backendApiUrl = `${this.env.apiUrl()}:${this.env.apiPort()}`;
  constructor(
    private httpClient: HttpClient,
    private spinner: NgxSpinnerService
  ) {}
  // Function to refresh the access token using the refresh token
  refreshToken() {
    return this.httpClient.post(this.backendApiUrl + '/users/token', {
      refreshToken: this.jwtRefreshToken(),
    });
  }

  login(credential: LoginCredential): Observable<UserApiResponseInterface> {
    this.spinner.show();
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
        timeout(this.apiTimeoutValue),
        finalize(() => {
          this.spinner.hide();
        }),
        tap((response: UserApiResponseInterface) => {
          this.storageService.updateStateLoginSuccessful(response);
          if (this.isPasswordResetRequired(response)) {
            this.storageService.updateLoginFlag(false);
            this.storageService.updatePasswordResetRequiredFlag(true);
            this.router.navigate(['/reset-expired-password']);
          } else this.userRouting.navigateToUserMainPage();
        }),
        catchError((error) => {
          this.toastService.error(error.message, 'Login Failed', {
            timeOut: this.toastrTimeoutValue,
            positionClass: 'toast-top-right',
            closeButton: true,
            progressBar: true,
          }); // Display an error toast
          this.storageService.updateStateLoginFailure(error?.message);
          return of(error.message);
        })
      );
  }
  isPasswordResetRequired(response: UserApiResponseInterface) {
    if (response?.user.passwordResetRequired) return true;
    else {
      const expirationDate = moment().subtract(
        response.expirationPeriodInDays,
        'days'
      );
      // Compare the last password reset date with the expiration date
      return moment(response.user.lastPasswordResetDate).isBefore(
        expirationDate
      );
    }
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
          timeout(this.apiTimeoutValue),
          finalize(() => {
            this.spinner.hide();
            this.storageService.updateStateLogoutSuccessful();
            this.router.navigate(['/login']);
          })
        );
    } else return of(null);
  }
  signup(userId: string): Observable<any> {
    this.spinner.show();
    return this.httpClient
      .post(
        this.backendApiUrl + '/users/signup',

        {
          userId: this.encryptionService.encryptItem(userId as string),
        }
      )
      .pipe(
        take(1),
        timeout(this.apiTimeoutValue),
        finalize(() => {
          this.spinner.hide();
        }),
        catchError((error) => {
          this.toastService.error(error.message, 'Signup Failed', {
            timeOut: this.toastrTimeoutValue,
            positionClass: 'toast-top-right',
            closeButton: true,
            progressBar: true,
          });
          return of(error);
        })
      );
  }
  checkUserToken(token: string): Observable<boolean> {
    return this.httpClient
      .post<boolean>(this.backendApiUrl + '/users/checkUserToken', {
        token: token,
      })
      .pipe(take(1));
  }
  registerFreePlan(
    user: UserInterface,
    plan: PlanInterface,
    userSignupToken: string
  ): Observable<UserApiResponseInterface> {
    this.spinner.show();
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
        timeout(this.apiTimeoutValue),
        finalize(() => {
          this.spinner.hide();
        }),
        catchError((error) => {
          this.toastService.error(error.message, 'Registration Failed', {
            timeOut: this.toastrTimeoutValue,
            positionClass: 'toast-top-right',
            closeButton: true,
            progressBar: true,
          });
          return of(error);
        })
      );
  }
  resetPassword(userId: string): Observable<any> {
    this.spinner.show();
    return this.httpClient
      .post(
        this.backendApiUrl + '/users/reset-password',

        {
          userId: this.encryptionService.encryptItem(userId as string),
        }
      )
      .pipe(
        take(1),
        timeout(this.apiTimeoutValue),
        finalize(() => {
          this.spinner.hide();
        }),
        catchError((error) => {
          this.toastService.error(error.message, 'Reset Password Failed', {
            timeOut: this.toastrTimeoutValue,
            positionClass: 'toast-top-right',
            closeButton: true,
            progressBar: true,
          });
          return of(error);
        })
      );
  }
  completeResetPassword(data: any): Observable<any> {
    this.spinner.show();
    data.userId = this.encryptionService.encryptItem(data.userId as string);
    data.password = this.encryptionService.encryptItem(data.password as string);

    // const headers = new HttpHeaders({
    //   Authorization: `Bearer ${data?.token}`,
    //   'Content-Type': 'application/json',
    // });
    this.storageService.updateJwtToken(data.token);
    // console.log(headers);
    // return this.httpClient
    //   .post<any>(this.backendApiUrl + '/users/complete-reset-password', data, {
    //     headers,
    //   })
    //   .pipe(take(1), timeout(this.apiTimeoutValue),  delay(300));
    return this.httpClient
      .post<any>(this.backendApiUrl + '/users/complete-reset-password', data)
      .pipe(
        take(1),
        timeout(this.apiTimeoutValue),
        finalize(() => {
          this.spinner.hide();
        }),
        catchError((error) => {
          this.toastService.error(error.message, 'Reset Password Failed', {
            timeOut: this.toastrTimeoutValue,
            positionClass: 'toast-top-right',
            closeButton: true,
            progressBar: true,
          });
          return of(error);
        })
      );
  }

  editUserProfile(data: FormData): Observable<UserApiResponseInterface> {
    this.spinner.show();
    return this.httpClient
      .post<any>(this.backendApiUrl + '/users/edit-user-profile', data)
      .pipe(
        take(1),
        timeout(this.apiTimeoutValue),

        finalize(() => {
          this.spinner.hide();
        }),
        tap((response: UserApiResponseInterface) => {
          this.storageService.updateStateProfileSuccessful(response);
        }),
        catchError((error) => {
          this.toastService.error(error.message, 'Edit User Profile Failed', {
            timeOut: this.toastrTimeoutValue,
            positionClass: 'toast-top-right',
            closeButton: true,
            progressBar: true,
          });
          return of(error);
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
        timeout(this.apiTimeoutValue),
        finalize(() => {
          this.spinner.hide();
        }),
        catchError((error) => {
          this.toastService.error(
            error.message,
            'Retrieving User Profile Failed',
            {
              timeOut: this.toastrTimeoutValue,
              positionClass: 'toast-top-right',
              closeButton: true,
              progressBar: true,
            }
          );
          return of(error);
        })
      );
  }
  changePassword(data: any): Observable<any> {
    this.spinner.show();
    data.userId = this.encryptionService.encryptItem(data.userId as string);
    data.password = this.encryptionService.encryptItem(data.password as string);
    data.currentPassword = this.encryptionService.encryptItem(
      data.currentPassword as string
    );
    return this.httpClient
      .post<any>(this.backendApiUrl + '/users/change-password', data)
      .pipe(
        take(1),
        timeout(this.apiTimeoutValue),

        finalize(() => {
          this.spinner.hide();
        }),
        catchError((error) => {
          this.toastService.error(
            error.message,
            'Change User Password Failed',
            {
              timeOut: this.toastrTimeoutValue,
              positionClass: 'toast-top-right',
              closeButton: true,
              progressBar: true,
            }
          );
          return of(error);
        })
      );
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
        timeout(this.apiTimeoutValue),
        finalize(() => {
          this.spinner.hide();
        }),
        catchError((error) => {
          this.toastService.error(
            error.message,
            'Retrieving User Services Failed',
            {
              timeOut: this.toastrTimeoutValue,
              positionClass: 'toast-top-right',
              closeButton: true,
              progressBar: true,
            }
          );
          return of(error);
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
        timeout(this.apiTimeoutValue),
        finalize(() => {
          this.spinner.hide();
        }),
        catchError((error) => {
          this.toastService.error(
            error.message,
            'Updating User Services Failed',
            {
              timeOut: this.toastrTimeoutValue,
              positionClass: 'toast-top-right',
              closeButton: true,
              progressBar: true,
            }
          );
          return of(error);
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
        timeout(this.apiTimeoutValue),
        finalize(() => {
          this.spinner.hide();
        }),
        catchError((error) => {
          this.toastService.error(
            error.message,
            'Updating User Services Failed',
            {
              timeOut: this.toastrTimeoutValue,
              positionClass: 'toast-top-right',
              closeButton: true,
              progressBar: true,
            }
          );
          return of(error);
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
      .post<UserApiResponseInterface[]>(this.backendApiUrl + '/admin/users', {
        userId: userIdEncrypted,
        isSAdmin: isSAdmin,
      })
      .pipe(
        take(1),
        timeout(this.apiTimeoutValue),
        finalize(() => {
          this.spinner.hide();
        }),
        catchError((error) => {
          this.toastService.error(
            error.message,
            'Retrieving User List Failed',
            {
              timeOut: this.toastrTimeoutValue,
              positionClass: 'toast-top-right',
              closeButton: true,
              progressBar: true,
            }
          );
          return of(error);
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
        timeout(this.apiTimeoutValue),
        finalize(() => {
          this.spinner.hide();
        }),
        catchError((error) => {
          this.toastService.error(error.message, 'User Deletion Failed', {
            timeOut: this.toastrTimeoutValue,
            positionClass: 'toast-top-right',
            closeButton: true,
            progressBar: true,
          });
          return of(error);
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
        timeout(this.apiTimeoutValue),
        finalize(() => {
          this.spinner.hide();
        }),
        catchError((error) => {
          this.toastService.error(error.message, 'User Activation Failed', {
            timeOut: this.toastrTimeoutValue,
            positionClass: 'toast-top-right',
            closeButton: true,
            progressBar: true,
          });
          return of(error);
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
        timeout(this.apiTimeoutValue),
        finalize(() => {
          this.spinner.hide();
        }),
        catchError((error) => {
          this.toastService.error(
            error.message,
            'Updating Admin Settings Failed',
            {
              timeOut: this.toastrTimeoutValue,
              positionClass: 'toast-top-right',
              closeButton: true,
              progressBar: true,
            }
          );
          return of(error);
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
        timeout(this.apiTimeoutValue),
        finalize(() => {
          this.spinner.hide();
        }),
        catchError((error) => {
          this.toastService.error(
            error.message,
            'Retrieving Admin Settings Failed',
            {
              timeOut: this.toastrTimeoutValue,
              positionClass: 'toast-top-right',
              closeButton: true,
              progressBar: true,
            }
          );
          return of(error);
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
        timeout(this.apiTimeoutValue),
        finalize(() => {
          this.spinner.hide();
        }),
        catchError((error) => {
          this.toastService.error(error.message, 'Creating New Plan Failed', {
            timeOut: this.toastrTimeoutValue,
            positionClass: 'toast-top-right',
            closeButton: true,
            progressBar: true,
          });
          return of(error);
        })
      );
  }
  getAdminPlans(): Observable<any> {
    this.spinner.show();
    return this.httpClient
      .get<any>(this.backendApiUrl + '/admin/list-plans')
      .pipe(
        take(1),
        timeout(this.apiTimeoutValue),
        finalize(() => {
          this.spinner.hide();
        }),
        catchError((error) => {
          this.toastService.error(
            error.message,
            'Retrieving Plans List Failed',
            {
              timeOut: this.toastrTimeoutValue,
              positionClass: 'toast-top-right',
              closeButton: true,
              progressBar: true,
            }
          );
          return of(error);
        })
      );
  }
  getAllActivePlans(): Observable<any> {
    this.spinner.show();
    return this.httpClient
      .get<any>(this.backendApiUrl + '/public/list-plans')
      .pipe(
        take(1),
        timeout(this.apiTimeoutValue),
        finalize(() => {
          this.spinner.hide();
        }),
        catchError((error) => {
          this.toastService.error(
            error.message,
            'Retrieving Active Plans List Failed',
            {
              timeOut: this.toastrTimeoutValue,
              positionClass: 'toast-top-right',
              closeButton: true,
              progressBar: true,
            }
          );
          return of(error);
        })
      );
  }
  getAllActiveNonFreePlans(): Observable<any> {
    this.spinner.show();
    return this.httpClient
      .get<any>(this.backendApiUrl + '/public/list-paid-plans')
      .pipe(
        take(1),
        timeout(this.apiTimeoutValue),
        finalize(() => {
          this.spinner.hide();
        }),
        catchError((error) => {
          this.toastService.error(
            error.message,
            'Retrieving Plans List Failed',
            {
              timeOut: this.toastrTimeoutValue,
              positionClass: 'toast-top-right',
              closeButton: true,
              progressBar: true,
            }
          );
          return of(error);
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
        timeout(this.apiTimeoutValue),
        finalize(() => {
          this.spinner.hide();
        }),
        catchError((error) => {
          this.toastService.error(
            error.message,
            'Updating Plans Status Failed',
            {
              timeOut: this.toastrTimeoutValue,
              positionClass: 'toast-top-right',
              closeButton: true,
              progressBar: true,
            }
          );
          return of(error);
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
        timeout(this.apiTimeoutValue),
        finalize(() => {
          this.spinner.hide();
        }),
        catchError((error) => {
          this.toastService.error(error.message, 'Deleting Plan Failed', {
            timeOut: this.toastrTimeoutValue,
            positionClass: 'toast-top-right',
            closeButton: true,
            progressBar: true,
          });
          return of(error);
        })
      );
  }
  getDashboardInfo(): Observable<any> {
    this.spinner.show();
    return this.httpClient
      .get<any>(this.backendApiUrl + '/admin/dashboard')
      .pipe(
        take(1),
        timeout(this.apiTimeoutValue),
        finalize(() => {
          this.spinner.hide();
        }),
        catchError((error) => {
          this.toastService.error(
            error.message,
            'Retrieving Admin Dashboard Info. Failed',
            {
              timeOut: this.toastrTimeoutValue,
              positionClass: 'toast-top-right',
              closeButton: true,
              progressBar: true,
            }
          );
          return of(error);
        })
      );
  }
  getFreeTrialInfo(): Observable<any> {
    this.spinner.show();
    return this.httpClient
      .get<any>(this.backendApiUrl + '/public/get-free-trial-info')
      .pipe(
        take(1),
        timeout(this.apiTimeoutValue),
        finalize(() => {
          this.spinner.hide();
        }),
        catchError((error) => {
          this.toastService.error(
            error.message,
            'Retrieving Free Trial Info. Failed',
            {
              timeOut: this.toastrTimeoutValue,
              positionClass: 'toast-top-right',
              closeButton: true,
              progressBar: true,
            }
          );
          return of(error);
        })
      );
  }
  getTopAdInfo(): Observable<any> {
    this.spinner.show();
    return this.httpClient
      .get<any>(this.backendApiUrl + '/public/get-top-ad-info')
      .pipe(
        take(1),
        timeout(this.apiTimeoutValue),
        finalize(() => {
          this.spinner.hide();
        }),
        catchError((error) => {
          this.toastService.error(
            error.message,
            'Retrieving Top Advertisement Failed',
            {
              timeOut: this.toastrTimeoutValue,
              positionClass: 'toast-top-right',
              closeButton: true,
              progressBar: true,
            }
          );
          return of(error);
        })
      );
  }
  getApplicationSetting(): Observable<any> {
    this.spinner.show();
    return this.httpClient
      .get<any>(this.backendApiUrl + '/users/get-application-settings')
      .pipe(
        take(1),
        timeout(this.apiTimeoutValue),
        finalize(() => {
          this.spinner.hide();
        }),
        catchError((error) => {
          this.toastService.error(
            error.message,
            'Retrieving Application Settings Failed',
            {
              timeOut: this.toastrTimeoutValue,
              positionClass: 'toast-top-right',
              closeButton: true,
              progressBar: true,
            }
          );
          return of(error);
        })
      );
  }
  getPreNewAdInfo(userId: string): Observable<any> {
    this.spinner.show();
    return this.httpClient
      .post<any>(this.backendApiUrl + '/users/get-pre-new-ad-info', {
        userId: userId,
      })
      .pipe(
        take(1),
        timeout(this.apiTimeoutValue),
        finalize(() => {
          this.spinner.hide();
        }),
        catchError((error) => {
          this.toastService.error(
            error.message,
            'Retrieving New Advertisement Pre-Info. Failed',
            {
              timeOut: this.toastrTimeoutValue,
              positionClass: 'toast-top-right',
              closeButton: true,
              progressBar: true,
            }
          );
          return of(error);
        })
      );
  }
  getAdvertisementEditInfo(
    advertisementId: any,
    userId: string
  ): Observable<any> {
    this.spinner.show();
    return this.httpClient
      .post<any>(
        this.backendApiUrl + '/users/advertisement-general-edit-info',
        { advertisementId: advertisementId, userId: userId }
      )
      .pipe(
        take(1),
        timeout(this.apiTimeoutValue),
        finalize(() => {
          this.spinner.hide();
        }),
        catchError((error) => {
          this.toastService.error(
            error.message,
            'Retrieving Advertisement Edit Info. Failed',
            {
              timeOut: this.toastrTimeoutValue,
              positionClass: 'toast-top-right',
              closeButton: true,
              progressBar: true,
            }
          );
          return of(error);
        })
      );
  }
  getTax(): Observable<any> {
    this.spinner.show();
    return this.httpClient
      .get<any>(this.backendApiUrl + '/public/get-tax')
      .pipe(
        take(1),
        timeout(this.apiTimeoutValue),
        finalize(() => {
          this.spinner.hide();
        }),
        catchError((error) => {
          this.toastService.error(error.message, 'Retrieving Tax Failed', {
            timeOut: this.toastrTimeoutValue,
            positionClass: 'toast-top-right',
            closeButton: true,
            progressBar: true,
          });
          return of(error);
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
        timeout(this.apiTimeoutValue),
        finalize(() => {
          this.spinner.hide();
        }),
        catchError((error) => {
          this.toastService.error(error.message, 'Purchase Plan Failed', {
            timeOut: this.toastrTimeoutValue,
            positionClass: 'toast-top-right',
            closeButton: true,
            progressBar: true,
          });
          return of(error);
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
        timeout(this.apiTimeoutValue),
        finalize(() => {
          this.spinner.hide();
        }),
        catchError((error) => {
          this.toastService.error(
            error.message,
            'Registering Paid Plans Failed',
            {
              timeOut: this.toastrTimeoutValue,
              positionClass: 'toast-top-right',
              closeButton: true,
              progressBar: true,
            }
          );
          return of(error);
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
        timeout(this.apiTimeoutValue),
        finalize(() => {
          this.spinner.hide();
        }),
        catchError((error) => {
          this.toastService.error(
            error.message,
            'Retrieving User Plans Failed',
            {
              timeOut: this.toastrTimeoutValue,
              positionClass: 'toast-top-right',
              closeButton: true,
              progressBar: true,
            }
          );
          return of(error);
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
        timeout(this.apiTimeoutValue),
        finalize(() => {
          this.spinner.hide();
        }),
        catchError((error) => {
          this.toastService.error(
            error.message,
            'Updating User Service Locations Failed',
            {
              timeOut: this.toastrTimeoutValue,
              positionClass: 'toast-top-right',
              closeButton: true,
              progressBar: true,
            }
          );
          return of(error);
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
        timeout(this.apiTimeoutValue),
        finalize(() => {
          this.spinner.hide();
        }),
        catchError((error) => {
          this.toastService.error(
            error.message,
            'Updating User Service Provinces Failed',
            {
              timeOut: this.toastrTimeoutValue,
              positionClass: 'toast-top-right',
              closeButton: true,
              progressBar: true,
            }
          );
          return of(error);
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
        timeout(this.apiTimeoutValue),
        finalize(() => {
          this.spinner.hide();
        }),
        catchError((error) => {
          this.toastService.error(
            error.message,
            'Updating User Service Cities Failed',
            {
              timeOut: this.toastrTimeoutValue,
              positionClass: 'toast-top-right',
              closeButton: true,
              progressBar: true,
            }
          );
          return of(error);
        })
      );
  }
  getUserServiceLocations(userId: string): Observable<any> {
    const userIdEncrypted = this.encryptionService.encryptItem(userId);
    this.spinner.show();
    return this.httpClient
      .post<any>(this.backendApiUrl + '/users/list-user-service-location', {
        userId: userIdEncrypted,
      })
      .pipe(
        take(1),
        timeout(this.apiTimeoutValue),
        finalize(() => {
          this.spinner.hide();
        }),
        catchError((error) => {
          this.toastService.error(
            error.message,
            'Retrieving User Service Locations Failed',
            {
              timeOut: this.toastrTimeoutValue,
              positionClass: 'toast-top-right',
              closeButton: true,
              progressBar: true,
            }
          );
          return of(error);
        })
      );
  }

  getPlanInfo(planId: string): Observable<any> {
    this.spinner.show();
    return this.httpClient
      .post<any>(this.backendApiUrl + '/admin/plan-info', {
        planId: planId,
      })
      .pipe(
        take(1),
        timeout(this.apiTimeoutValue),
        finalize(() => {
          this.spinner.hide();
        }),
        catchError((error) => {
          this.toastService.error(
            error.message,
            'Retrieving Plan Info. Failed',
            {
              timeOut: this.toastrTimeoutValue,
              positionClass: 'toast-top-right',
              closeButton: true,
              progressBar: true,
            }
          );
          return of(error);
        })
      );
  }
  updatePlan(plan: any, planId: string): Observable<any> {
    this.spinner.show();
    return this.httpClient
      .post<any>(this.backendApiUrl + '/admin/update-plan', {
        plan: plan,
        planId: planId,
      })
      .pipe(
        take(1),
        timeout(this.apiTimeoutValue),
        finalize(() => {
          this.spinner.hide();
        }),
        catchError((error) => {
          this.toastService.error(error.message, 'Updating Plan Failed', {
            timeOut: this.toastrTimeoutValue,
            positionClass: 'toast-top-right',
            closeButton: true,
            progressBar: true,
          });
          return of(error);
        })
      );
  }
  canUserAdvertise(userId: string): Observable<any> {
    this.spinner.show();
    return this.httpClient
      .post<any>(this.backendApiUrl + '/users/can-user-advertise', {
        userId: userId,
      })
      .pipe(
        take(1),
        timeout(this.apiTimeoutValue),
        finalize(() => {
          this.spinner.hide();
        }),
        catchError((error) => {
          this.toastService.error(
            error.message,
            'Retrieving If User Can Advertise Info. Failed',
            {
              timeOut: this.toastrTimeoutValue,
              positionClass: 'toast-top-right',
              closeButton: true,
              progressBar: true,
            }
          );
          return of(error);
        })
      );
  }
  canUserEditAdvertisement(
    advertisementId: string,
    userId: string
  ): Observable<any> {
    this.spinner.show();
    return this.httpClient
      .post<any>(this.backendApiUrl + '/users/can-user-edit-advertisement', {
        userId: userId,
        advertisementId: advertisementId,
      })
      .pipe(
        take(1),
        timeout(this.apiTimeoutValue),
        finalize(() => {
          this.spinner.hide();
        }),
        catchError((error) => {
          this.toastService.error(
            error.message,
            'Retrieving If User Can Edit Advertise Info. Failed',
            {
              timeOut: this.toastrTimeoutValue,
              positionClass: 'toast-top-right',
              closeButton: true,
              progressBar: true,
            }
          );
          return of(error);
        })
      );
  }
  saveUserRegularAd(data: FormData): Observable<any> {
    this.spinner.show();
    return this.httpClient
      .post<any>(this.backendApiUrl + '/users/save-user-regular-ad', data)
      .pipe(
        take(1),
        timeout(this.apiTimeoutValue),
        finalize(() => {
          this.spinner.hide();
        }),
        catchError((error) => {
          this.toastService.error(
            error.message,
            'Saving User Advertisement Failed',
            {
              timeOut: this.toastrTimeoutValue,
              positionClass: 'toast-top-right',
              closeButton: true,
              progressBar: true,
            }
          );
          return of(error);
        })
      );
  }
  editAdvertisement(data: FormData): Observable<any> {
    this.spinner.show();
    return this.httpClient
      .post<any>(this.backendApiUrl + '/users/edit-advertisement', data)
      .pipe(
        take(1),
        timeout(this.apiTimeoutValue),
        finalize(() => {
          this.spinner.hide();
        }),
        catchError((error) => {
          this.toastService.error(
            error.message,
            'Editing Advertisement Failed',
            {
              timeOut: this.toastrTimeoutValue,
              positionClass: 'toast-top-right',
              closeButton: true,
              progressBar: true,
            }
          );
          return of(error);
        })
      );
  }
  getUserAdvertisements(userId: string): Observable<any> {
    this.spinner.show();
    return this.httpClient
      .post<any>(this.backendApiUrl + '/users/get-user-advertisements', {
        userId: userId,
      })
      .pipe(
        take(1),
        timeout(this.apiTimeoutValue),
        finalize(() => {
          this.spinner.hide();
        }),
        catchError((error) => {
          this.toastService.error(error.message, 'Retrieving User Ads Failed', {
            timeOut: this.toastrTimeoutValue,
            positionClass: 'toast-top-right',
            closeButton: true,
            progressBar: true,
          });
          return of(error);
        })
      );
  }
  updateUserAdvertisementActiveStatus(
    userId: string,
    active: boolean,
    userAdvertisementId: any
  ): Observable<any> {
    this.spinner.show();

    return this.httpClient
      .post<any>(this.backendApiUrl + '/users/updateAd-active-status', {
        userId: userId,
        active: active,
        userAdvertisementId: userAdvertisementId,
      })
      .pipe(
        take(1),
        timeout(this.apiTimeoutValue),
        finalize(() => {
          this.spinner.hide();
        }),
        catchError((error) => {
          this.toastService.error(
            error.message,
            'Updating User Ads Active Status Failed',
            {
              timeOut: this.toastrTimeoutValue,
              positionClass: 'toast-top-right',
              closeButton: true,
              progressBar: true,
            }
          );
          return of(error);
        })
      );
  }
  updateUserAdvertisementDeleteStatus(
    userId: string,

    userAdvertisementId: any
  ): Observable<any> {
    this.spinner.show();
    return this.httpClient
      .post<any>(this.backendApiUrl + '/users/updateAd-delete-status', {
        userId: userId,
        deleted: true,
        userAdvertisementId: userAdvertisementId,
      })
      .pipe(
        take(1),
        timeout(this.apiTimeoutValue),
        finalize(() => {
          this.spinner.hide();
        }),
        catchError((error) => {
          this.toastService.error(
            error.message,
            'Updating User Ads Delete Status Failed',
            {
              timeOut: this.toastrTimeoutValue,
              positionClass: 'toast-top-right',
              closeButton: true,
              progressBar: true,
            }
          );
          return of(error);
        })
      );
  }
  repostUserAdvertisement(
    userId: string,
    userAdvertisementId: any,
    userAdvertisementDuration: any,
    activePlanId: any
  ): Observable<any> {
    this.spinner.show();

    return this.httpClient
      .post<any>(this.backendApiUrl + '/users/advertisement-repost', {
        userId: userId,
        userAdvertisementId: userAdvertisementId,
        userAdvertisementDuration: userAdvertisementDuration,
        activePlanId: activePlanId,
      })
      .pipe(
        take(1),
        timeout(this.apiTimeoutValue),
        finalize(() => {
          this.spinner.hide();
        }),
        catchError((error) => {
          this.toastService.error(
            error.message,
            'Re-Posting Advertisement Failed',
            {
              timeOut: this.toastrTimeoutValue,
              positionClass: 'toast-top-right',
              closeButton: true,
              progressBar: true,
            }
          );
          return of(error);
        })
      );
  }

  promoteTopAdvertisement(
    userId: string,
    paymentInfo: any,
    userAdvertisementId: any
  ): Observable<any> {
    this.spinner.show();

    return this.httpClient
      .post<any>(this.backendApiUrl + '/users/promote-top-ad', {
        userId: userId,
        paymentInfo: paymentInfo,
        userAdvertisementId: userAdvertisementId,
      })
      .pipe(
        take(1),
        timeout(this.apiTimeoutValue),
        finalize(() => {
          this.spinner.hide();
        }),
        catchError((error) => {
          this.toastService.error(
            error.message,
            'Promoting Top Advertisement Failed',
            {
              timeOut: this.toastrTimeoutValue,
              positionClass: 'toast-top-right',
              closeButton: true,
              progressBar: true,
            }
          );
          return of(error);
        })
      );
  }

  getAdvertisementDetails(userAdvertisementId: any): Observable<any> {
    this.spinner.show();
    return this.httpClient
      .post<any>(this.backendApiUrl + '/users/get-advertisement-details', {
        userAdvertisementId: userAdvertisementId,
      })
      .pipe(
        take(1),
        timeout(this.apiTimeoutValue),
        finalize(() => {
          this.spinner.hide();
        }),
        catchError((error) => {
          this.toastService.error(
            error.message,
            'Retrieving Advertisement Details Failed',
            {
              timeOut: this.toastrTimeoutValue,
              positionClass: 'toast-top-right',
              closeButton: true,
              progressBar: true,
            }
          );
          return of(error);
        })
      );
  }
  getAdminAdvertisementDetails(userAdvertisementId: any): Observable<any> {
    this.spinner.show();
    return this.httpClient
      .post<any>(this.backendApiUrl + '/admin/get-advertisement-details', {
        userAdvertisementId: userAdvertisementId,
      })
      .pipe(
        take(1),
        timeout(this.apiTimeoutValue),
        finalize(() => {
          this.spinner.hide();
        }),
        catchError((error) => {
          this.toastService.error(
            error.message,
            'Retrieving Admin Advertisement Details Failed',
            {
              timeOut: this.toastrTimeoutValue,
              positionClass: 'toast-top-right',
              closeButton: true,
              progressBar: true,
            }
          );
          return of(error);
        })
      );
  }
  approveAdvertisement(userAdvertisementId: any): Observable<any> {
    this.spinner.show();
    return this.httpClient
      .post<any>(this.backendApiUrl + '/admin/approve-advertisement', {
        userAdvertisementId: userAdvertisementId,
      })
      .pipe(
        take(1),
        timeout(this.apiTimeoutValue),
        finalize(() => {
          this.spinner.hide();
        }),
        catchError((error) => {
          this.toastService.error(
            error.message,
            'Approving Advertisement Failed',
            {
              timeOut: this.toastrTimeoutValue,
              positionClass: 'toast-top-right',
              closeButton: true,
              progressBar: true,
            }
          );
          return of(error);
        })
      );
  }
  rejectAdvertisement(userAdvertisementId: any, reason: any): Observable<any> {
    this.spinner.show();
    return this.httpClient
      .post<any>(this.backendApiUrl + '/admin/reject-advertisement', {
        userAdvertisementId: userAdvertisementId,
        rejectReason: reason,
      })
      .pipe(
        take(1),
        timeout(this.apiTimeoutValue),
        finalize(() => {
          this.spinner.hide();
        }),
        catchError((error) => {
          this.toastService.error(
            error.message,
            'Rejecting Advertisement Failed',
            {
              timeOut: this.toastrTimeoutValue,
              positionClass: 'toast-top-right',
              closeButton: true,
              progressBar: true,
            }
          );
          return of(error);
        })
      );
  }
  getUserAdvertisementDetails(
    userAdvertisementId: any,
    userId: any
  ): Observable<any> {
    this.spinner.show();
    return this.httpClient
      .post<any>(this.backendApiUrl + '/users/get-user-advertisement-details', {
        userAdvertisementId: userAdvertisementId,
        userId: userId,
      })
      .pipe(
        take(1),
        timeout(this.apiTimeoutValue),
        finalize(() => {
          this.spinner.hide();
        }),
        catchError((error) => {
          this.toastService.error(
            error.message,
            'Retrieving User Advertisement Details Failed',
            {
              timeOut: this.toastrTimeoutValue,
              positionClass: 'toast-top-right',
              closeButton: true,
              progressBar: true,
            }
          );
          return of(error);
        })
      );
  }

  getAllAdvertisements(): Observable<any> {
    this.spinner.show();
    return this.httpClient
      .get<any>(this.backendApiUrl + '/public/list-advertisements')
      .pipe(
        take(1),
        timeout(this.apiLongSearchTimeoutValue),
        finalize(() => {
          this.spinner.hide();
        }),
        catchError((error) => {
          this.toastService.error(
            error.message,
            'Retrieving Advertisements Failed',
            {
              timeOut: this.toastrTimeoutValue,
              positionClass: 'toast-top-right',
              closeButton: true,
              progressBar: true,
            }
          );
          return of(error);
        })
      );
  }
  getAllUsersAdvertisementsPendingApproval(): Observable<any> {
    this.spinner.show();
    return this.httpClient
      .get<any>(
        this.backendApiUrl + '/admin/list-advertisements-pending-approval'
      )
      .pipe(
        take(1),
        timeout(this.apiTimeoutValue),
        finalize(() => {
          this.spinner.hide();
        }),
        catchError((error) => {
          this.toastService.error(
            error.message,
            'Retrieving Advertisement Failed',
            {
              timeOut: this.toastrTimeoutValue,
              positionClass: 'toast-top-right',
              closeButton: true,
              progressBar: true,
            }
          );
          return of(error);
        })
      );
  }
  addFavoriteAdvertisement(
    userAdvertisementId: any,
    userId: any
  ): Observable<any> {
    this.spinner.show();
    return this.httpClient
      .post<any>(this.backendApiUrl + '/users/add-favorite-advertisement', {
        userAdvertisementId: userAdvertisementId,
        userId: userId,
      })
      .pipe(
        take(1),
        timeout(this.apiTimeoutValue),
        finalize(() => {
          this.spinner.hide();
        }),
        catchError((error) => {
          this.toastService.error(
            error.message,
            'Retrieving Favorite Advertisement Failed',
            {
              timeOut: this.toastrTimeoutValue,
              positionClass: 'toast-top-right',
              closeButton: true,
              progressBar: true,
            }
          );
          return of(error);
        })
      );
  }
  deleteFavoriteAdvertisement(
    userAdvertisementId: any,
    userId: any
  ): Observable<any> {
    this.spinner.show();
    return this.httpClient
      .post<any>(this.backendApiUrl + '/users/delete-favorite-advertisement', {
        userAdvertisementId: userAdvertisementId,
        userId: userId,
      })
      .pipe(
        take(1),
        timeout(this.apiTimeoutValue),
        finalize(() => {
          this.spinner.hide();
        }),
        catchError((error) => {
          this.toastService.error(
            error.message,
            'Deleting Favorite Advertisement Failed',
            {
              timeOut: this.toastrTimeoutValue,
              positionClass: 'toast-top-right',
              closeButton: true,
              progressBar: true,
            }
          );
          return of(error);
        })
      );
  }
  addUserRating(rate: any, userId: any, ratedBy: any): Observable<any> {
    this.spinner.show();
    return this.httpClient
      .post<any>(this.backendApiUrl + '/users/add-user-rating', {
        rate: rate,
        userId: userId,
        ratedBy: ratedBy,
      })
      .pipe(
        take(1),
        timeout(this.apiTimeoutValue),
        finalize(() => {
          this.spinner.hide();
        }),
        catchError((error) => {
          this.toastService.error(
            error.message,
            'Updating User Rating Failed',
            {
              timeOut: this.toastrTimeoutValue,
              positionClass: 'toast-top-right',
              closeButton: true,
              progressBar: true,
            }
          );
          return of(error);
        })
      );
  }

  isUserFavoriteAd(userAdvertisementId: any, userId: any): Observable<any> {
    this.spinner.show();
    return this.httpClient
      .post<any>(this.backendApiUrl + '/users/is-user-favorite-ad', {
        userAdvertisementId: userAdvertisementId,
        userId: userId,
      })
      .pipe(
        take(1),
        timeout(this.apiTimeoutValue),
        finalize(() => {
          this.spinner.hide();
        }),
        catchError((error) => {
          this.toastService.error(
            error.message,
            'User Favorite Advertisement Failed',
            {
              timeOut: this.toastrTimeoutValue,
              positionClass: 'toast-top-right',
              closeButton: true,
              progressBar: true,
            }
          );
          return of(error);
        })
      );
  }
  sendAdvertisementMessage(
    userId: any,
    messageBy: any,
    userAdvertisementId: any,
    message: any
  ): Observable<any> {
    this.spinner.show();
    return this.httpClient
      .post<any>(this.backendApiUrl + '/users/post-advertisement-message', {
        message: message,
        userId: userId,
        messageBy: messageBy,
        userAdvertisementId: userAdvertisementId,
      })
      .pipe(
        take(1),
        timeout(this.apiTimeoutValue),
        finalize(() => {
          this.spinner.hide();
        }),
        catchError((error) => {
          this.toastService.error(
            error.message,
            'Posting Advertisement Message Failed',
            {
              timeOut: this.toastrTimeoutValue,
              positionClass: 'toast-top-right',
              closeButton: true,
              progressBar: true,
            }
          );
          return of(error);
        })
      );
  }
  getUserAdvertisementMessages(userId: any): Observable<any> {
    this.spinner.show();
    return this.httpClient
      .post<any>(
        this.backendApiUrl + '/users/get-user-advertisement-messages',
        {
          userId: userId,
        }
      )
      .pipe(
        take(1),
        timeout(this.apiTimeoutValue),
        finalize(() => {
          this.spinner.hide();
        }),
        catchError((error) => {
          this.toastService.error(
            error.message,
            'Retrieving User Advertisement Messages Failed',
            {
              timeOut: this.toastrTimeoutValue,
              positionClass: 'toast-top-right',
              closeButton: true,
              progressBar: true,
            }
          );
          return of(error);
        })
      );
  }
  deleteUserAdvertisementMessage(
    userId: any,
    messageId: any,
    fromUserId: any,
    advertisementId: any
  ): Observable<any> {
    this.spinner.show();
    return this.httpClient
      .post<any>(
        this.backendApiUrl + '/users/delete-user-advertisement-messages',
        {
          userId: userId,
          messageId: messageId,
          fromUserId: fromUserId,
          advertisementId: advertisementId,
        }
      )
      .pipe(
        take(1),
        timeout(this.apiTimeoutValue),
        finalize(() => {
          this.spinner.hide();
        }),
        catchError((error) => {
          this.toastService.error(
            error.message,
            'Deleting User Advertisement Message Failed',
            {
              timeOut: this.toastrTimeoutValue,
              positionClass: 'toast-top-right',
              closeButton: true,
              progressBar: true,
            }
          );
          return of(error);
        })
      );
  }
  getFavoriteAdvertisements(userId: any): Observable<any> {
    this.spinner.show();
    return this.httpClient
      .post<any>(
        this.backendApiUrl + '/users/get-user-favorite-advertisements',
        {
          userId: userId,
        }
      )
      .pipe(
        take(1),
        timeout(this.apiTimeoutValue),
        finalize(() => {
          this.spinner.hide();
        }),
        catchError((error) => {
          this.toastService.error(
            error.message,
            'Retrieving User Favorite Advertisement Failed',
            {
              timeOut: this.toastrTimeoutValue,
              positionClass: 'toast-top-right',
              closeButton: true,
              progressBar: true,
            }
          );
          return of(error);
        })
      );
  }
  deleteUserFavoriteAdvertisement(
    userId: any,
    userAdvertisementId: any
  ): Observable<any> {
    this.spinner.show();
    return this.httpClient
      .post<any>(
        this.backendApiUrl + '/users/delete-user-favorite-advertisement',
        {
          userId: userId,
          userAdvertisementId: userAdvertisementId,
        }
      )
      .pipe(
        take(1),
        timeout(this.apiTimeoutValue),
        finalize(() => {
          this.spinner.hide();
        }),
        catchError((error) => {
          this.toastService.error(
            error.message,
            'Deleting User Favorite Advertisement Failed',
            {
              timeOut: this.toastrTimeoutValue,
              positionClass: 'toast-top-right',
              closeButton: true,
              progressBar: true,
            }
          );
          return of(error);
        })
      );
  }
  getAdvertisementMessageThreads(
    userId: any,
    fromUserId: any,
    userAdvertisementId: any
  ): Observable<any> {
    this.spinner.show();
    return this.httpClient
      .post<any>(
        this.backendApiUrl + '/users/get-user-advertisement-message-threads',
        {
          userId: userId,
          fromUserId: fromUserId,
          userAdvertisementId: userAdvertisementId,
        }
      )
      .pipe(
        take(1),
        timeout(this.apiTimeoutValue),
        finalize(() => {
          this.spinner.hide();
        }),
        catchError((error) => {
          this.toastService.error(
            error.message,
            'Retrieving User Advertisement Messages Failed',
            {
              timeOut: this.toastrTimeoutValue,
              positionClass: 'toast-top-right',
              closeButton: true,
              progressBar: true,
            }
          );
          return of(error);
        })
      );
  }
  getUserMessageInfo(messageId: any): Observable<any> {
    this.spinner.show();
    return this.httpClient
      .post<any>(this.backendApiUrl + '/users/get-user-message-info', {
        messageId: messageId,
      })
      .pipe(
        take(1),
        timeout(this.apiTimeoutValue),
        finalize(() => {
          this.spinner.hide();
        }),
        catchError((error) => {
          this.toastService.error(
            error.message,
            'Retrieving User Advertisement Message Details Failed',
            {
              timeOut: this.toastrTimeoutValue,
              positionClass: 'toast-top-right',
              closeButton: true,
              progressBar: true,
            }
          );
          return of(error);
        })
      );
  }
  updateUserMessageView(messageId: any): Observable<any> {
    this.spinner.show();
    return this.httpClient
      .post<any>(this.backendApiUrl + '/users/update-user-message-view', {
        messageId: messageId,
      })
      .pipe(
        take(1),
        timeout(this.apiTimeoutValue),
        finalize(() => {
          this.spinner.hide();
        }),
        catchError((error) => {
          this.toastService.error(
            error.message,
            'Updating User Advertisement Messages Failed',
            {
              timeOut: this.toastrTimeoutValue,
              positionClass: 'toast-top-right',
              closeButton: true,
              progressBar: true,
            }
          );
          return of(error);
        })
      );
  }
  deleteUserAllMessages(userId: any): Observable<any> {
    this.spinner.show();
    return this.httpClient
      .post<any>(this.backendApiUrl + '/users/delete-user-messages', {
        userId: userId,
      })
      .pipe(
        take(1),
        timeout(this.apiTimeoutValue),
        finalize(() => {
          this.spinner.hide();
        }),
        catchError((error) => {
          this.toastService.error(
            error.message,
            'Deleting User Advertisement Messages Failed',
            {
              timeOut: this.toastrTimeoutValue,
              positionClass: 'toast-top-right',
              closeButton: true,
              progressBar: true,
            }
          );
          return of(error);
        })
      );
  }
  getUserNumberOfNewMessages(userId: any): Observable<any> {
    this.spinner.show();
    return this.httpClient
      .post<any>(this.backendApiUrl + '/users/get-user-new-message-nbr', {
        userId: userId,
      })
      .pipe(
        take(1),
        timeout(this.apiTimeoutValue),
        tap((nbr) => this.storageService.updateUserNewMessagesNbr(nbr)),
        finalize(() => {
          this.spinner.hide();
        }),
        catchError((error) => {
          this.toastService.error(
            error.message,
            'Retrieving Number of New Advertisement Messages Failed',
            {
              timeOut: this.toastrTimeoutValue,
              positionClass: 'toast-top-right',
              closeButton: true,
              progressBar: true,
            }
          );
          return of(error);
        })
      );
  }
  createNewUser(user: any): Observable<any> {
    this.spinner.show();
    return this.httpClient
      .post<any>(this.backendApiUrl + '/admin/create-new-user', {
        user: user,
      })
      .pipe(
        take(1),
        timeout(this.apiTimeoutValue),
        finalize(() => {
          this.spinner.hide();
        }),
        catchError((error) => {
          this.toastService.error(error.message, 'Creating New User Failed', {
            timeOut: this.toastrTimeoutValue,
            positionClass: 'toast-top-right',
            closeButton: true,
            progressBar: true,
          });
          return of(error);
        })
      );
  }
  getUserPermissions(userId: any): Observable<any> {
    this.spinner.show();
    return this.httpClient
      .post<any>(this.backendApiUrl + '/admin/get-user-permissions', {
        userId: userId,
      })
      .pipe(
        take(1),
        timeout(this.apiTimeoutValue),
        finalize(() => {
          this.spinner.hide();
        }),
        catchError((error) => {
          this.toastService.error(
            error.message,
            'Retrieving User Permissions Failed',
            {
              timeOut: this.toastrTimeoutValue,
              positionClass: 'toast-top-right',
              closeButton: true,
              progressBar: true,
            }
          );
          return of(error);
        })
      );
  }
  updateUserPermissions(data: any): Observable<any> {
    this.spinner.show();
    return this.httpClient
      .post<any>(this.backendApiUrl + '/admin/update-user-permissions', data)
      .pipe(
        take(1),
        timeout(this.apiTimeoutValue),
        tap((nbr) => this.storageService.updateUserNewMessagesNbr(nbr)),
        finalize(() => {
          this.spinner.hide();
        }),
        catchError((error) => {
          this.toastService.error(
            error.message,
            'Updating User Permissions Failed',
            {
              timeOut: this.toastrTimeoutValue,
              positionClass: 'toast-top-right',
              closeButton: true,
              progressBar: true,
            }
          );
          return of(error);
        })
      );
  }
  getUserDetails(userId: any): Observable<any> {
    this.spinner.show();
    return this.httpClient
      .post<any>(this.backendApiUrl + '/admin/get-user-details', {
        userId: userId,
      })
      .pipe(
        take(1),
        timeout(this.apiTimeoutValue),
        finalize(() => {
          this.spinner.hide();
        }),
        catchError((error) => {
          this.toastService.error(
            error.message,
            'Getting User Details Failed',
            {
              timeOut: this.toastrTimeoutValue,
              positionClass: 'toast-top-right',
              closeButton: true,
              progressBar: true,
            }
          );
          return of(error);
        })
      );
  }
  getUserDashboardAdminDetails(): Observable<any> {
    this.spinner.show();
    return this.httpClient
      .get<any>(this.backendApiUrl + '/admin/get-user-dashboard-details')
      .pipe(
        take(1),
        timeout(this.apiTimeoutValue),
        finalize(() => {
          this.spinner.hide();
        }),
        catchError((error) => {
          this.toastService.error(
            error.message,
            'Getting User Dashboard Info. Failed',
            {
              timeOut: this.toastrTimeoutValue,
              positionClass: 'toast-top-right',
              closeButton: true,
              progressBar: true,
            }
          );
          return of(error);
        })
      );
  }
  getUserDashboardAdminDetailsBasedOnRegistrationAndPlanType(): Observable<any> {
    this.spinner.show();
    return this.httpClient
      .get<any>(
        this.backendApiUrl +
          '/admin/get-user-count-based-planTypes-andRegistrationDate'
      )
      .pipe(
        take(1),
        timeout(this.apiTimeoutValue),
        finalize(() => {
          this.spinner.hide();
        }),
        catchError((error) => {
          this.toastService.error(
            error.message,
            'Getting User Dashboard Info. Failed',
            {
              timeOut: this.toastrTimeoutValue,
              positionClass: 'toast-top-right',
              closeButton: true,
              progressBar: true,
            }
          );
          return of(error);
        })
      );
  }
  getUserDashboardTotalCountBasedOnPlanType(): Observable<any> {
    this.spinner.show();
    return this.httpClient
      .get<any>(
        this.backendApiUrl + '/admin/get-uses-totalCount-based-planType'
      )
      .pipe(
        take(1),
        timeout(this.apiTimeoutValue),
        finalize(() => {
          this.spinner.hide();
        }),
        catchError((error) => {
          this.toastService.error(
            error.message,
            'Getting User Dashboard Info. Failed',
            {
              timeOut: this.toastrTimeoutValue,
              positionClass: 'toast-top-right',
              closeButton: true,
              progressBar: true,
            }
          );
          return of(error);
        })
      );
  }
}
