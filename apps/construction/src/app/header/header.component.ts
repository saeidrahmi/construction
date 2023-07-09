import { Component, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { StorageService } from '../services/storage.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'construction-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  storageService = inject(StorageService);
  isLoggedIn = this.storageService.isUserLoggedIn();
  apiService = inject(ApiService);
  router = inject(Router);
  destroyRef = inject(DestroyRef);
  logout() {
    this.apiService
      .logout()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
  }
}
