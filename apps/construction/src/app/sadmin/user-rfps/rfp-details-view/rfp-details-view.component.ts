import { ActivatedRoute } from '@angular/router';

import { Component, DestroyRef, Input, inject } from '@angular/core';
import { AdvertisementInterface } from '../../../models/advertisement';
import { StorageService } from '../../../services/storage.service';
import { UserService } from '../../../services/user-service';

import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { EnvironmentInfo } from 'libs/common/src/models/common';
import { ImageService } from '../../../services/image-service';
import { ApiService } from '../../../services/api.service';
import { tap, switchMap } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { EncryptionService } from '../../../services/encryption-service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DomSanitizer } from '@angular/platform-browser';
import { FormService } from '../../../services/form.service';
import { CommonUtilityService } from '../../../services/common-utility.service';
import { RatingInterface } from '../../../models/rating';
import { RFPInterface } from '../../../models/rfp';

@Component({
  selector: 'app-admin-rfp-details-view',
  templateUrl: './rfp-details-view.component.html',
  styleUrls: ['./rfp-details-view.component.css'],
})
export class AdminRfpDetailsViewComponent {
  advertisement: RFPInterface = {};
  env: EnvironmentInfo = new EnvironmentInfo();
  storageService = inject(StorageService);
  commonUtility = inject(CommonUtilityService);
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
  selectedImage: any;
  profileImage: string;
  userRating: RatingInterface = {};
  constructor(private sanitizer: DomSanitizer) {
    this.max = this.commonUtility.getMaxUserRating();
    const adObject = this.storageService?.getRfp()();
    if (adObject?.rfpIdSelected && adObject?.rfpAction === 'view') {
      this.apiService
        .getUserRfpDetails(
          adObject?.rfpIdSelected,
          this.encryptionService.encryptItem(this.userId())
        )
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
                if (item?.userRFPImage) {
                  this.sliderImages.push(item?.userRFPImage);
                }
              });

              this.userInfo = info?.userInfo;
              this.registeredDate = new Date(info?.registeredDate);
              this.acitveAds = info.acitveAds;
              this.userRating = info.userRate;
            }
          }),

          switchMap(() => {
            return this.apiService
              .isRfpUserFavoriteAd(
                this.storageService?.getSelectedRfpId()(),
                this.encryptionService.encryptItem(this.userId())
              )
              .pipe(
                takeUntilDestroyed(this.destroyRef),
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

  goToUrl() {
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
      .addFavoriteRfp(id, this.encryptionService.encryptItem(this.userId()))
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        tap((info: any) => {
          if (info === 'inserted') this.heartColor = 'red';
          else this.heartColor = '';
          this.toastService.success(
            info + 'Saved Successfully.',
            'Successful',
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
  }

  setImage(imageUrl) {
    this.selectedImage = imageUrl;
  }
  getDaysLeft() {
    return this.userService.differenceInDays(
      new Date(this.advertisement?.endDate),
      new Date()
    );
  }
}
