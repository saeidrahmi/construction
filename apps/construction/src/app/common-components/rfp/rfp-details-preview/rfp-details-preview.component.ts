import { CommonModule } from '@angular/common';
import { Component, Input, inject } from '@angular/core';
import { AdvertisementInterface } from '../../../models/advertisement';
import { StorageService } from '../../../services/storage.service';
import { UserService } from '../../../services/user-service';
import { RatingModule } from 'ngx-bootstrap/rating';
import { FormsModule } from '@angular/forms';
import { EnvironmentInfo } from 'libs/common/src/models/common';
import { ImageService } from '../../../services/image-service';
import { ApiService } from '../../../services/api.service';
import { catchError, first, of, take, tap } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { EncryptionService } from '../../../services/encryption-service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DomSanitizer } from '@angular/platform-browser';
import { CommonUtilityService } from '../../../services/common-utility.service';
import { QuillModule } from 'ngx-quill';
import { RFPInterface } from '../../../models/rfp';

@Component({
  selector: 'app-rfp-details-preview',
  templateUrl: './rfp-details-preview.component.html',
  styleUrls: ['./rfp-details-preview.component.css'],
  standalone: true,
  imports: [CommonModule, RatingModule, FormsModule, QuillModule],
})
export class RFPDetailsPreviewComponent {
  env: EnvironmentInfo = new EnvironmentInfo();

  storageService = inject(StorageService);
  userService = inject(UserService);
  imageService = inject(ImageService);
  toastService = inject(ToastrService);
  commonUtility = inject(CommonUtilityService);
  apiService = inject(ApiService);
  encryptionService = inject(EncryptionService);
  user = this.storageService.getUser();

  @Input() advertisement: RFPInterface = {};
  message = '';
  max = 10;
  rate: number;
  isReadonly = true;
  myServices: string[] = [];
  locationType: any;
  myLocations: string[] = [];
  registeredDate: any;
  acitveAds: Date;
  constructor(public sanitizer: DomSanitizer) {
    const userId = this.storageService?.getUserId();
    this.apiService
      .getPreNewAdInfo(this.encryptionService.encryptItem(userId()))
      .pipe(
        takeUntilDestroyed(),
        tap((info: any) => {
          this.registeredDate = new Date(info?.registeredDate);
          this.acitveAds = info.acitveAds;
          this.rate = info.userRate;
        })
      )
      .subscribe();
  }
  getDaysLeft() {
    return this.userService.differenceInDays(
      new Date(this.advertisement?.endDate),
      new Date()
    );
  }
  goToUrl() {
    // window.open('http://' + this.user().website, '_blank');
    if (
      this.user().website &&
      (!this.user().website.includes('http://') ||
        !this.user().website.includes('https://'))
    )
      window.open('http://' + this.user().website, '_blank');
    else window.open(this.user().website, '_blank');
  }
}
