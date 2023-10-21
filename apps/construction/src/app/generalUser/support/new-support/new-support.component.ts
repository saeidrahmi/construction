import { Component, DestroyRef, inject } from '@angular/core';
import { StorageService } from '../../../services/storage.service';
import { Router } from '@angular/router';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-new-support',
  templateUrl: './new-support.component.html',
  styleUrls: ['./new-support.component.css'],
})
export class NewSupportComponent {
  apiService = inject(ApiService);
  storageService = inject(StorageService);
  router = inject(Router);
  destroyRef = inject(DestroyRef);
  plan = this.storageService.getPlan();
  constructor() {
    if (this.plan()?.onlineSupportIncluded != 1)
      this.router.navigate(['/general/dashboard']);
  }
}
