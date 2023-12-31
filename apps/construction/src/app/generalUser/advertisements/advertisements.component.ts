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
  selector: 'app-advertisements',
  templateUrl: './advertisements.component.html',
  styleUrls: ['./advertisements.component.css'],
})
export class AdvertisementsComponent {
  encryptionService = inject(EncryptionService);
  formService = inject(FormService);
  router = inject(Router);
  imageService = inject(ImageService);
  utilityService = inject(CommonUtilityService);
  toastService = inject(ToastrService);
  page = 1;
  pageSize = 5;
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
  getAds$ = this.apiService
    .getUserAdvertisements(this.encryptionService.encryptItem(this.userId()))
    .pipe(
      takeUntilDestroyed(this.destroyRef),

      tap((list: any) => {
        this.allAdvertisements = list;
        const uniqueIds = new Set();
        this.uniqueAdvertisements = this.allAdvertisements.filter((obj) => {
          if (uniqueIds.has(obj.userAdvertisementId)) {
            return false;
          } else {
            uniqueIds.add(obj.userAdvertisementId);
            return true;
          }
        });

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
            this.userAdvertisementDuration = info.userAdvertisementDuration;
          })
        )
      )
    );
  userAdvertisementDuration: any;
  constructor() {
    this.getAds$.subscribe();
  }
  activateAd(flag: boolean, adId: any) {
    this.apiService
      .updateUserAdvertisementActiveStatus(
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
      .updateUserAdvertisementDeleteStatus(
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
  repostAdvertisement(advertisement: AdvertisementInterface) {
    this.apiService
      .canUserAdvertise(this.encryptionService.encryptItem(this.userId()))
      .pipe(
        takeUntilDestroyed(this.destroyRef),

        switchMap((info) => {
          if (info.result) {
            return this.apiService
              .repostUserAdvertisement(
                this.encryptionService.encryptItem(this.userId()),
                advertisement.userAdvertisementId,
                this.userAdvertisementDuration,
                info.activePlanId
              )

              .pipe(
                takeUntilDestroyed(this.destroyRef),
                tap((list: any) => {
                  this.toastService.success(
                    'Ad. posted successfully. ',
                    'Successful',
                    {
                      timeOut: 3000,
                      positionClass: 'toast-top-right',
                      closeButton: true,
                      progressBar: true,
                    }
                  );
                })
              );
          } else {
            this.toastService.error(
              'You have no sufficient balance to create new advertisement. please purchase a plan . ',
              'Error',
              {
                timeOut: 3000,
                positionClass: 'toast-top-right',
                closeButton: true,
                progressBar: true,
              }
            );
          }
        }),
        switchMap(() => this.getAds$)
      )
      .subscribe();
  }
  navigatePromoteAd(userAdvertisementId) {
    this.storageService.updateAdvertisementIdAndAction(
      userAdvertisementId,
      'promote'
    );

    this.router.navigate(['/general/promote-top-ad']);
  }
  pageChangedTop(event: any, target: string): void {
    this[target] = event.page;
  }
}
