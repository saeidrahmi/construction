import {
  AfterViewInit,
  Component,
  DestroyRef,
  ViewChild,
  inject,
} from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { tap, catchError, of } from 'rxjs';
import { ApiService } from '../../services/api.service';
import { ToastrService } from 'ngx-toastr';
import { StorageService } from '../../services/storage.service';
import { UserApiResponseInterface } from 'libs/common/src/models/user-response';
import { ImageService } from '../../services/image-service';
import { Router } from '@angular/router';

@Component({
  selector: 'construction-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
})
export class UsersComponent {
  displayedColumns: string[] = [
    'action',
    'profileImage',
    'userId',
    'role',
    'loginCount',
    'firstName',
    'middleName',
    'lastName',
    'registeredDate',
    'deleted',
    'loggedIn',
    'active',
    'registered',
    'lastLoginDate',
    'phone',
    'fax',
    'address',
    'city',
    'province',
    'postalCode',
    'website',
    'company',
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
  router = inject(Router);
  userPermissions = this.storageService.getUserPermissions();
  userRole = this.storageService.getUserRole();
  constructor(public imageService: ImageService) {
    if (this.userRole() != 'SAdmin' && !this.userPermissions().viewUsers)
      this.router.navigate(['/admin/user-profile']);
    // Assign the data to the data source for the table to render
    this.storageService.updateIsLoading(true);
    this.apiService
      .getUsers(this.user(), true)
      .pipe(
        takeUntilDestroyed(),
        tap((users: UserApiResponseInterface[]) => {
          this.dataSource = new MatTableDataSource(users);
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
  setImage(image: any) {
    this.profileImage = image;
  }
}
