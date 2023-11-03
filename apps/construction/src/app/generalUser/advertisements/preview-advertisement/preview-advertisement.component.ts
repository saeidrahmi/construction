import { Component, OnInit, inject } from '@angular/core';
import { AdvertisementInterface } from '../../../models/advertisement';
import { AdvertisementCommunicationService } from '../../../services/advertisementServcie';
import { Router } from '@angular/router';
import { first } from 'rxjs';

@Component({
  selector: 'app-preview-advertisement',
  templateUrl: './preview-advertisement.component.html',
  styleUrls: ['./preview-advertisement.component.css'],
})
export class PreviewAdvertisementComponent {
  advertisement: AdvertisementInterface = {};
  advertisementCommunicationService = inject(AdvertisementCommunicationService);
  router = inject(Router);
  constructor() {
    this.advertisementCommunicationService.message$
      .pipe(first())
      .subscribe((message) => {
        const isEmpty = Object.keys(message).length === 0;
        if (isEmpty) this.router.navigate(['/general/new-advertisement']);
        else this.advertisement = message;
      });
  }

  navigateToNewAd() {
    this.advertisementCommunicationService.sendMessage(this.advertisement);
    this.router.navigate(['/general/new-advertisement']);
  }
}
