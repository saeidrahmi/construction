import { Component, DestroyRef, inject } from '@angular/core';
import { StorageService } from '../../../services/storage.service';
import { Router } from '@angular/router';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-view-bid',
  templateUrl: './view-bid.component.html',
  styleUrls: ['./view-bid.component.css'],
})
export class ViewBidComponent {
  apiService = inject(ApiService);
  storageService = inject(StorageService);
  router = inject(Router);
  destroyRef = inject(DestroyRef);
  plan = this.storageService.getPlan();
  constructor() {
    if (this.plan()?.createBidsIncluded != 1)
      this.router.navigate(['/general/dashboard']);
  }
}
