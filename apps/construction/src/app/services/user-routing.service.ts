import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root',
})
export class UserRoutingService {
  router = inject(Router);
  storageService = inject(StorageService);

  user = this.storageService.getUser();
  constructor() {}
  navigateToUserMainPage() {
    if (this.user()?.loggedIn) {
      if (this.user().role?.toLocaleLowerCase() == 'admin')
        this.router.navigate(['/admin']);
    } else this.router.navigate(['/']);
  }
}
