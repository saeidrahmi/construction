import { Component, DestroyRef, inject } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { tap, catchError, of, finalize } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormService } from '../../services/form.service';
import { FormErrorsComponent } from '../form-errors.component';
import { ApiService } from '../../services/api.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ApiServerErrorComponent } from '../apiServerError/api-server-error.component';
import { SpinnerComponent } from '../spinner/spinner.component';
import { StorageService } from '../../services/storage.service';
import { EnvironmentInfo } from 'libs/common/src/models/common';

@Component({
  selector: 'app-signup',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ApiServerErrorComponent,
    RouterLink,
    CommonModule,
    FormErrorsComponent,
    SpinnerComponent,
  ],
})
export class ResetPasswordComponent {
  userId!: string;
  form!: FormGroup;
  resetDone: boolean = false;
  env: EnvironmentInfo = new EnvironmentInfo();
  passwordResetExpiry: number = this.env.getPasswordResetExpiry() / 3600; //convert to hour
  formErrors: string[] = [];
  formService = inject(FormService);
  storageService = inject(StorageService);
  apiService = inject(ApiService);
  destroyRef = inject(DestroyRef);
  serverError: any;
  loading: boolean = false;
  constructor(private route: ActivatedRoute, private fb: FormBuilder) {
    this.userId = this.route.snapshot.queryParams['email'];
    this.form = this.fb.group({
      userId: new FormControl<string>('', {
        validators: [
          Validators.required,
          Validators.minLength(8),
          Validators.maxLength(50),
          Validators.email,
        ],
        updateOn: 'blur',
      }),
    });
  }
  resetPassword() {
    this.serverError = '';
    this.resetDone = false;
    this.formErrors = [];
    if (this.form.valid) {
      this.loading = true;
      this.formErrors = [];
      this.apiService
        .resetPassword(this.userId)
        .pipe(
          takeUntilDestroyed(this.destroyRef),
          tap(() => {
            this.resetDone = true;
          }),
          finalize(() => {
            this.loading = false;
          }),
          catchError((error) => {
            this.serverError = error;
            return of(error.message);
          })
        )
        .subscribe();
    } else {
      // Get form validation errors
      this.formErrors = this.formService.getFormValidationErrorMessages(
        this.form
      );
    }
  }
}
