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
import { ApiServerErrorComponent } from '../../public/apiServerError/api-server-error.component';
import { FormErrorsComponent } from '../../public/form-errors.component';
import { SpinnerComponent } from '../../public/spinner/spinner.component';
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
  ],
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss'],
})
export class ChangePasswordComponent implements OnInit {
  env: EnvironmentInfo = new EnvironmentInfo();
  userId: string = '';
  password: string = '';
  currentPassword: string = '';
  confirmPassword: string = '';
  serverError: string = '';
  formErrors: string[] = [];
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;

  form!: FormGroup;
  destroyRef = inject(DestroyRef);
  toastService = inject(ToastrService);
  validatorsService = inject(ValidatorsService);
  userRouting = inject(UserRoutingService);
  storageService = inject(StorageService);
  loading = this.storageService.isLoading();

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private apiService: ApiService,
    private router: Router,
    private formService: FormService,
    public commonUtility: CommonUtilityService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      currentPassword: new FormControl('', [Validators.required]),
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

  changePassword(): void {
    this.formErrors = [];
    if (this.form.valid) {
      this.storageService.updateIsLoading(true);
      this.serverError = '';

      let data: any = {
        userId: this.storageService.getUserId()(),
        currentPassword: this.commonUtility.trimString(
          this.form.get('currentPassword')?.value
        ),
        password: this.commonUtility.trimString(
          this.form.get('password')?.value
        ),
      };

      this.apiService
        .changePassword(data)
        .pipe(
          takeUntilDestroyed(this.destroyRef),
          finalize(() => {
            this.storageService.updateIsLoading(false);
          }),
          tap((response) => {
            this.toastService.success('Plan purchased. ', 'Success', {
              timeOut: 3000,
              positionClass: 'toast-top-right',
              closeButton: true,
              progressBar: true,
            });
          }),
          catchError((err) => {
            this.toastService.error(
              'Plan list failed. ' + err,
              'Plan failure',
              {
                timeOut: 3000,
                positionClass: 'toast-top-right',
                closeButton: true,
                progressBar: true,
              }
            );
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

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }
}
