import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root',
})
export class NavigationService {
  storageService = inject(StorageService);
  isLoggedIn = this.storageService.isUserLoggedIn();
  router = inject(Router);

  constructor() {}

  navigateUserHomePage() {
    if (this.isLoggedIn()) {
    } else this.router.navigate(['/']);
  }
}
