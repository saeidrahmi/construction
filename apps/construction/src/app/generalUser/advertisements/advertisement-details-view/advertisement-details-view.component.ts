import { isUserLoggedIn } from './../../../services/user-gaurds';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Component, DestroyRef, Input, inject } from '@angular/core';
import { AdvertisementInterface } from '../../../models/advertisement';
import { StorageService } from '../../../services/storage.service';
import { UserService } from '../../../services/user-service';
import { RatingModule } from 'ngx-bootstrap/rating';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { EnvironmentInfo } from 'libs/common/src/models/common';
import { ImageService } from '../../../services/image-service';
import { ApiService } from '../../../services/api.service';
import { catchError, first, map, of, take, tap, switchMap } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { EncryptionService } from '../../../services/encryption-service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DomSanitizer } from '@angular/platform-browser';
import { FormService } from '../../../services/form.service';
import { FormErrorsComponent } from '../../../public/form-errors.component';

@Component({
  selector: 'app-user-advertisement-details-view',
  templateUrl: './advertisement-details-view.component.html',
  styleUrls: ['./advertisement-details-view.component.css'],
})
export class UserAdvertisementDetailsViewComponent {
  advertisement: AdvertisementInterface = {};
  env: EnvironmentInfo = new EnvironmentInfo();
  storageService = inject(StorageService);
  userService = inject(UserService);
  imageService = inject(ImageService);
  toastService = inject(ToastrService);
  apiService = inject(ApiService);
  route = inject(ActivatedRoute);
  formService = inject(FormService);
  destroyRef = inject(DestroyRef);
  encryptionService = inject(EncryptionService);
  fb = inject(FormBuilder);

  messageForm: FormGroup;
  user = this.storageService.getUser();
  message = '';
  max = 10;
  rate: number;
  isReadonly = false;
  heartColor = '';
  myServices: string[] = [];
  locationType: any;
  myLocations: string[] = [];
  registeredDate: any;
  acitveAds: Date;
  userId = this.storageService?.getUserId();
  advertisementExists: boolean;
  userInfo: any;
  headerImage: any;
  sliderImages: any[];
  formErrors: string[] = [];
  selectedImage: any;
  profileImage: string;

  constructor(private sanitizer: DomSanitizer) {
    const adObject = this.storageService?.getAdvertisement()();
    if (
      adObject?.advertisementIdSelected &&
      adObject?.advertisementAction === 'view'
    ) {
      this.apiService
        .getUserAdvertisementDetails(
          adObject?.advertisementIdSelected,
          this.encryptionService.encryptItem(this.userId())
        )
        .pipe(
          takeUntilDestroyed(),
          take(1),
          tap((info: any) => {
            if (info?.selectAdResult?.length < 1)
              this.advertisementExists = false;
            else {
              this.advertisementExists = true;
              this.advertisement = info?.selectAdResult[0];
              this.headerImage = info?.selectAdResult[0]?.headerImage;
              const selectAdResult = info?.selectAdResult;
              this.sliderImages = [];

              selectAdResult.forEach((item) => {
                if (item?.userAdvertisementImage) {
                  this.sliderImages.push(item?.userAdvertisementImage);
                }
              });

              this.userInfo = info?.userInfo;

              this.registeredDate = new Date(info?.registeredDate);
              this.acitveAds = info.acitveAds;
              this.rate = info.userRate;
              this.myServices = info?.services;
              this.locationType = info?.locations?.serviceCoverageType;
              if (this.locationType === 'province') {
                this.myLocations = info?.locations?.provinces;
              } else if (this.locationType === 'city') {
                this.myLocations = info?.locations?.cities;
              } else if (this.locationType === 'country') {
                this.myLocations.push('All over Canada');
              }
            }
          }),
          catchError((err) => {
            return of(err);
          }),

          switchMap((info) => {
            return this.apiService
              .isUserFavoriteAd(
                this.storageService?.getSelectedAdvertisementId()(),
                this.encryptionService.encryptItem(this.userId())
              )
              .pipe(
                take(1),
                tap((isFavorite) => {
                  if (isFavorite) this.heartColor = 'red';
                  else this.heartColor = '';
                })
              );
          })
        )

        .subscribe();
    } else this.advertisementExists = false;

    this.messageForm = this.fb.group({
      message: new FormControl('', [Validators.required]),
    });
  }
  confirmSelection(event: KeyboardEvent) {
    this.toastService.error('You can not rate yourself', 'Failed', {
      timeOut: 3000,
      positionClass: 'toast-top-right',
      closeButton: true,
      progressBar: true,
    });
    // this.apiService
    //   .addUserRating(
    //     this.userRate,
    //     this.encryptionService.encryptItem(this.userInfo?.userId),
    //     this.encryptionService.encryptItem(this.userId())
    //   )
    //   .pipe(
    //     takeUntilDestroyed(this.destroyRef),
    //     take(1),
    //     tap((info: any) => {
    //       this.rate = info;
    //       this.toastService.success('success', 'success', {
    //         timeOut: 3000,
    //         positionClass: 'toast-top-right',
    //         closeButton: true,
    //         progressBar: true,
    //       });
    //     }),
    //     catchError((err) => {
    //       this.heartColor = '';
    //       this.toastService.error('Adding failed', 'Failed', {
    //         timeOut: 3000,
    //         positionClass: 'toast-top-right',
    //         closeButton: true,
    //         progressBar: true,
    //       });
    //       return of(err);
    //     })
    //   )

    //   .subscribe();
  }
  userRate(userRate: any, arg1: string, arg2: string) {
    throw new Error('Method not implemented.');
  }
  goToUrl() {
    // window.open('http://' + this.user().website, '_blank');
    if (
      this.user().website &&
      (!this.user().website.includes('http://') ||
        !this.user().website.includes('https://'))
    )
      window.open('http://' + this.user().website, '_blank');
    else window.open(this.user().website, '_blank');
  }
  createGoogleMapsURL() {
    const { address, city, province, postalCode } = this.userInfo;
    const addressString = `${address}, ${city}, ${province}, ${postalCode}`;
    const encodedAddress = encodeURIComponent(addressString);
    return `https://www.google.com/maps/place/${encodedAddress}`;
  }

  addFavoriteAd(id: any) {
    this.apiService
      .addFavoriteAdvertisement(
        id,
        this.encryptionService.encryptItem(this.userId())
      )
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        take(1),
        tap((info: any) => {
          if (info === 'inserted') this.heartColor = 'red';
          else this.heartColor = '';
          this.toastService.success(info + ' success', 'success', {
            timeOut: 3000,
            positionClass: 'toast-top-right',
            closeButton: true,
            progressBar: true,
          });
        }),
        catchError((err) => {
          this.heartColor = '';
          this.toastService.error('Adding failed', 'Failed', {
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
  sendMessage() {
    this.toastService.error('You can not message yourself', 'Failed', {
      timeOut: 3000,
      positionClass: 'toast-top-right',
      closeButton: true,
      progressBar: true,
    });
    // this.formErrors = [];
    // if (this.messageForm.valid) {
    //   this.apiService
    //     .sendAdvertisementMessage(
    //       this.encryptionService.encryptItem(this.userInfo?.userId),
    //       this.encryptionService.encryptItem(this.userId()),
    //       this.advertisement?.userAdvertisementId,
    //       this.message
    //     )
    //     .pipe(
    //       takeUntilDestroyed(this.destroyRef),
    //       take(1),
    //       tap((info: any) => {
    //         this.toastService.success('success', 'success', {
    //           timeOut: 3000,
    //           positionClass: 'toast-top-right',
    //           closeButton: true,
    //           progressBar: true,
    //         });
    //       }),
    //       catchError((err) => {
    //         this.toastService.error('Adding failed', 'Failed', {
    //           timeOut: 3000,
    //           positionClass: 'toast-top-right',
    //           closeButton: true,
    //           progressBar: true,
    //         });
    //         return of(err);
    //       })
    //     )

    //     .subscribe();
    // } else
    //   this.formErrors = this.formService.getFormValidationErrorMessages(
    //     this.messageForm
    //   );
  }
  setImage(imageUrl) {
    this.selectedImage = imageUrl;
  }
}
