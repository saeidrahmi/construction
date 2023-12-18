import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { tap, catchError, of, switchMap } from 'rxjs';

import { AdvertisementCommunicationService } from '../../services/advertisementServcie';
import { CommonUtilityService } from '../../services/common-utility.service';
import { EncryptionService } from '../../services/encryption-service';
import { FormService } from '../../services/form.service';
import { StorageService } from '../../services/storage.service';
import { ApiService } from '../../services/api.service';
import { ImageService } from '../../services/image-service';
import { UserService } from '../../services/user-service';
import { ToastrService } from 'ngx-toastr';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { RFPInterface } from '../../models/rfp';

@Component({
  selector: 'app-rfp-pending-approval',
  templateUrl: './rfp-pending-approval.component.html',
  styleUrls: ['./rfp-pending-approval.component.css'],
})
export class RfpPendingApprovalComponent {
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
  allAdvertisements: RFPInterface[] = [];
  uniqueAdvertisements: any[] = [];
  userId = this.storageService?.getUserId();
  user = this.storageService?.getUser();
  reason: string[] = [];
  form: FormGroup = this.fb.group({
    reasonControl: new FormControl('', [Validators.required]),
  });

  currentDate = new Date();
  getAds$ = this.apiService.getAllUsersRfpsPendingApproval().pipe(
    takeUntilDestroyed(this.destroyRef),

    tap((list: any) => {
      // this.allAdvertisements = list;
      list.map((ad) => {
        if (ad?.headerImage) {
          const blob = new Blob([new Uint8Array(ad.headerImage.data)], {
            type: 'image/jpeg',
          });

          // Set the header image URL
          const imageUrl = URL.createObjectURL(blob);
          ad.headerImage = `url(${imageUrl})`;
        }
      });
      this.allAdvertisements = list;
    }),
    catchError((err) => {
      return of(err);
    }),
    switchMap(() =>
      this.apiService.getApplicationSetting().pipe(
        takeUntilDestroyed(this.destroyRef),

        tap((info: any) => {
          this.userAdvertisementDuration = info.userRFPDuration;
        })
      )
    )
  );
  userAdvertisementDuration: any;
  userPermissions = this.storageService.getUserPermissions();
  userRole = this.storageService.getUserRole();
  constructor() {
    if (this.userRole() != 'SAdmin' && !this.userPermissions().viewRfps)
      this.router.navigate(['/admin/user-profile']);
    this.getAds$.subscribe();
  }
  approveAd(rfpId: any) {
    this.apiService
      .approveRfp(rfpId)

      .pipe(
        takeUntilDestroyed(this.destroyRef),

        tap((list: any) => {
          this.toastService.success('RFP approved successfully. ', 'Success', {
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
  rejectAd(rfpId: any) {
    this.apiService
      .rejectRfp(rfpId, this.reason?.join(', '))

      .pipe(
        takeUntilDestroyed(this.destroyRef),

        tap(() => {
          this.toastService.success('RFP rejected successfully. ', 'Success', {
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
}
