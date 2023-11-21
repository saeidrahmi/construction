import { Component, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ToastrService } from 'ngx-toastr';
import { tap, catchError, of } from 'rxjs';
import { ApiService } from '../../services/api.service';
import { StorageService } from '../../services/storage.service';
import { EncryptionService } from '../../services/encryption-service';
import * as moment from 'moment';
@Component({
  selector: 'construction-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent {
  toastService = inject(ToastrService);
  apiService = inject(ApiService);
  encryptionService = inject(EncryptionService);
  storageService = inject(StorageService);
  userId = this.storageService?.getUserId();
  canAdvertise: boolean;
  userNewMessagesNbr = this.storageService.getUserNewMessagesNbr();
  generalInfo: any;
  daysUntilPasswordExpiration: number;
  constructor() {
    this.getPasswordResetRequiredInDays();
    this.apiService
      .canUserAdvertise(this.encryptionService.encryptItem(this.userId()))
      .pipe(
        takeUntilDestroyed(),
        tap((info: any) => {
          this.generalInfo = info;
          if (!info?.result) this.canAdvertise = false;
          else this.canAdvertise = true;
        }),
        catchError((err) => {
          this.canAdvertise = false;
          return of(err);
        })
      )
      .subscribe();
  }
  getPasswordResetRequiredInDays() {
    const lastPasswordResetDate = new Date(
      this.storageService.getUser()()?.lastPasswordResetDate
    );
    const passwordExpirationDaysSetting =
      this.storageService.getExpirationPeriodInDays()();
    this.daysUntilPasswordExpiration = this.calculateDaysUntilExpiration(
      lastPasswordResetDate,
      passwordExpirationDaysSetting
    );
  }
  private calculateDaysUntilExpiration(
    lastResetDate: Date,
    expirationDays: number
  ): number {
    const today = new Date();
    const expirationDate = new Date(lastResetDate);
    expirationDate.setDate(expirationDate.getDate() + expirationDays);
    const timeDiff = expirationDate.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return daysDiff;
  }
}
