import { inject } from '@angular/core';
import { StorageService } from './storage.service';
import { CanActivateFn, Router } from '@angular/router';

export const isUserAdmin: CanActivateFn = () => {
  const storageService = inject(StorageService);
  const router = inject(Router);
  const user = storageService.getUser();
  if (user() && user().loggedIn && user().role?.toLocaleLowerCase() == 'admin')
    return true;
  else {
    router.navigate(['/login']);
    return false;
  }
};
