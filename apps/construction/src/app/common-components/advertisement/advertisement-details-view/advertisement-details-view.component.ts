import { isUserLoggedIn } from '../../../services/user-gaurds';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
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
import { PhoneNumberPipe } from '../../../pipes/phone-number.pipe';
import { CommonUtilityService } from '../../../services/common-utility.service';
import { RatingInterface } from '../../../models/rating';
import { QuillModule } from 'ngx-quill';

@Component({
  selector: 'app-advertisement-details-view',
  templateUrl: './advertisement-details-view.component.html',
  styleUrls: ['./advertisement-details-view.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    RatingModule,
    FormsModule,
    ReactiveFormsModule,
    FormErrorsComponent,
    PhoneNumberPipe,
    RouterModule,
    QuillModule,
  ],
})
export class AdvertisementDetailsViewComponent {
  advertisement: AdvertisementInterface = {};
  env: EnvironmentInfo = new EnvironmentInfo();
  storageService = inject(StorageService);
  userService = inject(UserService);
  imageService = inject(ImageService);
  router = inject(Router);
  commonUtility = inject(CommonUtilityService);
  toastService = inject(ToastrService);
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
  userRating: RatingInterface = {};
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

  constructor(private sanitizer: DomSanitizer) {
    this.max = this.commonUtility.getMaxUserRating();
    const adObject = this.storageService?.getAdvertisement()();
    if (
      adObject?.advertisementIdSelected &&
      adObject?.advertisementAction === 'view'
    ) {
      this.apiService
        .getAdvertisementDetails(adObject?.advertisementIdSelected)
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
              this.advertisement.userId = this.userInfo?.userId;
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

          switchMap(() => {
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
  navigateRatingDetails() {
    this.storageService.updateAdvertisementState(
      this.advertisement,
      this.advertisement.userAdvertisementId,
      'view'
    );
    this.router.navigate(['/user-ratings-details']);
  }
  naviagteUserAds(id: string) {
    this.storageService.updateSelectedAdvertisementId(id);
    this.router.navigate(['/user-advertisements']);
  }

  updateUserOverallRating(rate: any, rateType: string) {
    if (this.isLoggedIn())
      this.apiService
        .addUserRating(
          rate,
          this.encryptionService.encryptItem(this.userInfo?.userId),
          this.encryptionService.encryptItem(this.userId()),
          rateType
        )
        .pipe(
          takeUntilDestroyed(this.destroyRef),
          tap(() => {
            this.toastService.success('success', 'success', {
              timeOut: 3000,
              positionClass: 'toast-top-right',
              closeButton: true,
              progressBar: true,
            });
          }),
          catchError((err) => {
            this.heartColor = '';
            return of(err);
          }),
          switchMap(() =>
            this.apiService
              .getUserRatings(this.advertisement?.userAdvertisementId)
              .pipe(
                takeUntilDestroyed(this.destroyRef),
                tap((ratings: any) => {
                  console.log(ratings, 'ratings');
                  this.userRating = { ...ratings };
                })
              )
          )
        )

        .subscribe();
    else
      this.toastService.error('Please login first', 'Failed', {
        timeOut: 3000,
        positionClass: 'toast-top-right',
        closeButton: true,
        progressBar: true,
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
            this.toastService.success(info + ' success', 'success', {
              timeOut: 3000,
              positionClass: 'toast-top-right',
              closeButton: true,
              progressBar: true,
            });
          }),
          catchError((err) => {
            this.heartColor = '';
            return of(err);
          })
        )

        .subscribe();
    else
      this.toastService.error('Please login first', 'Failed', {
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
        this.toastService.error('Please login first', 'Failed', {
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
