import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { StorageService } from './storage.service';
import { EnvironmentInfo } from 'libs/common/src/models/common';

@Injectable({
  providedIn: 'root',
})
export class UserRoutingService {
  router = inject(Router);
  storageService = inject(StorageService);

  user = this.storageService.getUser();
  constructor() {}
  navigateToUserMainPage() {
    const env: EnvironmentInfo = new EnvironmentInfo();
    if (this.user()?.loggedIn) {
      if (
        this.user().role?.toLocaleLowerCase() ==
          env.getRole()?.sAdmin?.toLocaleLowerCase() ||
        this.user().role?.toLocaleLowerCase() ==
          env.getRole()?.admin?.toLocaleLowerCase()
      ) {
        this.router.navigate(['admin']);
      }
      // else if (
      //   this.user().role?.toLocaleLowerCase() ==
      //   env.getRole()?.admin?.toLocaleLowerCase()
      // ) {
      //   this.router.navigate(['/admin']);
      // }
      else if (
        this.user().role?.toLocaleLowerCase() ==
        env.getRole()?.general?.toLocaleLowerCase()
      ) {
        this.router.navigate(['/general']);
      }
    } else this.router.navigate(['/']);
  }
}
