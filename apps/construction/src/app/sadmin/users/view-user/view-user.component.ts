import { Component, DestroyRef, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../../../services/api.service';
import { EncryptionService } from '../../../services/encryption-service';
import { StorageService } from '../../../services/storage.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { tap } from 'rxjs';
import { ImageService } from '../../../services/image-service';

@Component({
  selector: 'app-view-user',
  templateUrl: './view-user.component.html',
  styleUrls: ['./view-user.component.css'],
})
export class ViewUserComponent {
  apiService = inject(ApiService);
  encryptionService = inject(EncryptionService);
  storageService = inject(StorageService);
  router = inject(Router);
  destroyRef = inject(DestroyRef);
  toastService = inject(ToastrService);
  imageService = inject(ImageService);
  userPermission = this.storageService.getUserPermissions();
  userRole = this.storageService.getUserRole();
  getUserSelected = this.storageService.getUserSelected();
  userAdvertisements: any;
  listPlans: any;
  currentPlan: any;
  planBalance: any;
  constructor() {
    if (
      this.userRole() != 'SAdmin' &&
      (!this.userPermission().allowUserActions || !this.getUserSelected())
    )
      this.router.navigate(['/admin/user-profile']);
    else {
      this.apiService
        .getUserDetails(
          this.encryptionService.encryptItem(this.getUserSelected()?.userId)
        )
        .pipe(
          takeUntilDestroyed(this.destroyRef),
          tap((userInfo: any) => {
            this.userAdvertisements = userInfo?.userAds;
            this.planBalance = userInfo?.planBalance;
            this.listPlans = userInfo?.plans.filter(
              (plan) => plan.userPlanActive === 0
            );
            this.currentPlan = userInfo?.plans.filter(
              (plan) => plan.userPlanActive === 1
            )[0];
          })
        )
        .subscribe();
    }
  }
}
