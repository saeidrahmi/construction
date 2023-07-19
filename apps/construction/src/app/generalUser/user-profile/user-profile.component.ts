import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import {
  Observable,
  catchError,
  finalize,
  first,
  of,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs';
import { ApiService } from '../../services/api.service';
import { StorageService } from '../../services/storage.service';
import { ValidatorsService } from '../../services/validators.service';
import { FormService } from '../../services/form.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UserInterface } from '../../models/user';
import { CommonUtilityService } from '../../services/common-utility.service';
import { TitleCasePipe } from '@angular/common';
import { CountryInterface } from '../../models/country';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css'],
})
export class UserProfileComponent {
  userInfo: any = null;

  serverGetError: string = '';
  destroyRef = inject(DestroyRef);
  validatorsService = inject(ValidatorsService);
  apiService = inject(ApiService);
  commonUtility = inject(CommonUtilityService);
  formService = inject(FormService);

  storageService = inject(StorageService);
  user = this.storageService.getUser();
  form: FormGroup;
  formErrors: string[] = [];
  initialFormValue: any;
  updateCompleted: boolean = false;
  serverUpdateError: any;
  selectedCity: string = '';
  selectedProvince: string = '';
  cities = signal<string[]>([]);
  provinces = ['New York', 'Rome'];
  canadaCountryInfo = this.commonUtility.getCanada();
  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      firstName: new FormControl(this.user()?.firstName, [Validators.required]),
      lastName: new FormControl(this.user()?.lastName, [Validators.required]),
      address: new FormControl(this.user()?.address, [Validators.required]),
      phone: new FormControl(this.user()?.phone, []),
      fax: new FormControl(this.user()?.fax, []),
      province: new FormControl('', []),
      city: new FormControl('', []),
      postalCode: new FormControl(
        this.user()?.postalCode?.toLocaleUpperCase(),
        []
      ),
    });
    this.selectedProvince = this.user()?.province as string;
    this.selectedProvinceAction();
    this.selectedCity = this.user()?.city as string;

    this.initialFormValue = this.form.value;
  }
  selectedProvinceAction() {
    let data = this.canadaCountryInfo().find(
      (item) => item.province == this.selectedProvince
    );

    this.cities.set(data!.cities);
  }
  submit() {
    const currentFormValue = this.form.value;
    const hasChanged =
      JSON.stringify(currentFormValue) !==
      JSON.stringify(this.initialFormValue);

    this.updateCompleted = false;
    this.formErrors = [];
    this.serverUpdateError = '';

    if (this.form.valid && hasChanged) {
      this.initialFormValue = currentFormValue;
      this.storageService.updateIsLoading(true);
      const userId = this.storageService?.getUserId();
      let user: UserInterface = {
        userId: userId(),
        firstName: this.commonUtility.trimString(
          this.form.get('firstName')?.value
        ),
        lastName: this.commonUtility.trimString(
          this.form.get('lastName')?.value
        ),
        phone: this.commonUtility.trimString(this.form.get('phone')?.value),
        fax: this.commonUtility.trimString(this.form.get('fax')?.value),

        address: this.commonUtility.trimString(this.form.get('address')?.value),
        city: this.selectedCity,
        province: this.selectedProvince,
        postalCode: this.commonUtility.trimString(
          this.form.get('postalCode')?.value
        ),
      };

      this.apiService
        .editUserProfile(user)
        .pipe(
          takeUntilDestroyed(this.destroyRef),
          tap(() => {
            this.updateCompleted = true;
          }),
          catchError((err) => {
            this.serverUpdateError = err;
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
}
