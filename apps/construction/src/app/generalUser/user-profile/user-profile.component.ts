import { ImageService } from './../../services/image-service';
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
import { ToastrService } from 'ngx-toastr';
import { EncryptionService } from '../../services/encryption-service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'construction-app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css'],
})
export class UserProfileComponent {
  userInfo: any = null;
  toastService = inject(ToastrService);
  serverGetError = '';
  destroyRef = inject(DestroyRef);
  validatorsService = inject(ValidatorsService);
  apiService = inject(ApiService);
  encryptionService = inject(EncryptionService);
  commonUtility = inject(CommonUtilityService);
  formService = inject(FormService);
  storageService = inject(StorageService);
  user = this.storageService.getUser();
  form: FormGroup;
  formErrors: string[] = [];
  initialFormValue: any;
  updateCompleted = false;
  serverUpdateError: any;
  selectedCity = '';
  selectedProvince = '';
  cities = signal<string[]>([]);
  canadaCountryInfo = this.commonUtility.getCanada();
  googleAddresses!: any;
  addressObject!: any;
  profileImageFile: any;
  logoImageFile: any;
  profileImageObjectUrl!: SafeUrl;
  constructor(private fb: FormBuilder, public imageService: ImageService) {
    this.getCurrentLocation();
    this.form = this.fb.group({
      photo: new FormControl(),
      firstName: new FormControl(this.user()?.firstName, [Validators.required]),
      middleName: new FormControl(this.user()?.middleName, []),
      lastName: new FormControl(this.user()?.lastName, [Validators.required]),
      address: new FormControl(this.user()?.address, [Validators.required]),
      phone: new FormControl(this.user()?.phone, [Validators.required]),
      fax: new FormControl(this.user()?.fax, []),
      province: new FormControl('', [Validators.required]),
      city: new FormControl('', [Validators.required]),
      website: new FormControl(this.user()?.website, []),
      company: new FormControl(this.user()?.company, []),
      // companyLogo: new FormControl(),
      jobProfileDescription: new FormControl(
        this.user()?.jobProfileDescription,
        []
      ),
      postalCode: new FormControl(
        this.user()?.postalCode?.toLocaleUpperCase(),
        [Validators.required]
      ),
    });
    this.selectedProvince = this.user()?.province as string;
    this.selectedProvinceAction();
    this.selectedCity = this.user()?.city as string;

    this.initialFormValue = this.form.value;
  }
  selectedProvinceAction() {
    const data = this.canadaCountryInfo().find(
      (item) =>
        item.province?.toLocaleLowerCase() ==
        this.selectedProvince?.toLocaleLowerCase()
    );
    if (!!data && 'cities' in data) this.cities?.set(data.cities);
  }

  submit() {
    const currentFormValue = this.form.value;
    const hasChanged =
      JSON.stringify(currentFormValue) !==
      JSON.stringify(this.initialFormValue);
    this.updateCompleted = false;
    this.formErrors = [];
    this.serverUpdateError = '';
    if (this.form.invalid) {
      this.formErrors = this.formService.getFormValidationErrorMessages(
        this.form
      );
    } else if (this.form.valid && hasChanged) {
      this.initialFormValue = currentFormValue;
      this.storageService.updateIsLoading(true);
      const userId = this.storageService?.getUserId();
      const formData = new FormData();
      formData.append('userId', this.encryptionService.encryptItem(userId()));
      if (this.profileImageFile)
        formData.append(
          'profileImage',
          this.profileImageFile,
          this.profileImageFile.name
        );
      else formData.append('profileImage', '');

      // if (this.logoImageFile)
      //   formData.append(
      //     'logoImage',
      //     this.logoImageFile,
      //     this.logoImageFile.name
      //   );
      // else

      formData.append('logoImage', '');
      formData.append(
        'firstName',
        this.commonUtility.trimString(this.form.get('firstName')?.value)
      );
      formData.append(
        'lastName',
        this.commonUtility.trimString(this.form.get('lastName')?.value)
      );

      formData.append(
        'middleName',
        this.commonUtility.trimString(this.form.get('middleName')?.value)
      );

      formData.append(
        'phone',
        this.commonUtility.trimString(this.form.get('phone')?.value)
      );
      formData.append(
        'company',
        this.commonUtility.trimString(this.form.get('company')?.value)
      );
      formData.append(
        'jobProfileDescription',
        this.commonUtility.trimString(
          this.form.get('jobProfileDescription')?.value
        )
      );
      formData.append(
        'website',
        this.commonUtility.trimString(this.form.get('website')?.value)
      );

      formData.append(
        'fax',
        this.commonUtility.trimString(this.form.get('fax')?.value)
      );
      formData.append(
        'address',
        this.commonUtility.trimString(this.form.get('address')?.value)
      );
      formData.append('city', this.selectedCity);
      formData.append('province', this.selectedProvince);
      formData.append('postalCode', this.form.get('postalCode')?.value);

      this.apiService
        .editUserProfile(formData)
        .pipe(
          takeUntilDestroyed(this.destroyRef),
          tap(() => {
            this.toastService.success('Profile updated.', 'Update Successful', {
              timeOut: 3000,
              positionClass: 'toast-top-right',
              closeButton: true,
              progressBar: true,
            });
          })
        )
        .subscribe();
    } else {
      this.toastService.warning(
        'No change to existing profile to update.',
        'No update',
        {
          timeOut: 3000,
          positionClass: 'toast-top-right',
          closeButton: true,
          progressBar: true,
        }
      );
    }
  }

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
          //    console.error('Error getting location:', error);
        }
      );
    } else {
      // console.error('Geolocation is not supported by this browser.');
    }
  }

  getAddressFromCoordinates() {
    const geocoder = new google.maps.Geocoder();
    const latlng = new google.maps.LatLng(
      this.currentPosition.coords.latitude,
      this.currentPosition.coords.longitude
    );

    geocoder.geocode({ location: latlng }, (results: any, status: any) => {
      this.googleAddresses = results;
      if (status === 'OK') {
        if (results[0]) {
          this.address = results[0].formatted_address;
          this.addressObject = results[0];
        } else {
          // this.address = 'Address not found';
        }
      } else {
        // console.error('Geocoder failed due to: ' + status);
      }
    });
  }
  profileImageHandler(event: any) {
    this.profileImageFile = event?.target?.files[0];
    const maxFileSize = this.commonUtility._profilePhotoMaxSize;
    const allowedFileTypes = this.commonUtility._imageMimeTypes;
    if (this.profileImageFile) {
      const fileType = this.profileImageFile?.name
        ?.split('.')
        ?.pop()
        ?.toLowerCase();
      if (fileType && !allowedFileTypes?.includes(fileType)) {
        this.toastService.error(
          'Selected file type is not allowed. Please select a file with one of the following extensions: ' +
            allowedFileTypes.join(', '),
          'Wrong File Type',
          {
            timeOut: 3000,
            positionClass: 'toast-top-right',
            closeButton: true,
            progressBar: true,
          }
        );
        this.form.get('photo')?.setValue('');
        this.profileImageFile = null;
      }
      if (
        this.profileImageFile?.size == 0 ||
        this.profileImageFile?.size > maxFileSize
      ) {
        this.toastService.error(
          'File size can not be empty and can not exceeds the maximum limit of 1 MB',
          'Wrong File Size',
          {
            timeOut: 3000,
            positionClass: 'toast-top-right',
            closeButton: true,
            progressBar: true,
          }
        );
        this.form.get('photo')?.setValue('');
        this.profileImageFile = null;
      } else {
        // file ok
      }
    }
  }
  // companyLogoHandler(event: any) {
  //   this.logoImageFile = event?.target?.files[0];
  //   const maxFileSize = this.commonUtility._companyLogoMaxSize;
  //   const allowedFileTypes = this.commonUtility._imageMimeTypes;
  //   if (this.logoImageFile) {
  //     const fileType = this.logoImageFile?.name
  //       ?.split('.')
  //       ?.pop()
  //       ?.toLowerCase();
  //     if (fileType && !allowedFileTypes?.includes(fileType)) {
  //       this.toastService.error(
  //         'Selected file type is not allowed. Please select a file with one of the following extensions: ' +
  //           allowedFileTypes.join(', '),
  //         'Wrong File Type',
  //         {
  //           timeOut: 3000,
  //           positionClass: 'toast-top-right',
  //           closeButton: true,
  //           progressBar: true,
  //         }
  //       );
  //       this.form.get('photo')?.setValue('');
  //       this.logoImageFile = null;
  //     }
  //     if (
  //       this.logoImageFile?.size == 0 ||
  //       this.logoImageFile?.size > maxFileSize
  //     ) {
  //       this.toastService.error(
  //         'File size can not be empty and can not exceeds the maximum limit of 1 MB',
  //         'Wrong File Size',
  //         {
  //           timeOut: 3000,
  //           positionClass: 'toast-top-right',
  //           closeButton: true,
  //           progressBar: true,
  //         }
  //       );
  //       this.form.get('photo')?.setValue('');
  //       this.logoImageFile = null;
  //     } else {
  //       // file ok
  //     }
  //   }
  // }
}
