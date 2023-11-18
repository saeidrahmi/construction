import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RatingModule } from 'ngx-bootstrap/rating';
import { ToastrService } from 'ngx-toastr';
import { take, tap, catchError, of } from 'rxjs';
import { AdvertisementCommunicationService } from '../../services/advertisementServcie';
import { ApiService } from '../../services/api.service';
import { CommonUtilityService } from '../../services/common-utility.service';
import { ImageService } from '../../services/image-service';
import { StorageService } from '../../services/storage.service';
import { UserService } from '../../services/user-service';
import { AdvertisementViewComponent } from '../../common-components/advertisement-view/advertisement-view.component';

@Component({
  selector: 'app-advertisements-list',
  templateUrl: './advertisements-list.component.html',
  styleUrls: ['./advertisements-list.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    RatingModule,
    FormsModule,
    AdvertisementViewComponent,
  ],
})
export class AdvertisementsListComponent {
  router = inject(Router);
  imageService = inject(ImageService);
  toastService = inject(ToastrService);
  apiService = inject(ApiService);
  userService = inject(UserService);
  storageService = inject(StorageService);

  commonUtility = inject(CommonUtilityService);
  destroyRef = inject(DestroyRef);
  allAdvertisements: any[] = [];

  user = this.storageService?.getUser();
  currentDate = new Date();
  constructor() {
    this.apiService
      .getAllAdvertisements()
      .pipe(
        takeUntilDestroyed(),

        tap((list: any) => {
          this.allAdvertisements = list;

          this.allAdvertisements = this.allAdvertisements.map((obj) => {
            if (obj?.headerImage) {
              const blob = new Blob([new Uint8Array(obj.headerImage.data)], {
                type: 'image/jpeg',
              }); // Adjust 'image/jpeg' to the correct image MIME type
              const imageUrl = URL.createObjectURL(blob);
              return { ...obj, headerImage: `url(${imageUrl})` };
            }
            return obj;
          });
        })
      )
      .subscribe();
  }
}
