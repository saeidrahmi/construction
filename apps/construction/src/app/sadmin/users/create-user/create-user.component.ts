import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { StorageService } from '../../../services/storage.service';
import {
  FormGroup,
  FormControl,
  Validators,
  FormBuilder,
} from '@angular/forms';
import { EnvironmentInfo } from 'libs/common/src/models/common';
import { FormService } from '../../../services/form.service';

@Component({
  selector: 'app-create-user',
  templateUrl: './create-user.component.html',
  styleUrls: ['./create-user.component.css'],
})
export class CreateUserComponent {
  apiService = inject(ApiService);
  storageService = inject(StorageService);
  router = inject(Router);
  destroyRef = inject(DestroyRef);
  form: FormGroup;
  env: EnvironmentInfo = new EnvironmentInfo();
  formErrors: string[] = [];
  roles = this.env.getRoles();
  formService = inject(FormService);
  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      firstName: new FormControl('', [Validators.required]),
      userId: new FormControl('', [Validators.required]),
      lastName: new FormControl('', [Validators.required]),
      role: new FormControl('', [Validators.required]),
    });
  }
  submit() {
    this.formErrors = [];

    if (this.form.invalid) {
      this.formErrors = this.formService.getFormValidationErrorMessages(
        this.form
      );
    } else {
    }
  }
}
