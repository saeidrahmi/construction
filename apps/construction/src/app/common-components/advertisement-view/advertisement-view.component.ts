import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Component, DestroyRef, Input, inject } from '@angular/core';
import { AdvertisementInterface } from '../../models/advertisement';
import { StorageService } from '../../services/storage.service';
import { UserService } from '../../services/user-service';

import { FormsModule } from '@angular/forms';
import { RatingModule } from 'ngx-bootstrap/rating';
import { ImageService } from '../../services/image-service';
import { CommonUtilityService } from '../../services/common-utility.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ToastrService } from 'ngx-toastr';
import { tap, catchError, of } from 'rxjs';
import { ApiService } from '../../services/api.service';
import { EncryptionService } from '../../services/encryption-service';
import { DomSanitizer } from '@angular/platform-browser';
import { QuillModule } from 'ngx-quill';

@Component({
  selector: 'app-advertisement-view',
  templateUrl: './advertisement-view.component.html',
  styleUrls: ['./advertisement-view.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, RatingModule, QuillModule],
})
export class AdvertisementViewComponent {
  @Input('advertisement') advertisement: AdvertisementInterface = {};

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
  constructor(public sanitizer: DomSanitizer) {}

  navigateDetails(userAdvertisementId) {
    this.storageService.updateAdvertisementIdAndAction(
      userAdvertisementId,
      'view'
    );
    this.router.navigate(['/view-advertisement-details']);
  }

  addFavoriteAd(id: any) {
    if (this.isUserLoggedIn())
      this.apiService
        .addFavoriteAdvertisement(
          id,
          this.encryptionService.encryptItem(this.userId())
        )
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
