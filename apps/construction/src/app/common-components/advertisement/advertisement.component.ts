import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { AdvertisementInterface } from '../../models/advertisement';

@Component({
  selector: 'app-advertisement',
  templateUrl: './advertisement.component.html',
  styleUrls: ['./advertisement.component.css'],
  standalone: true,
  imports: [CommonModule],
})
export class AdvertisementComponent {
  @Input('advertisement') advertisement: AdvertisementInterface = {};
  constructor() {}
}
