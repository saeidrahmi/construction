import { CommonModule } from '@angular/common';
import { Component, Input, inject } from '@angular/core';
import { AdvertisementInterface } from '../../models/advertisement';
import { StorageService } from '../../services/storage.service';
import { UserService } from '../../services/user-service';
import { RatingModule } from 'ngx-bootstrap/rating';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-advertisement-preview',
  templateUrl: './advertisement-preview.component.html',
  styleUrls: ['./advertisement-preview.component.css'],
  standalone: true,
  imports: [CommonModule, RatingModule, FormsModule],
})
export class AdvertisementPreviewComponent {
  @Input('advertisement') advertisement: AdvertisementInterface = {};

  storageService = inject(StorageService);
  userService = inject(UserService);
  user = this.storageService.getUser();
  max = 10;
  rate = 7;
  isReadonly = true;
  constructor() {}
}
