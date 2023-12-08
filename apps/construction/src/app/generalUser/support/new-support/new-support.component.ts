import { Component, DestroyRef, inject } from '@angular/core';
import { StorageService } from '../../../services/storage.service';
import { Router } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { tap } from 'rxjs';
import { EncryptionService } from '../../../services/encryption-service';
import { FormService } from '../../../services/form.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-new-support',
  templateUrl: './new-support.component.html',
  styleUrls: ['./new-support.component.css'],
})
export class NewSupportComponent {
  apiService = inject(ApiService);
  storageService = inject(StorageService);
  router = inject(Router);
  destroyRef = inject(DestroyRef);

  encryptionService = inject(EncryptionService);
  toastService = inject(ToastrService);
  formService = inject(FormService);

  plan = this.storageService.getPlan();
  contactForm: FormGroup;
  formErrors: string[] = [];
  requestType: string = 'type';
  description: string = '';
  subject: string = '';
  constructor(private fb: FormBuilder) {
    if (this.plan()?.onlineSupportIncluded != 1)
      this.router.navigate(['/general/dashboard']);
    this.contactForm = this.fb.group({
      description: new FormControl(),
      requestType: new FormControl(),
      subject: new FormControl(),
    });
  }
  submit() {
    this.formErrors = [];

    if (this.contactForm.invalid) {
      this.formErrors = this.formService.getFormValidationErrorMessages(
        this.contactForm
      );
    } else {
      const data = {
        userId: this.encryptionService.encryptItem(
          this.storageService?.getUserId()()
        ),
        description: this.description,
        requestType: this.requestType,
        subject: this.subject,
      };

      this.apiService
        .submitUserRequest(data)
        .pipe(
          takeUntilDestroyed(this.destroyRef),
          tap(() => {
            this.toastService.success('Request Submitted.', 'Successful', {
              timeOut: 3000,
              positionClass: 'toast-top-right',
              closeButton: true,
              progressBar: true,
            });
          })
        )
        .subscribe();
    }
  }
}
