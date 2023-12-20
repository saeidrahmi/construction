import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Component, DestroyRef, Input, inject } from '@angular/core';

import { StorageService } from '../../../services/storage.service';
import { UserService } from '../../../services/user-service';

import { FormsModule } from '@angular/forms';
import { RatingModule } from 'ngx-bootstrap/rating';
import { ImageService } from '../../../services/image-service';
import { CommonUtilityService } from '../../../services/common-utility.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ToastrService } from 'ngx-toastr';
import { tap, catchError, of } from 'rxjs';
import { ApiService } from '../../../services/api.service';
import { EncryptionService } from '../../../services/encryption-service';
import { DomSanitizer } from '@angular/platform-browser';
import { QuillModule } from 'ngx-quill';
import { RFPInterface } from '../../../models/rfp';

@Component({
  selector: 'app-rfp-view',
  templateUrl: './rfp-view.component.html',
  styleUrls: ['./rfp-view.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, RatingModule, QuillModule],
})
export class RFPViewComponent {
  @Input('advertisement') advertisement: RFPInterface = {};

  storageService = inject(StorageService);
  commonUtility = inject(CommonUtilityService);
  toastService = inject(ToastrService);
  apiService = inject(ApiService);
  encryptionService = inject(EncryptionService);
  userService = inject(UserService);
  router = inject(Router);
  user = this.storageService.getUser();
  isUserLoggedIn = this.storageService.isUserLoggedIn();
  imageService = inject(ImageService);
  destroyRef = inject(DestroyRef);
  userId = this.storageService?.getUserId();

  currentDate: Date;
  constructor(public sanitizer: DomSanitizer) {
    this.currentDate = new Date();
  }

  navigateDetails(advertisement, userAdvertisementId) {
    this.storageService.updateRfpState(
      advertisement,
      userAdvertisementId,
      'view'
    );
    this.router.navigate(['/view-rfp-details']);
  }
  getDaysLeft() {
    return this.userService.differenceInDays(
      new Date(this.advertisement?.endDate),
      this.currentDate
    );
  }
  navigateRatingDetails() {
    this.storageService.setSearchPreviousPage('rfp');
    this.storageService.updateRfpState(
      this.advertisement,
      this.advertisement.rfpId,
      'view'
    );
    this.router.navigate(['/user-ratings-details']);
  }
  addFavoriteAd(id: any) {
    if (this.isUserLoggedIn())
      this.apiService
        .addFavoriteRfp(id, this.encryptionService.encryptItem(this.userId()))
        .pipe(
          takeUntilDestroyed(this.destroyRef),

          tap((info: any) => {
            if (info === 'inserted') this.advertisement.isFavorite = 1;
            else this.advertisement.isFavorite = 0;

            this.toastService.success(info + ' success', 'success', {
              timeOut: 3000,
              positionClass: 'toast-top-right',
              closeButton: true,
              progressBar: true,
            });
          })
        )

        .subscribe();
    else
      this.toastService.error('Please login first', 'Failed', {
        timeOut: 3000,
        positionClass: 'toast-top-right',
        closeButton: true,
        progressBar: true,
      });
  }
}
