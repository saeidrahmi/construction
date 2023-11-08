import { Component, Input, OnInit, inject } from '@angular/core';
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
  @Input() advertisement: AdvertisementInterface = {};

  constructor() {}
}
