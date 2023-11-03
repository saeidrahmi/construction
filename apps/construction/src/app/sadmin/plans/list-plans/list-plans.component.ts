import { Component, DestroyRef, ViewChild, inject } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { tap, catchError, of, switchMap } from 'rxjs';
import { ApiService } from '../../../services/api.service';
import { ToastrService } from 'ngx-toastr';
import { StorageService } from '../../../services/storage.service';
import { UserApiResponseInterface } from 'libs/common/src/models/user-response';
import { Router } from '@angular/router';

@Component({
  selector: 'app-list-plans',
  templateUrl: './list-plans.component.html',
  styleUrls: ['./list-plans.component.css'],
})
export class ListPlansComponent {
  displayedColumns: string[] = [
    'action',
    'active',
    'deleted',
    'dateCreated',
    'startDate',
    'expiryDate',
    'planName',
    'planType',
    'planDescription',
    'duration',
    'originalPrice',
    'discountPercentage',
    'priceAfterDiscount',
    'numberOfAdvertisements',
    'customProfileIncluded',
    'viewBidsIncluded',
    'createBidsIncluded',
    'onlineSupportIncluded',
  ];
  dataSource!: MatTableDataSource<UserApiResponseInterface>;
  apiService = inject(ApiService);
  toastService = inject(ToastrService);
  router = inject(Router);
  storageService = inject(StorageService);
  destroyRef = inject(DestroyRef);
  user = this.storageService.getUserId();
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  profileImage: any;
  getPlans$ = this.apiService.getAdminPlans().pipe(
    takeUntilDestroyed(),
    tap((plans: any) => {
      this.dataSource = new MatTableDataSource(plans);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }),
    catchError((err) => {
      this.toastService.error('Users list failed. ' + err, 'List failure', {
        timeOut: 3000,
        positionClass: 'toast-top-right',
        closeButton: true,
        progressBar: true,
      });
      return of(err);
    })
  );
  constructor() {
    // Assign the data to the data source for the table to render

    this.getPlans$.subscribe();
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  changePlanStatus(planId: string, activate: boolean) {
    this.apiService
      .updatePlanActivationStatus(planId, activate)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        tap(() => {
          //this.getPlans$.subscribe();
        }),
        switchMap(() => this.getPlans$),
        catchError((err) => {
          this.toastService.error(
            'Plan update failed. ' + err,
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
      )
      .subscribe();
  }

  deletePlan(planId: string) {
    this.apiService
      .deletePlan(planId)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        tap(() => {
          //this.getPlans$.subscribe();
        }),
        switchMap(() => this.getPlans$),
        catchError((err) => {
          this.toastService.error(
            'Plan Delete failed. ' + err,
            'Delete failure',
            {
              timeOut: 3000,
              positionClass: 'toast-top-right',
              closeButton: true,
              progressBar: true,
            }
          );
          return of(err);
        })
      )
      .subscribe();
  }
  editPlan(planId: string) {
    this.router.navigate(['/sadmin/edit-plan', planId]);
  }
}
