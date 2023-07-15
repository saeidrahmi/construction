import { UserInterface } from '../models/user';
import { Component, OnInit, inject, DestroyRef } from '@angular/core';
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
import { CommonUtilityService } from '../services/common-utility.service';
import { CommonModule } from '@angular/common';
import { ApiService } from '../services/api.service';
import { ApiServerErrorComponent } from '../public/apiServerError/api-server-error.component';
import { FormErrorsComponent } from '../public/form-errors.component';
import { SpinnerComponent } from '../public/spinner/spinner.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EnvironmentInfo } from 'libs/common/src/models/common';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { FormService } from '../services/form.service';

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
  name: string = '';
  password: string = '';
  confirmPassword: string = '';
  serverError: string = '';
  formErrors: string[] = [];
  useCase: string = 'Personal purpose';
  form!: FormGroup;
  destroyRef = inject(DestroyRef);
  options: string[] = ['Personal purpose', 'Business purpose'];
  loading!: boolean;
  allowedOperation: boolean = false;
  token: string | null = '';
  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private apiService: ApiService,
    private router: Router,
    private formService: FormService,
    public commonUtility: CommonUtilityService
  ) {
    this.token = this.route.snapshot.paramMap.get('token');
    const tokenValid: boolean = this.commonUtility.isTokenValid(
      this.token as string
    );
    if (!!this.token && tokenValid) {
      this.allowedOperation = true;
      this.userId = this.commonUtility.decodeStringJWTTokenInfo(
        this.token as string,
        'userId'
      );
    } else this.allowedOperation = false;
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
    this.form.setValidators([this.matchPassword]);
  }
  matchPassword: ValidatorFn = (
    control: AbstractControl
  ): ValidationErrors | null => {
    let pass = control.get('password')?.value;
    let confirmPass = control.get('confirmPassword')?.value;
    console.log(pass, confirmPass);
    if (pass && confirmPass && pass !== confirmPass)
      return { matchError: true };
    else return null;
  };

  register(): void {
    if (this.form.valid) {
      this.loading = true;
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
          tap(() => {}),
          catchError((err) => {
            this.serverError = err;
            return of(err);
          }),
          finalize(() => {
            this.loading = false;
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
