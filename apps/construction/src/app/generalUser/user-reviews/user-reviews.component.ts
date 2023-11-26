import { Component, DestroyRef, inject } from '@angular/core';
import { ApiService } from '../../services/api.service';

import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { StorageService } from '../../services/storage.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { tap } from 'rxjs';
import { RatingInterface } from '../../models/rating';

import { CommonUtilityService } from '../../services/common-utility.service';
import { EncryptionService } from '../../services/encryption-service';

@Component({
  selector: 'app-user-reviews',
  templateUrl: './user-reviews.component.html',
  styleUrls: ['./user-reviews.component.css'],
})
export class UserReviewsComponent {
  destroyRef = inject(DestroyRef);
  toastService = inject(ToastrService);
  commonUtility = inject(CommonUtilityService);
  apiService = inject(ApiService);
  router = inject(Router);
  storageService = inject(StorageService);
  encryptionService = inject(EncryptionService);
  ratings: any;
  userRating: RatingInterface = {};
  max: number;
  isLoggedIn = this.storageService.isUserLoggedIn();
  userId = this.storageService?.getUserId();
  advertisement: any;
  formErrors: any[] = [];
  adObject = this.storageService?.getAdvertisement()();
  userRatingDetails$ = this.apiService
    .getAllUserRatingsDetailsBasedOnUserId(
      this.encryptionService.encryptItem(this.userId())
    )
    .pipe(
      takeUntilDestroyed(),
      tap((data: any) => {
        this.ratings = data;
        this.userRating = data.avgRatings;
        //
      })
    );

  constructor() {
    this.max = this.commonUtility.getMaxUserRating();
    this.userRatingDetails$.subscribe();
  }
}
