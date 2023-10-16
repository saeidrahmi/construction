import { UserInterface } from '../../models/user';
import { Component, inject, DestroyRef, signal } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  FormControl,
  Validators,
  ValidatorFn,
  AbstractControl,
  ValidationErrors,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import {
  ActivatedRoute,
  Router,
  RouterLink,
  RouterModule,
} from '@angular/router';

import { takeUntil, tap, catchError, of, finalize, take } from 'rxjs';
import { CommonUtilityService } from '../../services/common-utility.service';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { ApiServerErrorComponent } from '../apiServerError/api-server-error.component';
import { FormErrorsComponent } from '../form-errors.component';
import { SpinnerComponent } from '../spinner/spinner.component';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { EnvironmentInfo } from 'libs/common/src/models/common';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { FormService } from '../../services/form.service';
import { StorageService } from '../../services/storage.service';
import { UserRoutingService } from '../../services/user-routing.service';
import { ValidatorsService } from '../../services/validators.service';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatStepper, MatStepperModule } from '@angular/material/stepper';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ToastrService } from 'ngx-toastr';
import { PlanInterface } from '../../models/plan';

@Component({
  selector: 'construction-register',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ApiServerErrorComponent,
    RouterLink,
    RouterModule,
    FormErrorsComponent,
    SpinnerComponent,
    NgbDropdownModule,
    MatStepperModule,
    MatButtonModule,
    MatRadioModule,
    MatCheckboxModule,
    MatIconModule,
    MatTooltipModule,
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
  env: EnvironmentInfo = new EnvironmentInfo();
  userId: string = '';

  password: string = '';
  confirmPassword: string = '';
  serverError: string = '';
  formErrors: string[] = [];
  useCase: string = 'Personal purpose';
  toastService = inject(ToastrService);
  registerForm: FormGroup;
  destroyRef = inject(DestroyRef);
  validatorsService = inject(ValidatorsService);
  userRouting = inject(UserRoutingService);
  storageService = inject(StorageService);
  options: string[] = ['Personal purpose', 'Business purpose'];
  tokenValid = signal<boolean>(false);
  token: string | null = '';

  getPlans$ = this.apiService.getAllActivePlans().pipe(
    takeUntilDestroyed(),
    tap((plans: any) => {
      this.listPlans = plans;
    }),
    catchError((err) => {
      this.toastService.error('Users list failed. ' + err, 'List failure', {
        timeOut: 3000,
        positionClass: 'toast-top-right',
        closeButton: true,
        progressBar: true,
      });
      return of(err);
    })
  );
  listPlans: any;
  selectedPlan: PlanInterface;
  tax: any;
  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private apiService: ApiService,

    private formService: FormService,
    public commonUtility: CommonUtilityService
  ) {
    this.token = this.route.snapshot.paramMap.get('token');

    if (!!this.token) {
      const checkTokenOk = this.commonUtility.isTokenValid(
        this.token as string
      );

      if (checkTokenOk) {
        this.userId = this.commonUtility.decodeStringJWTTokenInfo(
          this.token as string,
          'userId'
        );
        this.storageService.updateIsLoading(true);
        this.apiService
          .checkUserToken(this.token)
          .pipe(
            takeUntilDestroyed(this.destroyRef),
            finalize(() => this.storageService.updateIsLoading(false)),
            tap((response) => {
              this.tokenValid.set(response);
            }),
            catchError((err) => {
              this.serverError = err;
              this.tokenValid.set(false);
              return of(false);
            })
          )
          .subscribe();
      } else this.tokenValid.set(false);
    } else this.tokenValid.set(false);

    this.registerForm = this.fb.group({
      formArray: this.fb.array([
        this.fb.group({
          useCase: new FormControl('', []),
          userId: new FormControl({ value: '', disabled: true }, [
            Validators.required,
            Validators.email,
          ]),
          firstName: new FormControl('', [Validators.required]),
          lastName: new FormControl('', [Validators.required]),
          password: new FormControl('', {
            validators: [
              Validators.required,
              Validators.minLength(8),
              Validators.maxLength(12),
              Validators.pattern(this.commonUtility.passwordRuleRegExp()),
            ],
            updateOn: 'change',
          }),
          confirmPassword: new FormControl('', [Validators.required]),
          confirmCheckbox: new FormControl('', [Validators.required]),
        }),
      ]),
    });
    this.formArray
      ?.get([0])
      ?.setValidators([this.validatorsService.matchPassword]);
    this.getPlans$.subscribe();
    this.apiService
      .getTax()
      .pipe(
        takeUntilDestroyed(),
        take(1),
        tap((info: any) => {
          this.tax = info.tax;
        }),
        catchError((err) => {
          return of(err);
        })
      )
      .subscribe();
  }
  get formArray(): AbstractControl | null {
    return this.registerForm?.get('formArray');
  }
  processPlan(plan: PlanInterface, stepper: MatStepper) {
    if (this.registerForm.valid) {
      if (plan.planType === 'free') {
        this.registerFreePlan(plan, stepper);
      } else {
        this.selectedPlan = plan;
        stepper.next();
      }
    } else {
      this.formErrors = this.formService.getFormValidationErrorMessages(
        this.formArray?.get([0]) as FormGroup
      );
    }
  }
  getUserInfo(): UserInterface {
    const user: UserInterface = {
      userId: this.commonUtility.trimString(
        this.formArray?.get([0]).get('userId')?.value
      ),
      purpose: this.commonUtility.trimString(this.useCase),
      active: true,
      registeredDate: new Date(),
      password: this.commonUtility.trimString(
        this.formArray?.get([0]).get('password')?.value
      ),
      role: 'general',
      firstName: this.commonUtility.trimString(
        this.formArray?.get([0]).get('firstName')?.value
      ),
      lastName: this.commonUtility.trimString(
        this.formArray?.get([0]).get('lastName')?.value
      ),
    };
    return user;
  }
  registerFreePlan(plan: PlanInterface, stepper: MatStepper) {
    this.serverError = '';
    const user = this.getUserInfo();

    this.apiService
      .registerFreePlan(user, plan, this.token as string)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.storageService.updateIsLoading(false)),
        tap((response) => {
          this.storageService.updateStateLoginSuccessful(response);
          this.userRouting.navigateToUserMainPage();
        }),
        catchError((err) => {
          this.serverError = err;
          return of(err);
        })
      )
      .subscribe();
  }
  registerPaidPlan() {
    if (this.registerForm.valid) {
      const user = this.getUserInfo();
      const payment = {
        amount: this.selectedPlan?.priceAfterDiscount,
        totalAmount:
          (parseFloat(this.selectedPlan?.priceAfterDiscount.toString()) *
            parseFloat(this.tax)) /
            100 +
          parseFloat(this.selectedPlan?.priceAfterDiscount.toString()),
        tax:
          (parseFloat(this.selectedPlan?.priceAfterDiscount.toString()) *
            parseFloat(this.tax)) /
          100,
        paymentConfirmation: 'Confirmed1234',
      };
      this.apiService
        .registerPaidPlan(
          user,
          this.selectedPlan,
          payment,
          this.token as string
        )
        .pipe(
          takeUntilDestroyed(this.destroyRef),
          finalize(() => this.storageService.updateIsLoading(false)),
          tap((response) => {
            this.storageService.updateStateLoginSuccessful(response);
            this.userRouting.navigateToUserMainPage();
          }),
          catchError((err) => {
            this.serverError = err;
            return of(err);
          })
        )
        .subscribe();
    } else {
      this.formErrors = this.formService.getFormValidationErrorMessages(
        this.formArray?.get([0]) as FormGroup
      );
    }
  }
  goForward(stepper: MatStepper, index: number) {
    if (this.formArray?.get([index])?.valid) {
      stepper.next();
    } else {
      this.formErrors = this.formService.getFormValidationErrorMessages(
        this.formArray?.get([index]) as FormGroup
      );
    }
  }
}
