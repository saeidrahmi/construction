import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { StorageService } from '../../services/storage.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-my-bids',
  templateUrl: './my-bids.component.html',
  styleUrls: ['./my-bids.component.css'],
})
export class MyBidsComponent implements OnInit {
  apiService = inject(ApiService);
  storageService = inject(StorageService);
  router = inject(Router);
  destroyRef = inject(DestroyRef);
  plan = this.storageService.getPlan();
  constructor() {
    if (this.plan()?.createBidsIncluded != 1)
      this.router.navigate(['/general/dashboard']);
  }

  ngOnInit() {}
}
