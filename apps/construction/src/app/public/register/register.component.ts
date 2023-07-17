import { UserInterface } from '../../models/user';
import { Component, OnInit, inject, DestroyRef, signal } from '@angular/core';
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

import { takeUntil, tap, catchError, of, finalize } from 'rxjs';
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
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnInit {
  env: EnvironmentInfo = new EnvironmentInfo();
  userId: string = '';

  password: string = '';
  confirmPassword: string = '';
  serverError: string = '';
  formErrors: string[] = [];
  useCase: string = 'Personal purpose';
  form!: FormGroup;
  destroyRef = inject(DestroyRef);
  validatorsService = inject(ValidatorsService);
  userRouting = inject(UserRoutingService);
  storageService = inject(StorageService);
  options: string[] = ['Personal purpose', 'Business purpose'];
  tokenValid = signal<boolean>(false);
  token: string | null = '';

  loading = this.storageService.isLoading();
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
  }

  ngOnInit(): void {
    this.form = this.fb.group({
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
    });
    this.form.setValidators([this.validatorsService.matchPassword]);
  }

  register(): void {
    if (this.form.valid) {
      this.storageService.updateIsLoading(true);
      this.serverError = '';
      let user: UserInterface = {
        userId: this.commonUtility.trimString(this.form.get('userId')?.value),
        purpose: this.commonUtility.trimString(this.useCase),
        active: true,
        registeredDate: new Date(),
        password: this.commonUtility.trimString(
          this.form.get('password')?.value
        ),
        role: 'general',
        firstName: this.commonUtility.trimString(
          this.form.get('firstName')?.value
        ),
        lastName: this.commonUtility.trimString(
          this.form.get('lastName')?.value
        ),
      };

      this.apiService
        .register(user, this.token as string)
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
        this.form
      );
    }
  }
}
