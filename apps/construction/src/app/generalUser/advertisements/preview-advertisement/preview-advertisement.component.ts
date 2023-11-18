import { Component, Input } from '@angular/core';
import { AdvertisementInterface } from '../../../models/advertisement';

@Component({
  selector: 'app-preview-advertisement',
  templateUrl: './preview-advertisement.component.html',
  styleUrls: ['./preview-advertisement.component.css'],
})
export class PreviewAdvertisementComponent {
  @Input() advertisement: AdvertisementInterface = {};

  constructor() {}
}
