import { Component, OnInit, inject } from '@angular/core';
import { AdvertisementInterface } from '../../../models/advertisement';
import { AdvertisementCommunicationService } from '../../../services/advertisementServcie';
import { Router } from '@angular/router';
import { first } from 'rxjs';
import { StorageService } from '../../../services/storage.service';

@Component({
  selector: 'app-preview-advertisement',
  templateUrl: './preview-advertisement.component.html',
  styleUrls: ['./preview-advertisement.component.css'],
})
export class PreviewAdvertisementComponent {
  advertisement: AdvertisementInterface = {};
  advertisementCommunicationService = inject(AdvertisementCommunicationService);
  router = inject(Router);
  storageService = inject(StorageService);
  previousPage: string;
  constructor() {
    const adObject = this.storageService?.getAdvertisement()();
    if (
      adObject?.advertisementSelected &&
      adObject?.advertisementAction === 'new'
    )
      this.previousPage = 'new';
    else if (
      adObject?.advertisementSelected &&
      adObject?.advertisementAction === 'edit'
    )
      this.previousPage = 'edit';
  }

  navigateBack() {
    if (this.previousPage === 'new')
      this.router.navigate(['/general/new-advertisement']);
    else if (this.previousPage === 'edit')
      this.router.navigate(['/general/edit-advertisement']);
  }
}
