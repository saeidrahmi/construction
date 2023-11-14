import { AdminSettingsInterface } from './../../../../../../../libs/common/src/models/admin-settings';
import { Component, DestroyRef, inject } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { FormService } from '../../../services/form.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatTableDataSource } from '@angular/material/table';
import { UserApiResponseInterface } from 'libs/common/src/models/user-response';
import { ToastrService } from 'ngx-toastr';
import { tap, catchError, of, take } from 'rxjs';
import { ApiService } from '../../../services/api.service';
import { StorageService } from '../../../services/storage.service';
import { left } from '@popperjs/core';
import { PlanInterface } from '../../../models/plan';
import { Router } from '@angular/router';

@Component({
  selector: 'app-createPlan',
  templateUrl: './createPlan.component.html',
  styleUrls: ['./createPlan.component.css'],
})
export class CreatePlanComponent {
  apiService = inject(ApiService);
  toastService = inject(ToastrService);
  storageService = inject(StorageService);
  destroyRef = inject(DestroyRef);
  plan: PlanInterface = {};
  planType = '';
  form: FormGroup;
  formService = inject(FormService);
  formErrors: string[] = [];
  setting: AdminSettingsInterface = {};
  settingError = false;
  router = inject(Router);
  userPermissions = this.storageService.getUserPermissions();
  userRole = this.storageService.getUserRole();
  constructor(private fb: FormBuilder) {
    if (this.userRole() != 'SAdmin' && !this.userPermissions().createPlan)
      this.router.navigate(['/admin/user-profile']);
    this.apiService
      .getAdminSettings()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        take(1),
        tap((setting: AdminSettingsInterface) => {
          this.setting = setting;
        }),
        catchError((err) => {
          this.settingError = true;
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

    this.form = this.fb.group({
      planName: new FormControl('', [Validators.required]),
      planType: new FormControl('', [Validators.required]),
      startDate: new FormControl('', [Validators.required]),
      endDate: new FormControl('', [Validators.required]),
      customProfileIncluded: new FormControl('', []),
      viewBidsIncluded: new FormControl('', []),
      createBidsIncluded: new FormControl('', []),
      onlineSupportIncluded: new FormControl('', []),

      planDescription: new FormControl('', [Validators.required]),
      priceAfterDiscount: new FormControl({ value: '', disabled: true }, [
        Validators.required,
      ]),
      numberOfAdvertisements: new FormControl('', [Validators.required]),
    });
    this.form
      .get('planType')
      ?.valueChanges.pipe(takeUntilDestroyed())
      .subscribe((value) => {
        if (value === 'free') {
          this.form.get('price')?.setValue(0);
          this.plan.originalPrice = 0;
          this.plan.duration = this.setting.freeTiralPeriod;
          this.plan.discountPercentage = 0;
          this.plan.priceAfterDiscount = 0;
        } else {
          let monthNbr = 1,
            discount = 0;
          if (value === 'monthly') {
            monthNbr = 1;
            discount = this.setting?.monthlyDiscount
              ? this.setting?.monthlyDiscount
              : 0;
          } else if (value === 'quarterly') {
            monthNbr = 3;
            discount = this.setting?.quarterlyDiscount
              ? this.setting?.quarterlyDiscount
              : 0;
          }
          if (value === 'semi') {
            monthNbr = 6;
            discount = this.setting?.semiAnualDiscount
              ? this.setting?.semiAnualDiscount
              : 0;
          }
          if (value === 'yearly') {
            monthNbr = 12;
            discount = this.setting?.yearlyDiscount
              ? this.setting?.yearlyDiscount
              : 0;
          }
          this.plan.duration = monthNbr * 30;
          if (this.setting?.monthlyPrice && this.setting?.monthlyPrice > 0) {
            this.plan.originalPrice = this.setting?.monthlyPrice * monthNbr;
            this.plan.discountPercentage = discount;
            this.plan.priceAfterDiscount =
              Math.floor(
                (this.setting?.monthlyPrice * monthNbr -
                  (this.setting?.monthlyPrice * monthNbr * discount) / 100) *
                  100
              ) / 100;

            this.form.get('price')?.setValue(this.plan.priceAfterDiscount);
          } else {
            this.plan.originalPrice = 0;
            this.plan.discountPercentage = 0;
            this.plan.priceAfterDiscount = 0;
            this.form.get('price')?.setValue(0);
          }
        }
      });
  }
  submit() {
    this.formErrors = [];
    if (this.form.invalid) {
      this.formErrors = this.formService.getFormValidationErrorMessages(
        this.form
      );
    } else {
      this.storageService.updateIsLoading(true);
      this.plan.active = true;
      this.plan.dateCreated = new Date();
      if (!this.form?.get('customProfileIncluded')?.value)
        this.plan.customProfileIncluded = false;

      if (!this.form?.get('viewBidsIncluded')?.value)
        this.plan.viewBidsIncluded = false;

      this.apiService
        .createNewPlan(this.plan)
        .pipe(
          takeUntilDestroyed(this.destroyRef),
          tap((plan: PlanInterface) => {
            this.plan = plan;
            this.toastService.success(
              'Create Plan.',
              'Create Plan Successful',
              {
                timeOut: 3000,
                positionClass: 'toast-top-right',
                closeButton: true,
                progressBar: true,
              }
            );
          }),
          catchError((err) => {
            this.toastService.error(
              'Create Plan failed. ' + err,
              'Create Plan failure',
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
  }
  getPlanTypeInfo() {
    if (this.plan.planType === 'free') return 'Trial Free';
    else return this.plan.planType;
  }
}
