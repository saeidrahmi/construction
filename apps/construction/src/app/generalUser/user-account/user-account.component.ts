import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ToastrService } from 'ngx-toastr';
import { tap, catchError, of, filter } from 'rxjs';
import { ApiService } from '../../services/api.service';
import { EncryptionService } from '../../services/encryption-service';
import { StorageService } from '../../services/storage.service';

@Component({
  selector: 'app-user-account',
  templateUrl: './user-account.component.html',
  styleUrls: ['./user-account.component.css'],
})
export class UserAccountComponent {
  toastService = inject(ToastrService);
  apiService = inject(ApiService);
  encryptionService = inject(EncryptionService);
  storageService = inject(StorageService);
  destroyRef = inject(DestroyRef);
  listPlans: any;
  currentPlan: any;
  constructor() {
    const userId = this.storageService?.getUserId();
    this.apiService
      .getUserPlans(this.encryptionService.encryptItem(userId()))
      .pipe(
        takeUntilDestroyed(),
        tap((plans: any) => {
          this.listPlans = plans.filter((plan) => plan.userPlanActive === 0);
          this.currentPlan = plans.filter(
            (plan) => plan.userPlanActive === 1
          )[0];
        })
      )
      .subscribe();
  }
}
