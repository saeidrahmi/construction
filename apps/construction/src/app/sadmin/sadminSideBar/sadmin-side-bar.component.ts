import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ApiService } from '../../services/api.service';
import { StorageService } from './../../services/storage.service';
import { Component, DestroyRef, inject } from '@angular/core';
@Component({
  selector: 'construction-sadmin-side-bar',
  templateUrl: './sadmin-side-bar.component.html',
  styleUrls: ['./sadmin-side-bar.component.scss'],
})
export class SAdminSideBarComponent {
  storageService = inject(StorageService);
  userPermissions = this.storageService.getUserPermissions();
  userRole = this.storageService.getUserRole();
  apiService = inject(ApiService);
  destroyRef = inject(DestroyRef);
  logout() {
    this.storageService.updateIsLoading(true);
    this.apiService
      .logout()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
  }
}
