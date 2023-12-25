import { ActivatedRoute } from '@angular/router';
import { Component, DestroyRef, inject } from '@angular/core';
import { AdvertisementInterface } from '../../../../models/advertisement';
import { StorageService } from '../../../../services/storage.service';
import { UserService } from '../../../../services/user-service';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { EnvironmentInfo } from 'libs/common/src/models/common';
import { ImageService } from '../../../../services/image-service';
import { ApiService } from '../../../../services/api.service';
import { of, tap, switchMap } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { EncryptionService } from '../../../../services/encryption-service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DomSanitizer } from '@angular/platform-browser';
import { FormService } from '../../../../services/form.service';
import { CommonUtilityService } from 'apps/construction/src/app/services/common-utility.service';
import { RatingInterface } from 'apps/construction/src/app/models/rating';

@Component({
  selector: 'app-admin-advertisement-details-view',
  templateUrl: './advertisement-details-view.component.html',
  styleUrls: ['./advertisement-details-view.component.css'],
})
export class AdminAdvertisementDetailsViewComponent {
  advertisement: AdvertisementInterface = {};
  env: EnvironmentInfo = new EnvironmentInfo();
  storageService = inject(StorageService);
  userService = inject(UserService);
  imageService = inject(ImageService);
  toastService = inject(ToastrService);
  commonUtility = inject(CommonUtilityService);
  apiService = inject(ApiService);
  route = inject(ActivatedRoute);
  formService = inject(FormService);
  destroyRef = inject(DestroyRef);
  encryptionService = inject(EncryptionService);
  fb = inject(FormBuilder);
  isLoggedIn = this.storageService.isUserLoggedIn();
  messageForm: FormGroup;
  user = this.storageService.getUser();
  message = '';
  max: number;
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
  userRating: RatingInterface = {};

  constructor(private sanitizer: DomSanitizer) {
    this.max = this.commonUtility.getMaxUserRating();
    const adObject = this.storageService?.getAdvertisement()();
    if (
      adObject?.advertisementIdSelected &&
      adObject?.advertisementAction === 'view'
    ) {
      this.apiService
        .getAdminAdvertisementDetails(adObject?.advertisementIdSelected)
        .pipe(
          takeUntilDestroyed(),

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
              this.userRating = info.userRate;
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
          switchMap((info: any) => {
            const advertisement = info?.selectAdResult[0];
            if (
              advertisement?.adType === 'sale' ||
              advertisement.adType === 'rental'
            )
              return this.apiService
                .getAdvertisementItems(advertisement?.userAdvertisementId)
                .pipe(
                  takeUntilDestroyed(this.destroyRef),
                  tap((items: any) => {
                    this.advertisement.items = [];

                    items.forEach((item) => {
                      if (item?.itemImage) {
                        const uint8Array = new Uint8Array(item?.itemImage.data);

                        // Convert Uint8Array to Blob
                        const blob = new Blob([uint8Array], {
                          type: 'image/jpeg' /* specify MIME type if known */,
                        });
                        const temporaryFile = new File([blob], 'image.jpg', {
                          type: 'image/jpeg',
                        });

                        // Create an Image object to get the dimensions
                        const img = new Image();
                        img.src = URL.createObjectURL(temporaryFile);

                        img.onload = () => {
                          // Set the dimensions on the temporaryFile
                          temporaryFile['width'] = img.width;
                          temporaryFile['height'] = img.height;

                          // Now you can use temporaryFile with its dimensions

                          // this.itemImageFiles.push(temporaryFile);
                          const imageUrl = URL.createObjectURL(temporaryFile);
                          // this.advertisement.sliderImages.push(`${imageUrl}`);
                          this.advertisement.items.push({
                            itemImage: `${imageUrl}`,
                            itemCategory: item.itemCategory,
                            itemName: item.itemName,
                            itemDescription: item.itemDescription,
                          });
                        };
                      }
                    });
                  })
                );
            else return of(null);
          }),

          switchMap((info) => {
            if (this.isLoggedIn())
              return this.apiService
                .isUserFavoriteAd(
                  this.storageService?.getSelectedAdvertisementId()(),
                  this.encryptionService.encryptItem(this.userId())
                )
                .pipe(
                  takeUntilDestroyed(this.destroyRef),
                  tap((isFavorite) => {
                    if (isFavorite) this.heartColor = 'red';
                    else this.heartColor = '';
                  })
                );
            else return of(null);
          })
        )

        .subscribe();
    } else this.advertisementExists = false;

    this.messageForm = this.fb.group({
      message: new FormControl('', [Validators.required]),
    });
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
    if (this.isLoggedIn())
      this.apiService
        .addFavoriteAdvertisement(
          id,
          this.encryptionService.encryptItem(this.userId())
        )
        .pipe(
          takeUntilDestroyed(this.destroyRef),

          tap((info: any) => {
            if (info === 'inserted') this.heartColor = 'red';
            else this.heartColor = '';
            this.toastService.success(
              info + 'Completed successfully',
              'Success',
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
    else
      this.toastService.error('Please login first', 'Error', {
        timeOut: 3000,
        positionClass: 'toast-top-right',
        closeButton: true,
        progressBar: true,
      });
  }
  sendMessage() {
    this.formErrors = [];
    if (this.messageForm.valid) {
      if (this.isLoggedIn())
        this.apiService
          .sendAdvertisementMessage(
            this.encryptionService.encryptItem(this.userInfo?.userId),
            this.encryptionService.encryptItem(this.userId()),
            this.advertisement?.userAdvertisementId,
            this.message
          )
          .pipe(
            takeUntilDestroyed(this.destroyRef),

            tap((info: any) => {
              this.toastService.success('success', 'success', {
                timeOut: 3000,
                positionClass: 'toast-top-right',
                closeButton: true,
                progressBar: true,
              });
            })
          )

          .subscribe();
      else
        this.toastService.error('Please login first', 'Error', {
          timeOut: 3000,
          positionClass: 'toast-top-right',
          closeButton: true,
          progressBar: true,
        });
    } else
      this.formErrors = this.formService.getFormValidationErrorMessages(
        this.messageForm
      );
  }
}
