import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ToastrService } from 'ngx-toastr';
import { tap } from 'rxjs';
import { ApiService } from '../../services/api.service';
import { StorageService } from '../../services/storage.service';
import { Router } from '@angular/router';
@Component({
  selector: 'construction-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent {
  apiService = inject(ApiService);
  toastService = inject(ToastrService);
  destroyRef = inject(DestroyRef);
  dashboard$ = this.apiService.getDashboardInfo().pipe(
    takeUntilDestroyed(this.destroyRef),

    tap((data: any) => {
      this.dashboard = data;
    })
  );

  dashboard: any;
  storageService = inject(StorageService);
  router = inject(Router);
  userPermissions = this.storageService.getUserPermissions();
  userRole = this.storageService.getUserRole();
  constructor() {
    if (this.userRole() != 'SAdmin' && !this.userPermissions()?.viewDashboard)
      this.router.navigate(['/admin/user-profile']);
    this.dashboard$.subscribe();
  }
}
