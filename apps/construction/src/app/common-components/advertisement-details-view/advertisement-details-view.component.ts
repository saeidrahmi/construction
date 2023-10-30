import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Component, Input, inject } from '@angular/core';
import { AdvertisementInterface } from '../../models/advertisement';
import { StorageService } from '../../services/storage.service';
import { UserService } from '../../services/user-service';
import { RatingModule } from 'ngx-bootstrap/rating';
import { FormsModule } from '@angular/forms';
import { EnvironmentInfo } from 'libs/common/src/models/common';
import { ImageService } from '../../services/image-service';
import { ApiService } from '../../services/api.service';
import { catchError, first, map, of, take, tap, switchMap } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { EncryptionService } from '../../services/encryption-service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-advertisement-details-view',
  templateUrl: './advertisement-details-view.component.html',
  styleUrls: ['./advertisement-details-view.component.css'],
  standalone: true,
  imports: [CommonModule, RatingModule, FormsModule],
})
export class AdvertisementDetailsViewComponent {
  advertisement: AdvertisementInterface = {};
  env: EnvironmentInfo = new EnvironmentInfo();
  storageService = inject(StorageService);
  userService = inject(UserService);
  imageService = inject(ImageService);
  toastService = inject(ToastrService);
  apiService = inject(ApiService);
  route = inject(ActivatedRoute);

  encryptionService = inject(EncryptionService);
  user = this.storageService.getUser();
  message = '';
  max = 10;
  rate: number;
  isReadonly = false;
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
  constructor(private sanitizer: DomSanitizer) {
    this.route.params
      .pipe(
        map((param) => param['id']),
        switchMap((id) => {
          return this.apiService.getAdvertisementDetails(id).pipe(
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
            })
          );
        })
      )

      .subscribe();
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
}
