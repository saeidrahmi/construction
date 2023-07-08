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

@Component({
  selector: 'construction-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  apiService = inject(ApiService);
  router = inject(Router);
  fb = inject(FormBuilder);
  storageService = inject(StorageService);
  isLoggedIn = this.storageService.isUserLoggedIn();
  loginForm: FormGroup;
  destroyRef = inject(DestroyRef);
  constructor() {
    if (this.isLoggedIn()) this.router.navigate(['/']);
    this.loginForm = this.fb.nonNullable.group({
      userId: new FormControl<string>('admin', [Validators.required]),
      password: new FormControl<string>('admin', [Validators.required]),
    });
  }

  login() {
    this.apiService
      .login(this.loginForm.value)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
  }
}
