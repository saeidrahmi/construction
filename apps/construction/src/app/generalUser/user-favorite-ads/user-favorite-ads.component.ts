import { Component, DestroyRef, ViewChild, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../../services/api.service';
import { EncryptionService } from '../../services/encryption-service';
import { FormService } from '../../services/form.service';
import { StorageService } from '../../services/storage.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { take, tap, catchError, of, switchMap } from 'rxjs';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { AdvertisementInterface } from '../../models/advertisement';

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
  getFavoriteAdvertisements$ = this.apiService
    .getFavoriteAdvertisements(
      this.encryptionService.encryptItem(this.userId())
    )
    .pipe(
      takeUntilDestroyed(this.destroyRef),
      take(1),
      tap((list: AdvertisementInterface[]) => {
        this.advertisements = list;
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
            this.toastService.success('User updated.', 'Update Successful', {
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
