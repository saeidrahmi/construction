import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Component, Input, inject } from '@angular/core';
import { AdvertisementInterface } from '../../../models/advertisement';
import { StorageService } from '../../../services/storage.service';
import { UserService } from '../../../services/user-service';

import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-user-advertisement-view',
  templateUrl: './advertisement-view.component.html',
  styleUrls: ['./advertisement-view.component.css'],
})
export class UserAdvertisementViewComponent {
  @Input('advertisement') advertisement: AdvertisementInterface = {};

  storageService = inject(StorageService);
  userService = inject(UserService);
  router = inject(Router);
  user = this.storageService.getUser();
  isUserLoggedIn = this.storageService.isUserLoggedIn();

  constructor() {}
  navigateDetails(advertisement, userAdvertisementId) {
    this.storageService.updateAdvertisementState(
      advertisement,
      userAdvertisementId,
      'view'
    );
    this.router.navigate(['/general/advertisement-details']);
  }
}
