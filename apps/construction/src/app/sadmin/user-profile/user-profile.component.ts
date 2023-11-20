import { ImageService } from './../../services/image-service';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { map, take, tap, filter } from 'rxjs';
import { ApiService } from '../../services/api.service';
import { StorageService } from '../../services/storage.service';
import { ValidatorsService } from '../../services/validators.service';
import { FormService } from '../../services/form.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonUtilityService } from '../../services/common-utility.service';
import { ToastrService } from 'ngx-toastr';
import { EncryptionService } from '../../services/encryption-service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';
import { CountryInterface } from '../../models/country';
import { CanadaInterface } from '../../models/canada';

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
  cities: string[] = [];

  profileImageFile: any;
  logoImageFile: any;
  profileImageObjectUrl!: SafeUrl;
  profileImageSrc: string;
  http = inject(HttpClient);
  canadaData: CanadaInterface[] = [];
  canadaProvinces: string[] = [];
  constructor(private fb: FormBuilder, public imageService: ImageService) {
    this.http
      .get<CanadaInterface[]>('../../assets/canadian-cities.json')
      .pipe(
        take(1),
        takeUntilDestroyed(),
        tap((response) => {
          const data = JSON.parse(JSON.stringify(response));
          this.canadaData = data;
          this.canadaProvinces = this.canadaData.map((entry) => entry.province);
          this.selectedProvince = this.user()?.province as string;
          this.selectedProvinceAction();
          this.selectedCity = this.user()?.city as string;
        })
      )
      .subscribe();

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
      postalCode: new FormControl(
        this.user()?.postalCode?.toLocaleUpperCase(),
        [Validators.required]
      ),
    });

    this.initialFormValue = this.form.value;
  }

  selectedProvinceAction() {
    const provinceData = this.canadaData?.find(
      (entry) =>
        entry?.province?.toLocaleLowerCase() ===
        this.selectedProvince?.toLocaleLowerCase()
    );
    this.cities = provinceData ? provinceData.cities : [];
  }

  submit() {
    const currentFormValue = this.form.value;
    this.updateCompleted = false;
    this.formErrors = [];
    this.serverUpdateError = '';
    if (this.form.invalid) {
      this.formErrors = this.formService.getFormValidationErrorMessages(
        this.form
      );
    } else if (this.form.valid) {
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
      formData.append('company', '');
      formData.append('jobProfileDescription', '');
      formData.append('website', '');

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
            this.profileImageFile = null;
            this.form.get('photo')?.setValue('');
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
      this.toastService.error('Nothing to update.', 'Error', {
        timeOut: 3000,
        positionClass: 'toast-top-right',
        closeButton: true,
        progressBar: true,
      });
    }
  }

  deleteHeaderImage() {
    this.profileImageFile = null;
  }
  profileImageHandler(event: any) {
    const profileImageFile = event?.target?.files[0];
    const maxFileSize = this.commonUtility._profilePhotoMaxSize;
    const allowedFileTypes = this.commonUtility._imageMimeTypes;
    if (profileImageFile) {
      const fileType = profileImageFile?.name?.split('.')?.pop()?.toLowerCase();
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
      } else if (
        profileImageFile?.size == 0 ||
        profileImageFile?.size > maxFileSize
      ) {
        this.toastService.error(
          `File size can not be empty and can not exceeds the maximum limit of ${this.commonUtility.convertBytesToKbOrMb(
            maxFileSize
          )}`,
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
        // Check image dimensions

        const [minWidth, maxWidth] =
          this.commonUtility._profilePhotoMinMaxWidthHeightPixel[0];
        const [minHeight, maxHeight] =
          this.commonUtility._profilePhotoMinMaxWidthHeightPixel[1];

        const img = new Image();
        img.src = URL.createObjectURL(profileImageFile);

        img.onload = () => {
          const imageWidth = img.width;

          const imageHeight = img.height;

          if (
            imageWidth < minWidth ||
            imageWidth > maxWidth ||
            imageHeight < minHeight ||
            imageHeight > maxHeight
          ) {
            this.handleImageError(
              `Image dimensions must be between ${minWidth}x${minHeight} and ${maxWidth}x${maxHeight} pixels.`,
              'Invalid Image Dimensions'
            );
            this.form.get('photo')?.setValue('');
            this.profileImageFile = null;
          } else {
            this.profileImageFile = profileImageFile;
            this.profileImageSrc = img.src;
            this.profileImageFile['width'] = imageWidth;
            this.profileImageFile['height'] = imageHeight;
          }
        };
      }
    }
  }
  private handleImageError(message: string, title: string): void {
    this.toastService.error(message, title, {
      timeOut: 3000,
      positionClass: 'toast-top-right',
      closeButton: true,
      progressBar: true,
    });
  }
  deleteUserProfileImage() {
    const userId = this.storageService?.getUserId();
    this.apiService
      .deleteUserProfileImage(this.encryptionService.encryptItem(userId()))
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        tap((deleted) => {
          if (deleted) {
            this.toastService.success('Profile Photo removed.', 'Success', {
              timeOut: 3000,
              positionClass: 'toast-top-right',
              closeButton: true,
              progressBar: true,
            });
            this.storageService.removeUserProfileImage();
          } else
            this.toastService.error('Profile Photo deletion failed.', 'Error', {
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
