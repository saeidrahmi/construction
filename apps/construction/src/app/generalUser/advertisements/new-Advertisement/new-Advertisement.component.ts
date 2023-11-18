import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ToastrService } from 'ngx-toastr';
import { tap, catchError, of, switchMap } from 'rxjs';
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
  selector: 'app-new-Advertisement',
  templateUrl: './new-Advertisement.component.html',
  styleUrls: ['./new-Advertisement.component.css'],
})
export class NewAdvertisementComponent {
  toastService = inject(ToastrService);
  apiService = inject(ApiService);
  fb = inject(FormBuilder);
  utilityService = inject(CommonUtilityService);

  form: FormGroup;
  formErrors: string[] = [];
  encryptionService = inject(EncryptionService);
  formService = inject(FormService);
  router = inject(Router);
  storageService = inject(StorageService);

  advertisementCommunicationService = inject(AdvertisementCommunicationService);
  commonUtility = inject(CommonUtilityService);
  destroyRef = inject(DestroyRef);
  canAdvertise: boolean;
  generalInfo: any;
  tax;
  headerImageFile: any;
  topAdPrice: any;
  maxAdvertisementSliderImage: number;
  userAdvertisementDuration: number;
  sliderImages: any[] = [];
  userId = this.storageService?.getUserId();
  advertisement: AdvertisementInterface;
  getUserAdvertiseInfo$ = this.apiService
    .canUserAdvertise(this.encryptionService.encryptItem(this.userId()))
    .pipe(
      takeUntilDestroyed(),
      tap((info: any) => {
        this.generalInfo = info;
        if (!info?.result) this.canAdvertise = false;
        else this.canAdvertise = true;
      }),
      catchError((err) => {
        this.canAdvertise = false;
        return of(err);
      })
    );

  constructor(private sanitizer: DomSanitizer) {
    this.advertisement = {};
    this.advertisement.dateCreated = new Date();
    this.advertisement.sliderImages = [];
    this.advertisement.sliderImageFiles = [];
    this.apiService
      .getApplicationSetting()
      .pipe(
        takeUntilDestroyed(),
        tap((info: any) => {
          this.topAdPrice = info.topAdvertisementPrice;
          this.tax = info.tax;
          this.maxAdvertisementSliderImage = info.maxAdvertisementSliderImage;
          this.userAdvertisementDuration = info.userAdvertisementDuration;
        })
      )
      .subscribe();

    // getPreNewAdInfo;

    // const newDate = new Date(
    //   this.advertisement.dateCreated.getTime() - 5 * 24 * 60 * 60 * 1000
    // );
    // this.advertisement.dateCreated = newDate;

    this.getUserAdvertiseInfo$.subscribe();

    this.form = this.fb.group({
      formArray: this.fb.array([
        this.fb.group({
          title: new FormControl('', [Validators.required]),
          description: new FormControl('', [Validators.required]),
          headerImage: new FormControl('', []),
        }),
        this.fb.group({
          topAdvertisement: new FormControl('', []),
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
  get formArray(): AbstractControl | null {
    return this.form?.get('formArray');
  }
  getClienttFormArrayControls() {
    return (this.formArray?.get([2]).get('sliderImages') as FormArray).controls;
  }
  goForward(stepper: MatStepper, index: number) {
    this.formErrors = this.formService.getFormValidationErrorMessages(
      this.formArray?.get([index]) as FormGroup
    );
    stepper.next();
  }
  removeClientFormGroup(index: number) {
    (this.formArray?.get([2]).get('sliderImages') as FormArray).removeAt(index);
    this.advertisement.sliderImages?.splice(index, 1);
    this.sliderImages?.splice(index, 1);
  }
  addClientFormControl() {
    (this.formArray?.get([2]).get('sliderImages') as FormArray).push(
      new FormGroup({
        sliderImage: new FormControl('', [Validators.required]),
        // sliderTitle: new FormControl('', [Validators.required]),
        // sliderDescription: new FormControl('', [Validators.required]),
      })
    );
  }
  preview() {
    this.advertisementCommunicationService.sendMessage(this.advertisement);
    this.router.navigate(['/general/preview-advertisement']);
  }
  getObjectURL(file: File): SafeUrl {
    return this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(file));
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
  // sliderImageHandler(event: any, index: number) {
  //   const sliderImageFile = event?.target?.files[0];
  //   if (!sliderImageFile) {
  //     this.advertisement.sliderImages[index] = '';
  //     this.sliderImages[index] = null;
  //   }

  //   const maxFileSize = this.commonUtility._sliderPhotoMaxSize;
  //   const allowedFileTypes = this.commonUtility._imageMimeTypes;
  //   if (sliderImageFile) {
  //     const fileType = sliderImageFile?.name?.split('.')?.pop()?.toLowerCase();
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
  //       // this.form.get('photo')?.setValue('');
  //       // this.headerImageFile = null;
  //     } else if (
  //       sliderImageFile?.size == 0 ||
  //       sliderImageFile?.size > maxFileSize
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
  //       //this.form.get('headerImage')?.setValue('');
  //       //this.headerImageFile = null;
  //     } else {
  //       // file ok

  //       const imageUrl = URL.createObjectURL(sliderImageFile);
  //       this.advertisement.sliderImages[index] = `${imageUrl}`;
  //       this.sliderImages[index] = sliderImageFile;
  //     }
  //   }
  // }
  submitNewAd(stepper: MatStepper) {
    if (this.form.valid) {
      const userId = this.storageService?.getUserId();
      const formData = new FormData();
      formData.append('userId', this.encryptionService.encryptItem(userId()));
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
        'topAdvertisement',
        `${this.advertisement?.topAdvertisement ? '1' : '0'}`
      );
      if (this.advertisement?.topAdvertisement) {
        const amount = this.topAdPrice;

        const tax = (amount * this.tax) / 100;

        const totalAmount =
          parseFloat(amount.toString()) + parseFloat(tax.toString());

        formData.append('paymentConfirmation', `PAL-235894-CONFIRM`);
        formData.append('paymentAmount', `${amount}`);
        formData.append('tax', `${tax}`);
        formData.append('totalPayment', `${totalAmount}`);
      }
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
      formData.append('active', `1`);
      formData.append('numberOfVisits', `0`);
      formData.append('approvedByAdmin', `0`);
      //const dateCreated = new Date();
      // const expiryDate = new Date(
      //   dateCreated.getTime() -
      //     this.userAdvertisementDuration * 24 * 60 * 60 * 1000
      // );
      const userPlanId = this.storageService.getPlan()()?.userPlanId;

      formData.append('userPlanId', `${userPlanId}`);
      formData.append(
        'userAdvertisementDuration',
        `${this.userAdvertisementDuration}`
      );
      // formData.append('expiryDate', `${expiryDate}`);
      // formData.append('dateCreated', `${dateCreated}`);
      this.apiService
        .saveUserRegularAd(formData)
        .pipe(
          takeUntilDestroyed(this.destroyRef),
          tap(() => {
            this.headerImageFile = null;
            //this.sliderImages = [];
            this.form.reset();
            stepper.reset();
            this.storageService.clearAdvertisementInfo();
            this.toastService.success('Saved Successfully. ', 'Successful', {
              timeOut: 3000,
              positionClass: 'toast-top-right',
              closeButton: true,
              progressBar: true,
            });
          }),

          switchMap(() => this.getUserAdvertiseInfo$)
        )
        .subscribe();
    } else {
      this.formErrors = this.formService.getFormValidationErrorMessages(
        this.formArray?.get([0]) as FormGroup
      );
      // this.formErrors = [
      //   ...this.formErrors,
      //   ...this.formService.getFormValidationErrorMessages(
      //     this.formArray?.get([1]) as FormGroup
      //   ),
      // ];
      // this.formErrors = [
      //   ...this.formErrors,
      //   ...this.formService.getFormValidationErrorMessages(
      //     this.formArray?.get([2]) as FormGroup
      //   ),
      // ];
    }
  }
  submitNewTopAd() {}
  files: File[] = [];

  onFilesAdded(event: any) {
    const newFiles: File[] = event.addedFiles;
    this.files = [...this.files, ...newFiles];
    if (this.files.length > this.maxAdvertisementSliderImage) {
      this.toastService.error(
        `You can upload only ${this.maxAdvertisementSliderImage} images`,
        'Error',
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
        `File size cannot be empty and cannot exceed the maximum limit of ${maxFileSize}`,
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
