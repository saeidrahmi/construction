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

  canadaCountryInfo = this.commonUtility.getCanada();
  googleAddresses!: any;
  addressObject!: any;
  constructor(private fb: FormBuilder) {
    this.getCurrentLocation();
    this.form = this.fb.group({
      firstName: new FormControl(this.user()?.firstName, [Validators.required]),
      lastName: new FormControl(this.user()?.lastName, [Validators.required]),
      address: new FormControl(this.user()?.address, [Validators.required]),
      phone: new FormControl(this.user()?.phone, []),
      fax: new FormControl(this.user()?.fax, []),
      province: new FormControl('', []),
      city: new FormControl('', []),
      currentAddress: new FormControl('', []),
      postalCode: new FormControl(
        this.user()?.postalCode?.toLocaleUpperCase(),
        []
      ),
    });
    this.selectedProvince = this.user()?.province as string;
    this.selectedProvinceAction();
    this.selectedCity = this.user()?.city as string;

    this.initialFormValue = this.form.value;
    this.form
      .get('currentAddress')
      ?.valueChanges.pipe(
        takeUntilDestroyed(this.destroyRef),
        tap((value) => {
          if (value) {
            this.form.get('address')?.disable();
            this.form.get('city')?.disable();
            this.form.get('province')?.disable();
            this.form.get('postalCode')?.disable();
          } else {
            this.form.get('address')?.enable();
            this.form.get('city')?.enable();
            this.form.get('province')?.enable();
            this.form.get('postalCode')?.enable();
          }
        })
      )
      .subscribe();
  }
  selectedProvinceAction() {
    let data = this.canadaCountryInfo().find(
      (item) =>
        item.province?.toLocaleLowerCase() ==
        this.selectedProvince?.toLocaleLowerCase()
    );
    if (!!data && 'cities' in data) this.cities?.set(data.cities);
<<<<<<< HEAD
=======
    console.log('citi', data?.cities, this.canadaCountryInfo());
>>>>>>> d583e5d2d7bb8482512494aaf707efe7b535e8e3
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
        address: this.form.get('currentAddress')?.value
          ? this.getAddressFromString()?.streetAddress
          : this.commonUtility.trimString(this.form.get('address')?.value),
        city: this.form.get('currentAddress')?.value
          ? this.getAddressFromString()?.city?.toUpperCase()
          : this.selectedCity,
        province: this.form.get('currentAddress')?.value
          ? this.getAddressFromString()?.province
          : this.selectedProvince,
        postalCode: this.form.get('currentAddress')?.value
          ? this.getAddressFromString()?.postalCode
          : this.form.get('postalCode')?.value,
        //address: this.commonUtility.trimString(this.form.get('address')?.value),
        //  city: this.selectedCity,
        // province: this.selectedProvince,
        //postalCode: this.commonUtility.trimString(
        // this.form.get('postalCode')?.value
        // ),
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
<<<<<<< HEAD
=======
  getAddressFromString(): any {
    const addressParts = this.address.split(',').map((part) => part.trim());

    const streetAddress = addressParts[0];
    const city = addressParts[1];
    const province = this.commonUtility.getFullProvinceName(
      addressParts[2].split(' ')[0]
    );
    const postalCode =
      addressParts[2].split(' ')[1] + ' ' + addressParts[2].split(' ')[2];

    const country = addressParts[3];

    return {
      streetAddress,
      city,
      province,
      postalCode,
      country,
    };
  }

>>>>>>> d583e5d2d7bb8482512494aaf707efe7b535e8e3
  currentPosition: any;
  address!: string;
  getCurrentLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position: any) => {
          this.currentPosition = position;
          this.getAddressFromCoordinates();
        },
        (error: any) => {
          console.error('Error getting location:', error);
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
    }
  }

  getAddressFromCoordinates() {
    const geocoder = new google.maps.Geocoder();
    const latlng = new google.maps.LatLng(
      this.currentPosition.coords.latitude,
      this.currentPosition.coords.longitude
    );

    geocoder.geocode({ location: latlng }, (results: any, status: any) => {
<<<<<<< HEAD
      console.log(results, status, 'res');
=======
>>>>>>> d583e5d2d7bb8482512494aaf707efe7b535e8e3
      this.googleAddresses = results;
      if (status === 'OK') {
        if (results[0]) {
          this.address = results[0].formatted_address;
<<<<<<< HEAD
=======
          this.addressObject = results[0];
>>>>>>> d583e5d2d7bb8482512494aaf707efe7b535e8e3
        } else {
          this.address = 'Address not found';
        }
      } else {
        console.error('Geocoder failed due to: ' + status);
      }
    });
  }
}
