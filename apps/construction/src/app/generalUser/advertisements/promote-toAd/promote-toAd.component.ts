import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../../../services/api.service';
import { EncryptionService } from '../../../services/encryption-service';
import { StorageService } from '../../../services/storage.service';
import { catchError, of, take, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-promote-toAd',
  templateUrl: './promote-toAd.component.html',
  styleUrls: ['./promote-toAd.component.css'],
})
export class PromoteToAdComponent {
  encryptionService = inject(EncryptionService);
  router = inject(Router);
  toastService = inject(ToastrService);
  apiService = inject(ApiService);
  storageService = inject(StorageService);
  destroyRef = inject(DestroyRef);
  userId = this.storageService?.getUserId();
  topAdPrice: any;
  tax: any;
  constructor() {
    const adObject = this.storageService?.getAdvertisement()();
    if (
      adObject?.advertisementIdSelected &&
      adObject?.advertisementAction === 'promote'
    ) {
      this.apiService
        .getApplicationSetting()
        .pipe(
          takeUntilDestroyed(),
          take(1),
          tap((info: any) => {
            this.topAdPrice = info.topAdvertisementPrice;
            this.tax = info.tax;
          }),
          catchError((err) => {
            return of(err);
          })
        )
        .subscribe();
    } else this.router.navigate(['/general/user-advertisements']);
  }
  promoteAd() {
    const amount = this.topAdPrice;
    const tax = (amount * this.tax) / 100;
    const totalAmount =
      parseFloat(amount.toString()) + parseFloat(tax.toString());
    const paymentInfo = {
      paymentConfirmation: `PAL-235894-CONFIRM`,
      paymentAmount: amount,
      tax: tax,
      totalPayment: totalAmount,
    };
    this.apiService
      .promoteTopAdvertisement(
        this.encryptionService.encryptItem(this.userId()),
        paymentInfo,
        this.storageService?.getSelectedAdvertisementId()()
      )
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        take(1),
        tap(() => {
          this.router.navigate(['/general/user-advertisements']);
          this.toastService.success('Updated. ', 'Success', {
            timeOut: 3000,
            positionClass: 'toast-top-right',
            closeButton: true,
            progressBar: true,
          });
        })
      )
      .subscribe();
  }
}
