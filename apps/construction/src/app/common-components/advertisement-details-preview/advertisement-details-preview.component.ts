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
import { catchError, first, of, take, tap } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { EncryptionService } from '../../services/encryption-service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-advertisement-details-preview',
  templateUrl: './advertisement-details-preview.component.html',
  styleUrls: ['./advertisement-details-preview.component.css'],
  standalone: true,
  imports: [CommonModule, RatingModule, FormsModule],
})
export class AdvertisementDetailsPreviewComponent {
  @Input('advertisement') advertisement: AdvertisementInterface = {};

  env: EnvironmentInfo = new EnvironmentInfo();

  storageService = inject(StorageService);
  userService = inject(UserService);
  imageService = inject(ImageService);
  toastService = inject(ToastrService);

  apiService = inject(ApiService);
  encryptionService = inject(EncryptionService);
  user = this.storageService.getUser();
  message = '';
  max = 10;
  rate: number;
  isReadonly = true;
  myServices: string[] = [];
  locationType: any;
  myLocations: string[] = [];
  registeredDate: any;
  acitveAds: Date;
  constructor() {
    const userId = this.storageService?.getUserId();
    this.apiService
      .getPreNewAdInfo(this.encryptionService.encryptItem(userId()))
      .pipe(
        takeUntilDestroyed(),
        take(1),
        tap((info: any) => {
          console.log(info, 'info info');
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
        }),
        catchError((err) => {
          return of(err);
        })
      )
      .subscribe();

    // this.apiService
    //   .getUserServices(this.storageService?.getUserId()())
    //   .pipe(first())
    //   .subscribe(
    //     (list: string[]) => {
    //       this.myServices = list;
    //       console.log(list, 'list asdfasd');
    //     },
    //     (err) => {
    //       this.toastService.error(
    //         'Failed getting user servcies due to server error. ' + err,
    //         'No update',
    //         {
    //           timeOut: 3000,
    //           positionClass: 'toast-top-right',
    //           closeButton: true,
    //           progressBar: true,
    //         }
    //       );
    //       return of(err);
    //     }
    //   );
    // this.apiService
    //   .getUserServiceLocations(this.storageService?.getUserId()())
    //   .pipe(first())
    //   .subscribe(
    //     (info: any) => {
    //       this.locationType = info.serviceCoverageType;
    //       if (this.locationType === 'province') {
    //         this.myLocations = info.provinces;
    //       } else if (this.locationType === 'city') {
    //         this.myLocations = info.cities;
    //       } else if (this.locationType === 'country') {
    //         this.myLocations = ['All over Canada'];
    //       }
    //     },
    //     (err) => {
    //       this.toastService.error(
    //         'Failed getting user servcies location due to server error. ' + err,
    //         'No update',
    //         {
    //           timeOut: 3000,
    //           positionClass: 'toast-top-right',
    //           closeButton: true,
    //           progressBar: true,
    //         }
    //       );
    //       return of(err);
    //     }
    //   );
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
}
