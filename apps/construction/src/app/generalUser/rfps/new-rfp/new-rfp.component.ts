import { Component, DestroyRef, inject } from '@angular/core';
import { StorageService } from '../../../services/storage.service';
import { Router } from '@angular/router';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-new-rfp',
  templateUrl: './new-rfp.component.html',
  styleUrls: ['./new-rfp.component.css'],
})
export class NewRFPComponent {
  apiService = inject(ApiService);
  storageService = inject(StorageService);
  router = inject(Router);
  destroyRef = inject(DestroyRef);
  plan = this.storageService.getPlan();
  constructor() {}
}
