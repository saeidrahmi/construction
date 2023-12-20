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
import { RFPInterface } from '../../../models/rfp';

@Component({
  selector: 'app-rfp-details-view',
  templateUrl: './rfp-details-view.component.html',
  styleUrls: ['./rfp-details-view.component.css'],
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
export class RFPDetailsViewComponent {
  advertisement: RFPInterface = {};
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
  selectedImage: any;

  constructor(private sanitizer: DomSanitizer) {
    this.max = this.commonUtility.getMaxUserRating();
    const adObject = this.storageService?.getRfp()();
    if (adObject?.rfpIdSelected && adObject?.rfpAction === 'view') {
      this.apiService
        .getRfpDetails(adObject?.rfpIdSelected)
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
              .getUserRatingsByUserId(
                this.encryptionService.encryptItem(this.userInfo?.userId)
              )
              .pipe(
                takeUntilDestroyed(this.destroyRef),
                tap((ratings: any) => {
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

        .addFavoriteRfp(id, this.encryptionService.encryptItem(this.userId()))
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
  getDaysLeft() {
    return this.userService.differenceInDays(
      new Date(this.advertisement?.endDate),
      new Date()
    );
  }
  navigateRatingDetails() {
    this.storageService.updateRfpState(
      this.advertisement,
      this.advertisement.rfpId,
      'view'
    );
    this.router.navigate(['/user-ratings-details']);
  }
  naviagteUserAds(id: string) {
    this.storageService.updateSelectedRfpId(id);
    this.router.navigate(['/user-advertisements']);
  }
  setImage(imageUrl) {
    this.selectedImage = imageUrl;
  }
}
