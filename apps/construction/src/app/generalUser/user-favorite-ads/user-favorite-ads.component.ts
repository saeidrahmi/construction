import { Component, DestroyRef, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../../services/api.service';
import { EncryptionService } from '../../services/encryption-service';
import { FormService } from '../../services/form.service';
import { StorageService } from '../../services/storage.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { tap, switchMap } from 'rxjs';
import { AdvertisementInterface } from '../../models/advertisement';
import { RFPInterface } from '../../models/rfp';
@Component({
  selector: 'app-user-favorite-ads-messages',
  templateUrl: './user-favorite-ads.component.html',
  styleUrls: ['./user-favorite-ads.component.css'],
})
export class UserFavoriteAdvertisementsComponent {
  toastService = inject(ToastrService);
  storageService = inject(StorageService);
  apiService = inject(ApiService);
  router = inject(Router);
  route = inject(ActivatedRoute);
  formService = inject(FormService);
  destroyRef = inject(DestroyRef);
  encryptionService = inject(EncryptionService);
  isLoggedIn = this.storageService.isUserLoggedIn();
  user = this.storageService.getUser();
  userId = this.storageService?.getUserId();
  advertisements: AdvertisementInterface[] = [];
  rfps: RFPInterface[] = [];
  getFavoriteAdvertisements$ = this.apiService
    .getFavoriteAdvertisements(
      this.encryptionService.encryptItem(this.userId())
    )
    .pipe(
      takeUntilDestroyed(this.destroyRef),
      tap((list: any) => {
        this.advertisements = list?.advertisements;
        this.rfps = list?.rfps;
      })
    );

  constructor() {
    this.getFavoriteAdvertisements$.subscribe();
  }

  deleteAd(userAdvertisementId: any) {
    if (userAdvertisementId) {
      this.storageService.updateIsLoading(true);
      this.apiService
        .deleteUserFavoriteAdvertisement(
          this.encryptionService.encryptItem(this.userId()),
          userAdvertisementId
        )
        .pipe(
          takeUntilDestroyed(this.destroyRef),
          tap(() => {
            this.toastService.success('Deleted Successfully.', 'Successful', {
              timeOut: 3000,
              positionClass: 'toast-top-right',
              closeButton: true,
              progressBar: true,
            });
          }),

          switchMap(() => this.getFavoriteAdvertisements$)
        )
        .subscribe();
    }
  }
  navigateDetails(userAdvertisementId) {
    this.storageService.updateAdvertisementIdAndAction(
      userAdvertisementId,
      'view'
    );
    this.router.navigate(['/view-advertisement-details']);
  }
}
