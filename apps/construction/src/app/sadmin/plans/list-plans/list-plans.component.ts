import { Component, DestroyRef, ViewChild, inject } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { tap, catchError, of } from 'rxjs';
import { ApiService } from '../../../services/api.service';
import { ToastrService } from 'ngx-toastr';
import { StorageService } from '../../../services/storage.service';
import { UserApiResponseInterface } from 'libs/common/src/models/user-response';

@Component({
  selector: 'app-list-plans',
  templateUrl: './list-plans.component.html',
  styleUrls: ['./list-plans.component.css'],
})
export class ListPlansComponent {
  displayedColumns: string[] = [
    'dateCreated',
    'startDate',
    'expiryDate',
    'planName',
    'planType',
    'planDescription',
    'active',
    'duration',
    'originalPrice',
    'discountPercentage',
    'priceAfterDiscount',
    'numberOfAdvertisements',
    'websiteIncluded',
    'viewBidsIncluded',
  ];
  dataSource!: MatTableDataSource<UserApiResponseInterface>;
  apiService = inject(ApiService);
  toastService = inject(ToastrService);
  storageService = inject(StorageService);
  destroyRef = inject(DestroyRef);
  user = this.storageService.getUserId();
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  profileImage: any;
  constructor() {
    // Assign the data to the data source for the table to render

    this.apiService
      .getAdminPlans()
      .pipe(
        takeUntilDestroyed(),
        tap((plans: any) => {
          console.log(plans);
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
      )
      .subscribe();
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  deleteAccount(userId: string, flag: boolean) {
    if (userId) {
      this.storageService.updateIsLoading(true);
      this.apiService
        .deleteUser(userId, flag, true)
        .pipe(
          takeUntilDestroyed(this.destroyRef),
          tap((users: UserApiResponseInterface[]) => {
            this.dataSource = new MatTableDataSource(users);
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;
            this.toastService.success('User updated.', 'Update Successful', {
              timeOut: 3000,
              positionClass: 'toast-top-right',
              closeButton: true,
              progressBar: true,
            });
          }),
          catchError((err) => {
            this.toastService.error(
              'User Deletion failed. ' + err,
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
  }
  changeAccountStatus(userId: string, activate: boolean) {
    this.storageService.updateIsLoading(true);
    this.apiService
      .updateUserActivationStatus(userId, activate, true)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        tap((users: UserApiResponseInterface[]) => {
          this.dataSource = new MatTableDataSource(users);
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
          this.toastService.success('User updated.', 'Update Successful', {
            timeOut: 3000,
            positionClass: 'toast-top-right',
            closeButton: true,
            progressBar: true,
          });
        }),
        catchError((err) => {
          this.toastService.error(
            'User update failed. ' + err,
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
}
