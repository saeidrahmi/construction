import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ApiService } from '../../services/api.service';
import { StorageService } from '../../services/storage.service';

@Component({
  selector: 'construction-general-side-bar',
  templateUrl: './general-side-bar.component.html',
  styleUrls: ['./general-side-bar.component.scss'],
})
export class GeneralSideBarComponent {
  apiService = inject(ApiService);
  storageService = inject(StorageService);
  destroyRef = inject(DestroyRef);
  plan = this.storageService.getPlan();
  logout() {
    this.storageService.updateIsLoading(true);
    this.apiService
      .logout()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
  }
}
