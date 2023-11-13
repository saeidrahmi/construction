import { inject } from '@angular/core';
import { StorageService } from './storage.service';
import { CanActivateFn, Router } from '@angular/router';
import { EnvironmentInfo } from 'libs/common/src/models/common';
const env: EnvironmentInfo = new EnvironmentInfo();

export const isUserLoggedIn: CanActivateFn = () => {
  const storageService = inject(StorageService);
  const router = inject(Router);

  if (storageService.isUserLoggedIn()) return true;
  else {
    router.navigate(['/login']);
    return false;
  }
};

// export const isUserAdmin: CanActivateFn = () => {
//   const storageService = inject(StorageService);
//   const router = inject(Router);
//   const user = storageService.getUser();
//   if (
//     user() &&
//     user().loggedIn &&
//     user().role?.toLocaleLowerCase() ==
//       env.getRole()?.admin?.toLocaleLowerCase()
//   )
//     return true;
//   else {
//     router.navigate(['/login']);
//     return false;
//   }
// };
export const isUserAdmin: CanActivateFn = () => {
  const storageService = inject(StorageService);
  const router = inject(Router);
  const user = storageService.getUser();
  if (
    (user() &&
      user().loggedIn &&
      user().role?.toLocaleLowerCase() ==
        env.getRole()?.sAdmin?.toLocaleLowerCase()) ||
    user().role?.toLocaleLowerCase() ==
      env.getRole()?.admin?.toLocaleLowerCase()
  )
    return true;
  else {
    router.navigate(['/login']);
    return false;
  }
};
export const isGeneralUser: CanActivateFn = () => {
  const storageService = inject(StorageService);
  const router = inject(Router);
  const user = storageService.getUser();
  if (
    user() &&
    user().loggedIn &&
    user().role?.toLocaleLowerCase() ==
      env.getRole()?.general?.toLocaleLowerCase()
  )
    return true;
  else {
    router.navigate(['/login']);
    return false;
  }
};
