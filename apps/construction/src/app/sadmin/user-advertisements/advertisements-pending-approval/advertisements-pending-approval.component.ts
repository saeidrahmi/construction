import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { take, tap, catchError, of, switchMap, map } from 'rxjs';
import { AdvertisementInterface } from '../../../models/advertisement';
import { AdvertisementCommunicationService } from '../../../services/advertisementServcie';
import { CommonUtilityService } from '../../../services/common-utility.service';
import { EncryptionService } from '../../../services/encryption-service';
import { FormService } from '../../../services/form.service';
import { StorageService } from '../../../services/storage.service';
import { ApiService } from '../../../services/api.service';
import { ImageService } from '../../../services/image-service';
import { UserService } from '../../../services/user-service';
import { ToastrService } from 'ngx-toastr';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';

@Component({
  selector: 'app-advertisements-pending-approval',
  templateUrl: './advertisements-pending-approval.component.html',
  styleUrls: ['./advertisements-pending-approval.component.css'],
})
export class AdvertisementsPendingApprovalComponent {
  encryptionService = inject(EncryptionService);
  formService = inject(FormService);
  router = inject(Router);
  imageService = inject(ImageService);
  toastService = inject(ToastrService);
  apiService = inject(ApiService);
  userService = inject(UserService);

  fb = inject(FormBuilder);
  storageService = inject(StorageService);
  advertisementCommunicationService = inject(AdvertisementCommunicationService);
  commonUtility = inject(CommonUtilityService);
  destroyRef = inject(DestroyRef);
  allAdvertisements: AdvertisementInterface[] = [];
  uniqueAdvertisements: any[] = [];
  userId = this.storageService?.getUserId();
  user = this.storageService?.getUser();
  reason: string[] = [];
  form: FormGroup = this.fb.group({
    reasonControl: new FormControl('', [Validators.required]),
  });

  currentDate = new Date();
  getAds$ = this.apiService.getAllUsersAdvertisementsPendingApproval().pipe(
    takeUntilDestroyed(this.destroyRef),
    take(1),
    tap((list: any) => {
      this.allAdvertisements = list;
    }),
    catchError((err) => {
      return of(err);
    }),
    switchMap(() =>
      this.apiService.getApplicationSetting().pipe(
        takeUntilDestroyed(this.destroyRef),
        take(1),
        tap((info: any) => {
          7;
          this.userAdvertisementDuration = info.userAdvertisementDuration;
        }),
        catchError((err) => {
          return of(err);
        })
      )
    )
  );
  userAdvertisementDuration: any;
  userPermissions = this.storageService.getUserPermissions();
  constructor() {
    if (!this.userPermissions().viewPendingAdvertisements)
      this.router.navigate(['/admin/user-profile']);
    this.getAds$.subscribe();
  }
  approveAd(userAdvertisementId: any) {
    this.apiService
      .approveAdvertisement(userAdvertisementId)

      .pipe(
        takeUntilDestroyed(this.destroyRef),
        take(1),
        tap((list: any) => {
          this.toastService.success('Updated. ', 'Success', {
            timeOut: 3000,
            positionClass: 'toast-top-right',
            closeButton: true,
            progressBar: true,
          });
        }),
        catchError((err) => {
          this.toastService.error('Update failed. ' + err, 'Plan failure', {
            timeOut: 3000,
            positionClass: 'toast-top-right',
            closeButton: true,
            progressBar: true,
          });
          return of(err);
        }),
        switchMap(() => this.getAds$)
      )
      .subscribe();
  }
  rejectAd(userAdvertisementId: any) {
    this.apiService
      .rejectAdvertisement(userAdvertisementId, this.reason?.join(', '))

      .pipe(
        takeUntilDestroyed(this.destroyRef),
        take(1),
        tap((list: any) => {
          this.toastService.success('Deleted. ', 'Success', {
            timeOut: 3000,
            positionClass: 'toast-top-right',
            closeButton: true,
            progressBar: true,
          });
        }),
        catchError((err) => {
          this.toastService.error('Deleted failed. ' + err, 'Plan failure', {
            timeOut: 3000,
            positionClass: 'toast-top-right',
            closeButton: true,
            progressBar: true,
          });
          return of(err);
        }),
        switchMap(() => this.getAds$)
      )
      .subscribe();
  }
}
