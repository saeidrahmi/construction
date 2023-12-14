import { CommonModule } from '@angular/common';
import { Component, Input, inject } from '@angular/core';
import { AdvertisementInterface } from '../../../models/advertisement';
import { StorageService } from '../../../services/storage.service';
import { UserService } from '../../../services/user-service';
import { RatingModule } from 'ngx-bootstrap/rating';
import { FormsModule } from '@angular/forms';
import { QuillModule } from 'ngx-quill';
import { CommonUtilityService } from '../../../services/common-utility.service';

@Component({
  selector: 'app-advertisement-preview',
  templateUrl: './advertisement-preview.component.html',
  styleUrls: ['./advertisement-preview.component.css'],
  standalone: true,
  imports: [CommonModule, RatingModule, FormsModule, QuillModule],
})
export class AdvertisementPreviewComponent {
  storageService = inject(StorageService);
  userService = inject(UserService);
  user = this.storageService.getUser();
  commonUtility = inject(CommonUtilityService);

  @Input() advertisement: AdvertisementInterface = {};
  max = 10;
  rate = 7;
  isReadonly = true;
  constructor() {}
  showDescription(description: string) {
    if (description?.length < 400) return description;
    else return description?.substring(0, 200) + '...';
  }
}
