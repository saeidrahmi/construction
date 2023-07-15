import { Component, DestroyRef, inject } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  takeUntil,
  tap,
  catchError,
  of,
  finalize,
  map,
  take,
  delay,
} from 'rxjs';
import { CommonUtilityService } from '../../services/common-utility.service';
import { CommonModule } from '@angular/common';
import { FormService } from '../../services/form.service';
import { FormErrorsComponent } from '../form-errors.component';
import { ApiService } from '../../services/api.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ApiServerErrorComponent } from '../apiServerError/api-server-error.component';
import { SpinnerComponent } from '../spinner/spinner.component';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
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
export class SignupComponent {
  userId!: string;
  form!: FormGroup;
  signedUp: boolean = false;
  loading: boolean = false;
  formErrors: string[] = [];
  formService = inject(FormService);
  apiService = inject(ApiService);
  destroyRef = inject(DestroyRef);
  serverError: any;
  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private commonUtility: CommonUtilityService,
    private router: Router
  ) {
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

  register() {
    this.serverError = '';
    this.signedUp = false;
    if (this.form.valid) {
      this.loading = true;
      this.formErrors = [];
      this.apiService
        .signup(this.userId)
        .pipe(
          takeUntilDestroyed(this.destroyRef),
          finalize(() => {
            this.loading = false;
          }),

          map(() => {
            this.signedUp = true;
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
