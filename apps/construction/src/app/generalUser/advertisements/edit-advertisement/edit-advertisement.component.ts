import { ImageService } from './../../../services/image-service';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ToastrService } from 'ngx-toastr';
import { tap, catchError, of, first, take, switchMap } from 'rxjs';
import { ApiService } from '../../../services/api.service';
import { EncryptionService } from '../../../services/encryption-service';
import { StorageService } from '../../../services/storage.service';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { AdvertisementInterface } from '../../../models/advertisement';
import { CommonUtilityService } from '../../../services/common-utility.service';
import { Router } from '@angular/router';
import { AdvertisementCommunicationService } from '../../../services/advertisementServcie';
import { FormService } from '../../../services/form.service';
import { MatStepper } from '@angular/material/stepper';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-edit-advertisement',
  templateUrl: './edit-advertisement.component.html',
  styleUrls: ['./edit-advertisement.component.css'],
})
export class EditAdvertisementComponent {
  files: File[] = [];
  toastService = inject(ToastrService);
  apiService = inject(ApiService);
  imageService = inject(ImageService);

  fb = inject(FormBuilder);
  form: FormGroup;
  formErrors: string[] = [];
  encryptionService = inject(EncryptionService);
  formService = inject(FormService);
  router = inject(Router);
  storageService = inject(StorageService);
  advertisementCommunicationService = inject(AdvertisementCommunicationService);
  commonUtility = inject(CommonUtilityService);
  destroyRef = inject(DestroyRef);
  utilityService = inject(CommonUtilityService);
  generalInfo: any;
  advertisement: AdvertisementInterface = {};
  headerImageFile: any;
  topAdPrice: any;
  maxAdvertisementSliderImage: number;
  userAdvertisementDuration: number;
  sliderImages: any[] = [];
  userId = this.storageService?.getUserId();
  selectedAdvertisementID = this.storageService?.getSelectedAdvertisementId();
  canUserEditAdvertisement$ = this.apiService
    .canUserEditAdvertisement(
      this.selectedAdvertisementID(),
      this.encryptionService.encryptItem(this.userId())
    )
    .pipe(
      takeUntilDestroyed(this.destroyRef),
      tap((canEdit: boolean) => {
        if (!canEdit) this.router.navigate(['/general/user-advertisements']);
      }),

      switchMap(() => {
        return this.apiService
          .getAdvertisementEditInfo(
            this.selectedAdvertisementID(),
            this.encryptionService.encryptItem(this.userId())
          )
          .pipe(
            takeUntilDestroyed(this.destroyRef),

            tap((results: any) => {
              if (results?.selectAdResult?.length < 1)
                this.router.navigate(['/general/user-advertisements']);
              else {
                this.advertisement = results[0];

                const selectAdResult = results;
                this.sliderImages = [];

                if (results[0].headerImage) {
                  const uint8Array = new Uint8Array(
                    results[0].headerImage.data
                  );
                  const blob = new Blob(
                    [new Uint8Array(results[0].headerImage.data)],
                    {
                      type: 'image/jpeg',
                    }
                  ); // Adjust 'image/jpeg' to the correct image MIME type
                  const imageUrl = URL.createObjectURL(blob);
                  this.advertisement.headerImageUrl = `url(${imageUrl})`;
                  this.advertisement.headerImage = imageUrl;

                  const temporaryFile = new File([blob], 'example.jpg', {
                    type: 'image/jpeg',
                  });

                  this.headerImageFile = temporaryFile;
                }

                //this.advertisement.dateCreated = new Date();
                this.advertisement.sliderImageFiles = [];
                this.advertisement.sliderImages = [];
                selectAdResult.forEach((item) => {
                  if (item?.userAdvertisementImage) {
                    const uint8Array = new Uint8Array(
                      item?.userAdvertisementImage.data
                    );

                    // Convert Uint8Array to Blob
                    const blob = new Blob([uint8Array], {
                      type: 'image/jpeg' /* specify MIME type if known */,
                    });
                    const temporaryFile = new File([blob], 'example.jpg', {
                      type: 'image/jpeg',
                    });

                    // const blob = new Blob(
                    //   [new Uint8Array(item?.userAdvertisementImage)],
                    //   {
                    //     type: 'image/jpeg',
                    //   }
                    // ); // Adjust 'image/jpeg' to the correct image MIME type
                    // const imageUrl = URL.createObjectURL(blob);
                    // this.sliderImages.push(imageUrl);
                    // this.advertisement.sliderImages.push(imageUrl);
                    const imageUrl = URL.createObjectURL(temporaryFile);

                    // this.sliderImages.push(sliderImageFile);
                    this.advertisement.sliderImageFiles.push(temporaryFile);
                    this.files.push(temporaryFile);

                    this.advertisement.sliderImages.push(`${imageUrl}`);
                  }
                });
              }
            })
          );
      }),
      switchMap(() =>
        this.apiService.getApplicationSetting().pipe(
          takeUntilDestroyed(this.destroyRef),
          tap((info: any) => {
            // this.topAdPrice = info.topAdvertisementPrice;
            // this.tax = info.tax;
            this.maxAdvertisementSliderImage = info.maxAdvertisementSliderImage;
            this.userAdvertisementDuration = info.userAdvertisementDuration;
          })
        )
      )
    );

  constructor(private sanitizer: DomSanitizer) {
    const adObject = this.storageService?.getAdvertisement()();
    if (
      adObject?.advertisementSelected &&
      adObject?.advertisementAction === 'edit'
    )
      this.advertisement = this.storageService?.getSelectedAdvertisement()();
    else this.advertisement = {};

    this.advertisement.sliderImages = [];
    this.advertisementCommunicationService.message$
      .pipe(first())
      .subscribe((message) => {
        const isEmpty = Object.keys(message).length === 0;
        if (!isEmpty) this.advertisement = message;
      });
    // const newDate = new Date(
    //   this.advertisement.dateCreated.getTime() - 5 * 24 * 60 * 60 * 1000
    // );
    // this.advertisement.dateCreated = newDate;

    this.canUserEditAdvertisement$.subscribe();

    this.form = this.fb.group({
      formArray: this.fb.array([
        this.fb.group({
          title: new FormControl('', [Validators.required]),
          description: new FormControl('', [Validators.required]),
          headerImage: new FormControl('', []),
        }),
        this.fb.group({
          showPhone: new FormControl('', []),
          showAddress: new FormControl('', []),
          showEmail: new FormControl('', []),
          showPicture: new FormControl('', []),
          showChat: new FormControl('', []),
          sliderImages: new FormArray([]),
        }),
        this.fb.group({
          sliderImages: new FormArray([]),
        }),
      ]),
    });
  }

  getObjectURL(file: File): SafeUrl {
    if (file)
      return this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(file));
    else return null;
  }
  get formArray(): AbstractControl | null {
    return this.form?.get('formArray');
  }

  goForward(stepper: MatStepper, index: number) {
    this.formErrors = this.formService.getFormValidationErrorMessages(
      this.formArray?.get([index]) as FormGroup
    );
    stepper.next();
  }

  preview() {
    this.advertisementCommunicationService.sendMessage(this.advertisement);
    this.router.navigate(['/general/preview-advertisement']);
  }
  deleteHeaderImage() {
    this.headerImageFile = null;
    this.advertisement.headerImage = null;
    this.advertisement.headerImageUrl = null;
  }
  headerImageHandler(event: any) {
    const headerImageFile = event?.target?.files[0];
    const imageUrl = URL.createObjectURL(headerImageFile);
    this.advertisement.headerImageUrl = `url(${imageUrl})`;
    this.advertisement.headerImage = imageUrl;
    const maxFileSize = this.commonUtility._advertisementHeaderMaxSize;

    const allowedFileTypes = this.commonUtility._imageMimeTypes;
    if (headerImageFile) {
      const fileType = headerImageFile?.name?.split('.')?.pop()?.toLowerCase();
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
        //this.form.get('photo')?.setValue('');
        this.headerImageFile = null;
      }
      if (headerImageFile?.size == 0 || headerImageFile?.size > maxFileSize) {
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
        //this.form.get('headerImage')?.setValue('');
        this.headerImageFile = null;
      } else {
        // file ok
        this.headerImageFile = headerImageFile;
      }
    }
  }

  submit() {
    if (this.form.valid) {
      const userId = this.storageService?.getUserId();
      const formData = new FormData();
      formData.append('userId', this.encryptionService.encryptItem(userId()));
      formData.append(
        'userAdvertisementId',
        this.advertisement?.userAdvertisementId
      );
      if (this.headerImageFile)
        formData.append(
          'headerImage',
          this.headerImageFile,
          this.headerImageFile.name
        );
      else formData.append('headerImage', '');

      if (this.advertisement.sliderImageFiles) {
        for (const file of this.advertisement.sliderImageFiles) {
          formData.append('sliderImages', file, file.name);
        }
      } else formData.append('sliderImages', '');

      formData.append('title', this.advertisement?.title);
      formData.append('description', this.advertisement?.description);

      formData.append(
        'showPhone',
        `${this.advertisement?.showPhone ? '1' : '0'}`
      );
      formData.append(
        'showAddress',
        `${this.advertisement?.showAddress ? '1' : '0'}`
      );
      formData.append(
        'showEmail',
        `${this.advertisement?.showEmail ? '1' : '0'}`
      );
      formData.append(
        'showPicture',
        `${this.advertisement?.showPicture ? '1' : '0'}`
      );
      formData.append(
        'showChat',
        `${this.advertisement?.showChat ? '1' : '0'}`
      );

      this.apiService
        .editAdvertisement(formData)
        .pipe(
          takeUntilDestroyed(this.destroyRef),
          tap(() => {
            this.router.navigate(['/general/user-advertisements']);
            this.toastService.success(
              'Saved Successfully. ',
              'Saved Successfully',
              {
                timeOut: 3000,
                positionClass: 'toast-top-right',
                closeButton: true,
                progressBar: true,
              }
            );
          })
        )
        .subscribe();
    } else {
      this.formErrors = this.formService.getFormValidationErrorMessages(
        this.formArray?.get([0]) as FormGroup
      );
    }
  }

  onFilesAdded(event: any) {
    const newFiles: File[] = event.addedFiles;
    this.files = [...this.files, ...newFiles];
    if (this.files.length > this.maxAdvertisementSliderImage) {
      this.toastService.error(
        `You can upload only ${this.maxAdvertisementSliderImage}`,
        'Server failure',
        {
          timeOut: 3000,
          positionClass: 'toast-top-right',
          closeButton: true,
          progressBar: true,
        }
      );
    }

    this.files = this.files.slice(0, this.maxAdvertisementSliderImage);
    this.advertisement.sliderImageFiles = [];
    this.advertisement.sliderImages = [];

    for (const sliderImageFile of this.files) {
      if (sliderImageFile) {
        this.handleFile(sliderImageFile);
      }
    }
  }
  handleFile(file: File) {
    const maxFileSize = this.commonUtility._sliderPhotoMaxSize;
    const allowedFileTypes = this.commonUtility._imageMimeTypes;

    const fileType = file?.name?.split('.').pop()?.toLowerCase();
    const fileSize = file?.size;

    if (fileType && allowedFileTypes && !allowedFileTypes.includes(fileType)) {
      this.toastService.error(
        'Selected file type is not allowed. Please select a file with one of the following extensions: ' +
          allowedFileTypes.join(', '),
        'Wrong File Type',
        {
          /* Your toast options */
        }
      );
    } else if (!fileSize || fileSize > maxFileSize) {
      this.toastService.error(
        'File size cannot be empty and cannot exceed the maximum limit of 1 MB',
        'Wrong File Size',
        {
          /* Your toast options */
        }
      );
    } else {
      const imageUrl = URL.createObjectURL(file);

      // this.sliderImages.push(file);
      this.advertisement.sliderImageFiles.push(file);

      this.advertisement.sliderImages.push(`${imageUrl}`);
    }
  }
  onFileDeleted(index: number) {
    // Delete the file at the specified index
    this.files.splice(index, 1);
    //this.sliderImages = [];
    this.advertisement.sliderImageFiles = [];
    this.advertisement.sliderImages = [];
    for (const sliderImageFile of this.files) {
      const imageUrl = URL.createObjectURL(sliderImageFile);
      //this.sliderImages.push(sliderImageFile);
      this.advertisement.sliderImageFiles.push(sliderImageFile);
      this.advertisement.sliderImages.push(`${imageUrl}`);
      this.storageService.updateSelectedAdvertisement(
        this.advertisement,
        'new'
      );
    }
  }
}
