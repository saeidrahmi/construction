import { StorageService } from './../../services/storage.service';
import { Component, inject } from '@angular/core';

@Component({
  selector: 'construction-sadmin-side-bar',
  templateUrl: './sadmin-side-bar.component.html',
  styleUrls: ['./sadmin-side-bar.component.scss'],
})
export class SAdminSideBarComponent {
  storageService = inject(StorageService);
  userPermissions = this.storageService.getUserPermissions();
}
