import { Component, DestroyRef, inject } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { StorageService } from '../../services/storage.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-my-rfps',
  templateUrl: './my-rfp.component.html',
  styleUrls: ['./my-rfp.component.css'],
})
export class MyRFPComponent {
  apiService = inject(ApiService);
  storageService = inject(StorageService);
  router = inject(Router);
  destroyRef = inject(DestroyRef);
  plan = this.storageService.getPlan();
  constructor() {}
}
