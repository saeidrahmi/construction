import { Component, Input } from '@angular/core';
import { AdvertisementInterface } from '../../../models/advertisement';

@Component({
  selector: 'app-preview-rfp',
  templateUrl: './preview-rfp.component.html',
  styleUrls: ['./preview-rfp.component.css'],
})
export class PreviewRFPComponent {
  @Input() advertisement: AdvertisementInterface = {};

  constructor() {}
}
