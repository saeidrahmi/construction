import { AfterViewInit, Component, ViewChild, inject } from '@angular/core';
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

@Component({
  selector: 'construction-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
})
export class UsersComponent {
  displayedColumns: string[] = [];
  dataSource!: MatTableDataSource<UserApiResponseInterface>;
  apiService = inject(ApiService);
  toastService = inject(ToastrService);
  storageService = inject(StorageService);
  user = this.storageService.getUserId();
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(public imageService: ImageService) {
    // Assign the data to the data source for the table to render

    this.apiService
      .getUsers(this.user())
      .pipe(
        takeUntilDestroyed(),
        tap((users: UserApiResponseInterface[]) => {
          this.displayedColumns = [
            'profileImage',
            'userId',
            'loginCount',
            'firstName',
            'middleName',
            'lastName',
            'registeredDate',
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
}
