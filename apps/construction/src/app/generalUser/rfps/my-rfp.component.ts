import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { tap, switchMap } from 'rxjs';
import { AdvertisementInterface } from '../../models/advertisement';
import { AdvertisementCommunicationService } from '../../services/advertisementServcie';
import { CommonUtilityService } from '../../services/common-utility.service';
import { EncryptionService } from '../../services/encryption-service';
import { FormService } from '../../services/form.service';
import { StorageService } from '../../services/storage.service';
import { ApiService } from '../../services/api.service';
import { ImageService } from '../../services/image-service';
import { UserService } from '../../services/user-service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-my-rfps',
  templateUrl: './my-rfp.component.html',
  styleUrls: ['./my-rfp.component.css'],
})
export class MyRFPComponent {
  encryptionService = inject(EncryptionService);
  formService = inject(FormService);
  router = inject(Router);
  imageService = inject(ImageService);
  utilityService = inject(CommonUtilityService);
  toastService = inject(ToastrService);
  apiService = inject(ApiService);
  userService = inject(UserService);
  storageService = inject(StorageService);
  advertisementCommunicationService = inject(AdvertisementCommunicationService);
  commonUtility = inject(CommonUtilityService);
  destroyRef = inject(DestroyRef);
  allAdvertisements: any[] = [];
  uniqueAdvertisements: any[] = [];
  userId = this.storageService?.getUserId();
  user = this.storageService?.getUser();
  currentDate = new Date();
  page = 1;
  pageSize = 5;
  userRFPDuration: any;
  getAds$ = this.apiService
    .getUserRfPs(this.encryptionService.encryptItem(this.userId()))
    .pipe(
      takeUntilDestroyed(this.destroyRef),

      tap((list: any) => {
        this.allAdvertisements = list;
        console.log(this.allAdvertisements);
        const uniqueIds = new Set();
        this.uniqueAdvertisements = this.allAdvertisements.filter((obj) => {
          if (uniqueIds.has(obj.rfpId)) {
            return false;
          } else {
            uniqueIds.add(obj.rfpId);
            return true;
          }
        });
        console.log(this.uniqueAdvertisements);

        this.uniqueAdvertisements = this.uniqueAdvertisements.map((obj) => {
          if (
            obj?.headerImage &&
            obj.headerImage.type === 'Buffer' &&
            Array.isArray(obj.headerImage.data)
          ) {
            const blob = new Blob([new Uint8Array(obj.headerImage.data)], {
              type: 'image/jpeg',
            }); // Adjust 'image/jpeg' to the correct image MIME type
            const imageUrl = URL.createObjectURL(blob);
            return { ...obj, headerImage: `url(${imageUrl})` };
          }
          return obj;
        });
      }),

      switchMap(() =>
        this.apiService.getApplicationSetting().pipe(
          takeUntilDestroyed(this.destroyRef),

          tap((info: any) => {
            7;
            this.userRFPDuration = info.userRFPDuration;
          })
        )
      )
    );

  constructor() {
    this.getAds$.subscribe();
  }
  pageChangedTop(event: any, target: string): void {
    this[target] = event.page;
  }
  activateAd(flag: boolean, adId: any) {
    this.apiService
      .updateUserRFPActiveStatus(
        this.encryptionService.encryptItem(this.userId()),
        flag,
        adId
      )

      .pipe(
        takeUntilDestroyed(this.destroyRef),

        tap(() => {
          this.toastService.success('Saved Successfully. ', 'Successful', {
            timeOut: 3000,
            positionClass: 'toast-top-right',
            closeButton: true,
            progressBar: true,
          });
        }),

        switchMap(() => this.getAds$)
      )
      .subscribe();
  }
  deleteAd(adId: any) {
    this.apiService
      .updateUserRFPDeleteStatus(
        this.encryptionService.encryptItem(this.userId()),
        adId
      )

      .pipe(
        takeUntilDestroyed(this.destroyRef),
        tap((list: any) => {
          this.toastService.success('Deleted successfully. ', 'Successful', {
            timeOut: 3000,
            positionClass: 'toast-top-right',
            closeButton: true,
            progressBar: true,
          });
        }),

        switchMap(() => this.getAds$)
      )
      .subscribe();
  }
  editAdvertisement(userAdvertisementId: string) {
    this.storageService.updateSelectedAdvertisementId(userAdvertisementId);
    this.router.navigate(['/general/edit-advertisement']);
  }
}
