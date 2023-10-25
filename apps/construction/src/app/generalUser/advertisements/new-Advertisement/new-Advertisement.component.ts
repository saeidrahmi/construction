import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ToastrService } from 'ngx-toastr';
import { tap, catchError, of, first } from 'rxjs';
import { ApiService } from '../../../services/api.service';
import { EncryptionService } from '../../../services/encryption-service';
import { StorageService } from '../../../services/storage.service';
import {
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

@Component({
  selector: 'app-new-Advertisement',
  templateUrl: './new-Advertisement.component.html',
  styleUrls: ['./new-Advertisement.component.css'],
})
export class NewAdvertisementComponent {
  toastService = inject(ToastrService);
  apiService = inject(ApiService);
  fb = inject(FormBuilder);
  form: FormGroup;
  encryptionService = inject(EncryptionService);
  router = inject(Router);
  storageService = inject(StorageService);
  advertisementCommunicationService = inject(AdvertisementCommunicationService);
  commonUtility = inject(CommonUtilityService);
  destroyRef = inject(DestroyRef);
  canAdvertise: boolean;
  generalInfo: any;
  advertisement: AdvertisementInterface = {};
  headerImageFile: any;
  constructor() {
    this.advertisement.dateCreated = new Date();
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

    const userId = this.storageService?.getUserId();
    this.apiService
      .canUserAdvertise(this.encryptionService.encryptItem(userId()))
      .pipe(
        takeUntilDestroyed(),
        tap((info: any) => {
          this.generalInfo = info;
          if (!info?.result) this.canAdvertise = false;
          else this.canAdvertise = true;
        }),
        catchError((err) => {
          this.canAdvertise = false;
          this.toastService.error(
            'Getting Info failed. ' + err,
            'Server failure',
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
      title: new FormControl('', [Validators.required]),
      description: new FormControl('', [Validators.required]),
      headerImage: new FormControl('', []),
      topAdvertisement: new FormControl('', []),
      showPhone: new FormControl('', []),
      showAddress: new FormControl('', []),
      showEmail: new FormControl('', []),
      showPicture: new FormControl('', []),
      showChat: new FormControl('', []),
      sliderImages: new FormArray([]),
    });
  }
  getClienttFormArrayControls() {
    return (this.form.get('sliderImages') as FormArray).controls;
  }
  removeClientFormGroup(index: number) {
    (this.form.get('sliderImages') as FormArray).removeAt(index);
    this.advertisement.sliderImages?.splice(index, 1);
    console.log(this.advertisement.sliderImages);
  }
  addClientFormControl() {
    (this.form.get('sliderImages') as FormArray).push(
      new FormGroup({
        sliderImage: new FormControl('', [Validators.required]),
        sliderTitle: new FormControl('', [Validators.required]),
        sliderDescription: new FormControl('', [Validators.required]),
      })
    );
  }
  preview() {
    this.advertisementCommunicationService.sendMessage(this.advertisement);
    this.router.navigate(['/general/preview-advertisement']);
  }
  headerImageHandler(event: any) {
    this.headerImageFile = event?.target?.files[0];
    const imageUrl = URL.createObjectURL(this.headerImageFile);
    this.advertisement.headerImage = `url(${imageUrl})`;
    const maxFileSize = this.commonUtility._advertisementHeaderMaxSize;
    const allowedFileTypes = this.commonUtility._imageMimeTypes;
    if (this.headerImageFile) {
      const fileType = this.headerImageFile?.name
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
        this.headerImageFile = null;
      }
      if (
        this.headerImageFile?.size == 0 ||
        this.headerImageFile?.size > maxFileSize
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
        this.form.get('headerImage')?.setValue('');
        this.headerImageFile = null;
      } else {
        // file ok
      }
    }
  }
  sliderImageHandler(event: any, index: number) {
    const headerImageFile = event?.target?.files[0];
    if (!headerImageFile) this.advertisement.sliderImages[index] = '';
    else {
      const imageUrl = URL.createObjectURL(headerImageFile);
      this.advertisement.sliderImages[index] = `${imageUrl}`;
    }

    console.log(this.advertisement.sliderImages);

    const maxFileSize = this.commonUtility._sliderPhotoMaxSize;
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
        // this.form.get('photo')?.setValue('');
        // this.headerImageFile = null;
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
        //this.headerImageFile = null;
      } else {
        // file ok
      }
    }
  }
  submit() {}
}
