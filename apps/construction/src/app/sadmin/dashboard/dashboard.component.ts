import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AdminSettingsInterface } from 'libs/common/src/models/admin-settings';
import { ToastrService } from 'ngx-toastr';
import { take, tap, catchError, of } from 'rxjs';
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
    take(1),
    tap((data: any) => {
      this.dashboard = data;
    }),
    catchError((err) => {
      this.toastService.error(
        'Getting Settings failed. ' + err,
        'List failure',
        {
          timeOut: 3000,
          positionClass: 'toast-top-right',
          closeButton: true,
          progressBar: true,
        }
      );
      return of(err);
    })
  );

  dashboard: any;
  storageService = inject(StorageService);
  router = inject(Router);
  userPermissions = this.storageService.getUserPermissions();
  userRole = this.storageService.getUserRole();
  constructor() {
    if (this.userRole() != 'SAdmin' && !this.userPermissions().viewDashboard)
      this.router.navigate(['/admin/user-profile']);
    this.dashboard$.subscribe();
  }
}
