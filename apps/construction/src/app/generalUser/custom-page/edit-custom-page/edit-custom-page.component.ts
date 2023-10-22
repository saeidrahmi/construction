import { Component, DestroyRef, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { StorageService } from '../../../services/storage.service';

@Component({
  selector: 'app-edit-custom-page',
  templateUrl: './edit-custom-page.component.html',
  styleUrls: ['./edit-custom-page.component.css'],
})
export class EditCustomPageComponent {
  apiService = inject(ApiService);
  storageService = inject(StorageService);
  router = inject(Router);
  destroyRef = inject(DestroyRef);
  plan = this.storageService.getPlan();
  constructor() {
    if (this.plan()?.customProfileIncluded != 1)
      this.router.navigate(['/general/dashboard']);
  }
}
