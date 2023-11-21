import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Component, Input, inject } from '@angular/core';
import { AdvertisementInterface } from '../../models/advertisement';
import { StorageService } from '../../services/storage.service';
import { UserService } from '../../services/user-service';

import { FormsModule } from '@angular/forms';
import { RatingModule } from 'ngx-bootstrap/rating';
import { ImageService } from '../../services/image-service';
import { CommonUtilityService } from '../../services/common-utility.service';

@Component({
  selector: 'app-advertisement-view',
  templateUrl: './advertisement-view.component.html',
  styleUrls: ['./advertisement-view.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, RatingModule],
})
export class AdvertisementViewComponent {
  @Input('advertisement') advertisement: AdvertisementInterface = {};

  storageService = inject(StorageService);
  commonUtility = inject(CommonUtilityService);
  userService = inject(UserService);
  router = inject(Router);
  user = this.storageService.getUser();
  isUserLoggedIn = this.storageService.isUserLoggedIn();
  imageService = inject(ImageService);
  constructor() {}

  navigateDetails(userAdvertisementId) {
    this.storageService.updateAdvertisementIdAndAction(
      userAdvertisementId,
      'view'
    );
    this.router.navigate(['/view-advertisement-details']);
  }
}
