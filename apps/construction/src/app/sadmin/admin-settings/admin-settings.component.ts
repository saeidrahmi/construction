import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormGroup,
  FormBuilder,
  FormControl,
  Validators,
} from '@angular/forms';
import { FormService } from '../../services/form.service';
import { AdminSettingsInterface } from 'libs/common/src/models/admin-settings';
import { UserApiResponseInterface } from 'libs/common/src/models/user-response';
import { ToastrService } from 'ngx-toastr';
import { tap, catchError, of, take } from 'rxjs';
import { ApiService } from '../../services/api.service';
import { StorageService } from '../../services/storage.service';

@Component({
  selector: 'app-admin-settings',
  templateUrl: './admin-settings.component.html',
  styleUrls: ['./admin-settings.component.css'],
})
export class AdminSettingsComponent {
  form: FormGroup;
  setting: AdminSettingsInterface = {};
  apiService = inject(ApiService);
  toastService = inject(ToastrService);
  storageService = inject(StorageService);
  destroyRef = inject(DestroyRef);
  planType = '';

  formService = inject(FormService);
  formErrors: string[] = [];
  initialSetting: AdminSettingsInterface = {};
  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      freeTiralPeriod: new FormControl('', [Validators.required]),
      monthlyPrice: new FormControl('', [Validators.required]),
      monthlyDiscount: new FormControl('', [Validators.required]),
      quarterlyDiscount: new FormControl('', [Validators.required]),
      semiAnualDiscount: new FormControl('', [Validators.required]),
      yearlyDiscount: new FormControl('', [Validators.required]),
    });
    this.storageService.updateIsLoading(true);
    this.apiService
      .getAdminSettings()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        take(1),
        tap((setting: AdminSettingsInterface) => {
          this.setting = setting;
          this.initialSetting = { ...setting };
        }),
        catchError((err) => {
          this.toastService.error(
            'Getting Settings failed. ' + err,
            'List failure',
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
  }
  resetSetting() {
    this.setting = { ...this.initialSetting };
  }
  submit() {
    if (this.form.invalid) {
      this.formErrors = this.formService.getFormValidationErrorMessages(
        this.form
      );
    } else {
      this.storageService.updateIsLoading(true);
      this.apiService
        .updateAdminSettings(this.setting)
        .pipe(
          takeUntilDestroyed(this.destroyRef),
          tap((setting: AdminSettingsInterface) => {
            this.setting = setting;
            this.initialSetting = setting;
            this.toastService.success('Updated.', 'Update Successful', {
              timeOut: 3000,
              positionClass: 'toast-top-right',
              closeButton: true,
              progressBar: true,
            });
          }),
          catchError((err) => {
            this.toastService.error('Update failed. ' + err, 'Update failure', {
              timeOut: 3000,
              positionClass: 'toast-top-right',
              closeButton: true,
              progressBar: true,
            });
            return of(err);
          })
        )
        .subscribe();
    }
  }
}