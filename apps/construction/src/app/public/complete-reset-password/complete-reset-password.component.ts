import { UserInterface } from '../../models/user';
import {
  Component,
  OnInit,
  inject,
  DestroyRef,
  signal,
  Signal,
  WritableSignal,
} from '@angular/core';
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
import { UserService } from '../../services/user-service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'construction-change-password',
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
  templateUrl: './complete-reset-password.component.html',
  styleUrls: ['./complete-reset-password.component.scss'],
})
export class CompleteResetPasswordComponent implements OnInit {
  env: EnvironmentInfo = new EnvironmentInfo();
  userId: string = '';
  password: string = '';
  confirmPassword: string = '';
  serverError: string = '';
  formErrors: string[] = [];
  useCase: string = 'Personal purpose';
  form!: FormGroup;
  destroyRef = inject(DestroyRef);
  toastService = inject(ToastrService);
  validatorsService = inject(ValidatorsService);
  userRouting = inject(UserRoutingService);
  storageService = inject(StorageService);
  options: string[] = ['Personal purpose', 'Business purpose'];
  token: string | null = '';
  tokenValid = signal<boolean>(false);
  showPassword: boolean = false;
  loading = this.storageService.isLoading();
  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private apiService: ApiService,
    private router: Router,
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

        this.apiService
          .checkUserToken(this.token)
          .pipe(
            takeUntilDestroyed(this.destroyRef),

            tap((response) => {
              this.tokenValid.set(response);
            })
          )
          .subscribe();
      } else this.tokenValid.set(false);
    } else this.tokenValid.set(false);
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      userId: new FormControl({ value: '', disabled: true }, [
        Validators.required,
        Validators.email,
      ]),

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
    });
    this.form.setValidators([this.validatorsService.matchPassword]);
  }

  completeResetPassword(): void {
    if (this.form.valid) {
      this.formErrors = [];
      this.serverError = '';
      let data = {
        userId: this.commonUtility.trimString(this.form.get('userId')?.value),
        password: this.commonUtility.trimString(
          this.form.get('password')?.value
        ),
        token: this.token,
      };

      this.apiService
        .completeResetPassword(data)
        .pipe(
          takeUntilDestroyed(this.destroyRef),

          tap(() => {
            this.toastService.success('Plan purchased. ', 'Success', {
              timeOut: 3000,
              positionClass: 'toast-top-right',
              closeButton: true,
              progressBar: true,
            });
            this.router.navigate(['/login']);
          })
        )
        .subscribe();
    } else {
      this.formErrors = this.formService.getFormValidationErrorMessages(
        this.form
      );
    }
  }
  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
}
