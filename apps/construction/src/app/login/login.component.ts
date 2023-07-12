import { Component, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../services/api.service';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { StorageService } from '../services/storage.service';
import { Router } from '@angular/router';
import { SpinnerComponent } from '../spinner/spinner.component';
import { UserRoutingService } from '../services/user-routing.service';
import { ApiServerErrorComponent } from '../apiServerError/api-server-error.component';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'construction-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SpinnerComponent,
    NgbTooltipModule,
    ApiServerErrorComponent,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  apiService = inject(ApiService);
  router = inject(Router);
  fb = inject(FormBuilder);
  storageService = inject(StorageService);
  isLoggedIn = this.storageService.isUserLoggedIn();
  loginError = this.storageService.loginError();
  loginForm: FormGroup;
  destroyRef = inject(DestroyRef);
  userRouting = inject(UserRoutingService);
  serverError: string = '';
  constructor() {
    if (this.isLoggedIn()) this.userRouting.navigateToUserMainPage();
    this.loginForm = this.fb.nonNullable.group({
      userId: new FormControl<string>('admin', [Validators.required]),
      password: new FormControl<string>('admin', [Validators.required]),
    });
  }
  login() {
    if (this.loginForm.valid)
      this.apiService
        .login(this.loginForm.value)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe();
  }
  reset() {
    this.loginForm.reset();
    this.storageService.updateLoginError();
  }
}
