import { Router } from '@angular/router';

import { Component, Input, inject } from '@angular/core';

import { StorageService } from '../../../services/storage.service';
import { UserService } from '../../../services/user-service';
import { CommonUtilityService } from '../../../services/common-utility.service';
import { RFPInterface } from '../../../models/rfp';

@Component({
  selector: 'app-admin-rfp-view',
  templateUrl: './rfp-view.component.html',
  styleUrls: ['./rfp-view.component.css'],
})
export class AdminRFPViewComponent {
  @Input('advertisement') advertisement: RFPInterface = {};
  storageService = inject(StorageService);
  userService = inject(UserService);
  commonUtilityService = inject(CommonUtilityService);
  router = inject(Router);
  user = this.storageService.getUser();
  isUserLoggedIn = this.storageService.isUserLoggedIn();
  currentDate: Date;
  constructor() {
    this.currentDate = new Date();
  }
  navigateDetails(advertisement, userAdvertisementId) {
    this.storageService.updateRfpState(
      advertisement,
      userAdvertisementId,
      'view'
    );
    this.router.navigate(['/admin/rfp-details']);
  }
  getDaysLeft() {
    return this.userService.differenceInDays(
      new Date(this.advertisement?.endDate),
      this.currentDate
    );
  }
}
