import { Component, OnInit, inject, DestroyRef } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  FormControl,
  Validators,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { RouterLink, RouterModule } from '@angular/router';

import { tap, catchError, of } from 'rxjs';
import { CommonUtilityService } from '../../services/common-utility.service';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { ApiServerErrorComponent } from '../apiServerError/api-server-error.component';
import { FormErrorsComponent } from '../form-errors.component';
import { SpinnerComponent } from '../spinner/spinner.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EnvironmentInfo } from 'libs/common/src/models/common';

import { FormService } from '../../services/form.service';
import { StorageService } from '../../services/storage.service';
import { UserRoutingService } from '../../services/user-routing.service';
import { ValidatorsService } from '../../services/validators.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'construction-reset-expired-password',
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
  templateUrl: './reset-expired-password.component.html',
  styleUrls: ['./reset-expired-password.component.scss'],
})
export class ResetExpiredPasswordComponent implements OnInit {
  env: EnvironmentInfo = new EnvironmentInfo();
  userId = '';
  password = '';
  currentPassword = '';
  confirmPassword = '';
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;
  serverError = '';
  formErrors: string[] = [];
  form!: FormGroup;
  destroyRef = inject(DestroyRef);
  toastService = inject(ToastrService);
  validatorsService = inject(ValidatorsService);
  userRouting = inject(UserRoutingService);
  storageService = inject(StorageService);
  loading = this.storageService.isLoading();
  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
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
  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  changePassword(): void {
    this.formErrors = [];
    if (this.form.valid) {
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

          tap(() => {
            this.storageService.updateLoginFlag(true);
            this.storageService.updatePasswordResetRequiredFlag(false);
            this.storageService.updatePasswordResetDateFlag(new Date());
            this.userRouting.navigateToUserMainPage();
            this.toastService.success(
              'Password reset Successful. ',
              'Successful',
              {
                timeOut: 3000,
                positionClass: 'toast-top-right',
                closeButton: true,
                progressBar: true,
              }
            );
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
  logout() {
    this.apiService
      .logout()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
  }
}
